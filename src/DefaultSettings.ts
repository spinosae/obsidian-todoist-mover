export interface TodoistSettings {
	settingsVersion: number;
	// can't use a dictionary/object because it doesn't have first-class support
	// for indexing, which is needed for settings manipulation/persistence
	taskQuery: todoistQuery;
	authToken: string;
	showSubtasks: boolean;
	enableTextToWikilinkHelper: boolean;
	// never rely on adding a new default value. Any change should entail bumping the settingsVersion
	// and adding a settings migration
}

export interface todoistQuery {
	filter: string;
	meta: string;
}

export const DEFAULT_SETTINGS: TodoistSettings = {
	settingsVersion: 3,
	taskQuery: { filter: "#Inbox", meta: "" },
	authToken: "TODO - get your auth token",
	showSubtasks: true,
	enableTextToWikilinkHelper: true,
};

export function migrateSettings(
	storedSettings: Partial<TodoistSettings> | null | undefined
): TodoistSettings {
	if (storedSettings == null) {
		return { ...DEFAULT_SETTINGS };
	}

	if ((storedSettings.settingsVersion ?? 1) < 3) {
		return {
			...DEFAULT_SETTINGS,
			...storedSettings,
			settingsVersion: 3,
			taskQuery: {
				...DEFAULT_SETTINGS.taskQuery,
				...storedSettings.taskQuery,
			},
			enableTextToWikilinkHelper:
				storedSettings.enableTextToWikilinkHelper ??
				DEFAULT_SETTINGS.enableTextToWikilinkHelper,
		};
	}

	return {
		...DEFAULT_SETTINGS,
		...storedSettings,
		taskQuery: {
			...DEFAULT_SETTINGS.taskQuery,
			...storedSettings.taskQuery,
		},
	};
}
