# Repository guide

This is the canonical agent guide. `CLAUDE.md` points here; repository visual guidance lives in `DESIGN.md`, not in a global skill or another project. Keep changes scoped, remove obsolete callers at cutover, and use small Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`). Never commit secrets or machine-local configuration.

## Toolchain and supply chain

Use Bun for installs and repository scripts, and activate the repository Node version with `nvm install && nvm use` (reads `.nvmrc`). The target stack is Vite 7, TypeScript 6, Tailwind CSS 4, Zod 4, Zustand 5, and Vitest 4. `package.json` and `bun.lock` are authoritative for exact installed versions and supported engines.

Every dependency and executable CLI must have an exact reviewed version: no `latest`, caret/tilde ranges, floating tags, or unpinned `npx`/`bunx`. Prefer repository-owned scripts and locked dependencies. Update the lockfile with dependency changes; use `bun install --frozen-lockfile` for reproducible installs. Never add `bun add -D` to Makefile recipes. Preserve the existing Oxlint/Oxfmt packages, scripts, configurations, and editor settings unless explicitly asked to change lint/format tooling.

## Commands and local verification

Run commands from the repository root. There are no GitHub Actions; verification is local. Do not add workflow files or claim a check passed without running it.

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
| Generate / check API contracts | `bun run api:generate` / `bun run api:check`               |
| React Doctor                   | `bun run doctor`                                           |
| Full local gate / quick gate   | `bun run gauntlet` / `bun run gauntlet:quick`              |
| Build / run container          | `bun run docker:build` / `bun run docker:run`              |

Run checks only after integration, not against concurrent half-finished changes. For delegated work, the integration owner runs verification once after all edits land. Report precisely which checks ran and their results. Doctor uses the exact package version in the lockfile through `bun run doctor`, with telemetry disabled; never download a floating CLI. Keep warnings visible and fix causes instead of hiding directories or disabling broad rules. `doctor.config.json` does not exclude API, hooks, lib, layouts, config, or types.

## Structure and ownership

- `src/routes/`: TanStack file routes; the router plugin owns `src/routeTree.gen.ts`. Do not hand-edit generated route registrations.
- `src/components/ui/`: shared Radix/shadcn primitives; `nav/`, `layouts/`, and `shared/` compose application screens.
- `src/forms/`: form/UI validation and interaction; `src/hooks/`: application orchestration and reusable hooks.
- `src/api/generated/`: backend-generated SDK, Zod schemas, and TanStack Query helpers. Generated output is not a place for handwritten fixes.
- `src/config/`: public configuration; `src/lib/`: shared utilities and local state; `src/types/`: frontend-only types, not duplicate backend contracts.
- `src/globals.css`: Tailwind 4 CSS-first tokens, utility mapping, typography, and global interaction styles.
- `scripts/`, `Makefile`, and `package.json`: repository automation; deployment details are in `DEPLOYMENT.md` and Docker files.
- `.claude/skills/react-doctor/`: vendored real Doctor skill. `.claude/settings.local.json` is ignored, local-only, and must stay untracked.

## Backend contract recipe

The backend is authoritative. Its exported `backend/docs/openapi/openapi.json` owns endpoint paths, methods, payloads, responses, and authentication declarations. A read-only backend checkout may be placed under ignored `.runtime/backend`; never modify backend source as part of frontend work without explicit authorization.

For an API change: inspect the actual exported schema, regenerate using the repository API scripts defined in `package.json`, and migrate every consumer to the generated SDK/Zod/TanStack helpers. Do not invent endpoint shapes, copy backend interfaces into handwritten frontend types, or patch generated files. If an endpoint or export is missing, report the precise backend prerequisite rather than fabricate a fallback. Check regeneration determinism and the backend revision/schema provenance as part of integration. Use the available script names from `package.json`; this guide does not assert that generation has already succeeded.

The pinned `@hey-api/openapi-ts` pipeline in `openapi-ts.config.ts` uses the official built-in TypeScript, fetch client, SDK, Zod 4, and TanStack Query 5 plugins. `bun run api:generate` writes tracked output to `src/api/generated/`; `bun run api:check` regenerates in a temporary directory and compares every relative file path and byte, then removes the temporary directory. The full gauntlet includes this drift gate. `make api-types` and `make api-client` regenerate the same output; `make api-schema` checks the producer export rather than downloading an unrelated schema.

Handwritten convention checks exclude only the generator-owned `src/api/generated/`
boundary (like the router-generated file), because the pinned upstream generator
emits internal `as any` and `@ts-ignore` constructs. Do not hand-edit them or widen
the exception to `src/api/`; `api:check`, TypeScript, and Oxlint still check this
output, and React Doctor has no API-directory exclusion.

Plugin references: [Zod 4](https://heyapi.dev/docs/openapi/typescript/plugins/zod/v4), [TanStack Query 5](https://heyapi.dev/docs/openapi/typescript/plugins/tanstack-query), and [fetch client](https://heyapi.dev/docs/openapi/typescript/clients/fetch). Plugins ship inside the exact generator dependency; they are not independently installed floating packages.

Producer provenance: `git@github.com:mattjaikaran/django-ninja-boilerplate.git`,
base `main` commit `b95a40bd0d826550693b43395face1b46d93fc54`, with the authorized
cookie contract committed separately as local backend commit `619422e` (not pushed).
The frontend snapshot requires that cookie contract, not unmodified upstream main.
In the owning backend checkout, retrieve it with
`git fetch <frontend-root>/.runtime/backend main` and `git cherry-pick 619422e`;
resolve overlaps with the independently owned backend changes.

From the backend checkout, export with
`env -u CI DJANGO_SETTINGS_MODULE=api.settings.test ENVIRONMENT=development TASK_BACKEND=celery OTEL_ENABLED=False .venv/bin/python manage.py export_openapi --api api.urls.api --output <frontend-root>/backend/docs/openapi --format json --no-validate`;
then run `bun run api:generate` and `bun run api:check` from this frontend root.
Test settings select deterministic development schema configuration. Generation
applies the existing formatter without changing JSON semantics; export success
alone is not evidence of browser cookie/CSRF integration.

Keep handwritten code at real boundaries: transport configuration, authentication/CSRF behavior supported by the backend, user-facing error presentation, and frontend-only UI state. Do not describe cookie sessions as working until the backend contract, credentials, CSRF flow, and browser integration have actually been verified. `VITE_*` and runtime browser configuration are public; never put credentials in them.

## Change recipes

- **Page/UI:** reuse existing primitives and semantic utilities, follow `DESIGN.md`, keep loading/empty/error/success states, and use real existing routes rather than empty action handlers.
- **Form:** use generated backend schemas for backend contracts; add only frontend-specific validation at the UI boundary. Preserve accessible labels and explicit submission states.
- **Server state:** use generated TanStack helpers and their query keys; keep Zustand for frontend-local state, not a second server cache.
- **Configuration:** use the explicit public allowlist in `src/config/`; do not serialize all of `import.meta.env`. Update examples/docs when changing public names.
- **Dependency:** select an exact version, update the lockfile and dependency documentation, and migrate obsolete APIs without compatibility shims.
- **Diagnostic:** inspect the finding and owning code, fix the cause, and justify any narrow exception with concrete framework/contract evidence. Never raise coverage or suppress a whole subsystem to improve a score.

## React Doctor review

The only configured file exclusion is `.runtime/**`: an ignored, temporary
backend checkout and downloaded Python dependency cache, not frontend source.
Doctor 0.9.14 scanned that cache and flagged Django's own SQL/version helpers and
vendored Swagger/Redoc bundles. High-confidence out-of-scope dependency findings;
scan the backend independently in its owning repository. No API/hooks/lib/types
or layout directory is excluded, and the blanket unused-file rule override is gone.

Reviewed frontend warnings remain visible, not suppressed:

- Generated `client/utils.gen.ts` awaits authentication schemes in their declared
  order. High-confidence upstream implementation; regeneration owns this file,
  and browser single-flight/replay smoke verifies our actual cookie path.
- Auth form field wrappers and static privacy sections repeat JSX. High-confidence
  style-only duplication; retaining explicit generated-schema fields avoids an
  unnecessary form abstraction.
- Dashboard, profile, and Todo pages have several loading/error/empty/filter
  branches. High-confidence complexity warnings, not observed failures; generated
  queries, extracted Todo rows, and real browser CRUD/reload checks preserve the
  boundary behavior. Do not suppress these or raise the component-size limit.

## Testing policy

tests only for bug fix, changed public contract or permission/boundary; no rendering/wiring/mocks/snapshots; at most one new file/task; never raise coverage.

Do not add new suites, Playwright, MSW, Storybook, or permanent tests for scaffolding. Prefer existing tests for an eligible regression. Preserve existing tests unless the public contract makes them obsolete; update affected contracts/callers/docs together.
