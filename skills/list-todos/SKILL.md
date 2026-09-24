---
name: list-todos
description: Scan the project source for TODO/FIXME/HACK/XXX comments and report them grouped by file with line numbers. Use when the user asks to list, find, or summarize outstanding TODOs or unfinished work in this repo.
---

# List TODOs

Find every `TODO`, `FIXME`, `HACK`, and `XXX` marker comment in the project and present them as
a single scannable report.

## Steps

1. Search the tracked source of this repo (skip `node_modules/`, `.git/`, and other
   generated/vendored paths already covered by `.gitignore`) for the markers:
   `TODO`, `FIXME`, `HACK`, `XXX` — case-insensitive, typically following `//`, `#`, `/*`, or
   inside a docstring.
   - Use the Grep tool with a pattern like `\b(TODO|FIXME|HACK|XXX)\b` and `-i`, `-n` on.
2. For each match capture: file path (relative to repo root), line number, and the marker text
   with any inline note (e.g. `TODO(name): message` or `TODO: message`).
3. Group results by file, and within each file sort by line number.
4. Present as a markdown report:
   - A summary line with the total count and number of files affected.
   - One section per file (`### path/to/file.js`), with each TODO as
     `- L<line>: <marker> <note>`.
   - If nothing is found, say so plainly — do not fabricate entries.
5. Do not modify any files — this skill is read-only reporting.
