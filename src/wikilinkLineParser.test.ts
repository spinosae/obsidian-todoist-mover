import {
	findFirstEligibleTextRange,
	wrapFirstEligibleTextBlock,
} from "./wikilinkLineParser";

describe("findFirstEligibleTextRange", () => {
	it("skips heading markers", () => {
		expect(findFirstEligibleTextRange("# Heading text")).toEqual({
			from: 2,
			to: 14,
			text: "Heading text",
		});
	});

	it("skips unordered list and task checkbox markers", () => {
		expect(findFirstEligibleTextRange("- [ ] Finish report")).toEqual({
			from: 6,
			to: 19,
			text: "Finish report",
		});
	});

	it("skips ordered list markers", () => {
		expect(findFirstEligibleTextRange("12. Review note")).toEqual({
			from: 4,
			to: 15,
			text: "Review note",
		});
	});

	it("skips an initial markdown link and wraps following text", () => {
		expect(findFirstEligibleTextRange("[Docs](https://example.com) summary")).toEqual({
			from: 28,
			to: 35,
			text: "summary",
		});
	});

	it("skips an initial wikilink and wraps following text", () => {
		expect(findFirstEligibleTextRange("[[Existing note]] summary")).toEqual({
			from: 18,
			to: 25,
			text: "summary",
		});
	});

	it("treats text before a later link as the first eligible block", () => {
		expect(findFirstEligibleTextRange("Read docs [here](https://example.com)")).toEqual({
			from: 0,
			to: 9,
			text: "Read docs",
		});
	});

	it("skips inline formatting markers to get the underlying text", () => {
		expect(findFirstEligibleTextRange("**Bold** and more")).toEqual({
			from: 2,
			to: 6,
			text: "Bold",
		});
	});

	it("stops before trailing tags", () => {
		expect(findFirstEligibleTextRange("Finish report #work #urgent")).toEqual({
			from: 0,
			to: 13,
			text: "Finish report",
		});
	});

	it("finds text after a leading tag", () => {
		expect(findFirstEligibleTextRange("#work Finish report")).toEqual({
			from: 6,
			to: 19,
			text: "Finish report",
		});
	});

	it("returns null when the line contains only ignored content", () => {
		expect(findFirstEligibleTextRange("[[Already linked]]")).toBeNull();
		expect(findFirstEligibleTextRange("[Docs](https://example.com)")).toBeNull();
		expect(findFirstEligibleTextRange("- [ ]")).toBeNull();
	});
});

describe("wrapFirstEligibleTextBlock", () => {
	it("wraps only the first eligible block", () => {
		expect(
			wrapFirstEligibleTextBlock("Read docs [here](https://example.com)")
		).toBe("[[Read docs]] [here](https://example.com)");
	});

	it("preserves skipped markdown syntax", () => {
		expect(wrapFirstEligibleTextBlock("- [ ] Finish report")).toBe(
			"- [ ] [[Finish report]]"
		);
	});

	it("wraps tagged text as a single block", () => {
		expect(wrapFirstEligibleTextBlock("Finish report #work #urgent")).toBe(
			"[[Finish report]] #work #urgent"
		);
	});

	it("wraps text after a leading tag", () => {
		expect(wrapFirstEligibleTextBlock("#work Finish report")).toBe(
			"#work [[Finish report]]"
		);
	});
});
