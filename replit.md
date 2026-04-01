# Liberty Chain - High-Performance EVM Blockchain Website

## Overview
Liberty Chain is a marketing website for a next-generation EVM-compatible Layer 1 blockchain, showcasing features like high TPS, zero gas fees, instant finality, and decentralization. The project aims to present these capabilities with a modern, dark-themed, premium aesthetic, using bold typography and smooth animations. It includes a comprehensive CMS for content, email marketing, and administrative functionalities for social media, partners, and press. The business vision is to highlight a high-performance blockchain with significant market potential, aiming to attract developers, institutions, and users to its ecosystem.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is a React with TypeScript single-page application, using Wouter for routing and `shadcn/ui` (New York style) for UI components, specifically focusing on a dark-themed aesthetic. Styling is managed with Tailwind CSS, incorporating a custom color palette and responsive typography. State management leverages TanStack Query for server state and React hooks for local component state. Animations are driven by CSS scroll-snap and custom Framer Motion-like utilities, focusing on smooth, full-page transitions and an interactive 3D globe visualization. All public and admin pages are designed for full responsiveness across various screen sizes (mobile, desktop, large screens).

### Backend Architecture
The backend is built with Express.js, providing a minimal API layer for static blockchain data, metrics, and features. It uses an in-memory storage layer (`MemStorage` in `server/storage.ts`) with a type-safe schema defined in `shared/schema.ts`, backed by **full PostgreSQL persistence** via a single `app_state` JSONB table. On every write, the in-memory state is serialised and upserted to PostgreSQL (fire-and-forget); on server startup, `initFromPg()` rehydrates in-memory state from PostgreSQL, making Replit's built-in database the authoritative source of truth. `data/db.json` is kept as a local file-system fallback. The PostgreSQL module lives in `server/pg-backend.ts` (Pool + ensureSchema/loadState/saveState). The system supports a robust CMS for dynamic content, email campaign management with tracking capabilities, event registration with email verification, and an unsubscribe system. Admin functionalities include managing social media, press, partners, events (with analytics), video tutorials, roadmap milestones (with deadline notifications), email templates, dynamic section reordering for the homepage, and a full forum (categories, topics, posts, likes, tags, search, pinning, closing, solved answers, admin management). The forum uses `marked` for Markdown rendering and `dompurify` for sanitization.

### Forum Wallet Gate
All `/forum/*` routes are wrapped with a `ForumGate` component that enforces wallet-gated access:
- **Step 1 — Connect Wallet**: Unauthenticated visitors see a branded gate screen with a "Connect MetaMask" button. Forum content is completely hidden.
- **Step 2 — Choose Identity**: After connecting, first-time users choose how to appear: either pick a **username** (3–20 chars, alphanumeric/underscore/hyphen, real-time availability check) or display their **wallet address**. A live preview shows how they will look to others.
- **Access Granted**: Once registered, the gate passes through to the full forum.
- **ForumProfile** schema (`walletAddress`, `username`, `displayMode`, `joinedAt`) is stored in `forumProfiles[]` with full PostgreSQL persistence.
- **API**: `GET /api/forum/profile/:address`, `POST /api/forum/profile` (upsert), `GET /api/forum/check-username/:username` (availability).
- **ForumProfileContext** (`client/src/contexts/ForumProfileContext.tsx`) caches the connected user's profile across all forum pages and exposes `displayName`, `hasProfile`, and `registerProfile`.
- `ForumNew.tsx` and `ForumTopic.tsx` both auto-fill the author name from the forum profile (username or short wallet address).

### Wallet / Web3
MetaMask wallet connection is implemented via `ethers` (BrowserProvider). The `WalletContext` (`client/src/contexts/WalletContext.tsx`) manages connection state, auto-reconnect on page load, account/chain-change listeners, and a rank tier system (None → Bronze → Silver → Gold → Platinum → Diamond) based on LC token holdings. The `WalletButton` (`client/src/components/WalletButton.tsx`) renders in the navigation bar — showing a "Connect Wallet" button when disconnected and a wallet avatar + dropdown (address copy, LC balance, rank, voting rights soon, staking soon, disconnect) when connected. Forum posting forms auto-fill author identity from the connected wallet address. LC token balance and ranking will be fully functional once the Liberty Chain mainnet token contract is deployed.

### Design System
The design system emphasizes a responsive typography hierarchy with custom weights and line heights, and a layout system that utilizes fullscreen sections with CSS scroll-snap. It features responsive grid layouts and card-based components with interactive elements. The aesthetic is dark-themed, inspired by premium blockchain platforms.

