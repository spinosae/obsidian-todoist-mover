import { Task, TodoistApi } from "@doist/todoist-api-typescript";
import { Notice } from "obsidian";

export async function getServerData(
	todoistQuery: string,
	authToken: string,
	showSubtasks: boolean,
	meta: string
): Promise<string> {
	const api = new TodoistApi(authToken);

	const tasks = await callTasksApi(api, todoistQuery);

	if (tasks.length === 0) {
		new Notice(
			`Todoist text: You have no tasks matching filter "${todoistQuery}"`
		);
	}

	let returnString = "";
	if (showSubtasks) {
		// work through all the parent tasks
		const parentTasks = tasks.filter((task) => task.parentId == null);
		parentTasks.forEach((task) => {
			returnString = returnString.concat(
				getFormattedTaskDetail(task, 0, false, meta)
			);
			returnString = returnString.concat(
				getSubTasks(tasks, task.id, 1, meta)
			);
		});

		// determine subtasks that have a parent that wasn't returned in the query
		const subtasks = tasks.filter((task) => task.parentId != null);
		const orphans = subtasks.filter((st) => !parentTasks.contains(st));

		// show the orphaned subtasks with a subtask indicator
		orphans.forEach((task) => {
			returnString = returnString.concat(
				getFormattedTaskDetail(task, 0, true, meta)
			);
			returnString = returnString.concat(
				getSubTasks(tasks, task.id, 1, meta)
			);
		});
	} else {
		tasks.forEach((t) => {
			// show the tasks, inlcude a subtask indicator (since subtask display is disabled)
			returnString = returnString.concat(
				getFormattedTaskDetail(t, 0, true, meta)
			);
		});
	}

	// close the tasks so they don't show up next time
	tasks.forEach((t) => {
		api.closeTask(t.id);
	});

	return returnString;
}

async function callTasksApi(api: TodoistApi, filter: string): Promise<Task[]> {
	let tasks: Task[];
	try {
		tasks = (await api.getTasksByFilter({ query: filter })).results;
	} catch (e) {
		let errorMsg: string;
		switch (e.httpStatusCode) {
			case undefined:
				errorMsg = `Todoist text: There was a problem pulling data from Todoist. Is your internet connection working?`;
				break;
			case 403:
				errorMsg =
					"Todoist text: Authentication with todoist server failed. Check that" +
					" your API token is set correctly in the settings.";
				break;
			default:
				`Todoist text: There was a problem pulling data from Todoist. ${e.responseData}`;
		}
		console.log(errorMsg, e);
		new Notice(errorMsg);
		throw e;
	}
	return tasks;
}

function getSubTasks(
	subtasks: Task[],
	parentId: string,
	indent: number,
	meta: string
): string {
	let returnString = "";
	const filtered = subtasks.filter((sub) => sub.parentId == parentId);
	filtered.forEach((st) => {
		returnString = returnString.concat(
			getFormattedTaskDetail(st, indent, false, meta)
		);
		returnString = returnString.concat(
			getSubTasks(subtasks, st.id, indent + 1, meta)
		);
	});
	return returnString;
}

function getFormattedTaskDetail(
	task: Task,
	indent: number,
	showSubtaskSymbol: boolean,
	meta: string
): string {
	const tabs = "\t".repeat(indent);
	const subtaskIndicator =
		showSubtaskSymbol && task.parentId != null ? "⮑ " : "";

	return `${tabs}- [ ] ${subtaskIndicator}${task.content} ${meta}\n`;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getTaskDescription(description: string, indent: number): string {
	const tabs = "\t".repeat(indent);
	return description.length === 0
		? ""
		: `\n${tabs}\t- ${description
				.trim()
				.replace(/(?:\r\n|\r|\n)+/g, "\n\t- ")}`;
}
