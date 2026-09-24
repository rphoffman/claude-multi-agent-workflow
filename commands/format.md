---
description: Reformat all code files in the project with Prettier
---

Run Prettier across the project to make sure every file is formatted consistently.

## Steps

1. Run `npx prettier --write .` in the repo root.
2. Run `git status` and summarize which files Prettier changed (if any).
3. Do not run lint or tests as part of this command — formatting only.
