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
  isCustom?: boolean;
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
          { key: "hero.subtitle", label: "Subtitle Lines", type: "textarea", defaultValue: "The first Reticulum-Meshtastic EVM Layer 1, engineered for|unmatched performance, zero gas fees, and instant finality.|No Gas. No Friction. No Permission. Just Liberty.", hint: "Separate lines with | — the last line is highlighted in primary color" },
          { key: "hero.primaryCTA", label: "Primary Button Text", type: "text", defaultValue: "Start Building" },
          { key: "hero.primaryCTAUrl", label: "Primary Button URL", type: "url", defaultValue: "/build" },
          { key: "hero.secondaryCTA", label: "Secondary Button Text", type: "text", defaultValue: "Read the Documentation" },
          { key: "hero.secondaryCTAUrl", label: "Secondary Button URL", type: "url", defaultValue: "/documentation" },
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
          { key: "network.cta1", label: "Primary Button Text", type: "text", defaultValue: "Become a Validator" },
          { key: "network.cta1Url", label: "Primary Button URL", type: "url", defaultValue: "/validators" },
          { key: "network.cta2", label: "Secondary Button Text", type: "text", defaultValue: "View Documentation" },
          { key: "network.cta2Url", label: "Secondary Button URL", type: "url", defaultValue: "/documentation" },
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
          { key: "hero.badge", label: "Badge Text", type: "text", defaultValue: "BUILD" },
          { key: "hero.title", label: "Headline", type: "text", defaultValue: "Build on Liberty" },
          { key: "hero.subtitle", label: "Subtitle", type: "textarea", defaultValue: "Explore programs, resources, and a world-class community for founders and developers building on Liberty." },
        ],
      },
      {
        id: "program1",
        label: "Program Card 1 — Accelerator",
        fields: [
          { key: "program1.title", label: "Card Title", type: "text", defaultValue: "Liberty Accelerator" },
          { key: "program1.description", label: "Card Description", type: "textarea", defaultValue: "Get funding, mentorship, and resources to launch your project on Liberty Chain. Applications open quarterly." },
          { key: "program1.cta", label: "Button Text", type: "text", defaultValue: "Apply Now" },
          { key: "program1.ctaUrl", label: "Button URL", type: "url", defaultValue: "/accelerator/apply" },
        ],
      },
      {
        id: "program2",
        label: "Program Card 2 — Community",
        fields: [
          { key: "program2.title", label: "Card Title", type: "text", defaultValue: "Developer Community" },
          { key: "program2.description", label: "Card Description", type: "textarea", defaultValue: "Join thousands of developers building the future of blockchain. Access forums, Discord, and regular meetups." },
          { key: "program2.cta", label: "Button Text", type: "text", defaultValue: "Join Community" },
          { key: "program2.ctaUrl", label: "Button URL", type: "url", defaultValue: "/community" },
        ],
      },
      {
        id: "program3",
        label: "Program Card 3 — Learning",
        fields: [
          { key: "program3.title", label: "Card Title", type: "text", defaultValue: "Learning Resources" },
          { key: "program3.description", label: "Card Description", type: "textarea", defaultValue: "Comprehensive tutorials, guides, and courses to help you master Liberty Chain development." },
          { key: "program3.cta", label: "Button Text", type: "text", defaultValue: "Start Learning" },
          { key: "program3.ctaUrl", label: "Button URL", type: "url", defaultValue: "/documentation" },
        ],
      },
      {
        id: "whyBuild",
        label: "Why Build on Liberty? Section",
        fields: [
          { key: "whyBuild.title", label: "Section Headline", type: "text", defaultValue: "Why Build on Liberty?" },
          { key: "whyBuild.feature1Title", label: "Feature 1 Title", type: "text", defaultValue: "10,000+ TPS" },
          { key: "whyBuild.feature1Desc", label: "Feature 1 Description", type: "text", defaultValue: "Scale your application without limits" },
          { key: "whyBuild.feature2Title", label: "Feature 2 Title", type: "text", defaultValue: "Zero Gas Fees" },
          { key: "whyBuild.feature2Desc", label: "Feature 2 Description", type: "text", defaultValue: "No transaction costs for your users" },
          { key: "whyBuild.feature3Title", label: "Feature 3 Title", type: "text", defaultValue: "EVM Compatible" },
          { key: "whyBuild.feature3Desc", label: "Feature 3 Description", type: "text", defaultValue: "Use familiar Solidity smart contracts" },
          { key: "whyBuild.feature4Title", label: "Feature 4 Title", type: "text", defaultValue: "True Decentralization" },
          { key: "whyBuild.feature4Desc", label: "Feature 4 Description", type: "text", defaultValue: "Built on proven blockchain security" },
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
          { key: "hero.badge", label: "Badge Text", type: "text", defaultValue: "COMMUNITY" },
          { key: "hero.title", label: "Headline", type: "text", defaultValue: "Join the Community" },
          { key: "hero.subtitle", label: "Subtitle", type: "textarea", defaultValue: "Connect with our vibrant community for discussions, support, and collaboration." },
        ],
      },
      {
        id: "channel1",
        label: "Channel Card 1 — Discord",
        fields: [
          { key: "channel1.title", label: "Card Title", type: "text", defaultValue: "Discord Server" },
          { key: "channel1.members", label: "Member Count Badge", type: "text", defaultValue: "50K+ members" },
          { key: "channel1.description", label: "Card Description", type: "textarea", defaultValue: "Join 50,000+ community members in our Discord for discussions, support, and collaboration." },
          { key: "channel1.cta", label: "Button Text", type: "text", defaultValue: "Join Discord" },
          { key: "channel1.ctaUrl", label: "Button URL", type: "url", defaultValue: "https://discord.gg/libertychain" },
        ],
      },
      {
        id: "channel2",
        label: "Channel Card 2 — Forum",
        fields: [
          { key: "channel2.title", label: "Card Title", type: "text", defaultValue: "Forum" },
          { key: "channel2.members", label: "Member Count Badge", type: "text", defaultValue: "Active discussions" },
          { key: "channel2.description", label: "Card Description", type: "textarea", defaultValue: "Participate in governance discussions, proposals, and long-form conversations." },
          { key: "channel2.cta", label: "Button Text", type: "text", defaultValue: "Visit Forum" },
          { key: "channel2.ctaUrl", label: "Button URL", type: "url", defaultValue: "https://discord.gg/libertychain" },
        ],
      },
      {
        id: "channel3",
        label: "Channel Card 3 — Developers",
        fields: [
          { key: "channel3.title", label: "Card Title", type: "text", defaultValue: "Developer Community" },
          { key: "channel3.members", label: "Member Count Badge", type: "text", defaultValue: "5K+ developers" },
          { key: "channel3.description", label: "Card Description", type: "textarea", defaultValue: "Connect with builders, share ideas, and get technical support from experienced developers." },
          { key: "channel3.cta", label: "Button Text", type: "text", defaultValue: "Join Developers" },
          { key: "channel3.ctaUrl", label: "Button URL", type: "url", defaultValue: "/build" },
        ],
      },
      {
        id: "channel4",
        label: "Channel Card 4 — Ambassador",
        fields: [
          { key: "channel4.title", label: "Card Title", type: "text", defaultValue: "Ambassador Program" },
          { key: "channel4.members", label: "Member Count Badge", type: "text", defaultValue: "Global network" },
          { key: "channel4.description", label: "Card Description", type: "textarea", defaultValue: "Become a Liberty ambassador and help grow the community in your region." },
          { key: "channel4.cta", label: "Button Text", type: "text", defaultValue: "Apply Now" },
          { key: "channel4.ctaUrl", label: "Button URL", type: "url", defaultValue: "https://discord.gg/libertychain" },
        ],
      },
      {
        id: "guidelines",
        label: "Community Guidelines Section",
        fields: [
          { key: "guidelines.title", label: "Section Title", type: "text", defaultValue: "Community Guidelines" },
          { key: "guidelines.body", label: "Body Text", type: "textarea", defaultValue: "We're building an inclusive, respectful community. Please read our community guidelines before participating in discussions." },
          { key: "guidelines.cta", label: "Button Text", type: "text", defaultValue: "Read Guidelines" },
          { key: "guidelines.ctaUrl", label: "Button URL", type: "url", defaultValue: "https://discord.gg/libertychain" },
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
          { key: "hero.cta1", label: "Primary Button Text", type: "text", defaultValue: "Join the Waitlist" },
          { key: "hero.cta2", label: "Secondary Button Text", type: "text", defaultValue: "Learn How It Works" },
        ],
      },
      {
        id: "howItWorks",
        label: "How It Works Section",
        fields: [
          { key: "howItWorks.title", label: "Section Title", type: "text", defaultValue: "How the Resilience Layer Works" },
          { key: "howItWorks.step1Title", label: "Step 1 Title", type: "text", defaultValue: "LoRa Radio Mesh" },
          { key: "howItWorks.step1Desc", label: "Step 1 Description", type: "textarea", defaultValue: "Liberty nodes broadcast over LoRa (Long Range) radio — a low-power, wide-area protocol that operates without the internet. Signals travel up to 15km in open terrain, hopping between nodes in a fully decentralized mesh." },
          { key: "howItWorks.step2Title", label: "Step 2 Title", type: "text", defaultValue: "Ultra-Lightweight Packets" },
          { key: "howItWorks.step2Desc", label: "Step 2 Description", type: "textarea", defaultValue: "Each packet carries only what matters: the latest block height and hash, finalized checkpoints, validator signals, and compressed transaction intents. The entire payload fits in a LoRa frame — no broadband required." },
          { key: "howItWorks.step3Title", label: "Step 3 Title", type: "text", defaultValue: "Mesh Propagation" },
          { key: "howItWorks.step3Desc", label: "Step 3 Description", type: "textarea", defaultValue: "Nodes relay packets across the mesh using a store-and-forward model. Even if a node is temporarily out of range, data propagates as connectivity returns — maintaining chain awareness across the entire network." },
          { key: "howItWorks.step4Title", label: "Step 4 Title", type: "text", defaultValue: "Seamless Reconciliation" },
          { key: "howItWorks.step4Desc", label: "Step 4 Description", type: "textarea", defaultValue: "When internet connectivity is restored, nodes reconcile from mesh checkpoints. Missing blocks sync automatically and full performance resumes instantly — no manual intervention, no loss of integrity." },
        ],
      },
      {
        id: "useCases",
        label: "Use Cases Section",
        fields: [
          { key: "useCases.title", label: "Section Title", type: "text", defaultValue: "Built for the Real World" },
          { key: "useCases.case1Title", label: "Case 1 Title", type: "text", defaultValue: "Remote & Rural Regions" },
          { key: "useCases.case1Desc", label: "Case 1 Description", type: "textarea", defaultValue: "Farmers, rural communities, and off-grid settlements can participate in and interact with the Liberty network without any internet infrastructure." },
          { key: "useCases.case2Title", label: "Case 2 Title", type: "text", defaultValue: "Infrastructure Outages" },
          { key: "useCases.case2Desc", label: "Case 2 Description", type: "textarea", defaultValue: "Natural disasters, power grid failures, and ISP outages won't take Liberty offline. The mesh layer keeps validators coordinating and the chain producing blocks." },
          { key: "useCases.case3Title", label: "Case 3 Title", type: "text", defaultValue: "Censorship-Restricted Environments" },
          { key: "useCases.case3Desc", label: "Case 3 Description", type: "textarea", defaultValue: "In regions where governments control or restrict internet access, Liberty's LoRa mesh bypasses traditional infrastructure entirely." },
          { key: "useCases.case4Title", label: "Case 4 Title", type: "text", defaultValue: "Emergency & Disaster Networks" },
          { key: "useCases.case4Desc", label: "Case 4 Description", type: "textarea", defaultValue: "Emergency responders, humanitarian operations, and disaster relief efforts can leverage Liberty's mesh layer for tamper-proof, decentralized coordination." },
          { key: "useCases.case5Title", label: "Case 5 Title", type: "text", defaultValue: "Maritime & Aviation" },
          { key: "useCases.case5Desc", label: "Case 5 Description", type: "textarea", defaultValue: "Shipping vessels, remote aircraft, and offshore platforms can maintain chain awareness via satellite-linked mesh nodes." },
          { key: "useCases.case6Title", label: "Case 6 Title", type: "text", defaultValue: "Protest & Civil Action" },
          { key: "useCases.case6Desc", label: "Case 6 Description", type: "textarea", defaultValue: "In environments where communication is monitored or suppressed, the off-grid layer allows participants to transact and coordinate without exposing themselves to internet-level surveillance." },
        ],
      },
      {
        id: "waitlist",
        label: "Waitlist / CTA Section",
        fields: [
          { key: "waitlist.title", label: "Section Title", type: "text", defaultValue: "Join the Liberty Mesh Device Waitlist" },
          { key: "waitlist.subtitle", label: "Section Subtitle", type: "textarea", defaultValue: "Be among the first to receive a Liberty Mesh Device — purpose-built hardware for running LoRa nodes and contributing to the Liberty resilience layer." },
          { key: "waitlist.submitBtn", label: "Submit Button Text", type: "text", defaultValue: "Join Waitlist" },
          { key: "waitlist.successTitle", label: "Success Message Title", type: "text", defaultValue: "You're on the list!" },
          { key: "waitlist.successBody", label: "Success Message Body", type: "textarea", defaultValue: "We'll notify you as soon as Liberty Mesh Devices are available. Thanks for being early." },
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
          { key: "hero.badge", label: "Badge Text", type: "text", defaultValue: "VALIDATORS" },
          { key: "hero.title", label: "Headline", type: "text", defaultValue: "Network Validators" },
          { key: "hero.subtitle", label: "Subtitle", type: "textarea", defaultValue: "View Liberty validator performance and network analytics." },
        ],
      },
      {
        id: "stats",
        label: "Network Stats",
        fields: [
          { key: "stats.stat1Label", label: "Stat 1 Label", type: "text", defaultValue: "Active Validators" },
          { key: "stats.stat1Value", label: "Stat 1 Value", type: "text", defaultValue: "1,247" },
          { key: "stats.stat2Label", label: "Stat 2 Label", type: "text", defaultValue: "Network Uptime" },
          { key: "stats.stat2Value", label: "Stat 2 Value", type: "text", defaultValue: "99.99%" },
          { key: "stats.stat3Label", label: "Stat 3 Label", type: "text", defaultValue: "Avg Block Time" },
          { key: "stats.stat3Value", label: "Stat 3 Value", type: "text", defaultValue: "0.4s" },
          { key: "stats.stat4Label", label: "Stat 4 Label", type: "text", defaultValue: "Total Stake" },
          { key: "stats.stat4Value", label: "Stat 4 Value", type: "text", defaultValue: "45.2M LBTC" },
        ],
      },
      {
        id: "table",
        label: "Top Validators Table",
        fields: [
          { key: "table.title", label: "Table Title", type: "text", defaultValue: "Top Validators" },
          { key: "table.ctaLabel", label: "Button Text", type: "text", defaultValue: "Become a Validator" },
          { key: "table.ctaUrl", label: "Button URL", type: "url", defaultValue: "/documentation" },
        ],
      },
      {
        id: "runValidator",
        label: "Run a Validator Section",
        fields: [
          { key: "runValidator.title", label: "Section Title", type: "text", defaultValue: "Run a Liberty Validator" },
          { key: "runValidator.body", label: "Body Text", type: "textarea", defaultValue: "Anyone can run a Liberty validator with consumer-grade hardware. Join our growing network of decentralized validators." },
          { key: "runValidator.cta1", label: "Primary Button Text", type: "text", defaultValue: "Start Validating" },
          { key: "runValidator.cta1Url", label: "Primary Button URL", type: "url", defaultValue: "/documentation" },
          { key: "runValidator.cta2", label: "Secondary Button Text", type: "text", defaultValue: "Learn More" },
          { key: "runValidator.cta2Url", label: "Secondary Button URL", type: "url", defaultValue: "/resilience-layer" },
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
          { key: "hero.searchPlaceholder", label: "Search Placeholder", type: "text", defaultValue: "Search apps..." },
          { key: "hero.submitCta", label: "Submit App Button", type: "text", defaultValue: "Submit Your App" },
          { key: "hero.submitCtaUrl", label: "Submit App URL", type: "url", defaultValue: "https://discord.gg/libertychain" },
        ],
      },
    ],
  },

  {
    id: "institutions",
    title: "Institutions",
    path: "/institutions",
    sections: [
      {
        id: "hero",
        label: "Hero Section",
        fields: [
          { key: "hero.badge", label: "Badge Text", type: "text", defaultValue: "INSTITUTIONS" },
          { key: "hero.title", label: "Headline", type: "text", defaultValue: "Enterprise Solutions" },
          { key: "hero.subtitle", label: "Subtitle", type: "textarea", defaultValue: "Blockchain solutions designed for institutional adoption and enterprise needs." },
        ],
      },
      {
        id: "feature1",
        label: "Feature Card 1 — Security",
        fields: [
          { key: "feature1.title", label: "Card Title", type: "text", defaultValue: "Enterprise Security" },
          { key: "feature1.description", label: "Card Description", type: "textarea", defaultValue: "Bank-grade security with multi-signature support and advanced key management for institutional needs." },
        ],
      },
      {
        id: "feature2",
        label: "Feature Card 2 — Infrastructure",
        fields: [
          { key: "feature2.title", label: "Card Title", type: "text", defaultValue: "Scalable Infrastructure" },
          { key: "feature2.description", label: "Card Description", type: "textarea", defaultValue: "Handle millions of transactions with Liberty's high-performance infrastructure designed for enterprise scale." },
        ],
      },
      {
        id: "feature3",
        label: "Feature Card 3 — Support",
        fields: [
          { key: "feature3.title", label: "Card Title", type: "text", defaultValue: "Dedicated Support" },
          { key: "feature3.description", label: "Card Description", type: "textarea", defaultValue: "Get white-glove support from our enterprise team to ensure smooth integration and operation." },
        ],
      },
      {
        id: "cta",
        label: "Bottom CTA Section",
        fields: [
          { key: "cta.title", label: "CTA Headline", type: "text", defaultValue: "Ready to Build with Liberty?" },
          { key: "cta.body", label: "CTA Body Text", type: "textarea", defaultValue: "Join leading institutions building on Liberty Chain. Contact our enterprise team to discuss your needs." },
          { key: "cta.primaryLabel", label: "Primary Button Text", type: "text", defaultValue: "Contact Sales" },
          { key: "cta.primaryUrl", label: "Primary Button URL", type: "url", defaultValue: "https://discord.gg/libertychain" },
          { key: "cta.secondaryLabel", label: "Secondary Button Text", type: "text", defaultValue: "View Documentation" },
          { key: "cta.secondaryUrl", label: "Secondary Button URL", type: "url", defaultValue: "/documentation" },
        ],
      },
    ],
  },

  {
    id: "mesh-messaging",
    title: "Mesh Messaging",
    path: "/mesh-messaging",
    sections: [
      {
        id: "hero",
        label: "Hero Section",
        fields: [
          { key: "hero.badge", label: "Badge Text", type: "text", defaultValue: "Decentralized Messaging" },
          { key: "hero.title", label: "Headline", type: "textarea", defaultValue: "Liberty Mesh Messaging Layer", hint: 'The word "Messaging" appears highlighted on the actual page' },
          { key: "hero.subtitle", label: "Subtitle", type: "textarea", defaultValue: "Communication without infrastructure. Liberty introduces a decentralized messaging layer built on Meshtastic, enabling secure, off-grid communication directly between wallets, validators, and network participants." },
          { key: "hero.cta1", label: "Primary Button Text", type: "text", defaultValue: "Explore the Resilience Layer" },
          { key: "hero.cta1Url", label: "Primary Button URL", type: "url", defaultValue: "/resilience-layer" },
          { key: "hero.cta2", label: "Secondary Button Text", type: "text", defaultValue: "Read the Docs" },
          { key: "hero.cta2Url", label: "Secondary Button URL", type: "url", defaultValue: "/documentation" },
        ],
      },
      {
        id: "unified",
        label: "Unified System Section",
        fields: [
          { key: "unified.title", label: "Section Headline", type: "textarea", defaultValue: "A unified system where everything just works." },
          { key: "unified.subtitle", label: "Section Subtitle", type: "textarea", defaultValue: "On Liberty, your wallet, your messages, and your infrastructure are one seamless layer." },
          { key: "unified.pillar1Label", label: "Pillar 1 Label", type: "text", defaultValue: "Identity" },
          { key: "unified.pillar1Value", label: "Pillar 1 Value", type: "text", defaultValue: "Wallet" },
          { key: "unified.pillar2Label", label: "Pillar 2 Label", type: "text", defaultValue: "Messaging" },
          { key: "unified.pillar2Value", label: "Pillar 2 Value", type: "text", defaultValue: "Native" },
          { key: "unified.pillar3Label", label: "Pillar 3 Label", type: "text", defaultValue: "Infrastructure" },
          { key: "unified.pillar3Value", label: "Pillar 3 Value", type: "text", defaultValue: "Decentralized" },
        ],
      },
      {
        id: "pillarsSection",
        label: "Four Pillars Section Title",
        fields: [
          { key: "pillars.title", label: "Section Headline", type: "textarea", defaultValue: "Four pillars of mesh communication." },
        ],
      },
      {
        id: "feature1",
        label: "Feature 1 — Wallet Messaging",
        fields: [
          { key: "feature1.tag", label: "Tag Text", type: "text", defaultValue: "Wallet-to-Wallet Messaging" },
          { key: "feature1.title", label: "Card Title", type: "text", defaultValue: "Your wallet is your identity." },
          { key: "feature1.description", label: "Card Description", type: "textarea", defaultValue: "Send encrypted messages directly between on-chain identities — address-to-address, with no phone numbers, no emails, and no middlemen. Fully encrypted payloads, native to the Liberty ecosystem." },
          { key: "feature1.cta", label: "Bottom Callout Text", type: "text", defaultValue: "Your wallet becomes your communication layer." },
        ],
      },
      {
        id: "feature2",
        label: "Feature 2 — Validator Communication",
        fields: [
          { key: "feature2.tag", label: "Tag Text", type: "text", defaultValue: "Validator Communication" },
          { key: "feature2.title", label: "Card Title", type: "text", defaultValue: "Critical infrastructure, always connected." },
          { key: "feature2.description", label: "Card Description", type: "textarea", defaultValue: "Maintain network coordination even in low-connectivity environments. Liberty validators broadcast liveness signals, checkpoint confirmations, and consensus coordination messages across the mesh." },
          { key: "feature2.cta", label: "Bottom Callout Text", type: "text", defaultValue: "Critical infrastructure, always connected." },
        ],
      },
      {
        id: "feature3",
        label: "Feature 3 — DAO Governance",
        fields: [
          { key: "feature3.tag", label: "Tag Text", type: "text", defaultValue: "DAO Governance Signals" },
          { key: "feature3.title", label: "Card Title", type: "text", defaultValue: "Governance that works beyond the internet." },
          { key: "feature3.description", label: "Card Description", type: "textarea", defaultValue: "Enable governance participation anywhere, anytime. Submit proposal voting signals, Snapshot-style intent messages, and emergency governance coordination directly over the mesh — no internet required." },
          { key: "feature3.cta", label: "Bottom Callout Text", type: "text", defaultValue: "Governance that works beyond the internet." },
        ],
      },
      {
        id: "feature4",
        label: "Feature 4 — Off-Grid Chat",
        fields: [
          { key: "feature4.tag", label: "Tag Text", type: "text", defaultValue: "Encrypted Off-Grid Chat" },
          { key: "feature4.title", label: "Card Title", type: "text", defaultValue: "Messaging that survives outages, censorship, and distance." },
          { key: "feature4.description", label: "Card Description", type: "textarea", defaultValue: "A resilient communication layer for real-world conditions. LoRa mesh-based messaging delivers end-to-end encrypted packets in environments without internet access, designed for low-bandwidth operation." },
          { key: "feature4.cta", label: "Bottom Callout Text", type: "text", defaultValue: "Messaging that survives outages, censorship, and distance." },
        ],
      },
      {
        id: "realWorld",
        label: "Real World Section",
        fields: [
          { key: "realWorld.title", label: "Section Headline", type: "textarea", defaultValue: "Built for the real world." },
          { key: "realWorld.subtitle", label: "Section Subtitle", type: "textarea", defaultValue: "From remote regions to high-risk environments, Liberty Mesh Messaging ensures communication never stops — wherever you are, whatever the conditions." },
          { key: "realWorld.use1", label: "Use Case 1", type: "text", defaultValue: "Rural & agricultural networks" },
          { key: "realWorld.use2", label: "Use Case 2", type: "text", defaultValue: "Disaster recovery scenarios" },
          { key: "realWorld.use3", label: "Use Case 3", type: "text", defaultValue: "Censorship-restricted regions" },
          { key: "realWorld.use4", label: "Use Case 4", type: "text", defaultValue: "Mobile, off-grid users" },
          { key: "realWorld.use5", label: "Use Case 5", type: "text", defaultValue: "High-risk environments" },
          { key: "realWorld.use6", label: "Use Case 6", type: "text", defaultValue: "Remote community networks" },
        ],
      },
      {
        id: "finalCta",
        label: "Final CTA Section",
        fields: [
          { key: "finalCta.badge", label: "Badge Text", type: "text", defaultValue: "Experience Mesh Messaging on Liberty" },
          { key: "finalCta.title", label: "Headline", type: "textarea", defaultValue: "The network that keeps talking when everything else goes silent." },
          { key: "finalCta.subtitle", label: "Subtitle", type: "textarea", defaultValue: "Liberty is in Testnet. Join the mesh, run a node, and help build the most resilient communication layer in blockchain." },
          { key: "finalCta.cta1", label: "Primary Button Text", type: "text", defaultValue: "Explore the Resilience Layer" },
          { key: "finalCta.cta1Url", label: "Primary Button URL", type: "url", defaultValue: "/resilience-layer" },
          { key: "finalCta.cta2", label: "Secondary Button Text", type: "text", defaultValue: "Read the Documentation" },
          { key: "finalCta.cta2Url", label: "Secondary Button URL", type: "url", defaultValue: "/documentation" },
        ],
      },
    ],
  },

  // ── Roadmap & Vision ────────────────────────────────────────────────────
  {
    id: "roadmap",
    title: "Roadmap & Vision",
    path: "/#roadmap",
    sections: [
      {
        id: "header",
        label: "Section Header",
        fields: [
          {
            key: "badge",
            label: "Badge Text",
            type: "text",
            defaultValue: "Vision & Roadmap",
            hint: "Small label shown above the headline",
          },
          {
            key: "headline",
            label: "Headline (first part)",
            type: "text",
            defaultValue: "Building Tomorrow's",
            hint: "The plain part of the headline",
          },
          {
            key: "headlineHighlight",
            label: "Headline (highlighted word)",
            type: "text",
            defaultValue: "Blockchain.",
            hint: "Rendered in gradient primary color",
          },
          {
            key: "subtitle",
            label: "Subtitle / Description",
            type: "textarea",
            defaultValue: "Every milestone brings us closer to a fully decentralized, sovereign internet.",
          },
          {
            key: "scrollHint",
            label: "Scroll Hint Text",
            type: "text",
            defaultValue: "Drag or use arrows to explore",
            hint: "Shown at the bottom when the user hasn't scrolled yet",
          },
          {
            key: "emptyState",
            label: "Empty State Message",
            type: "text",
            defaultValue: "No milestones yet — add them in the admin panel.",
            hint: "Shown when no milestones have been added",
          },
        ],
      },
    ],
  },
];
