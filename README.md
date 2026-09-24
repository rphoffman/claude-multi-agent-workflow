## test-sweet-plugin

A Claude Code plugin with some standard development tools to be leveraged during development.

### What's included

#### Commands

- **`/test-sweet-plugin:summarize-changes`** (command) — lists each file touched on the current branch with a one-line description of the change, sized to paste straight into a pull-request description.
- **`/test-sweet-plugin:format`** (command) - Formats the current file based on standard formating rules
- **`/test-sweet-plugin:review`** (command) - Command to execute the code-reviewer and documentation-specialist agents in parallel.

#### Agents

- **`code-reviewer`** (agent) — reviews recent changes for bugs, missing error handling, and unclear names, and returns findings grouped by severity (high, medium, low). Read-only.
- **`documentation-specialist`** (agent) - Reviews the changes and updates all documentation include readme files based on the current changes
- **`pr-creator`** (agent) - Summarizes the changes on the current branch and opens a pull request using that summary as the PR body.

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
- Run `/test-sweet-plugin:review` to run the `code-reviewer` and `documentation-specialist` agents in parallel and get combined findings plus documentation updates in one pass.
- Ask Claude to open a PR for your current branch — it will reach for the `pr-creator` agent, which summarizes the branch's changes and runs `gh pr create` with that summary as the body.

After editing plugin files, run `/reload-plugins` to pick up the changes without restarting.

### Structure

```
.
├── .claude-plugin/
│   └── plugin.json            # name + version (the manifest)
├── commands/
│   └── summarize-changes.md
|   └── format.md
|   └── review.md
├── agents/
│   └── code-reviewer.md
│   └── documentation-specialist.md
│   └── pr-creator.md
├── hooks/
│   └── format-on-edit.py
│   └── hooks.json
├── skills/
│   └── list-todos
└── README.md
```
