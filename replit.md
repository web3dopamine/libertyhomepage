# Liberty Chain - High-Performance EVM Blockchain Website

## Overview
Liberty Chain is a marketing website for a next-generation EVM-compatible Layer 1 blockchain. It highlights key features such as high TPS, zero gas fees, instant finality, and decentralization. The project aims to showcase these capabilities with a modern, dark-themed aesthetic, inspired by premium blockchain platforms, utilizing bold typography and smooth animations. The website supports a comprehensive Content Management System (CMS) for managing content across all pages, email marketing campaigns, and administrative functionalities for social media, partners, and press.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is a React with TypeScript single-page application, using Wouter for routing and `shadcn/ui` (New York style) for UI components. Styling is managed with Tailwind CSS, incorporating a custom color palette and responsive typography. State management leverages TanStack Query for server state and React hooks for local component state. Animations are driven by CSS scroll-snap and custom Framer Motion-like utilities, focusing on smooth, full-page transitions.

### Backend Architecture
The backend is built with Express.js, providing a minimal API layer for static blockchain data, metrics, and features. It uses in-memory data storage with a type-safe schema defined in `shared/schema.ts` and validated using Zod. The architecture includes a storage abstraction layer (`IStorage`) for future database integration. The system also supports a robust CMS for dynamic content, and email campaign management with tracking capabilities.

### Design System
The design system emphasizes a responsive typography hierarchy with custom weights and line heights, and a layout system that utilizes fullscreen sections with CSS scroll-snap. It features responsive grid layouts and card-based components with interactive elements. An interactive 3D globe is a key visual component.

### Build and Deployment
The build process uses Vite for both frontend (React) and backend (Express) bundling, supporting fast development with Hot Module Replacement (HMR) and optimized production builds. It uses ES Modules throughout, with path aliases for improved module resolution.

## External Dependencies

### Database (Configured but Not Active)
- **Drizzle ORM**: Configured for PostgreSQL with Neon Database, with schema defined in `shared/schema.ts`. Currently uses in-memory storage.

### UI Component Libraries
- **Radix UI Primitives**: Provides accessible, unstyled components used by `shadcn/ui`.

### Styling and Utilities
- **Tailwind CSS Ecosystem**: Includes PostCSS, Autoprefixer, `tailwind-merge`, and `clsx` for advanced styling and utility class management.
- **class-variance-authority**: For variant-based component styling.

### Form Handling
- **React Hook Form**: Used for form management with Zod integration via `@hookform/resolvers` for schema validation.

### Animation Libraries
- **Embla Carousel**: For touch-friendly carousel components.
- **Input OTP**: For one-time password input fields with animations.

### Session Management (Configured)
- **Express Session** with `connect-pg-simple`: Configured for session storage, though not actively used.

### Development Tools
- **Vite Ecosystem**: For fast development, optimized builds, and React support.

### Additional Utilities
- **date-fns**: For date handling and formatting.
- **cmdk**: For command menu interfaces.
- **Lucide React**: For icons.
- **nanoid**: For ID generation.
- **Wouter**: For lightweight client-side routing.
- **Resend**: Email API integration for sending and tracking emails.