# Design system

This file is the definitive visual-design authority for this repository. Start a redesign here, then apply it to the source paths below. Editing Markdown does not change the running app; the CSS tokens and React components implement the design. Keep one current design in this template, not a theme gallery or parallel design framework.

## Direction

An editorial product studio: warm paper and black ink in light mode, a pure-black background with neutral-gray surfaces in dark mode, and monochrome actions in both. Quiet mint emphasis remains in light mode. Use a strong type hierarchy and generous space rather than gradients, stock illustrations, or a wall of technology badges. The homepage preview is explicitly illustrative, not real customer activity.

## Design brief

Before implementing a new design, replace the Direction above and record these decisions here:

- **Reference and scope:** supplied screenshots/assets or reference links, target pages, and what stays unchanged.
- **Palette:** light background/foreground, dark background/foreground, card/popover surfaces, primary action, muted/accent, destructive, border/input, and focus ring. Record both modes, not only a hero screenshot. The default dark background is pure black with neutral surfaces; no blue action tint.
- **Typography:** locally available font stack or licensed local assets, heading/body sizes and weights, line height, and readable content width.
- **Layout:** content width, spacing scale, desktop/mobile stacking, navigation, card geometry, and density.
- **Interaction:** hover/focus/disabled/loading/error states, keyboard behavior, reduced motion, and real destinations for actions.

Keep the system-default, direct dark/light toggle invariant below unless a separate behavior change is explicitly requested. A visual redesign does not alter auth, API contracts, routes, or data ownership.

## Edit map

| Change                                                                 | Source                                                                                               |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Palette, light/dark surfaces, radius, body font, focus, reduced motion | `src/globals.css`                                                                                    |
| Token-to-Tailwind mapping, font families, animations, dark variant     | `src/globals.css` (`@theme inline`, `@custom-variant`)                                               |
| Hero copy, actions, preview, milestone content                         | `src/components/shared/Hero.tsx`                                                                     |
| Homepage sections and feature links                                    | `src/routes/index.tsx`                                                                               |
| Brand and navigation                                                   | `src/components/nav/Navbar.tsx`, `src/components/nav/Footer.tsx`                                     |
| Shared buttons and variants                                            | `src/components/ui/button.tsx`, `src/components/ui/button-variants.ts`                               |
| Authenticated shell                                                    | `src/components/layouts/DashboardLayout.tsx`                                                         |
| Cards and surface primitives                                           | `src/components/ui/card.tsx`                                                                         |
| Shared dark/light toggle and settings appearance                       | `src/components/ui/mode-toggle.tsx`, `src/routes/settings/-components/AppearanceTab.tsx`             |
| Theme initialization, persistence, and OS preference following         | `src/lib/store/index.ts`, `src/lib/store/slices/uiSlice.ts`, `src/components/layouts/MainLayout.tsx` |
| Application title and static document metadata                         | `index.html`                                                                                         |

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

The fresh-install theme is `system` and follows operating-system changes while the app is open. The visible control is a direct dark/light toggle, not a three-option menu. Its first click switches away from the current resolved appearance and saves an explicit light/dark choice on this device; subsequent clicks alternate between those two modes. Explicit choices override the OS and survive reloads. The settings Appearance panel reuses the same toggle. Notification switches save device-local preferences only; email/push delivery needs a backend integration.

## Applying a new design

1. **Write the brief first.** Update Direction and the Design brief decisions in this file. Use the edit map to bound the work; preserve real copy, routes, forms, and loading/empty/error/success behavior.
2. **Implement semantic tokens.** Edit `src/globals.css` in `:root` and `.dark`, then the `@theme inline` mapping only if a token is genuinely new. Keep dark backgrounds black and surfaces neutral. Use `--primary` for actions, `--ring` for keyboard focus, and paired foreground tokens for contrast. Keep CSS `color-scheme` aligned with the resolved appearance for native controls.
3. **Adapt primitives once.** Adjust `button-variants.ts`, `card.tsx`, and other existing UI primitives for radius, spacing, and interactive states. Do not fork per-page button/card implementations or hardcode theme colors in compositions.
4. **Compose the screens.** Update `Hero.tsx`, `src/routes/index.tsx`, navigation, and layout files for the brief's hierarchy and responsive structure. Authenticated routes reuse the same tokens and primitives. Keep previews labeled illustrative; do not add fabricated metrics or unsupported actions.
5. **Check the real surface.** Run `bun run dev --host 127.0.0.1 --port 3000`. Inspect the homepage, an auth form, and authenticated settings/Todos with the real backend when exercising protected routes. Check 390px and 1440px, both appearances, keyboard focus, and overflow. With browser theme storage cleared, verify OS changes apply; the first toggle selects the opposite appearance, explicit choices survive reload/OS changes, and no System option appears.
6. **Run the local gate.** After integration, run `bun run format`, `bun run gauntlet`, and `bun run build`. The gauntlet includes generated API drift, formatting, strict lint, type checks, existing tests, conventions, dependencies, and Doctor. Keep warnings visible and follow `AGENTS.md` for test scope; do not add a new suite for a restyle.
7. **Finish the handoff.** Update this file and affected README wording to match the implemented design, report actual visual/gate results and remaining warnings, and commit the scoped changes using small Conventional Commits. Stop any verification servers when finished.

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
