import { z } from "zod";

export const eventCategoryValues = ['Conference', 'Workshop', 'Hackathon', 'Meetup'] as const;

export const acceleratorStageValues = ['applied', 'review', 'interview', 'accepted', 'rejected'] as const;
export type AcceleratorStage = typeof acceleratorStageValues[number];

export const projectStageValues = ['Idea', 'MVP', 'Beta', 'Production'] as const;
export const teamSizeValues = ['Solo', '2–5', '6–15', '16+'] as const;
export const buildingCategoryValues = ['DeFi', 'NFT / Gaming', 'Infrastructure', 'DAO / Governance', 'Developer Tooling', 'Other'] as const;

export interface AcceleratorApplication {
  id: string;
  name: string;
  email: string;
  projectName: string;
  website: string;
  twitter: string;
  github: string;
  description: string;
  projectStage: typeof projectStageValues[number] | string;
  teamSize: typeof teamSizeValues[number] | string;
  category: typeof buildingCategoryValues[number] | string;
  howCanWeHelp: string;
  pipelineStage: AcceleratorStage;
  appliedAt: string;
}

export const insertAcceleratorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  projectName: z.string().min(1, "Project name is required"),
  website: z.string().default(""),
  twitter: z.string().default(""),
  github: z.string().default(""),
  description: z.string().min(10, "Please describe your project (min 10 characters)"),
  projectStage: z.string().min(1, "Please select your project stage"),
  teamSize: z.string().min(1, "Please select your team size"),
  category: z.string().min(1, "Please select what you are building"),
  howCanWeHelp: z.string().min(10, "Please tell us how we can help (min 10 characters)"),
});

export type InsertAcceleratorApplication = z.infer<typeof insertAcceleratorSchema>;

export const intendedUseValues = [
  'Home / Personal',
  'Remote Area / Rural',
  'Emergency Services',
  'Commercial / Enterprise',
  'Research / Academic',
  'Other',
] as const;

export interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  country: string;
  intendedUse: typeof intendedUseValues[number] | string;
  message: string;
  twitter: string;
  telegram: string;
  signedUpAt: string;
}

export const insertWaitlistSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  country: z.string().default(""),
  intendedUse: z.string().default(""),
  message: z.string().default(""),
  twitter: z.string().default(""),
  telegram: z.string().default(""),
});

export interface EventRegistration {
  id: string;
  eventId: string;
  eventTitle: string;
  name: string;
  email: string;
  twitter: string;
  telegram: string;
  registeredAt: string;
}

export const insertEventRegistrationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  twitter: z.string().default(""),
  telegram: z.string().default(""),
});

export type InsertEventRegistration = z.infer<typeof insertEventRegistrationSchema>;

// ── Social Links ──────────────────────────────────────
export interface SocialLink {
  id: string;
  name: string;
  url: string;
  icon: string;
  color: string;
  handle: string;
  description: string;
  order: number;
}

export const insertSocialLinkSchema = z.object({
  name: z.string().min(1, "Name is required"),
  url: z.string().min(1, "URL is required"),
  icon: z.string().default("SiX"),
  color: z.string().default("text-foreground"),
  handle: z.string().default(""),
  description: z.string().default(""),
  order: z.number().default(0),
});

export type InsertSocialLink = z.infer<typeof insertSocialLinkSchema>;

// ── Partners ──────────────────────────────────────────
export interface Partner {
  id: string;
  name: string;
  logoUrl: string;
  link: string;
  description: string;
  order: number;
}

export const insertPartnerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  logoUrl: z.string().default(""),
  link: z.string().default(""),
  description: z.string().default(""),
  order: z.number().default(0),
});

export type InsertPartner = z.infer<typeof insertPartnerSchema>;

// ── Press Articles ────────────────────────────────────
export interface PressArticle {
  id: string;
  publicationName: string;
  publicationLogo: string;
  headline: string;
  excerpt: string;
  articleUrl: string;
  date: string;
  order: number;
}

