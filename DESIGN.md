# Design system

## Direction

An editorial product studio: warm paper, dark ink, cobalt actions, and quiet mint surfaces. Use a strong type hierarchy and generous space rather than gradients, stock illustrations, or a wall of technology badges. The homepage preview is explicitly illustrative, not real customer activity.

## Edit map

| Change                                                                 | Source                                               |
| ---------------------------------------------------------------------- | ---------------------------------------------------- |
| Palette, light/dark surfaces, radius, body font, focus, reduced motion | `src/globals.css`                                    |
| Token-to-Tailwind mapping and font families                            | `tailwind.config.js`                                 |
| Hero copy, actions, preview, milestone content                         | `src/components/shared/Hero.tsx`                     |
| Homepage sections and feature links                                    | `src/routes/index.tsx`                               |
| Brand and navigation                                                   | `src/components/nav/Navbar.tsx`, `Footer.tsx`        |
| Shared buttons and variants                                            | `src/components/ui/button.tsx`, `button-variants.ts` |
| Authenticated shell                                                    | `src/components/layouts/DashboardLayout.tsx`         |

Change both `:root` and `.dark` when editing colors. HSL variables contain space-separated channels without `hsl()`, compatible with Tailwind opacity modifiers. Use semantic utilities (`bg-card`, `text-muted-foreground`, `border-border`) in app components, not duplicated hex colors. Primary means action; accent means quiet emphasis; destructive means danger.

## Typography and spacing

- System sans stack by default; no remote font dependency. Inter is used only if locally available. Serif italic is a single editorial accent, not body text.
- One page h1, section h2s, card h3s. Hero 48–72px, section titles 30–36px, body 16–18px, supporting labels 12–14px.
- Body line height around 1.6; headings tight. Keep prose to roughly 60–70 characters per line.
- Base spacing unit 4px. Prefer 16/24/32px card padding and 48/64/96px section rhythm.
- Content uses the existing 80rem container. Layouts stack on small screens; keep preview columns `min-w-0` and avoid fixed widths.
- Standard control radius comes from `--radius`; larger content cards use 16–32px corners. Borders define surfaces; shadows stay subtle.

## Components and interactions

Reuse the Radix/shadcn primitives under `src/components/ui`. Keep one primary action per decision point; use outlined secondary actions and plain links for navigation. Homepage actions lead to existing routes or the design-system section, never empty handlers. The preview is noninteractive sample content and is labeled as such.

Preserve loading, empty, validation, error, and success states when adapting forms and data screens. Use real domain labels and content; do not invent testimonials, customer counts, or live metrics.

The fresh-install theme is `system` and follows operating-system changes while the app is open. Appearance choices apply immediately and persist on this device; explicit light/dark choices override the OS. Notification switches save device-local preferences only; email/push delivery needs a backend integration.

## Accessibility and responsive checks

- Every control needs a visible or accessible name. Icon-only controls need `aria-label`; decorative icons use `aria-hidden`.
- Preserve visible `:focus-visible` rings and keyboard operation. Mobile navigation exposes its expanded state.
- Maintain WCAG AA text contrast in both themes; do not convey status with color alone.
- Global reduced-motion rules remove nonessential animation. Prefer specific color/opacity/transform transitions, never `transition-all`.
- Review at 390px and 1440px, light and dark, 200% zoom, and keyboard-only navigation. No horizontal page scroll; actions wrap without clipping.

## Tooling

Run `bun run format`, `bun run lint:strict`, `bun run build`, and `bun run doctor` after changes. Oxfmt and Oxlint use `.oxfmtrc.json` and `.oxlintrc.json`; React Doctor uses `doctor.config.json`. Node 20.19+ or 22.13+ is required (22 LTS recommended), alongside Bun 1.3+.

The lint migration retains React Hooks checks. React Compiler-specific rules are not enabled because this template does not use React Compiler; enabling a compiler is a separate adoption task. Doctor warnings remain visible and errors block. Required TanStack `Route` registrations have only a narrowly adjacent component-export exception; the router plugin owns route HMR. Auth forms and legal pages retain independent ownership despite intentional JSX similarities.

Public build configuration uses an explicit allowlist of statically referenced settings rather than serializing `import.meta.env`. `VITE_AUTH_STORAGE_KEY`, `VITE_AUTH_REFRESH_STORAGE_KEY`, `VITE_AUTH_SESSION_SECONDS`, and `VITE_DJANGO_CSRF_COOKIE_NAME` are public storage names, a session duration, and a cookie name—not credentials. Never place credentials in `VITE_*` variables. Browser-readable bearer tokens remain exposed to XSS; production HttpOnly sessions require a coordinated backend and CSRF migration.

Existing deployments must rename `VITE_AUTH_TOKEN_KEY` to `VITE_AUTH_STORAGE_KEY`, `VITE_AUTH_REFRESH_TOKEN_KEY` to `VITE_AUTH_REFRESH_STORAGE_KEY`, `VITE_AUTH_TOKEN_EXPIRY` to `VITE_AUTH_SESSION_SECONDS`, and `VITE_DJANGO_CSRF_TOKEN_NAME` to `VITE_DJANGO_CSRF_COOKIE_NAME`, including runtime `window.__APP_CONFIG__` settings. The default stored names (`access_token`, `refresh_token`, `csrftoken`) and duration (`3600`) are unchanged, so this configuration migration does not invalidate stored sessions. Explicit `false` feature flags now correctly override enabled defaults.
