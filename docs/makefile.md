# Makefile Commands Reference

This document provides a comprehensive guide to all available Makefile commands in the React Vite Boilerplate project.

## Quick Start

```bash
# Show all available commands
make help

# Show commands by category
make help-all

# Setup project with all dependencies
make setup

# Start development server
make dev
```

## Command Categories

### Development Commands (`make help-dev`)

| Command          | Description                                      |
| ---------------- | ------------------------------------------------ |
| `make install`   | Install dependencies with Bun                    |
| `make dev`       | Start development server                         |
| `make dev-open`  | Start dev server and open browser                |
| `make dev-debug` | Start dev server with debug mode                 |
| `make dev-https` | Start development server with HTTPS              |
| `make dev-host`  | Start development server accessible from network |
| `make build`     | Build for production                             |
| `make preview`   | Preview production build                         |

### Testing Commands (`make help-test`)

| Command              | Description             |
| -------------------- | ----------------------- |
| `make test`          | Run tests               |
| `make test-ui`       | Run tests with UI       |
| `make test-coverage` | Run tests with coverage |

### Shadcn/ui Commands (`make help-shadcn`)

#### Individual Component Management

| Command                                      | Description                     |
| -------------------------------------------- | ------------------------------- |
| `make setup-shadcn`                          | Setup Shadcn/ui components      |
| `make add-shadcn-component COMPONENT=button` | Add a specific component        |
| `make shadcn-list`                           | List all available components   |
| `make shadcn-update`                         | Update all shadcn/ui components |

#### Bulk Component Installation

| Command                  | Description                                                             |
| ------------------------ | ----------------------------------------------------------------------- |
| `make shadcn-common`     | Install common components (button, input, card, badge, avatar)          |
| `make shadcn-forms`      | Install form components (form, input, textarea, select, etc.)           |
| `make shadcn-data`       | Install data display components (table, pagination, badge, etc.)        |
| `make shadcn-navigation` | Install navigation components (navigation-menu, breadcrumb, tabs, etc.) |
| `make shadcn-feedback`   | Install feedback components (alert, dialog, toast, etc.)                |
| `make shadcn-layout`     | Install layout components (aspect-ratio, resizable, scroll-area, etc.)  |
| `make shadcn-all`        | Install all component categories                                        |

#### Examples

```bash
# Add a specific component
make add-shadcn-component COMPONENT=button

# Install all form-related components
make shadcn-forms

# Install everything
make shadcn-all
```

### Django Integration Commands (`make help-django`)

#### Build & Deployment

| Command             | Description                                                    |
| ------------------- | -------------------------------------------------------------- |
| `make django-prep`  | Prepare build for Django static files integration              |
| `make django-build` | Build and prepare for Django with proper static file structure |

#### API Integration

| Command             | Description                                                             |
| ------------------- | ----------------------------------------------------------------------- |
| `make api-schema`   | Check the producer-exported OpenAPI contract against generated output   |
| `make api-types`    | Generate the SDK, Zod schemas, and TanStack Query helpers               |
| `make api-client`   | Regenerate the fetch client and all API contracts (alias for api-types) |
| `make django-types` | Alias for `make api-types`; no schema download                          |

#### Configuration Helpers

| Command                | Description                                           |
| ---------------------- | ----------------------------------------------------- |
| `make cors-setup`      | Generate CORS configuration helper for Django         |
| `make django-urls`     | Generate Django URL configuration helper              |
| `make django-settings` | Generate Django settings helper for React integration |
| `make django-all`      | Generate all Django integration helpers               |

#### Examples

```bash
# Check generated contracts against the producer export
make api-schema

# Regenerate contracts after a backend schema change
make api-types

# Generate Django configuration files
make django-all

# Build for Django deployment
make django-build
```

### Docker Commands (`make help-docker`)

| Command             | Description                                     |
| ------------------- | ----------------------------------------------- |
| `make docker-build` | Build Docker image                              |
| `make docker-run`   | Run Docker container                            |
| `make docker-stop`  | Stop Docker container                           |
| `make docker-dev`   | Run development environment with Docker Compose |

