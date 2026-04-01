# Liberty Chain - High-Performance EVM Blockchain Website

## Overview
Liberty Chain is a marketing website for a next-generation EVM-compatible Layer 1 blockchain. It highlights key features such as high TPS, zero gas fees, instant finality, and decentralization. The project aims to showcase these capabilities with a modern, dark-themed aesthetic, inspired by premium blockchain platforms, utilizing bold typography and smooth animations. The website supports a comprehensive Content Management System (CMS) for managing content across all pages, email marketing campaigns, and administrative functionalities for social media, partners, and press.

## Recent Changes

**April 1, 2026 (Unsubscribe System)**:
- `GET /api/unsubscribe?email=...&token=...` route: HMAC-SHA256 token verification; marks email in `unsubscribedEmails[]` persisted to `data/db.json`; returns styled on-brand confirmation HTML page
- `GET /api/admin/unsubscribed` returns suppressed list for admin use
- `generateUnsubscribeToken`, `verifyUnsubscribeToken`, `buildUnsubscribeUrl` helpers in `server/email.ts`
- `baseLayout(content, unsubscribeUrl?)` updated — when `unsubscribeUrl` provided, injects "Unsubscribe · You can unsubscribe at any time" footer link
- Campaign send: per-recipient unsubscribe URL injected; suppressed emails skipped from recipient list
- Autoresponder send: `baseUrl` threaded through `fireAutoresponders` → `sendAutoresponderEmail`; unsubscribed recipients skipped in both individual and broadcast sends
- System emails (waitlist, accelerator, event confirmation) do NOT include unsubscribe link
- `storage.addUnsubscribe`, `storage.isUnsubscribed`, `storage.getUnsubscribedEmails` added to IStorage + MemStorage

**April 1, 2026 (Newsletter + Dual Event Registration)**:
- Newsletter fullscreen snap-scroll section added to landing page (between Partners and CTA); fields: name + email; `POST /api/newsletter`; 409 on duplicate; success state shown in-place
- `Newsletter` schema in `shared/schema.ts`; storage methods persisted in `data/db.json`; shows in admin Contacts with `source: "newsletter"` badge
- Events page: cards show both "Register Here" (internal dialog) AND "External Registration" (opens `event.link` in new tab) when an external link is configured

**April 1, 2026 (Logo Upload + Event Card Image)**:
- `LogoImagePicker` component: toggles between Upload (file → base64) and URL modes with drag-drop zone and live preview
- AdminSocials.tsx: Partner logo and Press publication logo fields now use `LogoImagePicker`
- AdminEvents.tsx: image picker labeled "Card Image (shown on the event listing card)"

**April 1, 2026 (Email Templates + Test Email + Newsletter Segment)**:
- Email templates system: GET/POST/PUT/DELETE `/api/email-templates`; `EmailTemplate` schema added to `shared/schema.ts`; `getEmailTemplates/createEmailTemplate/updateEmailTemplate/deleteEmailTemplate` methods in storage
- 4 premium built-in templates (Welcome, Network Update, Event Announcement, Liberty Dispatch) seeded in `PREMIUM_TEMPLATES` constant in `storage.ts`; premium templates cannot be edited/deleted
- Campaign editor: "Tmplt" tab added — shows premium templates with star badge + "Use" button to load; shows user saved templates with delete button; "Save Current Blocks as Template" button opens naming dialog
- Campaign editor: "Test" button in top bar opens dialog to send preview to any email address; calls `POST /api/campaigns/:id/test`
- Newsletter audience segment added: `audienceType` enum updated to include `"newsletter"`; campaign send route includes newsletter signups; campaign editor shows "Newsletter Subscribers" option
- Email footer updated in both preview (client) and sent emails (server/email.ts) to include: X/Twitter, Discord, GitHub, Telegram, YouTube social links

