# Liberty Chain Website Design Guidelines

## Design Approach
**Reference-Based Design**: Complete visual replication of Monad.xyz's premium blockchain aesthetic - bold, futuristic, performance-focused with high-impact animations and dark theme execution.

## Core Design Principles
1. **Performance-First Presentation**: Every element communicates speed, scale, and technical excellence
2. **Bold Typography Hierarchy**: Massive headlines that demand attention
3. **Animated Data Storytelling**: Numbers and metrics come alive through smooth animations
4. **Immersive Dark Experience**: Deep backgrounds with vibrant accent pops

## Typography System

**Font Family**: Use "Inter" or "DM Sans" from Google Fonts for clean, modern tech aesthetic

**Hierarchy**:
- Hero Headlines: 96px-128px, font-weight 700-900, line-height 0.9
- Section Headlines: 48px-72px, font-weight 700
- Animated Counters: 64px-96px, font-weight 800, tabular-nums
- Body Text: 18px-20px, font-weight 400, line-height 1.6
- Labels/Metadata: 14px-16px, font-weight 500, uppercase tracking-wide

**Text Treatments**:
- Gradient text on hero headlines (purple to blue)
- Italic emphasis on key phrases within headlines
- All-caps for section labels and CTAs

## Layout System

**Spacing Scale**: Use Tailwind units of 4, 8, 12, 16, 20, 24, 32
- Section padding: py-32 (desktop), py-20 (mobile)
- Component spacing: gap-8 to gap-16
- Container max-width: max-w-7xl with px-8

**Grid Structure**:
- Hero: Full-width, centered content
- Feature sections: 2-column splits for text+visual pairings
- Stats grid: 4-column on desktop, 2-column tablet, 1-column mobile
- Event cards: 2-column grid with full-width on mobile

## Component Library

### Hero Section
- Full-viewport height with centered content
- Massive headline with gradient text effect
- Animated counter showing "10,000+" TPS
- Two prominent CTAs (primary: "Explore Testnet", secondary: "Documentation")
- Subtle animated background with floating particles/grid

### Animated Metrics Bar
- 4 key stats in horizontal layout: TPS, Validators, EVM Compatibility %, Finality Time
- Large animated counters (count-up effect on page load)
- Small labels below each metric
- Subtle dividers between stats

### Performance Section
- Split layout: Large headline + copy on left, animated visual on right
- Repeating headline pattern: "Build beyond limits. Scale *without* compromise."
- 2x2 grid of key metrics with icons
- Link to technical documentation

### Floating Keywords Animation
- Continuous horizontal scroll of technology terms
- Keywords: "Wallets", "Security", "EVM Addresses", "Smart Contracts", "Tools & Services", "Research"
- Multiple rows scrolling at different speeds
- Subtle opacity variations and spacing

### EVM Compatibility Section
- Large "Plug and play" headline
- Description of bytecode-level compatibility
- Purple gradient accent image/visual element
- Prominent CTA to developer documentation

### Network/Validators Section
- Dark background with network globe visualization
- Split content: Database benefits + Decentralization messaging
- Two CTAs: "Learn about the database" + "Learn how to run a node"
- Emphasis on consumer-grade hardware requirement

### Trilemma Showcase
- Three-column comparison
- Text treatment: "Legacy chains are forced to choose"
- Bold statement: "Liberty Chain *rewrites* the rules"
- "All in one" emphasizer

### Ecosystem Cards
- 2-column grid of large interactive cards
- Each card has background image, icon, headline, description
- Cards: "Explore the Ecosystem" + "Start Building"
- Hover effect: subtle scale + brightness increase

### Events Section
- Scrollable horizontal card list
- Each card shows: Date, Event name, Location, Description preview, Event image
- "View Event" CTA on each card
- Link to full events page

## Animations

**On-Scroll Animations**:
- Fade-in + slide-up for section content (stagger children by 100ms)
- Parallax scroll for background elements
- Counter animations trigger when in viewport

**Continuous Animations**:
- Floating keywords marquee effect (infinite horizontal scroll)
- Subtle breathing effect on hero background
- Gentle rotation on globe visualization

**Interaction Animations**:
- Button hover: slight scale (1.05) + brightness increase
- Card hover: scale (1.02) + shadow expansion
- CTA pulse effect on primary buttons

## Images

**Hero Section**: No large hero image - dark gradient background with animated particles/grid instead

**Section Visuals**:
- Performance section: Abstract 3D render of purple/blue geometric shapes or circuit board patterns
- EVM section: Purple gradient organic shape or abstract tech visualization
- Network section: Interactive globe showing validator network distribution with connection lines
- Ecosystem cards: Use placeholder images showing UI mockups or abstract app representations

**Event Cards**: Each event includes a cover image (landscape format, 16:9 aspect ratio)

## Critical Details

- Navigation: Fixed header with logo left, links center, "Launch App" button right
- Footer: Multi-column layout with links, social icons, newsletter signup
- All CTAs use blurred background when placed over images/gradients
- Maintain high contrast ratios for accessibility while preserving dark aesthetic
- Use CSS backdrop-filter for frosted glass effects on overlays
- Implement smooth scroll behavior globally