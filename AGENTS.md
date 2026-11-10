# Repository guide

This is the single source of agent instructions. `CLAUDE.md` imports it with
`@AGENTS.md`; do not copy rules into other files. There are no nested
`AGENTS.md` files, so this file applies to the whole repository. Visual
guidance lives in [DESIGN.md](DESIGN.md), not in a global skill or another
project.

## Project overview

React Vite boilerplate: a standalone SPA that also deploys behind a Django
backend. The stack is Vite 7, React 19, TypeScript 6, Tailwind CSS 4, TanStack
Router and Query, Zod 4, Zustand 5, and Bun. See [README.md](README.md) for the
feature overview, [DESIGN.md](DESIGN.md) for the visual system, and
[DEPLOYMENT.md](DEPLOYMENT.md) for container and Django deployment.

## Toolchain and supply chain

Use Bun for installs and repository scripts, and activate the repository Node
version with `nvm install && nvm use` (reads `.nvmrc`). `package.json` and
`bun.lock` are authoritative for exact installed versions and supported
engines.

Every dependency and executable CLI must have an exact reviewed version: no
`latest`, caret/tilde ranges, floating tags, or unpinned `npx`/`bunx`. Prefer
repository-owned scripts and locked dependencies. Update the lockfile with
dependency changes; use `bun install --frozen-lockfile` for reproducible
installs. Never add `bun add -D` to Makefile recipes. Preserve the existing
Oxlint/Oxfmt packages, scripts, configurations, and editor settings unless
explicitly asked to change lint/format tooling.

## Commands and local verification

Run commands from the repository root. There are no GitHub Actions;
verification is local. Do not add workflow files or claim a check passed
without running it.

| Purpose                        | Command                                                    |
| ------------------------------ | ---------------------------------------------------------- |
| Install locked dependencies    | `bun install --frozen-lockfile`                            |
| Development server             | `bun run dev`                                              |
| Production build               | `bun run build`                                            |
| Preview built app              | `bun run preview`                                          |
| Type check                     | `bun run type-check`                                       |
| Strict lint                    | `bun run lint:strict`                                      |
| Format check / apply           | `bun run format:check` / `bun run format`                  |
| Existing tests / watch         | `bun run test` / `bun run test:watch`                      |
| Convention / dependency checks | `bun run check-conventions` / `bun run check-dependencies` |
| Agent docs check               | `bun run check-conventions --check AGENT_DOCS`             |
| Enable committed Git hooks     | `git config core.hooksPath .githooks`                      |
| Generate / check API contracts | `bun run api:generate` / `bun run api:check`               |
| React Doctor                   | `bun run doctor`                                           |
| Full local gate / quick gate   | `bun run gauntlet` / `bun run gauntlet:quick`              |
| Build / run container          | `bun run docker:build` / `bun run docker:run`              |

[docs/makefile.md](docs/makefile.md) documents the remaining Makefile targets.
Docker commands require a running Docker daemon; API generation from the
backend requires the producer checkout described in
[docs/backend-contract.md](docs/backend-contract.md).

Run checks only after integration, not against concurrent half-finished
changes. For delegated work, the integration owner runs verification once after
all edits land. Report precisely which checks ran and their results. Doctor uses
the exact package version in the lockfile through `bun run doctor`, with
telemetry disabled; never download a floating CLI. Keep warnings visible and
fix causes instead of hiding directories or disabling broad rules.

## Code standards and architecture

- `src/routes/`: TanStack file routes; the router plugin owns
  `src/routeTree.gen.ts`. Do not hand-edit generated route registrations.
- `src/components/ui/`: shared Radix/shadcn primitives; `nav/`, `layouts/`, and
  `shared/` compose application screens.
- `src/forms/`: form/UI validation and interaction; `src/hooks/`: application
  orchestration and reusable hooks.
- `src/api/generated/`: backend-generated SDK, Zod schemas, and TanStack Query
  helpers. Generated output is not a place for handwritten fixes.
- `src/config/`: public configuration; `src/lib/`: shared utilities and local
  state; `src/types/`: frontend-only types, not duplicate backend contracts.
- `src/globals.css`: Tailwind 4 CSS-first tokens, utility mapping, typography,
  and global interaction styles.
- `scripts/`, `Makefile`, and `package.json`: repository automation; deployment
  details are in [DEPLOYMENT.md](DEPLOYMENT.md) and Docker files.
