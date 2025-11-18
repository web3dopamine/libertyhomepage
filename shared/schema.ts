import { z } from "zod";

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
  category: 'Conference' | 'Workshop' | 'Hackathon' | 'Meetup';
  location: string;
  description: string;
  isVirtual: boolean;
  link: string;
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
    title: "The High-Performance EVM Blockchain Built for Scale",
    subtitle: "Liberty Chain is a next-generation, Ethereum-compatible Layer 1 blockchain delivering unmatched performance, zero gas fees, instant finality, and true decentralization. All in one.",
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
      title: "Run a node. Join the network.",
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
