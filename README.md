# Todoist Mover - Obsidian Plugin

Import Todoist tasks into Obsidian, then close the original Todoist tasks after import.

This plugin is built for a specific workflow:
1. Capture tasks in Todoist from email, chat, and other integrations.
2. Pull those tasks into Obsidian when you are ready to plan.
3. Manage the work in Obsidian from there.

> [!WARNING]
> Importing tasks closes the matching Todoist tasks immediately after they are pulled into Obsidian.

> [!IMPORTANT]
> The plugin is intentionally opinionated. Use it only if that workflow matches how you manage tasks.

## Usage

### Before you start
1. Install and enable `Todoist Mover` in Obsidian.
2. Open the plugin settings.
3. In `Todoist Import Settings`, add your Todoist API token.
4. Set the Todoist filter and optional metadata suffix you want applied to imported tasks.

> [!TIP]
> Todoist filters support powerful saved queries. See Todoist’s official [filter definition documentation](https://todoist.com/help/articles/introduction-to-filters).

### Import tasks from Todoist
1. Open the note where you want the tasks inserted.
2. Place the cursor where the imported tasks should go.
3. Run the command `Fetch tasks`.
4. Review the inserted checklist items in Obsidian.

The plugin inserts tasks at the cursor as markdown checklist items and appends the configured metadata. If enabled, subtasks are preserved in the imported structure.

### Use the text-to-wikilink helper
1. Open any markdown note in source mode or live preview.
2. Hover a line or place the cursor on the line.
3. Click the inline link helper icon shown after the line text.
4. The first eligible text block on that line is converted to a wikilink like `[[text]]`.

The helper skips markdown prefixes, existing links, frontmatter, and Obsidian tags so that only plain text is wrapped.

## Verification

- Running `Fetch tasks` inserts Todoist items at the cursor.
- Imported items include your configured metadata.
- When `Text to wikilink` is enabled in `Helper Funtions`, the inline helper appears only on the hovered or active line.

## Security

This plugin stores your Todoist API token in plain text in your `.obsidian/plugins` folder. Anyone with that token can access and manipulate your Todoist data.

> [!WARNING]
> Do not sync or share your `.obsidian/plugins` folder unless you are comfortable exposing the token.

## Release notes

To prepare a release locally:
1. Run `npm test`.
2. Run `npm run build`.
3. Run `npm run release`.
4. Push the release commit and tags with `git push --follow-tags origin master`.

## Attribution

- Forked from https://github.com/wesmoncrief/obsidian-todoist-text
