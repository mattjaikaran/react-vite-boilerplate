# React Doctor reference

The only configured file exclusion is `.runtime/**`: an ignored, temporary
backend checkout and downloaded Python dependency cache, not frontend source.
Doctor 0.9.14 scanned that cache and flagged Django's own SQL/version helpers
and vendored Swagger/Redoc bundles. Those are high-confidence out-of-scope
dependency findings; scan the backend independently in its owning repository.
No API/hooks/lib/types or layout directory is excluded, and the blanket
unused-file rule override is gone.

## Commands

- Regression check after React edits: `bun run doctor --verbose --scope changed`
- Full scan: `bun run doctor` (the default `--scope full`)
- Focused UI design audit:
  `bun run react-doctor --no-telemetry --no-supply-chain design . --verbose`

If errors or warnings increased, fix the regressions before committing. The
local gate disables telemetry and remote scoring.

## Reviewed warnings

These remain visible and must not be suppressed:

- Generated `client/utils.gen.ts` awaits authentication schemes in their
  declared order. High-confidence upstream implementation; regeneration owns
  this file, and browser single-flight/replay smoke verifies our actual cookie
  path.
- Auth form field wrappers and static privacy sections repeat JSX.
  High-confidence style-only duplication; retaining explicit generated-schema
  fields avoids an unnecessary form abstraction.
- Dashboard, profile, and Todo pages have several loading/error/empty/filter
  branches. High-confidence complexity warnings, not observed failures;
  generated queries, extracted Todo rows, and real browser CRUD/reload checks
  preserve the boundary behavior. Do not suppress these or raise the
  component-size limit.
