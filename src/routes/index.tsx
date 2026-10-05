import { Hero } from '@/components/shared/Hero';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowUpRight, Palette, PanelsTopLeft, Workflow } from 'lucide-react';

// TanStack Router requires the named Route registration in this file.
// react-doctor-disable-next-line react-doctor/only-export-components
export const Route = createFileRoute('/')({ component: HomePage });

const foundations = [
  {
    number: '01',
    icon: Palette,
    title: 'A system, not a blank canvas.',
    description:
      'Semantic colors, considered spacing, and light and dark themes. Change a few tokens. Change the whole feeling.',
    to: '/settings',
  },
  {
    number: '02',
    icon: PanelsTopLeft,
    title: 'The everyday details, handled.',
    description:
      'Authentication, account settings, and responsive layouts. Real screens you can reshape instead of rebuilding.',
    to: '/auth/register',
  },
  {
    number: '03',
    icon: Workflow,
    title: 'Built for what comes next.',
    description:
      'Typed routes, data fetching, and reusable components. Keep the foundation and bring your own product.',
    to: '/about',
  },
] as const;

function HomePage() {
  return (
    <>
      <Hero />
      <section
        id="starter-system"
        className="container scroll-mt-8 pb-20"
        aria-labelledby="system-title"
      >
        <div className="mb-8 flex flex-col justify-between gap-4 border-t pt-10 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Considered from the start
            </p>
            <h2
              id="system-title"
              className="text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              Small details. Strong foundation.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Less time setting up. More time making something that feels like
            you.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {foundations.map(({ number, icon: Icon, title, description, to }) => (
            <article
              key={number}
              className="flex flex-col rounded-2xl border bg-card p-6 sm:p-8"
            >
              <div className="mb-10 flex items-center justify-between">
                <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                <span className="font-mono text-xs text-muted-foreground">
                  {number}
                </span>
              </div>
              <h3 className="text-xl font-semibold leading-snug tracking-tight">
                {title}
              </h3>
              <p className="mb-6 mt-3 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
              <Link
                to={to}
                className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-primary"
              >
                Explore{' '}
                {number === '01'
                  ? 'settings'
                  : number === '02'
                    ? 'your account'
                    : 'the stack'}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-secondary px-6 py-5">
          <p className="text-sm font-medium">
            One cohesive toolkit. No unnecessary ceremony.
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            React · Vite · TanStack · Tailwind · Oxlint
          </p>
        </div>
      </section>
    </>
  );
}
