# Notes

## What this plugin does

`test-sweet-plugin` is a Claude Code plugin that bundles a few standard
development tools so they're available in any repo without re-writing them
each time:

- **Commands** — `/test-sweet-plugin:summarize-changes` (PR-ready summary of
  the current branch), `/test-sweet-plugin:format` (format the current file),
  and `/test-sweet-plugin:review` (run code review + doc updates together).
- **Agents** — `code-reviewer` (flags bugs, missing error handling, unclear
  names) and `documentation-specialist` (keeps README/docs in sync with
  changes).
- **Skills** — `list-todos` (find outstanding TODO/FIXME/HACK/XXX comments).
- **Hooks** — `format-on-edit` (formats files on save so nothing lands
  unformatted).

### Install

From the repo root:

```
claude --plugin-dir .
```

After editing any plugin file, run `/reload-plugins` to pick up the change
without restarting the session.

## Scoping decision: per-agent model choice

`code-reviewer` runs on `model: haiku`; `documentation-specialist` runs on
`model: sonnet` (`agents/code-reviewer.md`, `agents/documentation-specialist.md`).

**Why:** the two agents do different kinds of work. Code review here is
pattern-matching over a diff — spot bugs, missing error handling, unclear
names, report them grouped by severity. That's a cheap, fast, well-bounded
task, so the smaller/faster model is enough and keeps the loop quick to run
after every edit. Documentation is generative and judgment-heavy — deciding
what's missing, drafting coherent prose, keeping a whole README consistent —
which benefits from the stronger model's writing quality. Giving both agents
the same tool access (`Read, Grep, Glob, Bash, Write`) but different models
lets the cost/latency scale with how much reasoning the task actually needs,
instead of defaulting every agent to the biggest model available.

## Why `/review` runs its two agents in parallel

`commands/review.md` fires `code-reviewer` and `documentation-specialist` as
two parallel `Agent` calls in a single message, not one after the other.

**Why:** neither agent depends on the other's output. Both start from the
same input — the current diff/working tree — and produce independent
artifacts (a findings list vs. doc edits). Running them sequentially would
only add latency, not correctness, since there's nothing for the second
agent to wait on. Parallel execution is the pattern used elsewhere in the
plugin's guidance too: independent tool calls with no data dependency
between them should be batched together rather than chained. If a future
version needed the doc specialist to react to the reviewer's findings (e.g.
document a bug's root cause), that dependency would force sequencing —
but today's workflow has no such coupling.
