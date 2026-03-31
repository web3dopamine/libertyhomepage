export type FieldType = "text" | "textarea" | "url";

export interface CMSField {
  key: string;
  label: string;
  type: FieldType;
  defaultValue: string;
  hint?: string;
}

export interface CMSSection {
  id: string;
  label: string;
  fields: CMSField[];
}

export interface CMSPage {
  id: string;
  title: string;
  path: string;
  sections: CMSSection[];
}

export const cmsPages: CMSPage[] = [
  {
    id: "home",
    title: "Home",
    path: "/",
    sections: [
      {
        id: "hero",
        label: "Hero Section",
        fields: [
          { key: "hero.badge", label: "Badge Text", type: "text", defaultValue: "Over 50 Million BTC Addresses Eligible" },
          { key: "hero.title", label: "Main Headline", type: "text", defaultValue: "High-Performance EVM Blockchain Built for Freedom", hint: 'The word "EVM" is highlighted automatically' },
          { key: "hero.subtitle", label: "Subtitle Lines", type: "textarea", defaultValue: "The first Meshtastic-powered EVM Layer 1, engineered for|unmatched performance, zero gas fees, and instant finality.|No Gas. No Friction. No Permission. Just Liberty.", hint: "Separate lines with | — the last line is highlighted in primary color" },
          { key: "hero.primaryCTA", label: "Primary Button Text", type: "text", defaultValue: "Start Building" },
          { key: "hero.secondaryCTA", label: "Secondary Button Text", type: "text", defaultValue: "Read the Documentation" },
        ],
      },
      {
        id: "performance",
        label: "Performance Section",
        fields: [
          { key: "performance.title", label: "Section Headline", type: "text", defaultValue: "Build beyond limits. Scale without compromise." },
          { key: "performance.description", label: "Section Description", type: "textarea", defaultValue: "Liberty Chain unlocks a new era of EVM performance with zero gas fees, enabling products the EVM has never seen before." },
        ],
      },
      {
        id: "evm",
        label: "EVM Compatibility Section",
        fields: [
          { key: "evm.title", label: "Section Headline", type: "text", defaultValue: "Plug and play." },
          { key: "evm.description", label: "Section Description", type: "textarea", defaultValue: "Liberty Chain is EVM compatible at the bytecode level. That means Solidity contracts, EVM addresses, infrastructure, tooling, and libraries work out of the box. Focus on building great products—not learning a new stack." },
        ],
      },
      {
        id: "network",
        label: "Network / Testnet Section",
        fields: [
          { key: "network.title", label: "Section Headline", type: "text", defaultValue: "Liberty is in Testnet, Join the network." },
          { key: "network.description", label: "Section Description", type: "textarea", defaultValue: "Liberty Chain's optimized architecture and low system requirements allow validators to run on consumer-grade hardware." },
          { key: "network.subtitle", label: "Section Subtitle", type: "textarea", defaultValue: "That's real decentralization from day one—with a global network ready to scale as demand grows." },
        ],
      },
    ],
  },
  {
    id: "build",
    title: "Build",
    path: "/build",
    sections: [
      {
        id: "hero",
        label: "Hero Section",
        fields: [
          { key: "hero.title", label: "Headline", type: "text", defaultValue: "Build on Liberty" },
          { key: "hero.subtitle", label: "Subtitle", type: "textarea", defaultValue: "Explore programs, resources, and a world-class community for founders and developers building on Liberty." },
        ],
      },
    ],
  },
  {
    id: "community",
    title: "Community",
    path: "/community",
    sections: [
      {
        id: "hero",
        label: "Hero Section",
        fields: [
          { key: "hero.title", label: "Headline", type: "text", defaultValue: "Join the Community" },
          { key: "hero.subtitle", label: "Subtitle", type: "textarea", defaultValue: "Connect with our vibrant community for discussions, support, and collaboration." },
        ],
      },
    ],
  },
  {
    id: "resilience-layer",
    title: "Resilience Layer",
    path: "/resilience-layer",
    sections: [
      {
        id: "hero",
        label: "Hero Section",
        fields: [
          { key: "hero.badge", label: "Badge Text", type: "text", defaultValue: "Off-Grid Resilience Layer" },
          { key: "hero.title", label: "Headline", type: "text", defaultValue: "Stay online, even when the world goes offline." },
          { key: "hero.subtitle", label: "Subtitle", type: "textarea", defaultValue: "Liberty Chain integrates a Meshtastic-powered LoRa mesh network — enabling blockchain continuity far beyond the reach of traditional internet infrastructure." },
        ],
      },
    ],
  },
  {
    id: "validators",
    title: "Validators",
    path: "/validators",
    sections: [
      {
        id: "hero",
        label: "Hero Section",
        fields: [
          { key: "hero.title", label: "Headline", type: "text", defaultValue: "Network Validators" },
          { key: "hero.subtitle", label: "Subtitle", type: "textarea", defaultValue: "View Liberty validator performance and network analytics." },
        ],
      },
    ],
  },
  {
    id: "ecosystem",
    title: "Ecosystem",
    path: "/ecosystem",
    sections: [
      {
        id: "hero",
        label: "Hero Section",
        fields: [
          { key: "hero.title", label: "Headline", type: "text", defaultValue: "Ecosystem Directory" },
          { key: "hero.subtitle", label: "Subtitle", type: "textarea", defaultValue: "Discover apps built on Liberty Chain—fast, scalable, and completely decentralized." },
        ],
      },
    ],
  },
];