**April 1, 2026 (Video Tutorials Admin)**:
- `VideoTutorial` interface + `insertVideoTutorialSchema` added to `shared/schema.ts`
- `getVideoTutorials`, `createVideoTutorial`, `updateVideoTutorial`, `deleteVideoTutorial` added to `IStorage` + `MemStorage`; persisted in `data/db.json`
- CRUD routes: `GET/POST /api/video-tutorials`, `PUT/DELETE /api/video-tutorials/:id`, batch reorder `PUT /api/video-tutorials` (array of `{id, order}`)
- `client/src/pages/AdminVideoTutorials.tsx`: full CRUD admin with drag-to-reorder, add/edit dialog, YouTube/Vimeo auto-detect (regex parse), live auto-thumbnail preview (YouTube: `img.youtube.com/vi/{id}/hqdefault.jpg`), custom thumbnail URL override with clear button, category + duration fields, featured star toggle; stats bar (total, featured, categories)
- `VideoTypeBadge` component: red "YT" or blue "Vimeo" pill on each row
- `client/src/pages/VideoTutorials.tsx` updated: fetches from API; when videos exist shows featured section + category sections with click-to-embed modal (`<iframe>` with autoplay); YouTube/Vimeo embed URL generation; platform icon badge on thumbnails; play overlay on hover; when no videos shows "Coming Soon" + planned series (unchanged)
- `AdminSideNav`: "Video Tutorials" item with `PlayCircle` icon at `/admin/video-tutorials`
- `App.tsx`: admin route + public route wired

**April 1, 2026 (Roadmap Deadline Notifications)**:
- `adminEmail` field added to `EmailSettings` interface and in-memory settings; exposed via `GET /api/admin/email-settings` and saved via `POST /api/admin/email-settings`
- `AdminSettings.tsx`: new "Admin Notification Email" input field with auto-populate from loaded settings via `useEffect`; always persisted on save
- `sendRoadmapReminderEmail(adminEmail, alerts)` in `server/email.ts`: builds a branded dark-theme HTML table email listing overdue + due-soon milestones with urgency labels and a CTA button; returns `{ sent, error? }`
- `MilestoneAlert` type exported from `server/email.ts`
- `POST /api/admin/roadmap-reminders` route: computes non-completed milestones whose quarter ends within 30 days (or is already overdue); calls `sendRoadmapReminderEmail`; returns `{ sent, count, alerts }` or `{ sent: false, reason }` when no alerts exist
- `AdminRoadmap.tsx`: `parseQuarterEnd` + `daysUntilEnd` helpers; `DeadlineBadge` component (red/orange/yellow pill with icon); `alertMilestones` and `overdueCount` computed from live list; red/yellow alert banner with inline milestone summary; "Send Reminder (N)" outline button in header (yellow-tinted, only shown when alerts exist); mail icon button in banner for quick send; `reminderMutation` via `useMutation`

**April 1, 2026 (Section Reordering)**:
- `GET /api/section-order` returns current order; `PUT /api/section-order` saves it; persisted in `data/db.json`
- `getSectionOrder`/`setSectionOrder` added to `IStorage` + `MemStorage`
- `client/src/pages/AdminSections.tsx`: drag-to-reorder + up/down arrow buttons; fixed Hero (always first) and Footer (always last); "Reset to Default" and "Save Order" actions; unsaved-changes notice
- `Home.tsx` refactored: imports all section components into `SECTION_COMPONENTS` / `SECTION_NAMES` maps; fetches `/api/section-order` and renders sections dynamically in the stored order
- `AdminSideNav`: "Section Order" item with `LayoutList` icon at `/admin/sections`
- `App.tsx`: `/admin/sections` route wired

**April 1, 2026 (Dynamic Event Categories)**:
- Event category changed from static enum to dynamic `string[]` managed via `GET/POST/DELETE /api/event-categories`
- Admin event form shows "Event Types" panel: clickable tags, inline "New Type" input, delete X on custom types (built-ins protected)

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