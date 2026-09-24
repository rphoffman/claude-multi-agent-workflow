## test-sweet-plugin

A Claude Code plugin with some standard development tools to be leveraged during development.

### What's included

#### Commands

- **`/test-sweet-plugin:summarize-changes`** (command) — lists each file touched on the current branch with a one-line description of the change, sized to paste straight into a pull-request description.
- **`/test-sweet-plugin:format`** (command) - Formats the current file based on standard formating rules

#### Agents

- **`code-reviewer`** (agent) — reviews recent changes for bugs, missing error handling, and unclear names, and returns findings grouped by severity (high, medium, low).
- **`documentation-specialist`** (agent) - Reviews the changes and updates all documentation include readme files based on the current changes

### Skills

- **`list-todos`** (skill) - List all current todos within the project

### hooks

- **`format-on-edit`** (hooks) - forces all files to mantain the proper formating based on file type.

### Setup

Load the plugin locally from the repo root:

```
claude --plugin-dir .
```

Then:

- Run `/test-sweet-plugin:summarize-changes` to get a PR-ready summary of your branch.
- Ask Claude to review your recent changes — it will reach for the `code-reviewer` agent automatically.

After editing plugin files, run `/reload-plugins` to pick up the changes without restarting.

### Structure

```
.
├── .claude-plugin/
│   └── plugin.json            # name + version (the manifest)
├── commands/
│   └── summarize-changes.md
|   └── format.md
├── agents/
│   └── code-reviewer.md
│   └── documentation-specialist.md
├── hooks/
│   └── format-on-edit.py
├── skills/
│   └── list-todos
└── README.md
```
