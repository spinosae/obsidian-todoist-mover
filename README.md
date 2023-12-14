# Todoist Mover - Obsidian Plugin

This obsidian plugin import tasks from Todoist and close them in-situ, effectively using Todoist as aggregator and staging area for tasks.

Due to Obsidian's offline nature, it lacks the ability to gather tasks from other services, e.g. creating tasks from an email or a Slack message. Todoist, on the other hand has great integrations. This plugin combines the best of both worlds. Here is the workflow:
1. The user gathers tasks via Todoist
2. The user offloads Todoist tasks to Obsidian via this plugin, and manages them in Obsidian
3. Rinse and repeat

> [!WARNING]
> This plugin closes original Todoist tasks after importing them.

> [!IMPORTANT]
> This is an opinionated plugin for a specific workflow, use it only if it suits your needs.

# Usage
1. Ensure you understand the security implications (see Security section of this file)
2. Install this plugin (Todoist Mover) through Obsidian and enable it
3. Enter your Todoist API token in the plugin settings, as explained there
4. Read below sections to learn how to manipulate tasks

## Importing tasks from Todoist
Executing the command "Todoist Text: Replace keyword with todos" will search the currently open file and replace your keyword (configurable in the settings) with your todos from Todoist. The keyword will use your chosen [filter definition](https://todoist.com/help/articles/introduction-to-filters), which allows you to control exactly what tasks will be shown.

You can configure multiple keywords, each corresponding to a separate Todoist filter definition.

You can also create a macro with [quickadd](https://github.com/chhoumann/quickadd) to insert the keyword and replace them in a single step.

## Security 
This plugin stores your Todoist API token in plain text in your .obsidian/plugins folder. Anyone with your Todoist API token could access and manipulate all of your Todoist data. Ensure that you are not syncing/sharing your .obsidian/plugins folder for security purposes. Use this plugin at your own risk.

## Feature requests
Please reach out (by filing a GitHub issue) if you'd like to discuss possible new features or need help with anything! If you do see a GitHub issue that already exists, feel free to comment on it, which could raise the priority/help inform how the feature is implemented.

See the [changelog](CHANGELOG.md) for recent changes.

I'm actively creating new features, so be sure to "watch" this repository (with the GitHub button near the top of the screen) to get notified so that you'll know when to update.

## Attribution
- This is a fork of https://github.com/wesmoncrief/obsidian-todoist-text
