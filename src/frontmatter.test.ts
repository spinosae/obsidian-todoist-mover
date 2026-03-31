import {
	getYamlFrontmatterRange,
	isLineInYamlFrontmatter,
	LineSource,
} from "./frontmatter";

function createLineSource(lines: string[]): LineSource {
	return {
		lineCount: lines.length,
		getLine(lineNumber: number): string {
			return lines[lineNumber];
		},
	};
}

describe("getYamlFrontmatterRange", () => {
	it("returns null when the document does not start with frontmatter", () => {
		expect(getYamlFrontmatterRange(createLineSource(["# Title", "---"]))).toBeNull();
	});

	it("returns the full closed frontmatter range", () => {
		expect(
			getYamlFrontmatterRange(
				createLineSource(["---", "title: Test", "tags: [one]", "---", "Body"])
			)
		).toEqual({ from: 0, to: 3 });
	});

	it("supports ellipsis as the closing delimiter", () => {
		expect(
			getYamlFrontmatterRange(createLineSource(["---", "title: Test", "...", "Body"]))
		).toEqual({ from: 0, to: 2 });
	});
});

describe("isLineInYamlFrontmatter", () => {
	it("flags only lines inside the frontmatter block", () => {
		const source = createLineSource([
			"---",
			"title: Test",
			"aliases:",
			"  - One",
			"---",
			"Main body",
		]);

		expect(isLineInYamlFrontmatter(source, 0)).toBe(true);
		expect(isLineInYamlFrontmatter(source, 3)).toBe(true);
		expect(isLineInYamlFrontmatter(source, 4)).toBe(true);
		expect(isLineInYamlFrontmatter(source, 5)).toBe(false);
	});
});
