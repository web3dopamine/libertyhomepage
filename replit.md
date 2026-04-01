# Liberty Chain - High-Performance EVM Blockchain Website

## Overview

Liberty Chain is a marketing website for a next-generation EVM-compatible Layer 1 blockchain built for freedom. The site showcases the blockchain's key features including 10,000+ TPS, zero gas fees, instant finality, and true decentralization. Built with a modern tech stack, the website features bold typography, smooth animations, and a dark theme aesthetic inspired by premium blockchain platforms.

## Recent Changes

**April 1, 2026 (Dynamic Event Categories)**:
- Event `category` field changed from static enum to `string` type
- `defaultEventCategories: string[]` exported from `shared/schema.ts` (Conference, Workshop, Hackathon, Meetup)
- Storage: `eventCategories` array persisted in `data/db.json`; `getEventCategories()`, `createEventCategory()`, `deleteEventCategory()` methods added to IStorage + MemStorage
- Routes: `GET/POST /api/event-categories`, `DELETE /api/event-categories/:name`
- AdminEvents.tsx: Category select now fetches from API; "Event Types" panel shows all types as clickable tags; custom types have X delete button (built-ins do not); "New Type" button reveals inline input to add new categories; new type is auto-selected after creation

**April 1, 2026 (CMS Full Expansion)**:
- cms-schema.ts now covers ALL 8 pages: Home, Build, Community, Resilience Layer, Validators, Ecosystem, Institutions, Mesh Messaging — every text field, button label, link URL, card title/description, badge, and stat is CMS-editable
- Institutions.tsx and MeshMessaging.tsx fully wired to CMS for the first time
- Build, Community, Validators expanded beyond hero to cover all program cards, feature grids, CTA sections
- ResilienceLayer expanded: hero CTAs, howItWorks steps (title+desc), useCases (title+desc), waitlist section title/subtitle — all CMS-driven; hero scroll-to-section buttons added
- Custom pages: backend CRUD at `GET/POST /api/cms/pages` + `DELETE /api/cms/pages/:id`; `CustomPage.tsx` renderer with hero/cards/CTA template; `/custom/:slug` route added to App.tsx
- AdminCMS.tsx rewritten as 3-panel editor: all 8 built-in pages + custom pages section, Clone button, New Page dialog, Delete custom pages

**April 1, 2026 (Email Marketing Platform)**:
- Full email campaign system at `/admin/campaigns` and `/admin/autoresponders`
- Drag-and-drop block editor (using @dnd-kit/core + @dnd-kit/sortable): heading, text, image, button, divider, spacer blocks
- Live preview iframe updates in real time as blocks are edited
- Audience segmentation: All Contacts, Waitlist, Accelerator, Event Registrations, CSV Upload, Custom email list
- CSV upload: parse name/email columns from .csv files in-browser, stored as csvRecipients in campaign
- Open tracking: 1x1 transparent GIF pixel served at `/api/track/open?c=&r=` — increments openCount, tracks unique opens
- Click tracking: redirect endpoint at `/api/track/click?c=&r=&u=` — increments clickCount, tracks unique clicks and per-link counts
- Analytics tab per campaign: sent count, unique opens, open rate, total opens, unique clicks, click rate, top clicked links
- Clone/repurpose campaign: POST `/api/campaigns/:id/clone` creates a draft copy ready to edit and resend
- Campaign status: draft → sending → sent; campaigns can be edited while in draft
- Autoresponders at `/admin/autoresponders`: trigger on waitlist signup, accelerator apply, or event registration
- Autoresponder delay: 0h = immediate send; >0h = setTimeout scheduled (note: resets on server restart)
- Autoresponders fire automatically from existing signup routes; sentCount tracked per autoresponder
- New backend routes: CRUD for `/api/campaigns`, `/api/autoresponders`, plus `/api/track/open`, `/api/track/click`
- Shared utility `shared/email-builder.ts`: blocksToBodyHtml() + injectTracking() — used by both server and client preview
- AdminDashboard updated with Email Campaigns and Autoresponders cards showing live stats

**April 1, 2026 (Socials/Partners/Press)**:
- Added `/admin/socials` page with three tabs: Social Links, Partners, Press & Articles
- Social Links: CRUD admin for all site-wide social links; Footer + SocialMedia page now fetch from `/api/socials` (no more hardcoded URLs)
- Partners: CRUD admin for partner logos/links shown on new homepage Partners slide
- Press & Articles: CRUD admin for press coverage (e.g. CoinTelegraph mock article); shown on new homepage Press slide
- Two new fullscreen snap-scroll homepage sections added: PressSection (`/components/PressSection.tsx`) and PartnersSection (`/components/PartnersSection.tsx`)
- Icon utility at `client/src/lib/social-icons.ts` with SOCIAL_ICON_MAP for dynamic react-icons/si rendering
- New backend endpoints: `GET/POST/PUT/DELETE /api/socials`, `/api/partners`, `/api/press`
- Default data: 6 social links (X, Discord, GitHub, Telegram, YouTube, Medium), 1 CoinTelegraph press article
- AdminDashboard updated with Socials/Partners/Press card showing live counts

**March 31, 2026**:
- Added CMS Content Editor at `/admin/cms`: 3-panel split layout (page list | field editor | live preview iframe)
- CMS edits headlines, subtitles, badge text on: Home (hero + performance + EVM + network sections), Build, Community, Resilience Layer, Validators, Ecosystem pages
- CMS schema defined in `client/src/lib/cms-schema.ts`; `useCMSContent(pageId)` hook in `client/src/hooks/use-cms-content.ts`
- Server-side CMS endpoints: `GET/PUT/DELETE /api/cms/content/:pageId`; in-memory store in `server/storage.ts`
- AdminDashboard updated with Content Editor card
- Added Resend email integration: `server/email.ts` manages API key, from-email/name, and four HTML email templates
- Auto-send emails: waitlist confirmation on signup, accelerator confirmation on apply, accelerator stage-update on pipeline move
- New admin page `/admin/settings` — enter Resend API key, configure sender details, send test email, view template descriptions
- New admin page `/admin/contacts` — unified contact database from all sources (waitlist + accelerator), search, filter by source, sort by name/date, export to CSV
- New backend endpoints: `GET/POST /api/admin/email-settings`, `POST /api/admin/test-email`, `GET /api/admin/contacts`
- AdminDashboard updated with Contact Database and Email Settings cards
- Installed `resend` npm package

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
- Added text decrypt effect on hover for navigation menu items (HOME, EXPLORE, BUILD, RESOURCES) - text scrambles with random characters and progressively reveals on hover

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