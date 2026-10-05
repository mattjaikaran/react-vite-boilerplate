import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { ArrowRight, Check, Layers, Sparkles } from 'lucide-react';

const milestones = [
  {
    title: 'Make it yours',
    detail: 'Brand, tokens, and typography',
    done: true,
  },
  {
    title: 'Build the experience',
    detail: 'Routes, forms, and real data',
    done: true,
  },
  {
    title: 'Ship something good',
    detail: 'A focused, accessible product',
    done: false,
  },
];

export function Hero() {
  return (
    <section
      className="container grid items-center gap-12 py-16 lg:grid-cols-[1.1fr_1fr] lg:gap-20 lg:py-24"
      aria-labelledby="hero-title"
    >
      <div>
        <p className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          <span className="h-2 w-2 rounded-full bg-primary" /> A better starting
          point
        </p>
        <h1
          id="hero-title"
          className="max-w-xl text-5xl font-semibold leading-[1.06] tracking-[-0.055em] sm:text-6xl lg:text-7xl"
        >
          Less boilerplate.
          <br />
          <span className="font-serif italic text-primary">
            More possibility.
          </span>
        </h1>
        <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
          Start with the details already considered. A thoughtful interface,
          connected workflows, and a design system ready for your next idea.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" asChild>
            <Link to="/auth/register">
              Start building{' '}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#starter-system">Explore the system</a>
          </Button>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          React 19 / TypeScript / Vite / Built to be changed
        </p>
      </div>
      <div className="relative min-w-0 rounded-[2rem] border bg-secondary/60 p-4 sm:p-7">
        <div className="mb-5 flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span className="flex items-center gap-2">
            <Layers className="h-4 w-4" aria-hidden="true" /> YOUR NEXT BIG
            THING
          </span>
          <span className="rounded-full border bg-background px-3 py-1">
            Interface preview
          </span>
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">
                Workspace / Overview
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Good ideas start here.
              </h2>
            </div>
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>
          <div className="my-7 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-secondary p-4">
              <p className="text-xs text-muted-foreground">Your foundation</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">
                Ready.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                From first screen to real product
              </p>
            </div>
            <div className="rounded-xl bg-accent p-4">
              <p className="text-xs text-muted-foreground">Your direction</p>
              <p className="mt-2 font-serif text-3xl italic">Wide open.</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Make room for something original
              </p>
            </div>
          </div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            A clear path forward
          </p>
          <ol className="space-y-4">
            {milestones.map((item, index) => (
              <li key={item.title} className="flex items-center gap-3">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${item.done ? 'bg-primary text-primary-foreground' : 'border text-muted-foreground'}`}
                >
                  {item.done ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <span className="text-xs">{index + 1}</span>
                  )}
                </span>
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          An example composition. Your product, your data, your story.
        </p>
      </div>
    </section>
  );
}
