export interface LineSource {
	lineCount: number;
	getLine(lineNumber: number): string;
}

export interface LineRange {
	from: number;
	to: number;
}

export function getYamlFrontmatterRange(source: LineSource): LineRange | null {
	if (source.lineCount === 0) {
		return null;
	}

	if (source.getLine(0).trim() !== "---") {
		return null;
	}

	for (let lineNumber = 1; lineNumber < source.lineCount; lineNumber += 1) {
		const line = source.getLine(lineNumber).trim();
		if (line === "---" || line === "...") {
			return { from: 0, to: lineNumber };
		}
	}

	return { from: 0, to: source.lineCount - 1 };
}

export function isLineInYamlFrontmatter(
	source: LineSource,
	lineNumber: number
): boolean {
	const range = getYamlFrontmatterRange(source);
	return range != null && lineNumber >= range.from && lineNumber <= range.to;
}
