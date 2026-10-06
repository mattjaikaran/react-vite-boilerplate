# React Vite Boilerplate

A modern, production-ready React application boilerplate built with Vite, TypeScript, and a comprehensive set of development tools. This boilerplate provides a solid foundation for building scalable web applications with excellent developer experience and industry best practices.

**Dual Mode Support**: Works as a standalone SPA or integrates seamlessly with Django applications.

## 📋 Quick Links

- [Features](#features) - Complete feature overview
- [Getting Started](#getting-started) - Quick setup guide
- [Architecture](#architecture) - Project structure and design
- [Deployment](./DEPLOYMENT.md) - Standalone and Django deployment guides
- [Features Guide](./FEATURES.md) - Detailed feature documentation

## Features

### Core Technologies

- **React 19** - Latest React with concurrent features
- **TypeScript 6** - Static type checking
- **Vite 7** - Build tool and development server
- **Bun** - Fast JavaScript runtime and package manager

### Routing & State Management

- **TanStack Router** - Type-safe routing with automatic code splitting
- **Zustand 5** - Frontend-local state with stable shallow selectors
- **TanStack Query** - Server state management and caching
- **React Hook Form** - Performant forms with easy validation
- **Zod 4** - Generated API schemas and frontend-only refinements

### UI & Styling

- **Tailwind CSS 4** - CSS-first utility framework
- **Shadcn/ui** - Accessible component library
- **Dark Mode** - Built-in theme switching with system preference
- **Responsive Design** - Mobile-first approach
- **Feature Flags** - Conditional component rendering

### Authentication

- **Email/Password Authentication** - Traditional login system
- **Magic Link Authentication** - Passwordless login option
- **Cookie Authentication** - HttpOnly credentials, CSRF protection, one centralized refresh/retry
- **Protected Routes** - Route-level authentication guards
- **Django Integration** - Works with Django's authentication system

### Developer Experience

- **Hot Module Replacement** - Instant feedback during development
- **Oxlint & Oxfmt** - Native linting and formatting, with built-in React Hooks checks
- **React Doctor** - React health diagnostics with blocking errors and telemetry disabled
- **Editable design system** - Paper/ink light mode, black/neutral dark mode, and a product-oriented starter; see [DESIGN.md](./DESIGN.md)
- **Vitest 4** - Existing behavior and boundary tests
- **Comprehensive Utils** - 100+ utility functions organized by category
- **Type Safety** - Modular type definitions
- **Docker Support** - Containerized development and deployment

### Utility Library

- **Validation Utils** - Email, password, URL, phone validation
- **Storage Utils** - Type-safe localStorage/sessionStorage
- **Format Utils** - Currency, dates, phone numbers, addresses
- **Array Utils** - Functional programming helpers
- **Object Utils** - Deep operations, property manipulation
- **Async Utils** - Promise utilities, retry logic, queues

## Architecture

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layouts/        # Layout components
│   ├── nav/           # Navigation components
│   ├── providers/     # Context providers
│   └── ui/            # Base UI components (Shadcn/ui)
├── forms/              # Form components
│   ├── auth/          # Authentication forms
│   └── shared/        # Shared form components
├── hooks/              # Custom React hooks
├── lib/                # Utilities and configurations
│   ├── store/         # Zustand store and slices
│   └── utils/         # Utility functions
├── routes/             # TanStack Router routes
├── api/                # Cookie transport and generated SDK/Zod/Query helpers
├── types/              # Frontend-only type definitions
└── test/               # Test utilities and setup
```

### Design Principles

- **Component Composition** - Favor composition over inheritance
- **Custom Hooks** - Extract and reuse stateful logic
- **Type Safety** - Comprehensive TypeScript coverage
- **Separation of Concerns** - Clear boundaries between layers
- **Accessibility** - WCAG compliant components
- **Performance First** - Zustand over Context, minimal re-renders

## Django Integration

This boilerplate is designed to work seamlessly with [Django Ninja](https://django-ninja.dev/) backends. See [django-ninja-boilerplate](https://github.com/mattjaikaran/django-ninja-boilerplate) for more details.

### Features

- **Generated Django Ninja Contracts** - SDK, schemas, and query helpers from the producer export
- **CSRF Token Handling** - Automatic CSRF token management for Django
- **Server-side Pagination** - DataTable supports Django's pagination format
- **Authentication** - HttpOnly access/refresh cookies; no browser-stored bearer tokens

### Setup

```bash
# Set your Django API URL
VITE_API_BASE_URL=http://localhost:8000

# Enable Django SPA mode (optional)
VITE_MODE=django-spa
```

### Server-side Pagination Example

```tsx
import { DataTable } from '@/components/shared/DataTable';
import { todoListTodosOptions } from '@/api/generated/@tanstack/react-query.gen';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

function TodoList() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isPending } = useQuery(
    todoListTodosOptions({ query: { page, page_size: pageSize } })
  );

  return (
    <DataTable
      columns={columns}
      data={data?.results ?? []}
      isLoading={isPending}
      serverPagination={{
        page,
        pageSize,
        total: data?.count ?? 0,
        totalPages: Math.ceil((data?.count ?? 0) / pageSize),
      }}
      onPaginationChange={(newPage, newSize) => {
        setPage(newPage);
        setPageSize(newSize);
      }}
    />
  );
}
```

## Optional Enhancements

The boilerplate includes optional advanced features in `src/optional/`:

### Server-Side Rendering (SSR)

Enable SSR for better SEO and initial load performance.

```bash
# See setup instructions
cat src/optional/ssr/README.md
```

**When to use SSR:**

- Public-facing content pages
- SEO-critical pages
- Social media previews

### React Server Components (RSC)

Utilities for RSC patterns (requires Next.js for full support).

```bash
# See documentation
cat src/optional/rsc/README.md
```

**When to use RSC:**

- Migrating to Next.js App Router
- Building isomorphic utilities

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/)
- Node 22
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/mattjaikaran/react-vite-boilerplate
   cd react-vite-boilerplate
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Set up environment**

   ```bash
   cp env.example .env
   ```

4. **Start development server**

   ```bash
   bun run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

This project includes a comprehensive Makefile with 50+ commands for development, testing, deployment, and Django integration.

### Quick Start Commands

```bash
make help            # Show all available commands
make setup           # Full project setup with dependencies
make dev             # Start development server
make build           # Build for production
make test            # Run tests
```

### Enhanced Makefile Commands

The project includes powerful Makefile commands organized into categories:

- **Development**: `make dev`, `make dev-open`, `make dev-debug`, `make build`, `make preview`
- **Shadcn/ui**: `make shadcn-common`, `make shadcn-forms`, `make shadcn-all`, `make add-shadcn-component COMPONENT=button`
- **Django Integration**: `make django-build`, `make api-schema`, `make api-types`, `make cors-setup`
- **Code Generation**: `make component NAME=MyComponent`, `make hook NAME=useMyHook`
- **Testing**: `make test`, `make test-ui`, `make test-coverage`
- **Utilities**: `make security-audit`, `make performance-test`, `make update-all`

```bash
# View commands by category
make help-all        # Show all commands organized by category
make help-shadcn     # Show shadcn/ui commands
make help-django     # Show Django integration commands
make help-utils      # Show utility commands
```

**📖 Full Documentation**: See [docs/MAKEFILE.md](./docs/MAKEFILE.md) for complete command reference and examples.

### Direct Bun Commands

You can also run commands directly with Bun:

```bash
bun run dev          # Start development server
bun run build        # Build for production
bun run preview      # Preview production build
bun run lint         # Run Oxlint
bun run lint:strict  # Fail on lint warnings
bun run format       # Format with Oxfmt
bun run format:check # Check formatting
bun run doctor       # Scan React health; fail on errors
bun run test         # Run tests
```

### Docker

```bash
bun run docker:build # Build Docker image
bun run docker:run   # Run Docker container
```

## Configuration

### Environment Variables

Copy `env.example` to `.env` and configure:

```env
# API origin only; generated URLs already include /api
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=10000

# Cookie authentication; no token-storage configuration
VITE_ENABLE_MAGIC_LINK=true

# Environment
VITE_APP_ENV=development
VITE_APP_NAME=React Vite Boilerplate
```

### Router configuration

Use TanStack Router's file-based routes in `src/routes/`. Keep settings tab
components in `src/routes/settings/-components/`; the leading `-` excludes
them from route discovery. Regenerate `src/routeTree.gen.ts` through Vite,
not by editing it manually.

Keep auth redirects in route guards and the root router subscription.
Configure the generated client before session bootstrap. Login consumes the
generated mutation; signup creates the account, then logs in explicitly.
Only user/session state stays in memory. Browser storage persists UI preferences,
never credentials or server data.

Todo forms use the generated create schema. The backend has no tags or due-date
fields; those unsupported controls are removed. Self-profile details are
read-only because the backend's user-update route is staff administration, not
self-service. No nonexistent change-password or server-action API is retained.

### Theme Configuration

Dark mode uses the Zustand UI slice. Fresh installs follow the operating system until the user chooses an appearance with the dark/light toggle; explicit choices persist on this device. Dark mode uses a pure-black background and neutral-gray surfaces. Customize CSS-first tokens and utilities in `src/globals.css`; see the definitive [design brief and redesign workflow](./DESIGN.md#applying-a-new-design) for exact edit paths, implementation order, and local checks. There is no Tailwind JavaScript configuration.

## Testing

The project uses Vitest for testing with comprehensive coverage:

- **Unit Tests** - Component and utility function testing
- **Integration Tests** - Form and API integration testing
- **Coverage Reports** - Detailed test coverage tracking

```bash
# Run tests
bun run test

# Run tests with UI
bun run test:ui

# Generate coverage report
bun run test:coverage
```

## Docker

### Development

```bash
docker compose --profile dev up --build app-dev
```

Development runs as the Bun user at http://localhost:3001 (container port 3000).
Dependencies come from the frozen `bun.lock`; recreate the `node_modules` volume
after dependency changes (`docker compose down -v`, which removes project volumes).

### Production

```bash
# Build production image
docker build -t react-vite-boilerplate .

# Run production container
docker run --read-only --tmpfs /tmp:uid=101,gid=101,mode=1770 --cap-drop ALL \
  --security-opt no-new-privileges:true -p 3000:8080 react-vite-boilerplate
```

Production runs non-root nginx on container port 8080, published at
http://localhost:3000. `docker compose up --build app` applies the same hardening.
`/health` checks nginx readiness; SPA routes fall back to `index.html`, hashed
assets are cached immutably, and HTML is revalidated. Image tags and multi-platform
manifest digests are pinned in the Dockerfiles and Compose configuration.
Vite environment values are build-time settings, not runtime container secrets.

The optional monorepo proxy uses `docker compose -f docker-compose.monorepo.yml
--profile production up --build` and maps host port 80 to non-root nginx port 8080.
It preserves `/api/`, `/admin/`, `/static/`, and `/media/` backend routing and Vite HMR.
It requires a separately configured backend at `BACKEND_PATH` (default `../backend`);
the ignored `.runtime/backend` contract checkout is not a deployment source.

## Key Concepts

### Authentication Flow

1. Generated login bootstraps CSRF and submits credentials.
2. The API returns the user and sets HttpOnly access/refresh cookies.
3. User/session state stays in memory; no tokens enter localStorage.
4. A protected 401 triggers one shared refresh and one retry in `src/api/auth.ts`.
5. Reload bootstraps the current user before private routes render.

### State Management

- **Auth State** - User data and session status in memory; bootstrap through generated `authGetCurrentUser`
- **Server State** - Generated TanStack Query options/keys and mutations; paginated Todo envelopes
- **UI State** - Theme, notifications, sidebar state; no duplicate Todo cache

### Form Handling

- React Hook Form for form state management
- Generated Zod schemas, with only frontend-only fields/refinements added locally
- Consistent error handling and display
- Accessible form components

### API Layer

- Producer export: `backend/docs/openapi/openapi.json`
- Pinned `@hey-api/openapi-ts` SDK, fetch client, Zod 4, and TanStack Query 5 plugins
- `src/api/auth.ts`: cookie credentials, CSRF bootstrap/rotation, shared refresh, one retry
- Generated methods preserve the producer's casing: User fields camelCase, Todo timestamps snake_case

```bash
nvm install && nvm use # exact Node LTS from .nvmrc; Node >=22.12 required
bun install --frozen-lockfile
bun run api:generate
bun run api:check
bun run gauntlet
```

Generation uses the existing pinned Oxfmt for deterministic generated bytes;
lint/format tooling and configuration are unchanged. `api:check` regenerates
into a temporary directory and rejects missing, extra, or changed files.
Do not edit generated source. Backend cookies require same-site deployment,
consistent local hostnames, trusted CORS/CSRF origins, and HTTPS in production.
Use `localhost` for both servers, or `127.0.0.1` for both; do not mix them.
The production/dev Docker files here are hardened; backend Docker work is owned
by the separate backend session.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Tests only for bugs, public contracts, or permission/boundary behavior; no rendering/wiring/mocks/snapshots, at most one new file per task, never coverage chasing
- Update documentation as needed
- Ensure all checks pass before submitting

## Built With

- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [React](https://reactjs.org/) - A JavaScript library for building user interfaces
- [TanStack Router](https://tanstack.com/router) - Type-safe routing
- [Shadcn/ui](https://ui.shadcn.com/) - Beautifully designed components
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework

##

Built by [Matt Jaikaran](https://github.com/mattjaikaran)
