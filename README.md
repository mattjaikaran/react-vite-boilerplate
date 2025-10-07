# React Vite Boilerplate

A modern, production-ready React application boilerplate built with Vite, TypeScript, and a comprehensive set of development tools. This boilerplate provides a solid foundation for building scalable web applications with excellent developer experience and industry best practices.

**🚀 Dual Mode Support**: Works as a standalone SPA or integrates seamlessly with Django applications.

## 📋 Quick Links

- [Features](#features) - Complete feature overview
- [Getting Started](#getting-started) - Quick setup guide
- [Architecture](#architecture) - Project structure and design
- [Deployment](./DEPLOYMENT.md) - Standalone and Django deployment guides
- [Features Guide](./FEATURES.md) - Detailed feature documentation

## Features

### Core Technologies

- **React 19** - Latest React with concurrent features
- **TypeScript** - Full type safety and excellent developer experience
- **Vite** - Lightning-fast build tool and development server
- **Bun** - Fast JavaScript runtime and package manager

### 🛣️ Routing & State Management

- **TanStack Router** - Type-safe routing with automatic code splitting
- **Zustand** - Lightweight state management with slice pattern
- **TanStack Query** - Server state management and caching
- **React Hook Form** - Performant forms with easy validation
- **Zod** - TypeScript-first schema validation

### 🎨 UI & Styling

- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Accessible component library
- **Dark Mode** - Built-in theme switching with system preference
- **Responsive Design** - Mobile-first approach
- **Feature Flags** - Conditional component rendering

### 🔐 Authentication

- **Email/Password Authentication** - Traditional login system
- **Magic Link Authentication** - Passwordless login option
- **JWT Token Management** - Automatic token refresh
- **Protected Routes** - Route-level authentication guards
- **Django Integration** - Works with Django's authentication system

### Developer Experience

- **Hot Module Replacement** - Instant feedback during development
- **ESLint & Prettier** - Code quality and formatting
- **Vitest** - Fast unit testing framework
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
├── api/                # API layer and services
├── types/              # TypeScript type definitions
├── mock-api/           # Mock API for development
└── test/               # Test utilities and setup
```

### Design Principles

- **Component Composition** - Favor composition over inheritance
- **Custom Hooks** - Extract and reuse stateful logic
- **Type Safety** - Comprehensive TypeScript coverage
- **Separation of Concerns** - Clear boundaries between layers
- **Accessibility** - WCAG compliant components

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
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

### Development

```bash
bun run dev          # Start development server
bun run build        # Build for production
bun run preview      # Preview production build
```

### Code Quality

```bash
bun run lint         # Run ESLint
bun run lint:fix     # Fix ESLint issues
bun run format       # Format code with Prettier
bun run type-check   # Run TypeScript type checking
```

### Testing

```bash
bun run test         # Run tests
bun run test:ui      # Run tests with UI
bun run test:coverage # Run tests with coverage
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
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api
VITE_API_TIMEOUT=10000

# Authentication
VITE_AUTH_TOKEN_KEY=auth_token
VITE_REFRESH_TOKEN_KEY=refresh_token

# Environment
VITE_APP_ENV=development
VITE_APP_NAME=React Vite Boilerplate
```

### Router Configuration

The project uses TanStack Router with file-based routing. Routes are automatically generated from files in the `src/routes/` directory.

### Theme Configuration

Dark mode is configured through the theme provider. Customize colors in `tailwind.config.js` and `src/globals.css`.

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
docker-compose up -d
```

### Production

```bash
# Build production image
docker build -t react-vite-boilerplate .

# Run production container
docker run -p 3000:3000 react-vite-boilerplate
```

## Key Concepts

### Authentication Flow

1. User submits login credentials
2. API validates and returns JWT tokens
3. Tokens stored in localStorage and Zustand store
4. Automatic token refresh on API calls
5. Protected routes check authentication state

### State Management

- **Auth State** - User data, tokens, authentication status
- **Todo State** - Todo items, filters, loading states
- **UI State** - Theme, notifications, sidebar state

### Form Handling

- React Hook Form for form state management
- Zod schemas for validation
- Consistent error handling and display
- Accessible form components

### API Layer

- Axios instance with interceptors
- Automatic token attachment
- Error handling and retry logic
- Type-safe API methods

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Ensure all checks pass before submitting

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Built With

- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [React](https://reactjs.org/) - A JavaScript library for building user interfaces
- [TanStack Router](https://tanstack.com/router) - Type-safe routing
- [Shadcn/ui](https://ui.shadcn.com/) - Beautifully designed components
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework

## Support

If you have any questions or need help:

1. Check the documentation
2. Search existing issues
3. Create a new issue
4. Contact the maintainer

---

Built with care by [Matt Jaikaran](https://github.com/mattjaikaran)
