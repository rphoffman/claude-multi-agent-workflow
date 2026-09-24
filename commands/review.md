---
description: This will execute the code-reviewer agent and the documentation-specialist agent to return all changes and documentation update
---

Run both the code-reviewer and documentation specialist in parallel to review the current code and provide documentation updates based on the code changes.

## Steps

1. In a single message, call the Agent tool twice in parallel: once with subagent_type "code-reviewer" to list any issues, and once with subagent_type "documentation-specialist" to describe what changed and update docs accordingly.
2. Present both results together.
3. If the code-reviewer does not report any issues with the changes then execute the PR Request agent using the summarize-changes command to provide a PR comment.
