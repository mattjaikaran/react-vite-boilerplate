# Scripts

This folder contains shell scripts for managing optional features and project setup.

## Quick Start

```bash
# List available features
make list-features

# Add a feature
make add-feature FEATURE=ssr

# Remove a feature
make remove-feature FEATURE=ssr
```

## Available Scripts

### Feature Management

| Script                        | Description                   |
| ----------------------------- | ----------------------------- |
| `add-feature.sh <feature>`    | Enable an optional feature    |
| `remove-feature.sh <feature>` | Disable an optional feature   |
| `setup-ssr.sh`                | Enable Server-Side Rendering  |
| `disable-ssr.sh`              | Disable Server-Side Rendering |
| `setup-rsc.sh`                | Enable RSC utilities          |
| `disable-rsc.sh`              | Disable RSC utilities         |

### Available Features

| Feature | Description                        |
| ------- | ---------------------------------- |
| `ssr`   | Server-Side Rendering with Express |
| `rsc`   | React Server Components utilities  |
| `all`   | All optional features              |

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
- `src/lib/rsc/server-actions.ts` - Server action patterns

Utilities included:

- `isServer` / `isClient` - Environment detection
- `serverOnly()` / `clientOnly()` - Runtime guards
- `cache()` - Memoization for async functions
- `preload()` - Data prefetching helper

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
