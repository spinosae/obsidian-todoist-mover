export interface EligibleTextRange {
	from: number;
	to: number;
	text: string;
}

const INLINE_FORMATTING_MARKERS = new Set(["*", "_", "~", "`", "="]);

export function findFirstEligibleTextRange(
	line: string
): EligibleTextRange | null {
	let index = skipLinePrefixes(line, 0);

	while (index < line.length) {
		index = skipWhitespace(line, index);

		const ignoredLinkEnd = getIgnoredLinkEnd(line, index);
		if (ignoredLinkEnd != null) {
			index = ignoredLinkEnd;
			continue;
		}

		const ignoredTagEnd = getIgnoredTagEnd(line, index);
		if (ignoredTagEnd != null) {
			index = ignoredTagEnd;
			continue;
		}

		if (INLINE_FORMATTING_MARKERS.has(line[index])) {
			index = skipInlineFormatting(line, index);
			continue;
		}

		const start = index;
		let end = index;

		while (index < line.length) {
			if (getIgnoredLinkEnd(line, index) != null) {
				break;
			}

			if (getIgnoredTagEnd(line, index) != null) {
				break;
			}

			if (INLINE_FORMATTING_MARKERS.has(line[index])) {
				break;
			}

			end = index + 1;
			index += 1;
		}

		const trimmed = trimRange(line, start, end);
		if (trimmed != null) {
			return trimmed;
		}
	}

	return null;
}

export function wrapFirstEligibleTextBlock(line: string): string | null {
	const range = findFirstEligibleTextRange(line);
	if (range == null) {
		return null;
	}

	return `${line.slice(0, range.from)}[[${range.text}]]${line.slice(range.to)}`;
}

function skipLinePrefixes(line: string, initialIndex: number): number {
	let index = skipWhitespace(line, initialIndex);

	while (index < line.length) {
		const nextIndex = skipSingleLinePrefix(line, index);
		if (nextIndex === index) {
			return index;
		}

		index = skipWhitespace(line, nextIndex);
	}

	return index;
}

function skipSingleLinePrefix(line: string, index: number): number {
	let nextIndex = index;

	while (line[nextIndex] === ">") {
		nextIndex += 1;
		nextIndex = skipWhitespace(line, nextIndex);
	}

	if (nextIndex !== index) {
		return nextIndex;
	}

	const headingMatch = line.slice(index).match(/^#{1,6}(?=\s)/);
	if (headingMatch != null) {
		return index + headingMatch[0].length;
	}

	const unorderedListMatch = line.slice(index).match(/^[-+*](?=\s)/);
	if (unorderedListMatch != null) {
		return index + unorderedListMatch[0].length;
	}

	const orderedListMatch = line.slice(index).match(/^\d+[.)](?=\s)/);
	if (orderedListMatch != null) {
		return index + orderedListMatch[0].length;
	}

	const checkboxMatch = line.slice(index).match(/^\[(?: |x|X)\](?=\s|$)/);
	if (checkboxMatch != null) {
		return index + checkboxMatch[0].length;
	}

	return index;
}

function skipWhitespace(line: string, index: number): number {
	let nextIndex = index;
	while (nextIndex < line.length && /\s/.test(line[nextIndex])) {
		nextIndex += 1;
	}

	return nextIndex;
}

function skipInlineFormatting(line: string, index: number): number {
	let nextIndex = index;
	while (
		nextIndex < line.length &&
		INLINE_FORMATTING_MARKERS.has(line[nextIndex])
	) {
		nextIndex += 1;
	}

	return nextIndex;
}

function trimRange(
	line: string,
	start: number,
	end: number
): EligibleTextRange | null {
	let trimmedStart = start;
	let trimmedEnd = end;

	while (trimmedStart < trimmedEnd && /\s/.test(line[trimmedStart])) {
		trimmedStart += 1;
	}

	while (trimmedEnd > trimmedStart && /\s/.test(line[trimmedEnd - 1])) {
		trimmedEnd -= 1;
	}

	if (trimmedStart >= trimmedEnd) {
		return null;
	}

	return {
		from: trimmedStart,
		to: trimmedEnd,
		text: line.slice(trimmedStart, trimmedEnd),
	};
}

function getIgnoredLinkEnd(line: string, index: number): number | null {
	if (index >= line.length) {
		return null;
	}

	if (line.startsWith("![[", index) || line.startsWith("[[", index)) {
		const closeIndex = line.indexOf("]]", index + 2);
		return closeIndex === -1 ? null : closeIndex + 2;
	}

	if (line.startsWith("![", index) || line[index] === "[") {
		const labelEnd = findClosingBracket(line, index + 1);
		if (labelEnd === -1) {
			return null;
		}

		const nextChar = line[labelEnd + 1];
		if (nextChar === "(") {
			const destinationEnd = findClosingParen(line, labelEnd + 2);
			return destinationEnd === -1 ? null : destinationEnd + 1;
		}

		if (nextChar === "[") {
			const referenceEnd = findClosingBracket(line, labelEnd + 2);
			return referenceEnd === -1 ? null : referenceEnd + 1;
		}

		return null;
	}

	return null;
}

function getIgnoredTagEnd(line: string, index: number): number | null {
	if (!isTagStart(line, index)) {
		return null;
	}

	let end = index + 1;
	while (end < line.length && !/\s/.test(line[end])) {
		end += 1;
	}

	return end;
}

function isTagStart(line: string, index: number): boolean {
	if (line[index] !== "#") {
		return false;
	}

	const previousChar = index === 0 ? "" : line[index - 1];
	if (previousChar !== "" && !/\s/.test(previousChar)) {
		return false;
	}

	const nextChar = line[index + 1];
	return nextChar != null && !/\s/.test(nextChar);
}

function findClosingBracket(line: string, index: number): number {
	let depth = 1;

	for (let current = index; current < line.length; current += 1) {
		if (line[current] === "\\") {
			current += 1;
			continue;
		}

		if (line[current] === "[") {
			depth += 1;
		} else if (line[current] === "]") {
			depth -= 1;
			if (depth === 0) {
				return current;
			}
		}
	}

	return -1;
}

function findClosingParen(line: string, index: number): number {
	let depth = 1;

	for (let current = index; current < line.length; current += 1) {
		if (line[current] === "\\") {
			current += 1;
			continue;
		}

		if (line[current] === "(") {
			depth += 1;
		} else if (line[current] === ")") {
			depth -= 1;
			if (depth === 0) {
				return current;
			}
		}
	}

	return -1;
}
