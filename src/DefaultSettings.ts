export interface TodoistSettings {
	settingsVersion: number;
	// can't use a dictionary/object because it doesn't have first-class support
	// for indexing, which is needed for settings manipulation/persistence
	taskQuery: todoistQuery;
	authToken: string;
	showSubtasks: boolean;
	// never rely on adding a new default value. Any change should entail bumping the settingsVersion
	// and adding a settings migration
}

export interface todoistQuery {
	filter: string;
	meta: string;
}

export const DEFAULT_SETTINGS: TodoistSettings = {
	settingsVersion: 2,
	taskQuery: { filter: "#Inbox", meta: "" },
	authToken: "TODO - get your auth token",
	showSubtasks: true,
};
