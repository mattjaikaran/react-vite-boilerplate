import { Hero } from '@/components/shared/Hero';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  return (
    <div>
      <Hero />

      <div className="page-container">
        <div className="space-y-16">
          <div className="space-y-4 text-center">
            <h2 className="text-3xl font-bold">Tech Stack</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Built with modern tools and libraries for the best developer
              experience
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {[
              'React 19',
              'TypeScript',
              'Vite',
              'TanStack Router',
              'React Query',
              'Zustand',
              'Tailwind CSS',
              'Shadcn/ui',
              'React Hook Form',
              'Zod',
              'Axios',
              'Vitest',
            ].map(tech => (
              <span
                key={tech}
                className="rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
