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
      link: "#build"
    }
  ] as EcosystemCard[]
};