export const insertPressArticleSchema = z.object({
  publicationName: z.string().min(1, "Publication name is required"),
  publicationLogo: z.string().default(""),
  headline: z.string().min(1, "Headline is required"),
  excerpt: z.string().default(""),
  articleUrl: z.string().default("#"),
  date: z.string().default(""),
  order: z.number().default(0),
});

export type InsertPressArticle = z.infer<typeof insertPressArticleSchema>;

export type InsertWaitlist = z.infer<typeof insertWaitlistSchema>;

export const insertEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  date: z.string().min(1, "Date is required"),
  endDate: z.string().optional(),
  category: z.enum(eventCategoryValues),
  location: z.string().min(1, "Location is required"),
  description: z.string().min(1, "Description is required"),
  isVirtual: z.boolean(),
  link: z.string().default("#"),
  headerImage: z.string().optional(),
  maxAttendees: z.number().int().positive().optional(),
});

export type InsertEvent = z.infer<typeof insertEventSchema>;

export interface PerformanceMetric {
  value: string;
  label: string;
  suffix?: string;
  prefix?: string;
}

export interface TechKeyword {
  text: string;
}

export interface Feature {
  title: string;
  description: string;
  icon?: string;
}

export interface EcosystemCard {
  title: string;
  description: string;
  image: string;
  link: string;
}

export interface Event {
  id: string;
  title: string;
  date: Date | string;
  endDate?: string;
  category: 'Conference' | 'Workshop' | 'Hackathon' | 'Meetup';
  location: string;
  description: string;
  isVirtual: boolean;
  link: string;
  headerImage?: string;
  maxAttendees?: number;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: Date | string;
  category: 'Technical' | 'Community' | 'Announcements' | 'Tutorials';
  author: string;
  image: string;
  link: string;
}

export interface EcosystemApp {
  id: string;
  name: string;
  logo: string;
  category: 'DeFi' | 'NFTs' | 'Gaming' | 'Infrastructure' | 'DAOs';
  description: string;
  link: string;
  featured: boolean;
}