### Utility Commands (`make help-utils`)

#### Code Generation

| Command                           | Description                    |
| --------------------------------- | ------------------------------ |
| `make component NAME=MyComponent` | Generate a new React component |
| `make hook NAME=useMyHook`        | Generate a custom React hook   |

#### Development Tools

| Command                | Description                        |
| ---------------------- | ---------------------------------- |
| `make storybook-init`  | Initialize Storybook               |
| `make storybook`       | Start Storybook development server |
| `make storybook-build` | Build Storybook for production     |

#### Security & Performance

| Command                 | Description                        |
| ----------------------- | ---------------------------------- |
| `make security-audit`   | Run security audit                 |
| `make performance-test` | Run Lighthouse CI performance test |

#### Maintenance

| Command              | Description                       |
| -------------------- | --------------------------------- |
| `make update-all`    | Update all dependencies and tools |
| `make reset-project` | Reset project to clean state      |

#### Git Utilities

| Command          | Description                              |
| ---------------- | ---------------------------------------- |
| `make git-setup` | Setup Git repository with initial commit |
| `make git-hooks` | Setup Git hooks                          |

#### Environment Management

| Command          | Description                            |
| ---------------- | -------------------------------------- |
| `make env-setup` | Copy environment file from example     |
| `make env-dev`   | Create development environment file    |
| `make env-prod`  | Create production environment template |
| `make env-all`   | Create all environment files           |

#### Examples

```bash
# Generate a new component
make component NAME=UserCard

# Generate a custom hook
make hook NAME=useLocalStorage

# Update everything
make update-all

# Setup development environment
make env-all
```

## Django Integration Workflow

### 1. Initial Setup

```bash
# Generate Django configuration helpers
make django-all
```

This creates three configuration files in a generated docs/django-integration
directory:

- `cors-settings.py` - CORS configuration for Django
- `urls-example.py` - URL routing example
- `settings-example.py` - Django settings for React integration

### 2. API Integration

```bash
# Regenerate contracts after exporting the backend schema
make api-types

# Verify generated output matches the producer export byte for byte
make api-schema
```

The backend owns the schema. Export it from the backend checkout, then
regenerate; see [backend-contract.md](backend-contract.md) for the export
command, producer revision, and cookie contract.

### 3. Build for Django

```bash
# Build React app for Django static files
make django-build
```

This creates a `dist/static/` directory that can be copied to your Django `STATIC_ROOT`.

### 4. Environment Variables

Browser configuration is public and uses the `VITE_*` names documented in
`env.example`.

## Advanced Usage

### Chaining Commands

```bash
# Full project setup
make clean && make install && make shadcn-common && make env-all

# Complete Django integration setup
make django-all && make api-schema && make api-types

# Pre-deployment checks
make check-all && make build && make django-prep
```

### Custom Component Generation

```bash
# Generate a component with proper structure
make component NAME=ProductCard
# Creates:
# - src/components/productcard/ProductCard.tsx
# - src/components/productcard/index.ts
```

### Performance Monitoring

```bash
# Run full performance audit
make build && make performance-test
```

## Makefile Variables

Targets that generate files read these make variables:

- `NAME` - component or hook name for `make component` and `make hook`
- `COMPONENT` - shadcn/ui component for `make add-shadcn-component`

## Tips

1. **Use tab completion**: Most shells support tab completion for Makefile targets
2. **Chain commands**: Use `&&` to chain multiple commands
3. **Check help**: Use `make help` for the full list, or `make help-shadcn`,
   `make help-django`, and `make help-utils` for category groups
4. **Environment files**: Always run `make env-setup` after cloning the project

## Troubleshooting

### Common Issues

1. **Command not found**: Make sure you have Bun installed
2. **Permission denied**: Check file permissions or run with appropriate privileges
3. **API schema download fails**: Ensure your Django server is running and accessible
4. **Component generation fails**: Check that the target directory is writable

### Getting Help

```bash
# Show all commands
make help

# Show specific category
make help-shadcn
make help-django
make help-utils

# Show all commands organized by category
make help-all
```
