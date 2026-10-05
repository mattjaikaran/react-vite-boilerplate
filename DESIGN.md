# Design system

## Direction

An editorial product studio: warm paper, dark ink, cobalt actions, and quiet mint surfaces. Use a strong type hierarchy and generous space rather than gradients, stock illustrations, or a wall of technology badges. The homepage preview is explicitly illustrative, not real customer activity.

## Edit map

| Change                                                                 | Source                                                 |
| ---------------------------------------------------------------------- | ------------------------------------------------------ |
| Palette, light/dark surfaces, radius, body font, focus, reduced motion | `src/globals.css`                                      |
| Token-to-Tailwind mapping, font families, animations, dark variant     | `src/globals.css` (`@theme inline`, `@custom-variant`) |
| Hero copy, actions, preview, milestone content                         | `src/components/shared/Hero.tsx`                       |
| Homepage sections and feature links                                    | `src/routes/index.tsx`                                 |
| Brand and navigation                                                   | `src/components/nav/Navbar.tsx`, `Footer.tsx`          |
| Shared buttons and variants                                            | `src/components/ui/button.tsx`, `button-variants.ts`   |
| Authenticated shell                                                    | `src/components/layouts/DashboardLayout.tsx`           |

Change both `:root` and `.dark` when editing colors. HSL variables contain space-separated channels without `hsl()`; Tailwind 4's `@theme inline` maps them to semantic `--color-*` tokens with `hsl(var(--...))`, preserving opacity modifiers. The CSS-first theme also maps radii, the existing local/system sans stack, and accordion animations; `@custom-variant dark` follows `.dark` descendants. Use semantic utilities (`bg-card`, `text-muted-foreground`, `border-border`) in app components, not duplicated hex colors. Primary means action; accent means quiet emphasis; destructive means danger. Tailwind is integrated through `@tailwindcss/vite`, not a JavaScript Tailwind or PostCSS configuration.

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

Use the local commands and verification policy in `AGENTS.md`. Oxfmt and Oxlint use `.oxfmtrc.json` and `.oxlintrc.json`; React Doctor uses `doctor.config.json` and the repository-pinned `bun run doctor`. Toolchain versions and Node/Bun requirements come from `package.json` and `bun.lock`, not duplicated version promises here.

The lint migration retains React Hooks checks. React Compiler-specific rules are not enabled because this template does not use React Compiler; enabling a compiler is a separate adoption task. Doctor warnings remain visible and errors block; there are no blanket unused-file suppressions or source-directory exclusions. Required TanStack `Route` registrations have only a narrowly adjacent component-export exception; the router plugin owns route HMR. Auth forms and legal pages retain independent ownership despite intentional JSX similarities.

Public build configuration uses an explicit allowlist of statically referenced settings rather than serializing `import.meta.env`. Browser-exposed storage names, durations, and cookie names are configuration, not credentials. Never place credentials in `VITE_*` variables or runtime browser configuration. Authentication and CSRF must match the authoritative backend contract; a visual theme change does not establish a working cookie-session integration.

This design system is repository-only. Keep application tokens and component rules here; do not copy them into global agent skills or use another repository's design document as authority.
