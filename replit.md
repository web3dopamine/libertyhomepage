# Liberty Chain - High-Performance EVM Blockchain Website

## Overview
Liberty Chain is a marketing website for a next-generation EVM-compatible Layer 1 blockchain, showcasing features like high TPS, zero gas fees, instant finality, and decentralization. The project aims to present these capabilities with a modern, dark-themed, premium aesthetic, using bold typography and smooth animations. It includes a comprehensive CMS for content, email marketing, and administrative functionalities for social media, partners, and press. The business vision is to highlight a high-performance blockchain with significant market potential, aiming to attract developers, institutions, and users to its ecosystem.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is a React with TypeScript single-page application, using Wouter for routing and `shadcn/ui` (New York style) for UI components, specifically focusing on a dark-themed aesthetic. Styling is managed with Tailwind CSS, incorporating a custom color palette and responsive typography. State management leverages TanStack Query for server state and React hooks for local component state. Animations are driven by CSS scroll-snap and custom Framer Motion-like utilities, focusing on smooth, full-page transitions and an interactive 3D globe visualization. All public and admin pages are designed for full responsiveness across various screen sizes (mobile, desktop, large screens).

### Backend Architecture
The backend is built with Express.js, providing a minimal API layer for static blockchain data, metrics, and features. It uses in-memory data storage with a type-safe schema defined in `shared/schema.ts` and validated using Zod. A storage abstraction layer (`IStorage`) is implemented for future database integration. The system supports a robust CMS for dynamic content, email campaign management with tracking capabilities, event registration with email verification, and an unsubscribe system. Admin functionalities include managing social media, press, partners, events (with analytics), video tutorials, roadmap milestones (with deadline notifications), email templates, dynamic section reordering for the homepage, and a full forum (categories, topics, posts, likes, tags, search, pinning, closing, solved answers, admin management). The forum uses `marked` for Markdown rendering and `dompurify` for sanitization.

### Wallet / Web3
MetaMask wallet connection is implemented via `ethers` (BrowserProvider). The `WalletContext` (`client/src/contexts/WalletContext.tsx`) manages connection state, auto-reconnect on page load, account/chain-change listeners, and a rank tier system (None → Bronze → Silver → Gold → Platinum → Diamond) based on LC token holdings. The `WalletButton` (`client/src/components/WalletButton.tsx`) renders in the navigation bar — showing a "Connect Wallet" button when disconnected and a wallet avatar + dropdown (address copy, LC balance, rank, voting rights soon, staking soon, disconnect) when connected. Forum posting forms auto-fill author identity from the connected wallet address. LC token balance and ranking will be fully functional once the Liberty Chain mainnet token contract is deployed.

### Design System
The design system emphasizes a responsive typography hierarchy with custom weights and line heights, and a layout system that utilizes fullscreen sections with CSS scroll-snap. It features responsive grid layouts and card-based components with interactive elements. The aesthetic is dark-themed, inspired by premium blockchain platforms.

### Build and Deployment
The build process uses Vite for both frontend (React) and backend (Express) bundling, supporting fast development with Hot Module Replacement (HMR) and optimized production builds. It uses ES Modules throughout, with path aliases for improved module resolution.

## External Dependencies

### Database
- **Drizzle ORM**: Configured for PostgreSQL with Neon Database, with schema defined in `shared/schema.ts`, currently using in-memory storage.

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

### Email Services
- **Resend**: Email API integration for sending and tracking emails, including verification and campaign emails.

### Development Tools
- **Vite Ecosystem**: For fast development, optimized builds, and React support.

### Additional Utilities
- **date-fns**: For date handling and formatting.
- **cmdk**: For command menu interfaces.
- **Lucide React**: For icons.
- **nanoid**: For ID generation.
- **Wouter**: For lightweight client-side routing.