- `.claude/skills/react-doctor/`: vendored real Doctor skill.
  `.claude/settings.local.json` is ignored, local-only, and must stay untracked.

Change recipes:

- **Page/UI:** reuse existing primitives and semantic utilities, follow
  [DESIGN.md](DESIGN.md), keep loading/empty/error/success states, and use real
  existing routes rather than empty action handlers.
- **Form:** use generated backend schemas for backend contracts; add only
  frontend-specific validation at the UI boundary. Preserve accessible labels
  and explicit submission states.
- **Server state:** use generated TanStack helpers and their query keys; keep
  Zustand for frontend-local state, not a second server cache.
- **Configuration:** use the explicit public allowlist in `src/config/`; do not
  serialize all of `import.meta.env`. Update examples/docs when changing public
  names.
- **Dependency:** select an exact version, update the lockfile and dependency
  documentation, and migrate obsolete APIs without compatibility shims.
- **Diagnostic:** inspect the finding and owning code, fix the cause, and
  justify any narrow exception with concrete framework/contract evidence.
  Never raise coverage or suppress a whole subsystem to improve a score.

Convention checks exclude only the generator-owned `src/api/generated/`
boundary, because the pinned upstream generator emits internal `as any` and
`@ts-ignore` constructs. Do not hand-edit them or widen the exception to
`src/api/`; `api:check`, TypeScript, and Oxlint still check this output, and
React Doctor has no API-directory exclusion.

## Backend contract

The backend is authoritative. Its exported `backend/docs/openapi/openapi.json`
owns endpoint paths, methods, payloads, responses, and authentication
declarations. A read-only backend checkout may be placed under ignored
`.runtime/backend`; never modify backend source without explicit authorization.
Do not invent endpoint shapes, copy backend interfaces into handwritten
frontend types, or patch generated files. If an endpoint or export is missing,
report the precise backend prerequisite rather than fabricate a fallback.
Regenerate with `bun run api:generate` and prove determinism with
`bun run api:check`.

The producer revision, export command, plugin pipeline, and cookie contract
details are in [docs/backend-contract.md](docs/backend-contract.md).

## Testing policy

Tests only for a bug fix, a changed public contract, or permission/boundary
behavior; no rendering/wiring/mocks/snapshots; at most one new file per task;
never raise coverage. Do not add new suites, Playwright, MSW, Storybook, or
permanent tests for scaffolding. Prefer existing tests for an eligible
regression. Preserve existing tests unless the public contract makes them
obsolete; update affected contracts, callers, and docs together.

## Git and commit rules

- Use small, scoped Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`,
  `refactor:`, `test:`. Imperative summary.
- Keep the subject at most 50 characters and wrap the body at 72.
- Commit explicit paths; do not mix unrelated changes or generated drift.
- Never commit secrets, credentials, `.env` files, machine-local configuration,
  or `.claude/settings.local.json`.
- Run the local gates before committing, and never force-push shared branches.
- Enable the committed hook once per clone with `git config core.hooksPath
  .githooks`; it rejects a missing `AGENTS.md`, an unresolved relative link, a
  non-import `CLAUDE.md`, or a skill without `name`/`description` frontmatter.

## Spec workflow (agent-run)

An agent-run task starts from a written spec under [tasks/specs/](tasks/specs/)
and ends with the repository gate green. The format and ownership rules are in
[tasks/specs/README.md](tasks/specs/README.md): state the requirement, list the
files owned, name the verification commands, and keep changes inside that
boundary. The integration owner runs `bun run gauntlet:quick` plus
`bun run build` once after all edits land; specs may add `bun run api:check` or
a focused smoke check when their surface needs it.

## Security

Browser configuration (`VITE_*`) is public; never put credentials in it.
Session credentials stay in HttpOnly cookies, not browser storage or
handwritten caches. Do not describe cookie sessions as working until the
backend contract, credentials, CSRF flow, and browser integration have been
verified. Report suspected vulnerabilities privately instead of publishing
exploit details in an issue or pull request.

## React Doctor

Run `bun run doctor` after React changes and `bun run doctor --verbose --scope
changed` for a regression check. The reviewed findings, exclusions, and
reporting rules are in [docs/react-doctor.md](docs/react-doctor.md).
