# Liberty Chain - High-Performance EVM Blockchain Website

## Overview

Liberty Chain is a marketing website for a next-generation EVM-compatible Layer 1 blockchain built for freedom. The site showcases the blockchain's key features including 10,000+ TPS, zero gas fees, instant finality, and true decentralization. Built with a modern tech stack, the website features bold typography, smooth animations, and a dark theme aesthetic inspired by premium blockchain platforms.

## Recent Changes

**November 18, 2025**:
- Updated hero section main title from "The High-Performance EVM Blockchain Built for Scale" to "High-Performance EVM Blockchain Built for Freedom"
- Updated hero section subtitle to emphasize "No Gas. No Friction. No Permission. Just Liberty."
- Formatted hero subtitle across three lines to prevent word cutoff:
  - Line 1: "Liberty Chain is a next-generation, Ethereum-compatible Layer 1 blockchain"
  - Line 2: "delivering unmatched performance, zero gas fees, instant finality,"
  - Line 3: "No Gas. No Friction. No Permission. Just Liberty."
- Linked "Read the Documentation" button to internal /documentation page
- Fixed React DOM nesting warning in Navigation component by using NavigationMenuLink with asChild prop
- Fixed 3D globe POI rotation by grouping validator nodes, glows, and connection lines in a THREE.Group that rotates synchronously with the globe
- Changed scroll behavior from smooth to auto for abrupt/jolty section transitions (instant snap instead of smooth animation)
- Replaced solid 3D globe with dotted wireframe globe design:
  - Particle-based rendering using small spheres arranged in latitude/longitude grid pattern
  - 18 latitude lines and 36 longitude lines, each composed of 50 dots
  - Maintains teal/cyan color scheme (#2EB8B8 for latitude, #38B2AC for longitude)
  - Validator nodes with pulsing animations and dashed connection lines
  - All elements rotate synchronously as a single group

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript
- Single-page application using Wouter for client-side routing
- Component-based architecture with reusable UI components
- No server-side rendering (RSC disabled in shadcn config)

**UI Component Library**: shadcn/ui (New York style variant)
- Radix UI primitives for accessible, unstyled components
- Custom-styled components using Tailwind CSS and class-variance-authority
- Comprehensive component library including buttons, cards, dialogs, forms, and more

**Styling System**:
- Tailwind CSS with custom configuration
- CSS variables for theming (dark mode by default)
- Custom color palette with primary (teal/cyan #2EB8B8, #228888, #38B2AC, #66CCCC), secondary (blue), and supporting colors
- Custom border radius values (9px, 6px, 3px)
- Gradient text effects and elevation utilities for depth
- Google Fonts: DM Sans, Inter, JetBrains Mono

**State Management**:
- TanStack Query (React Query) for server state and data fetching
- Local component state with React hooks
- Custom hooks for mobile detection and toast notifications

**Animations & Scrolling**:
- Fullscreen section-based scrolling inspired by Monad.xyz
- CSS scroll-snap for smooth section transitions (scroll-snap-type: y mandatory)
- Framer Motion viewport triggers for within-section animations
- Custom animated counter component with easing functions
- Performance-first approach with requestAnimationFrame
- SplitText component for word and character-level text reveals

### Backend Architecture

**Server Framework**: Express.js
- Minimal API layer serving static blockchain data
- Three main endpoints: `/api/chain-data`, `/api/metrics`, `/api/features`
- In-memory data storage (no database currently connected)
- Development/production mode handling

**Data Layer**:
- Static data defined in `shared/schema.ts`
- Type-safe schemas using Zod for validation
- Shared TypeScript types between frontend and backend
- Storage abstraction layer (IStorage interface) for future database integration

**Development Environment**:
- Vite for fast development and optimized production builds
- Hot module replacement (HMR) in development
- Replit-specific plugins for error handling and development tools
- TypeScript compilation with strict mode enabled

### Design System

**Typography Hierarchy** (Responsive):
- Hero headlines: text-5xl (mobile) → text-9xl (2xl screens), weight 900, line-height 0.85
- Section headlines: text-4xl (mobile) → text-8xl (xl screens), weight 900, line-height 0.9
- TPS counter: text-5xl (mobile) → text-9xl (xl screens), weight 800, tabular numbers
- Body text: text-base (mobile) → text-2xl (lg screens), weight 400, line-height 1.6
- Progressive responsive breakpoints (sm, md, lg, xl, 2xl) prevent mobile overflow

**Layout System**:
- Fullscreen sections: Each section takes full viewport height (100vh)
- Container max-width: 1280px (max-w-7xl)
- Section padding: Optimized for fullscreen layout
- Responsive grid layouts (4-column → 2-column → 1-column)
- Flex-based footer positioning (mt-auto) within final section
- Consistent spacing scale using Tailwind units

**Component Patterns**:
- FullpageScrollLayout: Container with CSS scroll-snap behavior
- SectionWrapper: Individual fullscreen sections with snap-start alignment
- SectionNavigation: Right-side navigation dots (desktop only, hidden on mobile)
- Hero section with full viewport height and animated elements
- CTASection: Large call-to-action content in final section
- Footer: Anchored to bottom of final section using flex layout
- Feature sections with alternating text/visual layouts
- Interactive 3D globe with teal/cyan color scheme
- Card-based components with hover effects and elevation

### Build and Deployment

**Build Process**:
- Frontend: Vite bundles React application to `dist/public`
- Backend: esbuild bundles Express server to `dist/index.js`
- TypeScript type checking separate from build process
- Environment-specific builds (development vs production)

**Module System**:
- ES Modules throughout (type: "module" in package.json)
- Path aliases configured: `@/` for client, `@shared/` for shared code
- Bundler module resolution for TypeScript

## External Dependencies

### Database (Configured but Not Active)

**Drizzle ORM** with PostgreSQL dialect:
- Configuration points to Neon Database (@neondatabase/serverless)
- Schema defined in `shared/schema.ts`
- Migrations configured to output to `./migrations`
- Currently using in-memory storage instead of database
- Database connection requires `DATABASE_URL` environment variable

### UI Component Libraries

**Radix UI Primitives** (v1.x):
- Accordion, Alert Dialog, Avatar, Checkbox, Dialog, Dropdown Menu
- Form controls, Hover Card, Navigation Menu, Popover, Progress
- Radio Group, Scroll Area, Select, Separator, Slider
- Switch, Tabs, Toast, Tooltip, Toggle components
- Provides accessible, unstyled component primitives

### Styling and Utilities

**Tailwind CSS** ecosystem:
- PostCSS for CSS processing
- Autoprefixer for browser compatibility
- tailwind-merge and clsx for className composition
- class-variance-authority for variant-based component styling

### Form Handling

**React Hook Form** with validation:
- @hookform/resolvers for schema validation
- Zod integration via drizzle-zod
- Type-safe form state management

### Animation Libraries

**Embla Carousel**: Touch-friendly carousel component
**Framer Motion-like utilities**: Custom animation implementations
**Input OTP**: One-time password input with animations

### Session Management (Configured)

**Express Session** with PostgreSQL store:
- connect-pg-simple for session storage
- Currently not actively used but configured

### Development Tools

**Vite Ecosystem**:
- @vitejs/plugin-react for React support
- Replit-specific plugins for development experience
- Runtime error overlay for better debugging

### Additional Utilities

**Date Handling**: date-fns for date formatting and manipulation
**Command Palette**: cmdk for command menu interfaces
**UI Utilities**: Lucide React for icons, nanoid for ID generation
**Routing**: Wouter for lightweight client-side routing