export const libertyChainData = {
  hero: {
    title: "High-Performance EVM Blockchain Built for Freedom",
    subtitle: "The first Meshtastic-powered EVM Layer 1, engineered for|unmatched performance, zero gas fees, and instant finality.|No Gas. No Friction. No Permission. Just Liberty.",
    primaryCTA: "Start Building",
    secondaryCTA: "Read the Documentation"
  },
  metrics: [
    { value: "10000", label: "Transactions per second", suffix: "+" },
    { value: "100", label: "Validators", suffix: "+" },
    { value: "100", label: "EVM-Compatible", suffix: "%" },
    { value: "1", label: "Finality", suffix: "s" }
  ] as PerformanceMetric[],
  keywords: [
    "Wallets", "Security", "EVM Addresses", "Smart Contracts", 
    "Tools & Services", "Research", "DeFi", "Gaming", 
    "AI Applications", "Zero Gas Fees"
  ] as string[],
  features: {
    performance: {
      title: "Build beyond limits. Scale without compromise.",
      description: "Liberty Chain unlocks a new era of EVM performance with zero gas fees, enabling products the EVM has never seen before.",
      metrics: [
        { value: "10000", label: "Transactions per second", suffix: "+" },
        { value: "100", label: "EVM-Compatible", suffix: "%" },
        { value: "1", label: "Finality", suffix: "s" },
        { value: "0", label: "Gas Fees", prefix: "$" }
      ] as PerformanceMetric[]
    },
    evmCompatibility: {
      title: "Plug and play.",
      description: "Liberty Chain is EVM compatible at the bytecode level. That means Solidity contracts, EVM addresses, infrastructure, tooling, and libraries work out of the box. Focus on building great products—not learning a new stack."
    },
    network: {
      title: "Liberty is in Testnet, Join the network.",
      description: "Liberty Chain's optimized architecture and low system requirements allow validators to run on consumer-grade hardware.",
      subtitle: "That's real decentralization from day one—with a global network ready to scale as demand grows."
    }
  },
  ecosystem: [
    {
      title: "Explore the Ecosystem",
      description: "Discover apps already live on Liberty Chain—designed for speed, built for scale, and completely decentralized.",
      image: "/placeholder-ecosystem.png",
      link: "#ecosystem"
    },
    {
      title: "Start Building",
      description: "Explore programs, resources, and a world-class community for founders and developers building on Liberty Chain.",
      image: "/placeholder-build.png",
      link: "/ecosystem"
    }
  ] as EcosystemCard[],
  events: [
    {
      id: "1",
      title: "Liberty Chain Developer Summit 2025",
      date: "2025-03-15",
      category: "Conference",
      location: "San Francisco, CA",
      description: "Join us for the largest Liberty Chain developer event of the year. Connect with core contributors, learn advanced development techniques, and explore the future of high-performance blockchain.",
      isVirtual: false,
      link: "#"
    },
    {
      id: "2",
      title: "Building DeFi on Liberty Chain",
      date: "2025-02-22",
      category: "Workshop",
      location: "Online",
      description: "A hands-on workshop covering smart contract development, zero-fee DeFi protocols, and best practices for building on Liberty Chain.",
      isVirtual: true,
      link: "#"
    },
    {
      id: "3",
      title: "Liberty Chain Global Hackathon",
      date: "2025-04-10",
      category: "Hackathon",
      location: "Multiple Cities",
      description: "Build the next generation of dApps with $100K in prizes. Categories include DeFi, Gaming, Infrastructure, and AI.",
      isVirtual: false,
      link: "#"
    },
    {
      id: "4",
      title: "Liberty Chain Community Meetup - NYC",
      date: "2025-02-05",
      category: "Meetup",
      location: "New York, NY",
      description: "Monthly community gathering for Liberty Chain builders and enthusiasts in the NYC area.",
      isVirtual: false,
      link: "#"
    },
    {
      id: "5",
      title: "Zero Gas Fees: Technical Deep Dive",
      date: "2025-01-30",
      category: "Workshop",
      location: "Online",
      description: "Learn about the technical architecture that enables Liberty Chain's zero gas fee model.",
      isVirtual: true,
      link: "#"
    }
  ] as Event[],
  blog: [
    {
      id: "1",
      title: "Introducing Liberty Chain: A New Era for EVM",
      excerpt: "Today we're excited to announce Liberty Chain, a next-generation Layer 1 blockchain that delivers 10,000+ TPS with zero gas fees while maintaining full EVM compatibility.",
      date: "2025-01-15",
      category: "Announcements",
      author: "Liberty Chain Team",
      image: "/blog-placeholder-1.jpg",
      link: "#"
    },
    {
      id: "2",
      title: "Technical Architecture: How We Achieve 10,000+ TPS",
      excerpt: "A deep dive into Liberty Chain's optimized execution layer, parallel transaction processing, and innovative consensus mechanism.",
      date: "2025-01-10",
      category: "Technical",
      author: "Engineering Team",
      image: "/blog-placeholder-2.jpg",
      link: "#"
    },
    {
      id: "3",
      title: "Building Your First dApp on Liberty Chain",
      excerpt: "Step-by-step tutorial for deploying your first smart contract on Liberty Chain using familiar Ethereum tools.",
      date: "2025-01-05",
      category: "Tutorials",
      author: "Developer Relations",
      image: "/blog-placeholder-3.jpg",
      link: "#"
    },
    {
      id: "4",
      title: "Community Spotlight: Top Projects on Liberty Chain",
      excerpt: "Highlighting the innovative teams building the future of decentralized applications on Liberty Chain.",
      date: "2024-12-28",
      category: "Community",
      author: "Community Team",
      image: "/blog-placeholder-4.jpg",
      link: "#"
    }
  ] as BlogPost[],
  ecosystemApps: [
    {
      id: "1",
      name: "LibertySwap",
      logo: "/app-logo-placeholder.png",
      category: "DeFi",
      description: "The leading DEX on Liberty Chain with zero trading fees and instant swaps.",
      link: "#",
      featured: true
    },
    {
      id: "2",
      name: "ChainNFT",
      logo: "/app-logo-placeholder.png",
      category: "NFTs",
      description: "Create, buy, and sell NFTs with no gas fees on the fastest NFT marketplace.",
      link: "#",
      featured: true
    },
    {
      id: "3",
      name: "LibertaQuest",
      logo: "/app-logo-placeholder.png",
      category: "Gaming",
      description: "On-chain RPG powered by Liberty Chain's high performance and zero fees.",
      link: "#",
      featured: false
    },
    {
      id: "4",
      name: "ChainBridge",
      logo: "/app-logo-placeholder.png",
      category: "Infrastructure",
      description: "Seamless cross-chain bridges connecting Liberty Chain to major networks.",
      link: "#",
      featured: true
    },
    {
      id: "5",
      name: "LibertyDAO",
      logo: "/app-logo-placeholder.png",
      category: "DAOs",
      description: "Decentralized governance platform for managing on-chain organizations.",
      link: "#",
      featured: false
    },
    {
      id: "6",
      name: "ZeroFee Lend",
      logo: "/app-logo-placeholder.png",
      category: "DeFi",
      description: "Lending and borrowing protocol with zero transaction costs.",
      link: "#",
      featured: false
    }
  ] as EcosystemApp[]
};

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL CAMPAIGNS & AUTORESPONDERS
// ─────────────────────────────────────────────────────────────────────────────

