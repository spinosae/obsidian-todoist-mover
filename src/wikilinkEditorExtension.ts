import { RangeSetBuilder } from "@codemirror/state";
import {
	Decoration,
	DecorationSet,
	EditorView,
	ViewPlugin,
	ViewUpdate,
	WidgetType,
} from "@codemirror/view";
import {
	editorInfoField,
	Editor,
	MarkdownFileInfo,
	setIcon,
} from "obsidian";
import { getYamlFrontmatterRange } from "./frontmatter";
import { findFirstEligibleTextRange } from "./wikilinkLineParser";

class WikilinkButtonWidget extends WidgetType {
	constructor(
		private readonly lineNumber: number,
		private readonly lineText: string
	) {
		super();
	}

	eq(other: WikilinkButtonWidget): boolean {
		return (
			other.lineNumber === this.lineNumber && other.lineText === this.lineText
		);
	}

	toDOM(view: EditorView): HTMLElement {
		const button = document.createElement("button");
		button.type = "button";
		button.className = "clickable-icon todoist-wikilink-button";
		button.setAttribute("aria-label", "Convert first text block to wikilink");
		button.setAttribute("title", "Convert text to wikilink");
		setIcon(button, "link-2");
		button.addEventListener("mousedown", (event) => {
			event.preventDefault();
			event.stopPropagation();
			wrapLineText(view, this.lineNumber);
		});
		return button;
	}

	ignoreEvent(): boolean {
		return false;
	}
}

class WikilinkButtonView {
	decorations: DecorationSet;

	constructor(private readonly view: EditorView) {
		this.decorations = this.buildDecorations();
	}

	update(update: ViewUpdate): void {
		if (update.docChanged || update.viewportChanged) {
			this.decorations = this.buildDecorations();
		}
	}

	private buildDecorations(): DecorationSet {
		const builder = new RangeSetBuilder<Decoration>();
		const seenLines = new Set<number>();
		const frontmatterRange = getYamlFrontmatterRange({
			lineCount: this.view.state.doc.lines,
			getLine: (lineNumber: number) => this.view.state.doc.line(lineNumber + 1).text,
		});

		for (const visibleRange of this.view.visibleRanges) {
			let position = visibleRange.from;

			while (position <= visibleRange.to) {
				const line = this.view.state.doc.lineAt(position);
				position = line.to + 1;

				if (seenLines.has(line.number)) {
					continue;
				}
				seenLines.add(line.number);

				const lineNumber = line.number - 1;
				if (
					frontmatterRange != null &&
					lineNumber >= frontmatterRange.from &&
					lineNumber <= frontmatterRange.to
				) {
					continue;
				}

				if (findFirstEligibleTextRange(line.text) == null) {
					continue;
				}

				builder.add(
					line.from,
					line.from,
					Decoration.line({
						attributes: {
							class: "todoist-wikilink-line",
						},
					})
				);

				builder.add(
					line.to,
					line.to,
					Decoration.widget({
						widget: new WikilinkButtonWidget(lineNumber, line.text),
						side: 1,
					})
				);
			}
		}

		return builder.finish();
	}
}

export function createWikilinkEditorExtension() {
	return ViewPlugin.fromClass(WikilinkButtonView, {
		decorations: (value) => value.decorations,
	});
}

function wrapLineText(view: EditorView, lineNumber: number): void {
	const editor = getEditor(view);
	if (editor == null) {
		return;
	}

	const lineText = editor.getLine(lineNumber);
	const range = findFirstEligibleTextRange(lineText);
	if (range == null) {
		return;
	}

	editor.replaceRange(
		`[[${range.text}]]`,
		{ line: lineNumber, ch: range.from },
		{ line: lineNumber, ch: range.to }
	);
	editor.focus();
}

function getEditor(view: EditorView): Editor | undefined {
	const info = view.state.field(editorInfoField, false) as MarkdownFileInfo | null;
	return info?.editor;
}
