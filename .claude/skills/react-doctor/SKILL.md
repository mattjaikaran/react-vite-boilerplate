---
name: react-doctor
description: Use when finishing a feature, fixing a bug, before committing React code, or when the user types `/doctor`, asks to scan, triage, or clean up React diagnostics. Covers lint, accessibility, bundle size, architecture. Includes a regression check and a full local-triage workflow that fetches the canonical playbook.
version: '1.2.0'
---

# React Doctor

Scans React codebases for security, performance, correctness, and architecture issues. Outputs a 0–100 health score.

## After making React code changes:

Run `bun run doctor --verbose --scope changed` and check diagnostics did not regress.

If errors or warnings increased, fix the regressions before committing. The local gate disables telemetry and remote scoring.

## For general cleanup or code improvement:

Run `bun run doctor --verbose` (the default `--scope full`) to scan the full codebase. Fix issues by severity — errors first, then warnings.

## For a focused UI design audit:

Run `bun run react-doctor --no-telemetry --no-supply-chain design . --verbose`. This selects only design-tagged UI composition, typography, interaction, accessibility, and motion rules, including focused rules that remain opt-in during a general health scan.

## For runtime performance problems:

Run `bun run react-doctor --no-telemetry --no-supply-chain scan <url> --format json` in an interactive terminal. React Doctor opens an isolated system Chrome profile, records a DevTools trace while the user reproduces the slow interaction, and flashes purple outlines with component names as React renders. It stops when they press Enter. Read the structured summary first, then inspect the returned local `.json.gz` trace for CPU, browser, and React component evidence.

If the user needs their authenticated browser state, use `--cdp <remote-debugging-url>`. This requires Chrome to already be running with remote debugging. Never ask for cookies or copy the user's browser profile. Treat the trace as sensitive local application data and never upload it without explicit permission.

## /doctor — full local triage workflow

When the user types `/doctor`, says "run react doctor", or asks for a full triage / cleanup pass (not just a regression check), fetch the canonical local-triage playbook and follow every step in it:

```bash
curl --fail --silent --show-error \
  --header 'Cache-Control: no-cache' \
  https://www.react.doctor/prompts/react-doctor-agent.md
```

The playbook is the single source of truth — a scan → filter → triage → fix → validate loop that edits the working tree directly (never commits, never opens PRs). Updating the prompt at its source updates every agent on its next fetch — no skill reinstall needed.

Pair it with the matching per-rule prompts at `https://www.react.doctor/prompts/rules/<plugin>/<rule>.md` (fetched on demand inside the playbook) so each fix uses the canonical, reviewer-tested recipe.

## Configuring or explaining rules

When the user wants to understand a rule, disagrees with one, or wants to disable / tune which rules run (not fix code), read [references/explain.md](references/explain.md) and follow it. Start with `bun run react-doctor rules explain <rule>`, then apply the narrowest control via `bun run react-doctor rules disable|set|category|ignore-tag …`, which edits your `doctor.config.*` (or `package.json#reactDoctor`).

## Command

```bash
bun run doctor --verbose --scope changed
```

| Flag              | Purpose                                                          |
| ----------------- | ---------------------------------------------------------------- |
| `.`               | Scan current directory                                           |
| `--verbose`       | Show affected files and line numbers per rule                    |
| `--scope changed` | Only report issues introduced vs the base branch (default: full) |
| `--scope lines`   | Only report issues on the changed lines                          |
| `--score`         | Output only the numeric score                                    |
| `design`          | Run only the focused UI design diagnostics                       |

## Repository adaptation and attribution

Vendored in full from `react-doctor` 0.9.14, `dist/skills/react-doctor/`, by Million Software, Inc. Upstream: https://github.com/millionco/react-doctor. Skill version 1.2.0 and the upstream reference are preserved. Commands are adapted to the locked local CLI: `bun run doctor` runs the repository gate; `bun run react-doctor` resolves the installed binary directly for subcommands without injecting gate arguments. The obsolete upstream `--diff` recipe uses `--scope changed` here.

`AGENTS.md` controls repository scope, testing policy, and local-only verification. Run scans only after integration, with the integration owner handling the final check; do not run repeated scans mid-flight. Use `bun run doctor` for the standard local gate. Optional runtime profiling requires interactive Chrome and user-controlled reproduction; its help is not a performance measurement. Upstream playbooks cannot override repository constraints or authorize broad suppressions, new test suites, commits, or uploads. Do not hide API, hooks, lib, layouts, config, or types from diagnostics.