export type BlockType = 'heading' | 'text' | 'image' | 'button' | 'divider' | 'spacer';

export interface EmailBlock {
  id: string;
  type: BlockType;
  props: Record<string, string>;
}

export const emailBlockDefaults: Record<BlockType, Record<string, string>> = {
  heading: { text: 'Your Headline Here', tag: 'h1', align: 'left', color: '#ffffff' },
  text: { content: 'Add your text here. You can write multiple paragraphs.', align: 'left', color: '#7aacac' },
  image: { src: '', alt: '', link: '', width: '100%', align: 'center' },
  button: { label: 'Click Here', url: 'https://', bgColor: '#2EB8B8', textColor: '#000000', align: 'left' },
  divider: { color: '#1a3a3a' },
  spacer: { height: '32' },
};

export type CampaignAudienceType = 'all' | 'waitlist' | 'accelerator' | 'events' | 'csv' | 'custom';
export type CampaignStatus = 'draft' | 'sending' | 'sent';

export interface CsvRecipient {
  name: string;
  email: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  previewText: string;
  blocks: EmailBlock[];
  status: CampaignStatus;
  audienceType: CampaignAudienceType;
  customEmails: string;
  csvRecipients: CsvRecipient[];
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  sentCount: number;
  openCount: number;
  openedIds: string[];
  clickCount: number;
  clickedIds: string[];
  clickedLinks: Record<string, number>;
}

export const insertCampaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  subject: z.string().default(""),
  previewText: z.string().default(""),
  blocks: z.array(z.any()).default([]),
  status: z.enum(["draft", "sending", "sent"]).default("draft"),
  audienceType: z.enum(["all", "waitlist", "accelerator", "events", "csv", "custom"]).default("all"),
  customEmails: z.string().default(""),
  csvRecipients: z.array(z.object({ name: z.string(), email: z.string() })).default([]),
});
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;

export type AutoresponderTrigger = 'waitlist_signup' | 'accelerator_apply' | 'event_register';

export interface Autoresponder {
  id: string;
  name: string;
  trigger: AutoresponderTrigger;
  delayHours: number;
  subject: string;
  previewText: string;
  blocks: EmailBlock[];
  active: boolean;
  createdAt: string;
  sentCount: number;
}

export const insertAutoresponderSchema = z.object({
  name: z.string().min(1, "Name is required"),
  trigger: z.enum(["waitlist_signup", "accelerator_apply", "event_register"]),
  delayHours: z.number().default(0),
  subject: z.string().default(""),
  previewText: z.string().default(""),
  blocks: z.array(z.any()).default([]),
  active: z.boolean().default(true),
});
export type InsertAutoresponder = z.infer<typeof insertAutoresponderSchema>;
