#!/bin/bash
# Setup script for Django + React monorepo
# This script sets up the frontend to work alongside the Django backend
# Usage: ./scripts/setup-monorepo.sh [--backend-path <path>]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
BACKEND_PATH="../backend"
FRONTEND_DIR=$(pwd)

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --backend-path)
            BACKEND_PATH="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 [--backend-path <path>]"
            echo ""
            echo "Options:"
            echo "  --backend-path <path>  Path to Django backend (default: ../backend)"
            echo "  --help, -h             Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

echo -e "${BLUE}🚀 Setting up Django + React Monorepo${NC}"
echo ""

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Run this script from the frontend directory.${NC}"
    exit 1
fi

# Check if backend exists
if [ ! -d "$BACKEND_PATH" ]; then
    echo -e "${YELLOW}⚠️  Backend directory not found at: $BACKEND_PATH${NC}"
    echo -e "${YELLOW}   Creating symlink placeholder...${NC}"
    echo ""
    echo -e "${BLUE}To complete setup, either:${NC}"
    echo "  1. Clone the backend: git clone https://github.com/mattjaikaran/django-ninja-boilerplate $BACKEND_PATH"
    echo "  2. Run this script again with --backend-path pointing to your Django project"
    echo ""
fi

# Create .env file if it doesn't exist
echo -e "${GREEN}📝 Setting up environment files...${NC}"

if [ ! -f ".env" ]; then
    cat > .env << 'EOF'
# Application Mode - Set to 'django-spa' for monorepo setup
VITE_MODE=django-spa

# API origin only; generated paths already include /api
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=10000

# HttpOnly cookie authentication with CSRF protection
VITE_ENABLE_MAGIC_LINK=true

# Features
VITE_ENABLE_TODOS=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_DEVTOOLS=true

# Django Integration
VITE_DJANGO_CSRF_COOKIE_NAME=csrftoken
VITE_DJANGO_STATIC_URL=/static/
VITE_DJANGO_MEDIA_URL=/media/
VITE_DJANGO_API_PREFIX=/api

# Environment
VITE_APP_ENV=development
VITE_APP_NAME=Django + React Monorepo
VITE_APP_VERSION=1.0.0
VITE_DEBUG=true
EOF
    echo -e "${GREEN}   ✅ Created .env file with Django SPA configuration${NC}"
else
    echo -e "${YELLOW}   ⚠️  .env file already exists. Please verify VITE_MODE=django-spa${NC}"
fi

# Create .env.monorepo for reference
cat > .env.monorepo << 'EOF'
# Monorepo-specific environment configuration
# Copy this to .env to use Django SPA mode

VITE_MODE=django-spa
VITE_API_BASE_URL=http://localhost:8000
VITE_DJANGO_CSRF_COOKIE_NAME=csrftoken
VITE_DJANGO_STATIC_URL=/static/
VITE_DJANGO_MEDIA_URL=/media/
VITE_DJANGO_API_PREFIX=/api
EOF
echo -e "${GREEN}   ✅ Created .env.monorepo reference file${NC}"

# Create vite.config.monorepo.ts for monorepo-specific config
echo -e "${GREEN}📦 Creating monorepo Vite configuration...${NC}"

cat > vite.config.monorepo.ts << 'EOF'
/**
 * Vite configuration for monorepo setup with Django backend
 * Use this when running frontend alongside Django
 */
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      '@/components': path.resolve(import.meta.dirname, './src/components'),
      '@/routes': path.resolve(import.meta.dirname, './src/routes'),
      '@/forms': path.resolve(import.meta.dirname, './src/forms'),
      '@/lib': path.resolve(import.meta.dirname, './src/lib'),
      '@/hooks': path.resolve(import.meta.dirname, './src/hooks'),
      '@/api': path.resolve(import.meta.dirname, './src/api'),
      '@/types': path.resolve(import.meta.dirname, './src/types'),
      '@/config': path.resolve(import.meta.dirname, './src/config'),
    },
  },
  server: {
    port: 3000,
    host: true,
    // Proxy API requests to Django backend
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/static': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/media': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/admin': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 3000,
    host: true,
  },
  build: {
    // Output for Django static files integration
    outDir: 'dist',
    assetsDir: 'static/assets',
    rollupOptions: {
      output: {
        // Consistent file naming for Django integration
        entryFileNames: 'static/js/[name]-[hash].js',
        chunkFileNames: 'static/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || '';
          if (name.endsWith('.css')) {
            return 'static/css/[name]-[hash][extname]';
          }
          return 'static/assets/[name]-[hash][extname]';
        },
      },
    },
  },
});
EOF
echo -e "${GREEN}   ✅ Created vite.config.monorepo.ts${NC}"

# Update package.json with monorepo scripts
echo -e "${GREEN}📝 Adding monorepo scripts to package.json...${NC}"

# Check if jq is available
if command -v jq &> /dev/null; then
    # Use jq to add scripts
    tmp=$(mktemp)
    jq '.scripts["dev:monorepo"] = "vite --config vite.config.monorepo.ts" |
        .scripts["build:monorepo"] = "tsc -b && vite build --config vite.config.monorepo.ts" |
        .scripts["preview:monorepo"] = "vite preview --config vite.config.monorepo.ts"' package.json > "$tmp" && mv "$tmp" package.json
    echo -e "${GREEN}   ✅ Added monorepo scripts to package.json${NC}"
else
    echo -e "${YELLOW}   ⚠️  jq not found. Please add these scripts manually to package.json:${NC}"
    echo '    "dev:monorepo": "vite --config vite.config.monorepo.ts"'
    echo '    "build:monorepo": "tsc -b && vite build --config vite.config.monorepo.ts"'
    echo '    "preview:monorepo": "vite preview --config vite.config.monorepo.ts"'
fi

# Install dependencies if needed
echo -e "${GREEN}📦 Checking dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}   Installing dependencies...${NC}"
    if command -v bun &> /dev/null; then
        bun install
    elif command -v npm &> /dev/null; then
        npm install
    fi
fi
echo -e "${GREEN}   ✅ Dependencies ready${NC}"

echo ""
echo -e "${GREEN}✅ Monorepo setup complete!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo ""
echo "1. Start the Django backend (in backend directory):"
echo "   ${YELLOW}make up${NC}  or  ${YELLOW}python manage.py runserver${NC}"
echo ""
echo "2. Start the React frontend (in this directory):"
echo "   ${YELLOW}bun run dev:monorepo${NC}  or  ${YELLOW}make dev-monorepo${NC}"
echo ""
echo "3. Access the application:"
echo "   Frontend: ${BLUE}http://localhost:3000${NC}"
echo "   Backend API: ${BLUE}http://localhost:8000/api/docs${NC}"
echo "   Django Admin: ${BLUE}http://localhost:8000/admin${NC}"
echo ""
echo -e "${BLUE}For production build:${NC}"
echo "   ${YELLOW}bun run build:monorepo${NC}"
echo "   Then copy dist/ contents to your Django STATICFILES_DIRS"
echo ""
