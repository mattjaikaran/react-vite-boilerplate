# React Vite Boilerplate Makefile
# Requires Bun to be installed

.PHONY: help install dev build preview test test-ui test-coverage lint lint-fix format format-check type-check clean setup docker-build docker-run docker-stop

# Default target
help: ## Show this help message
	@echo "React Vite Boilerplate - Available Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development Commands
install: ## Install dependencies
	@echo "Installing dependencies with Bun..."
	bun install

dev: ## Start development server
	@echo "Starting development server..."
	bun dev

build: ## Build for production
	@echo "Building for production..."
	bun run build

preview: ## Preview production build
	@echo "Starting preview server..."
	bun run preview

# Testing Commands
test: ## Run tests
	@echo "Running tests..."
	bun run test

test-ui: ## Run tests with UI
	@echo "Running tests with UI..."
	bun run test:ui

test-coverage: ## Run tests with coverage
	@echo "Running tests with coverage..."
	bun run test:coverage

# Code Quality Commands
lint: ## Run ESLint
	@echo "Running ESLint..."
	bun run lint

lint-fix: ## Fix ESLint issues
	@echo "Fixing ESLint issues..."
	bun run lint:fix

format: ## Format code with Prettier
	@echo "Formatting code..."
	bun run format

format-check: ## Check code formatting
	@echo "Checking code formatting..."
	bun run format:check

type-check: ## Run TypeScript type checking
	@echo "Running TypeScript type checking..."
	bun run type-check

# Setup Commands
setup: install ## Full project setup
	@echo "Setting up project..."
	@echo "Installing dependencies..."
	bun install
	@echo "Setting up Shadcn/ui..."
	bunx shadcn@latest init -y
	@echo "Setup complete!"

setup-shadcn: ## Setup Shadcn/ui components
	@echo "Setting up Shadcn/ui..."
	bunx shadcn@latest init -y

add-shadcn-component: ## Add a Shadcn/ui component (usage: make add-shadcn-component COMPONENT=button)
	@if [ -z "$(COMPONENT)" ]; then \
		echo "Usage: make add-shadcn-component COMPONENT=component-name"; \
		echo "Example: make add-shadcn-component COMPONENT=button"; \
		exit 1; \
	fi
	@echo "Adding Shadcn/ui component: $(COMPONENT)"
	bunx shadcn@latest add $(COMPONENT) -y

# Docker Commands
docker-build: ## Build Docker image
	@echo "Building Docker image..."
	docker build -t react-vite-boilerplate .

docker-run: ## Run Docker container
	@echo "Running Docker container..."
	docker run -p 3000:3000 --name react-vite-boilerplate-container react-vite-boilerplate

docker-stop: ## Stop Docker container
	@echo "Stopping Docker container..."
	docker stop react-vite-boilerplate-container || true
	docker rm react-vite-boilerplate-container || true

docker-dev: ## Run development environment with Docker Compose
	@echo "Starting development environment with Docker Compose..."
	docker-compose up --build

# Utility Commands
clean: ## Clean node_modules and build artifacts
	@echo "Cleaning project..."
	rm -rf node_modules
	rm -rf dist
	rm -rf coverage
	rm -rf .turbo

fresh-install: clean install ## Clean install dependencies
	@echo "Fresh install complete!"

check-all: type-check lint test ## Run all checks (type-check, lint, test)
	@echo "All checks passed!"

# Git Hooks Setup
setup-hooks: ## Setup Git hooks
	@echo "Setting up Git hooks..."
	@if [ ! -d ".git" ]; then \
		echo "Not a Git repository. Initializing..."; \
		git init; \
	fi
	@echo "#!/bin/sh" > .git/hooks/pre-commit
	@echo "make check-all" >> .git/hooks/pre-commit
	@chmod +x .git/hooks/pre-commit
	@echo "Git hooks setup complete!"

# Environment Commands
env-setup: ## Copy environment file
	@if [ ! -f .env ]; then \
		echo "Creating .env file from env.example..."; \
		cp env.example .env; \
		echo ".env file created! Please update it with your configuration."; \
	else \
		echo ".env file already exists."; \
	fi

# Package Management
update-deps: ## Update dependencies
	@echo "Updating dependencies..."
	bun update

outdated: ## Check for outdated dependencies
	@echo "Checking for outdated dependencies..."
	bun outdated

# Production Commands
deploy-prep: clean install build test ## Prepare for deployment
	@echo "Deployment preparation complete!"

# Router Commands (TanStack Router specific)
generate-routes: ## Generate TanStack Router routes
	@echo "Generating TanStack Router routes..."
	bunx @tanstack/router-cli generate

# Development Utilities
dev-https: ## Start development server with HTTPS
	@echo "Starting development server with HTTPS..."
	bun run dev --https

dev-host: ## Start development server accessible from network
	@echo "Starting development server accessible from network..."
	bun run dev --host

# Bundle Analysis
analyze: build ## Analyze bundle size
	@echo "Analyzing bundle size..."
	bunx vite-bundle-analyzer dist

# Database/API Commands (for future use)
api-types: ## Generate API types (placeholder for future implementation)
	@echo "Generating API types..."
	@echo "This command will generate TypeScript types from your API schema"

# Help for specific categories
help-dev: ## Show development commands
	@echo "Development Commands:"
	@grep -E '^(install|dev|build|preview):.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

help-test: ## Show testing commands
	@echo "Testing Commands:"
	@grep -E '^test.*:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

help-docker: ## Show Docker commands
	@echo "Docker Commands:"
	@grep -E '^docker.*:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'
