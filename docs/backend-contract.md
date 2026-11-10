# Backend contract reference

The exported `backend/docs/openapi/openapi.json` is the schema source for
endpoint paths, methods, payloads, responses, and authentication declarations.
Read-only backend checkouts live under ignored `.runtime/backend`.

## Generation pipeline

The pinned `@hey-api/openapi-ts` pipeline in `openapi-ts.config.ts` uses the
official built-in TypeScript, fetch client, SDK, Zod 4, and TanStack Query 5
plugins. `bun run api:generate` writes tracked output to `src/api/generated/`;
`bun run api:check` regenerates in a temporary directory and compares every
relative file path and byte, then removes the temporary directory. The full
gauntlet includes this drift gate. `make api-types` and `make api-client`
regenerate the same output; `make api-schema` checks the producer export rather
than downloading an unrelated schema.

Plugin references: [Zod 4](https://heyapi.dev/docs/openapi/typescript/plugins/zod/v4),
[TanStack Query 5](https://heyapi.dev/docs/openapi/typescript/plugins/tanstack-query),
and the [fetch client](https://heyapi.dev/docs/openapi/typescript/clients/fetch).
Plugins ship inside the exact generator dependency; they are not independently
installed floating packages.

## Producer provenance

Producer: `git@github.com:mattjaikaran/django-ninja-boilerplate.git`, base `main`
commit `b95a40bd0d826550693b43395face1b46d93fc54`, with the authorized cookie
contract published to the backend's `origin/main` as commit `619422e`. The
frontend snapshot requires that cookie contract or a compatible successor. In
the owning backend checkout, retrieve it with `git fetch origin main`. If
integrating onto an independently modified branch, use `git cherry-pick 619422e`
and resolve overlaps with the independently owned backend changes.

## Export

From the backend checkout, export with:

```bash
env -u CI DJANGO_SETTINGS_MODULE=api.settings.test ENVIRONMENT=development \
  TASK_BACKEND=celery OTEL_ENABLED=False .venv/bin/python manage.py export_openapi \
  --api api.urls.api --output <frontend-root>/backend/docs/openapi \
  --format json --no-validate
```

Then run `bun run api:generate` and `bun run api:check` from the frontend root.
Test settings select deterministic development schema configuration. Generation
applies the existing formatter without changing JSON semantics; export success
alone is not evidence of browser cookie/CSRF integration.

## Handwritten boundaries

Handwritten frontend code covers transport configuration, authentication/CSRF
behavior supported by the backend, user-facing error presentation, and
frontend-only UI state.