### Node Runner Waitlist
A complete node runner application flow has been added:
- **Public signup form** at `/run-a-node` — collects name, email, country, node type (Validator/Full/Light/Archive/RPC), hardware setup, bandwidth, RAM, storage, uptime target, experience level, Twitter/Telegram/Discord, and motivation.
- **Admin management page** at `/admin/node-waitlist` — table with all applications, search, status filter (pending/approved/rejected), CSV export, per-applicant detail dialog with status controls, admin notes, and delete.
- **Schema**: `NodeApplication` interface + `insertNodeApplicationSchema` in `shared/schema.ts` with enum values for node type, hardware, bandwidth, and experience.
- **Storage**: `getNodeApplications`, `createNodeApplication`, `updateNodeApplicationStatus`, `deleteNodeApplication`, `isEmailInNodeWaitlist` in `server/storage.ts` with persistence to `data/db.json`.
- **API routes**: `GET/POST /api/node-applications`, `PATCH /api/node-applications/:id/status`, `DELETE /api/node-applications/:id`.
- **Navigation**: "Run a Node" added to the Build section of the nav menu.
- **Admin Dashboard**: "Node Runner Waitlist" card with total/pending/approved counts.

### Liberty Media Hub
A fully CMS-managed media hub is implemented:
- **Public page** at `/liberty-media` — fetches content dynamically from the API; shows featured cards in a two-column layout with cover images and a gradient overlay, remaining items in a three-column grid. Cards display the media type badge (Blog Post/Video/Podcast/Article/Interview/Announcement), title, description, date, and a "Read More" link.
- **Admin management page** at `/admin/media-hub` — grid view of all items showing cover image thumbnails, type badges, title, and action buttons (edit, delete, external link); stats summary (total, featured, videos, articles); create/edit dialog with image URL preview, type selector, featured toggle, and link URL field.
- **Schema**: `MediaItem` interface + `MEDIA_TYPES` enum array + `insertMediaItemSchema` in `shared/schema.ts`.
- **Storage**: `getMediaItems`, `createMediaItem`, `updateMediaItem`, `deleteMediaItem`, `reorderMediaItems` in `server/storage.ts`.
- **API routes**: `GET/POST /api/media-items`, `PUT /api/media-items/:id`, `DELETE /api/media-items/:id`, `POST /api/media-items/reorder`.
- **Navigation**: "Media Hub" added to admin sidebar; dashboard card shows total count and featured count.
- **PostgreSQL**: `mediaItems` included in the persisted JSONB snapshot with automatic re-sync on startup if new collections are detected.

### Liberty Media Hub — Full Post Support
Media items now have a `content: string` field (Markdown) in addition to the existing metadata. Admin (`/admin/media-hub`) shows a full Markdown editor in the create/edit dialog: a Write tab with a formatting toolbar (bold, italic, heading, quote, bullet/numbered list, code, link, image insert) and a live Preview tab. Cards with content show a "Full Post" badge in the admin grid. On the public Media Hub (`/liberty-media`), cards with content show a "Read Post" button linking to an internal reader at `/liberty-media/:id`. The reader page (`client/src/pages/MediaPost.tsx`) renders Markdown via `marked` + `DOMPurify` using Tailwind Typography (`prose-invert`) with the post's title, type badge, date, cover image, and an optional "Read original" CTA for items that also have an external URL. API: `GET /api/media-items/:id` returns a single item.

### Press Articles — Cover Images + Medium Import
Press articles now support cover images (`imageUrl` field added to `PressArticle` interface and `insertPressArticleSchema`). The public `/` homepage "As Featured In" section renders cards with a 44-height cover image, gradient overlay, publication name/logo, headline, excerpt, and date — matching the Media Hub card style. The admin press tab at `/admin/socials` (Press & Articles tab) shows a grid of thumbnail cards with edit/delete actions. A new "Import from Medium" button fetches `https://libertychain.medium.com/feed` via the server-side `GET /api/admin/medium-feed` route (parses RSS XML, extracts title, link, date, hero image, and stripped excerpt), displays the posts in a selection dialog with checkboxes (pre-deselecting already-imported articles), and bulk-imports the selected posts. The add/edit dialog includes a Cover Image URL field with live preview.

### Master Settings (Admin)
The Admin Settings page (`/admin/settings`) has been renamed to "App Settings" and now includes two credential sections:
- **Resend Email**: API key (masked), from email/name, admin notification email, test-send.
- **PostgreSQL Database**: Individual fields (host, port, database, user, password with show/hide, SSL toggle) or a connection string — switchable via tab toggle. "Test Connection" button verifies the connection live using the `pg` package. Credentials are stored in a module-level in-memory object (`server/pg-config.ts`) following the same pattern as `server/email.ts`. API routes: `GET/POST /api/admin/db-settings`, `POST /api/admin/test-db`.

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