# Agent-run specs

`agent-run` tasks start from a spec in this directory. One spec per task, named
after the issue (`issue-<N>.md`). Keep the spec short and testable.

## Format

```markdown
# <Imperative task title>

## Goal

One paragraph: the behavior or documentation result the task must produce.

## Acceptance

- Observable, checkable outcomes, including the issue's acceptance criteria.

## Files owned

- Paths or globs this task may change. Anything outside this boundary is
  another owner's work.

## Verification

- Exact commands from `AGENTS.md`, `package.json`, or the Makefile.
```

## Rules

- State the requirement, not the implementation; the implementing agent chooses
  the smallest change.
- List files owned explicitly. A spec that needs generated output
  (`src/api/generated/`, `src/routeTree.gen.ts`) names the generator command,
  never manual edits.
- No unit tests unless the change is a bug fix, public contract, or
  permission/boundary change. Prefer an existing test; otherwise add at most one
  focused test file.
- The integration owner runs `bun run gauntlet:quick` and `bun run build` after
  all edits land, plus `bun run api:check` for contract changes. Run only the
  checks covering the changed surface during implementation.
- Record a deliberate decision in the spec or pull request body when the issue
  leaves a choice open; do not silently widen scope.
