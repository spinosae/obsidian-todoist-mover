import {
	App,
	Editor,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";
import { getServerData } from "./src/updateFileFromServer";
import { DEFAULT_SETTINGS, TodoistSettings } from "./src/DefaultSettings";

export default class TodoistPlugin extends Plugin {
	settings: TodoistSettings;
	hasIntervalFailure = false;
	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: "todoist-task-pull",
			name: "Fetch tasks",
			editorCallback: async (editor: Editor) => {
				const settings = this.settings;
				if (settings.authToken.contains("TODO - ")) {
					new Notice(
						"Todoist Text: You need to configure your Todoist API token in the Todoist Text plugin settings"
					);
					throw "Todoist text: missing auth token.";
				}

				const query = settings.taskQuery;
				const formattedTodos = await getServerData(
					query.filter,
					settings.authToken,
					settings.showSubtasks,
					query.meta
				);

				editor.replaceRange(formattedTodos, editor.getCursor());
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new TodoistPluginSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		const storedSettings = (await this.loadData()) ?? DEFAULT_SETTINGS;
		this.settings = storedSettings;
		await this.saveSettings();
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class TodoistPluginSettingTab extends PluginSettingTab {
	plugin: TodoistPlugin;

	constructor(app: App, plugin: TodoistPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		containerEl.createEl("h1", { text: "Todoist Mover" });
		containerEl.createEl("a", {
			text: "Important - see usage instructions",
			href: "https://github.com/spinosae/obsidian-todoist-mover/tree/master#readme",
		});

		this.addApiKeySetting(containerEl);
		this.addKeywordTodoistQuerySetting(containerEl);
	}

	private addKeywordTodoistQuerySetting(containerEl: HTMLElement) {
		// todo add warning/stop if multiple same keywords
		const filterDescription = document.createDocumentFragment();
		filterDescription.append(
			"This plugin will fetch tasks matching specified filters. Read more on ",
			containerEl.createEl("a", null, (link) => {
				link.href =
					"https://todoist.com/help/articles/introduction-to-filters";
				link.innerText = "filter definition.";
			})
		);

		new Setting(containerEl)
			.setName("Todoist task filter")
			.setDesc(filterDescription)
			.addText((text) =>
				text
					.setPlaceholder("#Inbox")
					.setValue(this.plugin.settings.taskQuery.filter)
					.onChange(async (value) => {
						this.plugin.settings.taskQuery.filter = value;
						await this.plugin.saveSettings();
					})
					.inputEl.addClass("todoist-query-setting")
			);

		new Setting(containerEl)
			.setName("Meta")
			.setDesc(
				"Arbitrary text to be appended to the imported tasks. E.g. `#imported`"
			)
			.addText((text) =>
				text
					.setPlaceholder("#todo")
					.setValue(this.plugin.settings.taskQuery.meta)
					.onChange(async (value) => {
						this.plugin.settings.taskQuery.meta = value;
						await this.plugin.saveSettings();
					})
					.inputEl.addClass("todoist-query-setting")
			);
	}

	private addApiKeySetting(containerEl: HTMLElement) {
		const tokenDescription = document.createDocumentFragment();
		tokenDescription.createEl("span", null, (span) => {
			span.innerText =
				"This is your personal authentication token for Todoist. Be aware that anyone with this token " +
				"could access all of your Todoist data. This is stored in plain text in your .obsidian/plugins folder." +
				" Ensure that you are comfortable with the security implications before proceeding. " +
				'You can get your token from the "API token" section ';

			span.createEl("a", null, (link) => {
				link.href = "https://todoist.com/prefs/integrations";
				link.innerText = "here.";
			});
		});
		new Setting(containerEl)
			.setName("API token")
			.setDesc(tokenDescription)
			.addText((text) =>
				text
					.setValue(this.plugin.settings.authToken)
					.onChange(async (value) => {
						this.plugin.settings.authToken = value;
						await this.plugin.saveSettings();
						// give another chance for auto-updates to happen
						this.plugin.hasIntervalFailure = false;
					})
			);
	}
}
