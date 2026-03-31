import {
	DEFAULT_SETTINGS,
	migrateSettings,
	TodoistSettings,
} from "./DefaultSettings";

describe("migrateSettings", () => {
	it("returns defaults when settings are missing", () => {
		expect(migrateSettings(null)).toEqual(DEFAULT_SETTINGS);
	});

	it("adds the wikilink helper toggle for older settings", () => {
		const oldSettings = {
			settingsVersion: 2,
			taskQuery: { filter: "#Inbox", meta: "#todo" },
			authToken: "token",
			showSubtasks: true,
		} as Partial<TodoistSettings>;

		expect(migrateSettings(oldSettings)).toEqual({
			...DEFAULT_SETTINGS,
			...oldSettings,
			settingsVersion: 3,
			enableTextToWikilinkHelper: true,
		});
	});

	it("preserves an existing toggle value", () => {
		const currentSettings: TodoistSettings = {
			...DEFAULT_SETTINGS,
			enableTextToWikilinkHelper: false,
		};

		expect(migrateSettings(currentSettings)).toEqual(currentSettings);
	});
});
