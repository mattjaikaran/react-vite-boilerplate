# Scripts

This folder contains shell scripts for managing optional features, project setup, and monorepo configuration.

## Quick Start

```bash
# List available features
make list-features

# Add a feature
make add-feature FEATURE=ssr

# Remove a feature
make remove-feature FEATURE=ssr

# Setup monorepo with Django backend
make setup-monorepo
```

## Available Scripts

### Feature Management

| Script                        | Description                       |
| ----------------------------- | --------------------------------- |
| `add-feature.sh <feature>`    | Enable an optional feature        |
| `remove-feature.sh <feature>` | Disable an optional feature       |
| `setup-ssr.sh`                | Enable Server-Side Rendering      |
| `disable-ssr.sh`              | Disable Server-Side Rendering     |
| `setup-rsc.sh`                | Enable RSC utilities              |
| `disable-rsc.sh`              | Disable RSC utilities             |
| `setup-monorepo.sh`           | Setup for Django backend monorepo |

### Available Features

| Feature | Description                        |
| ------- | ---------------------------------- |
| `ssr`   | Server-Side Rendering with Express |
| `rsc`   | React Server Components utilities  |
| `all`   | All optional features              |

---

## Monorepo Setup (Django + React)

This frontend is designed to work seamlessly with [django-ninja-boilerplate](https://github.com/mattjaikaran/django-ninja-boilerplate) as a monorepo.

### Quick Monorepo Setup

```bash
# 1. Create monorepo directory
mkdir my-project && cd my-project

# 2. Clone both repositories
git clone https://github.com/mattjaikaran/django-ninja-boilerplate backend
git clone https://github.com/mattjaikaran/react-vite-boilerplate frontend

# 3. Setup frontend for monorepo
cd frontend
./scripts/setup-monorepo.sh

# 4. Setup backend
cd ../backend
cp env.example .env
./scripts/setup.sh  # or make up
```

### Expected Monorepo Structure

```
my-project/
├── backend/                  # django-ninja-boilerplate
│   ├── api/                  # Django project settings
│   ├── core/                 # User management
│   ├── todos/                # Todo app (matches frontend)
│   └── manage.py
├── frontend/                 # react-vite-boilerplate
│   ├── src/
│   ├── scripts/
│   └── package.json
└── docker-compose.yml        # Optional: unified compose file
```

### Running the Monorepo

#### Option 1: Run Separately (Recommended for Development)

```bash
# Terminal 1 - Backend
cd backend
make up  # or: python manage.py runserver

# Terminal 2 - Frontend
cd frontend
make dev-monorepo  # or: bun run dev:monorepo
```

#### Option 2: Docker Compose

```bash
# From frontend directory
make docker-monorepo

# Or with nginx reverse proxy
make docker-monorepo-prod
```

### API Integration

The frontend automatically adapts to Django Ninja's API format when `VITE_MODE=django-spa`:

| Feature         | Standalone Mode     | Django SPA Mode                  |
| --------------- | ------------------- | -------------------------------- |
| Auth Login      | `/auth/login`       | `/token/pair` (Django Ninja JWT) |
| Auth Refresh    | `/auth/refresh`     | `/token/refresh`                 |
| User Profile    | `/auth/profile`     | `/users/me`                      |
| Response Format | `{ success, data }` | Direct data or Django format     |
| CSRF            | Not required        | Automatic                        |

### Environment Variables

Copy `env.monorepo.example` to `.env`:

```bash
cp env.monorepo.example .env
```

Key settings for monorepo:

```env
VITE_MODE=django-spa
VITE_API_BASE_URL=http://localhost:8000
```

### Building for Production

```bash
# Build frontend for Django static files
make build-monorepo

# This creates:
# dist/
# ├── index.html
# └── static/
#     ├── js/
#     ├── css/
#     └── assets/
```

Then configure Django to serve these files:

```python
# settings.py
STATICFILES_DIRS = [
    BASE_DIR / 'frontend' / 'dist' / 'static',
]
TEMPLATES[0]['DIRS'] = [BASE_DIR / 'frontend' / 'dist']
```

### Django CORS Configuration

The backend needs CORS configured for local development:

```python
# Django settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
CORS_ALLOW_CREDENTIALS = True
```

See `docs/django-integration/cors-settings.py` for full configuration.

---

## Usage Examples

### Using Make (Recommended)

```bash
# Enable SSR
make setup-ssr

# Enable RSC
make setup-rsc

# Enable all features
make add-feature FEATURE=all

# Disable SSR
make disable-ssr

# List features
make list-features
```

### Using bun/npm

```bash
# Enable SSR
bun run feature:ssr

# Enable RSC
bun run feature:rsc

# Add any feature
bun run feature:add ssr

# Remove any feature
bun run feature:remove ssr
```

### Direct Script Execution

```bash
# Make sure scripts are executable
chmod +x scripts/*.sh

# Run directly
./scripts/setup-ssr.sh
./scripts/add-feature.sh all
```

## What Each Feature Adds

### SSR (Server-Side Rendering)

When enabled, adds:

- `server.ts` - Express server for SSR
- `src/entry-server.tsx` - Server-side render function
- `src/entry-client.tsx` - Client-side hydration
- `vite.config.ssr.ts` - Vite SSR build config
- SSR npm scripts (`dev:ssr`, `build:ssr`, etc.)

Dependencies installed:

- `express`
- `compression`
- `sirv`
- `tsx` (dev)
- `@types/express` (dev)
- `@types/compression` (dev)

### RSC (React Server Components)

When enabled, adds:

- `src/lib/rsc/index.ts` - RSC utilities

Utilities included:

- `isServer` / `isClient` - Environment detection
- `serverOnly()` / `clientOnly()` - Runtime guards
- `cache()` - Memoization for async functions
- `preload()` - Data prefetching helper

Use the generated SDK directly for real API operations. Vite has no server-action
runtime; the old handwritten API action wrappers are removed. A server framework
must supply its own request-cookie and response-cookie boundary.

## Creating New Feature Scripts

To add a new optional feature:

1. Create files in `src/optional/<feature>/`
2. Create `scripts/setup-<feature>.sh`
3. Create `scripts/disable-<feature>.sh`
4. Update `add-feature.sh` and `remove-feature.sh`
5. Add Makefile targets

Template for a new feature script:

```bash
#!/bin/bash
# Enable <Feature Name>
# Usage: ./scripts/setup-<feature>.sh

set -e

echo "🚀 Setting up <feature>..."

# Check if optional files exist
if [ ! -d "src/optional/<feature>" ]; then
    echo "❌ Error: src/optional/<feature> directory not found"
    exit 1
fi

# Install dependencies (if any)
echo "📦 Installing dependencies..."
bun add <packages>

# Copy files
echo "📁 Copying files..."
cp -r src/optional/<feature>/* src/lib/<feature>/

echo "✅ <Feature> setup complete!"
```
