import { useState, useEffect, useRef, useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import {
  BookOpen,
  Code2,
  Terminal,
  FileText,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ExternalLink,
  Copy,
  Check,
  Menu,
  X,
  Search,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Lightbulb,
  Layers,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Data model
───────────────────────────────────────────── */

interface DocItem {
  id: string;
  label: string;
}

interface DocSection {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  items: DocItem[];
}

const sections: DocSection[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: BookOpen,
    description: "Quick start guide to building your first dApp on Liberty Chain.",
    items: [
      { id: "introduction", label: "Introduction" },
      { id: "installation", label: "Installation" },
      { id: "your-first-contract", label: "Your First Contract" },
    ],
  },
  {
    id: "smart-contracts",
    title: "Smart Contracts",
    icon: Code2,
    description: "Learn how to write and deploy Solidity smart contracts on Liberty.",
    items: [
      { id: "contract-basics", label: "Contract Basics" },
      { id: "advanced-patterns", label: "Advanced Patterns" },
      { id: "security-best-practices", label: "Security Best Practices" },
    ],
  },
  {
    id: "tutorials",
    title: "Tutorials",
    icon: Lightbulb,
    description: "Step-by-step guides for building real-world applications on Liberty Chain.",
    items: [
      { id: "build-a-dex", label: "Build a DEX" },
      { id: "nft-marketplace", label: "NFT Marketplace" },
      { id: "dao-governance", label: "DAO Governance" },
    ],
  },
  {
    id: "cli-tools",
    title: "CLI Tools",
    icon: Terminal,
    description: "Command-line tools for Liberty Chain development and deployment.",
    items: [
      { id: "cli-installation", label: "Installation" },
      { id: "commands-reference", label: "Commands Reference" },
      { id: "configuration", label: "Configuration" },
    ],
  },
  {
    id: "api-reference",
    title: "API Reference",
    icon: FileText,
    description: "Complete API documentation for Liberty Chain RPC methods.",
    items: [
      { id: "json-rpc", label: "JSON-RPC API" },
      { id: "web3-integration", label: "Web3 Integration" },
      { id: "graphql-api", label: "GraphQL API" },
    ],
  },
  {
    id: "sdk-libraries",
    title: "SDKs & Libraries",
    icon: Layers,
    description: "Official and community SDKs for integrating Liberty Chain into any app.",
    items: [
      { id: "liberty-sdk-js", label: "liberty.js SDK" },
      { id: "react-hooks", label: "React Hooks" },
      { id: "python-sdk", label: "Python SDK" },
    ],
  },
];

/* ─────────────────────────────────────────────
   Utility components
───────────────────────────────────────────── */

function CodeBlock({ code, language = "bash" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <div className="relative rounded-xl overflow-hidden border border-border bg-[#0d1117] my-4">
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-white/5 border-b border-border">
        <span className="text-xs text-muted-foreground font-mono">{language}</span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors min-h-[44px] sm:min-h-0 px-2"
          data-testid="button-copy-code"
          aria-label="Copy code"
        >
          {copied
            ? <><Check className="w-4 h-4 text-primary" /><span className="hidden sm:inline ml-1">Copied</span></>
            : <><Copy className="w-4 h-4" /><span className="hidden sm:inline ml-1">Copy</span></>
          }
        </button>
      </div>
      <div className="relative">
        <pre className="p-3 sm:p-4 overflow-x-auto text-[11px] sm:text-sm font-mono leading-relaxed text-[#e6edf3]">
          <code>{code}</code>
        </pre>
        {/* Fade-right scroll hint (mobile) */}
        <div className="pointer-events-none absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-[#0d1117] to-transparent sm:hidden" />
      </div>
    </div>
  );
}

function Callout({ type = "info", children }: { type?: "info" | "tip" | "warning"; children: React.ReactNode }) {
  const styles = {
    info: "border-primary/30 bg-primary/5 text-primary",
    tip: "border-green-500/30 bg-green-500/5 text-green-400",
    warning: "border-yellow-500/30 bg-yellow-500/5 text-yellow-400",
  };
  const labels = { info: "Note", tip: "Tip", warning: "Warning" };
  return (
    <div className={`border rounded-xl p-4 my-4 ${styles[type]}`}>
      <div className="text-xs font-bold uppercase tracking-wider mb-1">{labels[type]}</div>
      <div className="text-sm text-foreground/80 leading-relaxed">{children}</div>
    </div>
  );
}

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-2xl sm:text-3xl font-black tracking-tight mt-12 mb-4 scroll-mt-28">
      {children}
    </h2>
  );
}

function SubHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h3 id={id} className="text-lg font-bold mt-8 mb-3 scroll-mt-28 text-foreground">
      {children}
    </h3>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return <div className="text-muted-foreground leading-relaxed space-y-3">{children}</div>;
}

function StepList({ steps }: { steps: { n: string; title: string; body: React.ReactNode }[] }) {
  return (
    <div className="space-y-6 my-6">
      {steps.map((s) => (
        <div key={s.n} className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <span className="text-xs font-black text-primary">{s.n}</span>
          </div>
          <div className="flex-1 pt-0.5">
            <div className="font-bold text-sm mb-1">{s.title}</div>
            <div className="text-sm text-muted-foreground leading-relaxed">{s.body}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Section content
───────────────────────────────────────────── */

function GettingStartedContent() {
  return (
    <>
      <SectionHeading id="introduction">Introduction</SectionHeading>
      <Prose>
        <p>
          Liberty Chain is a next-generation, EVM-compatible Layer 1 blockchain designed for freedom,
          performance, and true decentralisation. It delivers{" "}
          <strong className="text-foreground">10,000+ TPS</strong>, instant finality, and{" "}
          <strong className="text-foreground">zero gas fees</strong> — so you can build without limits.
        </p>
        <p>
          Because Liberty Chain is fully EVM-compatible, any smart contract written in Solidity and
          any tooling you already use with Ethereum (Hardhat, Foundry, Remix, ethers.js, wagmi) works
          on Liberty out of the box. No rewrites, no new languages.
        </p>
      </Prose>

      <Callout type="tip">
        Liberty Chain has <strong>no gas fees</strong>. You do not need to set gas prices or hold
        native tokens to pay for transactions. Just deploy and send — transactions land instantly.
      </Callout>

      <div className="grid sm:grid-cols-3 gap-4 my-6">
        {[
          { label: "Throughput", value: "10,000+ TPS" },
          { label: "Finality", value: "Instant" },
          { label: "Gas Fees", value: "Zero" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-primary">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <SubHeading id="network-details">Network Details</SubHeading>
      <div className="overflow-x-auto my-4">
        <table className="w-full text-sm border border-border rounded-xl overflow-hidden">
          <thead className="bg-muted/40">
            <tr>
              {["Parameter", "Mainnet", "Devnet"].map((h) => (
                <th key={h} className="text-left px-4 py-2 font-semibold text-foreground text-xs">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["Chain ID", "1337", "1338"],
              ["RPC URL", "https://rpc.libertychain.org", "https://devnet-rpc.libertychain.org"],
              ["Explorer", "https://explorer.libertychain.org", "https://devnet-explorer.libertychain.org"],
              ["Currency symbol", "LIB", "LIB"],
              ["Gas price", "0", "0"],
              ["Block time", "~400ms", "~400ms"],
            ].map(([param, main, dev]) => (
              <tr key={param} className="border-t border-border">
                <td className="px-4 py-2 font-medium text-foreground">{param}</td>
                <td className="px-4 py-2 text-muted-foreground font-mono text-xs">{main}</td>
                <td className="px-4 py-2 text-muted-foreground font-mono text-xs">{dev}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SectionHeading id="installation">Installation</SectionHeading>
      <Prose>
        <p>Use your preferred Ethereum toolchain. Liberty Chain's RPC is fully compatible with all standard EVM development environments.</p>
      </Prose>

      <SubHeading id="install-hardhat">Option A — Hardhat</SubHeading>
      <CodeBlock language="bash" code={`npm install --save-dev hardhat
npx hardhat init`} />
      <p className="text-sm text-muted-foreground mb-2">Configure the Liberty network in <code className="text-primary">hardhat.config.ts</code>:</p>
      <CodeBlock language="typescript" code={`import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    liberty: {
      url: "https://rpc.libertychain.org",
      chainId: 1337,
    },
    libertyDevnet: {
      url: "https://devnet-rpc.libertychain.org",
      chainId: 1338,
    },
  },
};

export default config;`} />

      <SubHeading id="install-foundry">Option B — Foundry</SubHeading>
      <CodeBlock language="bash" code={`curl -L https://foundry.paradigm.xyz | bash
foundryup

forge init my-liberty-app
cd my-liberty-app`} />
      <CodeBlock language="bash" code={`# Deploy to Liberty Devnet (no gas fees — no --gas-price needed)
forge script script/Deploy.s.sol \\
  --rpc-url https://devnet-rpc.libertychain.org \\
  --broadcast`} />

      <SubHeading id="install-remix">Option C — Remix IDE</SubHeading>
      <Prose>
        <p>
          In Remix, open the Deploy tab, select <strong className="text-foreground">Injected Provider</strong> or{" "}
          <strong className="text-foreground">Web3 Provider</strong>, and enter{" "}
          <code className="text-primary">https://devnet-rpc.libertychain.org</code> as the custom RPC.
          Remix will automatically detect chain ID 1338.
        </p>
      </Prose>

      <Callout type="info">
        Liberty Chain is currently in <strong>Devnet</strong>. Mainnet details will be published on launch. The Devnet RPC is fully stable for development and testing.
      </Callout>

      <SectionHeading id="your-first-contract">Your First Contract</SectionHeading>
      <Prose>
        <p>Let's deploy a simple storage contract to Liberty Devnet in under 5 minutes. Because there are no gas fees, you can iterate freely without worrying about cost.</p>
      </Prose>

      <StepList steps={[
        {
          n: "1",
          title: "Write the contract",
          body: (
            <CodeBlock language="solidity" code={`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SimpleStorage {
    uint256 private value;

    event ValueChanged(address indexed by, uint256 newValue);

    function set(uint256 _value) external {
        value = _value;
        emit ValueChanged(msg.sender, _value);
    }

    function get() external view returns (uint256) {
        return value;
    }
}`} />
          ),
        },
        {
          n: "2",
          title: "Deploy with Hardhat",
          body: (
            <>
              <CodeBlock language="typescript" code={`// scripts/deploy.ts
import { ethers } from "hardhat";

async function main() {
  const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
  const contract = await SimpleStorage.deploy();
  await contract.waitForDeployment();
  console.log("Deployed to:", await contract.getAddress());
}

main().catch(console.error);`} />
              <CodeBlock language="bash" code={`npx hardhat run scripts/deploy.ts --network libertyDevnet`} />
            </>
          ),
        },
        {
          n: "3",
          title: "Interact with ethers.js",
          body: (
            <CodeBlock language="typescript" code={`import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("https://devnet-rpc.libertychain.org");
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

const abi = [
  "function set(uint256) external",
  "function get() external view returns (uint256)",
];
const contract = new ethers.Contract("0xYourDeployedAddress", abi, wallet);

// No gas fees — just call
await contract.set(42);
const val = await contract.get();
console.log("Value:", val.toString()); // 42`} />
          ),
        },
        {
          n: "4",
          title: "Add MetaMask",
          body: (
            <CodeBlock language="typescript" code={`// Add Liberty Devnet to MetaMask
await window.ethereum.request({
  method: "wallet_addEthereumChain",
  params: [{
    chainId: "0x53A",   // 1338
    chainName: "Liberty Devnet",
    nativeCurrency: { name: "Liberty", symbol: "LIB", decimals: 18 },
    rpcUrls: ["https://devnet-rpc.libertychain.org"],
    blockExplorerUrls: ["https://devnet-explorer.libertychain.org"],
  }],
});`} />
          ),
        },
      ]} />
    </>
  );
}

function SmartContractsContent() {
  return (
    <>
      <SectionHeading id="contract-basics">Contract Basics</SectionHeading>
      <Prose>
        <p>Liberty Chain supports the full Solidity feature set. Every contract that runs on Ethereum runs on Liberty without modification. The key difference: there are no gas fees, so contracts can be called freely by any user.</p>
      </Prose>

      <SubHeading id="erc20">ERC-20 Token</SubHeading>
      <CodeBlock language="bash" code={`npm install @openzeppelin/contracts`} />
      <CodeBlock language="solidity" code={`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LibertyToken is ERC20, Ownable {
    constructor(address initialOwner)
        ERC20("LibertyToken", "LBT")
        Ownable(initialOwner)
    {
        _mint(initialOwner, 1_000_000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}`} />

      <SubHeading id="erc721">ERC-721 NFT</SubHeading>
      <CodeBlock language="solidity" code={`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LibertyNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    constructor(address initialOwner)
        ERC721("LibertyNFT", "LNFT")
        Ownable(initialOwner) {}

    function mint(address to, string memory uri) external onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        return tokenId;
    }
}`} />

      <Callout type="tip">
        On Liberty Chain, NFT minting has <strong>no gas cost</strong> for the end user. Build gasless mint flows without meta-transaction relay infrastructure.
      </Callout>

      <SubHeading id="erc1155">ERC-1155 Multi-Token</SubHeading>
      <CodeBlock language="solidity" code={`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GameItems is ERC1155, Ownable {
    uint256 public constant GOLD   = 0;
    uint256 public constant SHIELD = 1;
    uint256 public constant SWORD  = 2;

    constructor(address owner) ERC1155("https://api.example.com/tokens/{id}.json") Ownable(owner) {
        _mint(owner, GOLD,   10_000, "");
        _mint(owner, SHIELD,  1_000, "");
        _mint(owner, SWORD,     500, "");
    }

    function mint(address to, uint256 id, uint256 amount) external onlyOwner {
        _mint(to, id, amount, "");
    }
}`} />

      <SectionHeading id="advanced-patterns">Advanced Patterns</SectionHeading>

      <SubHeading id="upgradeable">Upgradeable Contracts (UUPS)</SubHeading>
      <CodeBlock language="bash" code={`npm install @openzeppelin/contracts-upgradeable
npm install --save-dev @openzeppelin/hardhat-upgrades`} />
      <CodeBlock language="solidity" code={`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract MyProtocolV1 is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    uint256 public version;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    function initialize(address owner) public initializer {
        __Ownable_init(owner);
        __UUPSUpgradeable_init();
        version = 1;
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}
}`} />
      <CodeBlock language="typescript" code={`// deploy-upgradeable.ts
import { ethers, upgrades } from "hardhat";

const Protocol = await ethers.getContractFactory("MyProtocolV1");
const proxy = await upgrades.deployProxy(Protocol, [ownerAddress], { kind: "uups" });
await proxy.waitForDeployment();
console.log("Proxy at:", await proxy.getAddress());

// Later: upgrade to V2
const V2 = await ethers.getContractFactory("MyProtocolV2");
const upgraded = await upgrades.upgradeProxy(await proxy.getAddress(), V2);`} />

      <SubHeading id="multicall">Multicall3 Batching</SubHeading>
      <CodeBlock language="typescript" code={`import { ethers } from "ethers";

// Multicall3 is deployed at the same address as on Ethereum mainnet
const MULTICALL3 = "0xcA11bde05977b3631167028862bE2a173976CA11";

const calls = [
  { target: tokenA, allowFailure: false, callData: erc20.interface.encodeFunctionData("balanceOf", [user]) },
  { target: tokenB, allowFailure: false, callData: erc20.interface.encodeFunctionData("balanceOf", [user]) },
  { target: tokenA, allowFailure: false, callData: erc20.interface.encodeFunctionData("totalSupply") },
];

const mc = new ethers.Contract(MULTICALL3, multicall3Abi, provider);
const results = await mc.aggregate3(calls);
const [balA, balB, supply] = results.map((r: any) =>
  erc20.interface.decodeFunctionResult("balanceOf", r.returnData)[0]
);`} />

      <SubHeading id="events-indexing">Event Indexing</SubHeading>
      <CodeBlock language="typescript" code={`const contract = new ethers.Contract(address, abi, provider);

// Real-time listener
contract.on("Transfer", (from, to, amount) => {
  console.log(\`Transfer: \${from} → \${to}: \${ethers.formatEther(amount)} LBT\`);
});

// Historical query
const filter = contract.filters.Transfer(null, userAddress);
const logs = await contract.queryFilter(filter, 0, "latest");
console.log("Received:", logs.length, "transfers");`} />

      <SectionHeading id="security-best-practices">Security Best Practices</SectionHeading>

      {[
        {
          title: "Checks-Effects-Interactions",
          id: "cei",
          desc: "Always perform state changes before external calls to prevent reentrancy.",
          code: `// ✅ Safe — state updated BEFORE external call
function withdraw(uint256 amount) external {
    require(balances[msg.sender] >= amount, "Insufficient");
    balances[msg.sender] -= amount;        // Effect first
    (bool ok,) = msg.sender.call{value: amount}(""); // Interaction last
    require(ok, "Transfer failed");
}

// ❌ Vulnerable — state updated AFTER call
function withdrawUnsafe(uint256 amount) external {
    (bool ok,) = msg.sender.call{value: amount}("");
    require(ok);
    balances[msg.sender] -= amount;  // Too late — already drained
}`,
        },
        {
          title: "ReentrancyGuard",
          id: "reentrancy",
          desc: "Use OpenZeppelin's ReentrancyGuard on any function that moves value or calls external contracts.",
          code: `import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract SafeVault is ReentrancyGuard {
    mapping(address => uint256) public balances;

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() external nonReentrant {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "Nothing to withdraw");
        balances[msg.sender] = 0;
        (bool ok,) = msg.sender.call{value: amount}("");
        require(ok, "Transfer failed");
    }
}`,
        },
        {
          title: "Access Control",
          id: "access-control",
          desc: "Use role-based access control for admin functions rather than Ownable alone.",
          code: `import "@openzeppelin/contracts/access/AccessControl.sol";

contract Managed is AccessControl {
    bytes32 public constant MANAGER_ROLE  = keccak256("MANAGER_ROLE");
    bytes32 public constant PAUSER_ROLE   = keccak256("PAUSER_ROLE");

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    function sensitiveAction() external onlyRole(MANAGER_ROLE) {
        // Only MANAGER_ROLE addresses can call this
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        // Only PAUSER_ROLE addresses can pause
    }
}`,
        },
        {
          title: "Input Validation",
          id: "input-validation",
          desc: "Validate all inputs using require() with descriptive messages. Use custom errors for gas efficiency.",
          code: `// Custom errors (more gas-efficient than string messages)
error ZeroAddress();
error AmountTooLow(uint256 minimum, uint256 provided);
error DeadlineExpired(uint256 deadline, uint256 current);

contract ValidatedContract {
    function transfer(address to, uint256 amount, uint256 deadline) external {
        if (to == address(0)) revert ZeroAddress();
        if (amount < 100) revert AmountTooLow(100, amount);
        if (block.timestamp > deadline) revert DeadlineExpired(deadline, block.timestamp);
        // proceed...
    }
}`,
        },
      ].map((item) => (
        <div key={item.id}>
          <SubHeading id={item.id}>{item.title}</SubHeading>
          <p className="text-sm text-muted-foreground mb-2">{item.desc}</p>
          <CodeBlock language="solidity" code={item.code} />
        </div>
      ))}

      <Callout type="warning">
        Always audit your contracts before deploying to Mainnet. Liberty Chain's no-fee model means contracts can be called at extremely high volume — ensure your logic handles this correctly.
      </Callout>
    </>
  );
}

function TutorialsContent() {
  return (
    <>
      <SectionHeading id="build-a-dex">Build a DEX</SectionHeading>
      <Prose>
        <p>
          This tutorial walks through building a minimal automated market maker (AMM) on Liberty Chain. Because there are no gas fees, users can swap freely — making Liberty ideal for high-frequency DeFi applications.
        </p>
      </Prose>

      <SubHeading id="dex-pool">1. Liquidity Pool Contract</SubHeading>
      <CodeBlock language="solidity" code={`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title SimpleDEX — constant-product AMM (x * y = k)
contract SimpleDEX is ERC20 {
    IERC20 public immutable tokenA;
    IERC20 public immutable tokenB;

    constructor(address _tokenA, address _tokenB)
        ERC20("LP Token", "LP") {
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
    }

    function addLiquidity(uint256 amtA, uint256 amtB) external returns (uint256 shares) {
        tokenA.transferFrom(msg.sender, address(this), amtA);
        tokenB.transferFrom(msg.sender, address(this), amtB);
        uint256 totalSupply_ = totalSupply();
        if (totalSupply_ == 0) {
            shares = _sqrt(amtA * amtB);
        } else {
            shares = _min(
                (amtA * totalSupply_) / tokenA.balanceOf(address(this)),
                (amtB * totalSupply_) / tokenB.balanceOf(address(this))
            );
        }
        require(shares > 0, "Shares = 0");
        _mint(msg.sender, shares);
    }

    function swap(address tokenIn, uint256 amountIn) external returns (uint256 amountOut) {
        require(tokenIn == address(tokenA) || tokenIn == address(tokenB), "Invalid token");
        bool isA = tokenIn == address(tokenA);
        (IERC20 tIn, IERC20 tOut) = isA ? (tokenA, tokenB) : (tokenB, tokenA);
        tIn.transferFrom(msg.sender, address(this), amountIn);
        uint256 rIn  = tIn.balanceOf(address(this)) - amountIn;
        uint256 rOut = tOut.balanceOf(address(this));
        // x * y = k, no fee (no gas fees on Liberty means we can skip protocol fees)
        amountOut = (amountIn * rOut) / (rIn + amountIn);
        tOut.transfer(msg.sender, amountOut);
    }

    function _sqrt(uint256 y) private pure returns (uint256 z) {
        if (y > 3) { z = y; uint256 x = y / 2 + 1; while (x < z) { z = x; x = (y / x + x) / 2; } }
        else if (y != 0) z = 1;
    }
    function _min(uint256 a, uint256 b) private pure returns (uint256) { return a < b ? a : b; }
}`} />

      <SubHeading id="dex-frontend">2. Frontend Integration</SubHeading>
      <CodeBlock language="typescript" code={`import { ethers } from "ethers";

const dex = new ethers.Contract(DEX_ADDRESS, DEX_ABI, wallet);
const tokenA = new ethers.Contract(TOKEN_A, ERC20_ABI, wallet);

// Approve DEX to spend tokens — zero gas fee
await tokenA.approve(DEX_ADDRESS, ethers.parseEther("1000"));

// Execute swap — instant, zero fee for the user
const tx = await dex.swap(TOKEN_A_ADDRESS, ethers.parseEther("100"));
await tx.wait();
console.log("Swapped 100 TokenA for TokenB");`} />

      <SectionHeading id="nft-marketplace">NFT Marketplace</SectionHeading>
      <Prose>
        <p>Build a marketplace where users can list, buy, and sell NFTs — with zero platform fees on transactions because Liberty Chain covers the network cost.</p>
      </Prose>

      <SubHeading id="marketplace-contract">Marketplace Contract</SubHeading>
      <CodeBlock language="solidity" code={`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract LibertyMarketplace is ReentrancyGuard {
    struct Listing {
        address seller;
        uint256 price;   // in wei
    }

    mapping(address => mapping(uint256 => Listing)) public listings;

    event Listed(address indexed nft, uint256 indexed tokenId, address seller, uint256 price);
    event Sold(address indexed nft, uint256 indexed tokenId, address buyer, uint256 price);

    function list(address nft, uint256 tokenId, uint256 price) external {
        IERC721(nft).transferFrom(msg.sender, address(this), tokenId);
        listings[nft][tokenId] = Listing(msg.sender, price);
        emit Listed(nft, tokenId, msg.sender, price);
    }

    function buy(address nft, uint256 tokenId) external payable nonReentrant {
        Listing memory l = listings[nft][tokenId];
        require(l.price > 0, "Not listed");
        require(msg.value >= l.price, "Insufficient payment");
        delete listings[nft][tokenId];
        IERC721(nft).transferFrom(address(this), msg.sender, tokenId);
        (bool ok,) = l.seller.call{value: l.price}("");
        require(ok, "Payment failed");
        emit Sold(nft, tokenId, msg.sender, l.price);
    }

    function cancel(address nft, uint256 tokenId) external {
        Listing memory l = listings[nft][tokenId];
        require(l.seller == msg.sender, "Not seller");
        delete listings[nft][tokenId];
        IERC721(nft).transferFrom(address(this), msg.sender, tokenId);
    }
}`} />

      <SectionHeading id="dao-governance">DAO Governance</SectionHeading>
      <Prose>
        <p>
          Deploy a fully on-chain DAO using OpenZeppelin Governor. On Liberty Chain, governance
          participation is free — no gas barrier means broader community engagement.
        </p>
      </Prose>

      <SubHeading id="governor-contract">Governor Contract</SubHeading>
      <CodeBlock language="bash" code={`npm install @openzeppelin/contracts`} />
      <CodeBlock language="solidity" code={`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";

contract LibertyDAO is
    Governor,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    GovernorTimelockControl
{
    constructor(IVotes _token, TimelockController _timelock)
        Governor("LibertyDAO")
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4)          // 4% quorum
        GovernorTimelockControl(_timelock) {}

    function votingDelay()    public pure override returns (uint256) { return 1;    } // 1 block
    function votingPeriod()   public pure override returns (uint256) { return 50400; } // ~1 week
    function proposalThreshold() public pure override returns (uint256) { return 0; } // No threshold

    // Required overrides
    function quorum(uint256 blockNumber) public view override(Governor, GovernorVotesQuorumFraction) returns (uint256) { return super.quorum(blockNumber); }
    function state(uint256 id) public view override(Governor, GovernorTimelockControl) returns (ProposalState) { return super.state(id); }
    function _queueOperations(uint256 id, address[] memory t, uint256[] memory v, bytes[] memory c, bytes32 d) internal override(Governor, GovernorTimelockControl) returns (uint48) { return super._queueOperations(id, t, v, c, d); }
    function _executeOperations(uint256 id, address[] memory t, uint256[] memory v, bytes[] memory c, bytes32 d) internal override(Governor, GovernorTimelockControl) { super._executeOperations(id, t, v, c, d); }
    function _cancel(address[] memory t, uint256[] memory v, bytes[] memory c, bytes32 d) internal override(Governor, GovernorTimelockControl) returns (uint256) { return super._cancel(t, v, c, d); }
    function _executor() internal view override(Governor, GovernorTimelockControl) returns (address) { return super._executor(); }
    function supportsInterface(bytes4 id) public view override(Governor, GovernorTimelockControl) returns (bool) { return super.supportsInterface(id); }
}`} />

      <Callout type="tip">
        With zero gas fees on Liberty Chain, your DAO members can vote on proposals without needing
        to hold LIB tokens. This dramatically increases governance participation.
      </Callout>
    </>
  );
}

function CLIContent() {
  return (
    <>
      <SectionHeading id="cli-installation">Installation</SectionHeading>
      <Prose>
        <p>The Liberty CLI (<code className="text-primary">liberty</code>) provides tools for compiling, deploying, and interacting with contracts from your terminal.</p>
      </Prose>

      <SubHeading id="cli-npm">Via npm (recommended)</SubHeading>
      <CodeBlock language="bash" code={`npm install -g @libertychain/cli

# Verify
liberty --version
# → liberty-cli v1.4.2`} />

      <SubHeading id="cli-curl">Via curl (Linux / macOS)</SubHeading>
      <CodeBlock language="bash" code={`curl -sSL https://install.libertychain.org | bash
source ~/.bashrc   # or ~/.zshrc`} />

      <Callout type="info">Requires Node.js ≥ 18. Install via <code className="text-primary">nvm install --lts</code>.</Callout>

      <SectionHeading id="commands-reference">Commands Reference</SectionHeading>

      {[
        { cmd: "liberty init", flag: "", desc: "Scaffold a new project.", example: "liberty init my-project --template hardhat-ts" },
        { cmd: "liberty compile", flag: "", desc: "Compile all Solidity contracts.", example: "liberty compile" },
        { cmd: "liberty deploy", flag: "--network", desc: "Deploy a compiled contract.", example: "liberty deploy --network libertyDevnet --contract SimpleStorage" },
        { cmd: "liberty call", flag: "--fn", desc: "Call a read-only function.", example: `liberty call --address 0xABC --fn "get()"` },
        { cmd: "liberty send", flag: "--fn", desc: "Send a write transaction (no gas price needed).", example: `liberty send --address 0xABC --fn "set(uint256)" --args 42` },
        { cmd: "liberty accounts", flag: "", desc: "List configured wallet accounts.", example: "liberty accounts --show-balance" },
        { cmd: "liberty node", flag: "--port", desc: "Start a local Liberty node.", example: "liberty node --port 8545" },
        { cmd: "liberty verify", flag: "--network", desc: "Verify source on the block explorer.", example: "liberty verify --address 0xABC --network liberty" },
        { cmd: "liberty logs", flag: "--address", desc: "Stream live contract events.", example: `liberty logs --address 0xABC --event "Transfer(address,address,uint256)"` },
        { cmd: "liberty abi", flag: "", desc: "Print the ABI of a compiled contract.", example: "liberty abi --contract SimpleStorage" },
      ].map((item) => (
        <div key={item.cmd} className="border border-border rounded-xl p-5 my-3">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <code className="text-primary font-mono font-bold text-sm">{item.cmd}</code>
            {item.flag && <Badge variant="secondary" className="text-xs font-mono">{item.flag}</Badge>}
          </div>
          <p className="text-sm text-muted-foreground mb-3">{item.desc}</p>
          <CodeBlock language="bash" code={item.example} />
        </div>
      ))}

      <SectionHeading id="configuration">Configuration</SectionHeading>
      <Prose>
        <p>The CLI reads from <code className="text-primary">liberty.config.json</code> in your project root. Values can be overridden with environment variables.</p>
      </Prose>

      <SubHeading id="config-file">liberty.config.json</SubHeading>
      <CodeBlock language="json" code={`{
  "defaultNetwork": "libertyDevnet",
  "networks": {
    "libertyDevnet": {
      "rpc": "https://devnet-rpc.libertychain.org",
      "chainId": 1338,
      "explorer": "https://devnet-explorer.libertychain.org"
    },
    "liberty": {
      "rpc": "https://rpc.libertychain.org",
      "chainId": 1337,
      "explorer": "https://explorer.libertychain.org"
    }
  },
  "accounts": [
    { "name": "deployer", "privateKey": "\${DEPLOYER_PRIVATE_KEY}" }
  ],
  "compiler": {
    "version": "0.8.24",
    "optimizer": { "enabled": true, "runs": 200 }
  },
  "verify": {
    "apiKey": "\${EXPLORER_API_KEY}"
  }
}`} />

      <SubHeading id="env-vars">Environment Variables</SubHeading>
      <CodeBlock language="bash" code={`# .env
DEPLOYER_PRIVATE_KEY=0xabc123...
LIBERTY_RPC_URL=https://rpc.libertychain.org
LIBERTY_CHAIN_ID=1337
EXPLORER_API_KEY=your-api-key`} />

      <Callout type="tip">Never commit private keys to source control. Add <code>.env</code> to <code>.gitignore</code>.</Callout>
    </>
  );
}

function APIContent() {
  return (
    <>
      <SectionHeading id="json-rpc">JSON-RPC API</SectionHeading>
      <Prose>
        <p>Liberty Chain exposes a standard Ethereum JSON-RPC API. Any tool or library using <code className="text-primary">eth_*</code> methods works with Liberty Chain out of the box.</p>
        <p>
          <strong className="text-foreground">RPC:</strong> <code className="text-primary">https://rpc.libertychain.org</code><br />
          <strong className="text-foreground">Devnet RPC:</strong> <code className="text-primary">https://devnet-rpc.libertychain.org</code>
        </p>
      </Prose>

      {[
        {
          method: "eth_chainId",
          desc: "Returns the chain ID.",
          req: `{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}`,
          res: `{"jsonrpc":"2.0","id":1,"result":"0x539"}  // 1337`,
        },
        {
          method: "eth_blockNumber",
          desc: "Returns the current block number.",
          req: `{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}`,
          res: `{"jsonrpc":"2.0","id":1,"result":"0x1a4f2c"}`,
        },
        {
          method: "eth_getBalance",
          desc: "Returns the balance of an account in wei.",
          req: `{"jsonrpc":"2.0","method":"eth_getBalance","params":["0xAddress","latest"],"id":1}`,
          res: `{"jsonrpc":"2.0","id":1,"result":"0xde0b6b3a7640000"}`,
        },
        {
          method: "eth_sendRawTransaction",
          desc: "Submits a pre-signed transaction. Set gasPrice to 0 — no fees on Liberty.",
          req: `{"jsonrpc":"2.0","method":"eth_sendRawTransaction","params":["0xSignedHex"],"id":1}`,
          res: `{"jsonrpc":"2.0","id":1,"result":"0xTxHash"}`,
        },
        {
          method: "eth_call",
          desc: "Executes a read-only call without creating a transaction.",
          req: `{"jsonrpc":"2.0","method":"eth_call","params":[{"to":"0xContract","data":"0xCallData"},"latest"],"id":1}`,
          res: `{"jsonrpc":"2.0","id":1,"result":"0xReturnData"}`,
        },
        {
          method: "eth_getLogs",
          desc: "Returns event logs matching a filter.",
          req: `{"jsonrpc":"2.0","method":"eth_getLogs","params":[{
  "fromBlock":"0x0",
  "toBlock":"latest",
  "address":"0xContract",
  "topics":["0xEventSignatureHash"]
}],"id":1}`,
          res: `{"jsonrpc":"2.0","id":1,"result":[{"blockNumber":"0x1a4f2c","txHash":"0x..."}]}`,
        },
        {
          method: "eth_getTransactionReceipt",
          desc: "Returns the receipt for a mined transaction.",
          req: `{"jsonrpc":"2.0","method":"eth_getTransactionReceipt","params":["0xTxHash"],"id":1}`,
          res: `{"jsonrpc":"2.0","id":1,"result":{"status":"0x1","blockNumber":"0x1a4f2d","gasUsed":"0x0"}}`,
        },
      ].map((item) => (
        <div key={item.method} className="border border-border rounded-xl p-5 my-4">
          <Badge variant="secondary" className="font-mono text-xs mb-3">{item.method}</Badge>
          <p className="text-sm text-muted-foreground mb-3">{item.desc}</p>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Request</p>
          <CodeBlock language="json" code={item.req} />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Response</p>
          <CodeBlock language="json" code={item.res} />
        </div>
      ))}

      <Callout type="tip">
        Set <code className="text-primary">gasPrice: "0x0"</code> in all transactions. Users never need native tokens to interact with your dApp.
      </Callout>

      <SectionHeading id="web3-integration">Web3 Integration</SectionHeading>

      <SubHeading id="ethersjs">ethers.js v6</SubHeading>
      <CodeBlock language="bash" code={`npm install ethers`} />
      <CodeBlock language="typescript" code={`import { ethers } from "ethers";

// Provider
const provider = new ethers.JsonRpcProvider("https://rpc.libertychain.org");

// Wallet
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

// Send a zero-fee transaction
const tx = await wallet.sendTransaction({ to: "0xRecipient", value: 0n });
await tx.wait();

// Read contract
const contract = new ethers.Contract(address, abi, provider);
const result = await contract.get();`} />

      <SubHeading id="wagmi">wagmi + viem</SubHeading>
      <CodeBlock language="bash" code={`npm install wagmi viem @tanstack/react-query`} />
      <CodeBlock language="typescript" code={`import { defineChain } from "viem";
import { createConfig, http } from "wagmi";

export const libertyChain = defineChain({
  id: 1337,
  name: "Liberty Chain",
  nativeCurrency: { name: "Liberty", symbol: "LIB", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.libertychain.org"] } },
  blockExplorers: { default: { name: "Liberty Explorer", url: "https://explorer.libertychain.org" } },
});

export const config = createConfig({
  chains: [libertyChain],
  transports: { [libertyChain.id]: http() },
});`} />
      <CodeBlock language="typescript" code={`// React hook usage
import { useReadContract, useWriteContract } from "wagmi";

function Counter() {
  const { data: count } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: "get",
  });

  const { writeContract } = useWriteContract();

  return (
    <div>
      <p>Count: {count?.toString()}</p>
      {/* No gas fee — user just signs */}
      <button onClick={() => writeContract({ address: CONTRACT_ADDRESS, abi, functionName: "set", args: [42n] })}>
        Set to 42
      </button>
    </div>
  );
}`} />

      <SectionHeading id="graphql-api">GraphQL API</SectionHeading>
      <Prose>
        <p>Liberty Chain provides a GraphQL endpoint for flexible on-chain data queries.</p>
        <p><strong className="text-foreground">Endpoint:</strong> <code className="text-primary">https://graph.libertychain.org/graphql</code></p>
      </Prose>

      <CodeBlock language="bash" code={`npm install graphql-request graphql`} />

      {[
        {
          label: "Latest Block",
          code: `query LatestBlock {
  block(number: null) {
    number
    hash
    timestamp
    transactionCount
  }
}`,
        },
        {
          label: "Account Transactions",
          code: `query AccountTxns($address: String!) {
  transactions(
    where: { or: [{ from: $address }, { to: $address }] }
    orderBy: blockNumber
    orderDirection: desc
    first: 20
  ) {
    hash
    from
    to
    value
    blockNumber
    status
  }
}`,
        },
        {
          label: "ERC-20 Transfer Events",
          code: `query Transfers($contract: String!, $from: Int!) {
  transferEvents(
    where: { contractAddress: $contract, blockNumber_gte: $from }
    orderBy: blockNumber
  ) {
    transactionHash
    from
    to
    amount
    blockNumber
  }
}`,
        },
      ].map((q) => (
        <div key={q.label}>
          <SubHeading id={q.label.toLowerCase().replace(/\s/g, "-")}>{q.label}</SubHeading>
          <CodeBlock language="graphql" code={q.code} />
        </div>
      ))}
    </>
  );
}

function SDKContent() {
  return (
    <>
      <SectionHeading id="liberty-sdk-js">liberty.js SDK</SectionHeading>
      <Prose>
        <p>The official Liberty Chain JavaScript SDK wraps ethers.js with Liberty-specific defaults — zero-gas transactions, instant finality helpers, and typed contract factories.</p>
      </Prose>

      <SubHeading id="sdk-install">Installation</SubHeading>
      <CodeBlock language="bash" code={`npm install @libertychain/sdk`} />

      <SubHeading id="sdk-usage">Basic Usage</SubHeading>
      <CodeBlock language="typescript" code={`import { Liberty, LibertyWallet } from "@libertychain/sdk";

// Connect to Liberty Chain
const liberty = new Liberty({ network: "devnet" });

// Create a wallet
const wallet = LibertyWallet.fromPrivateKey(process.env.PRIVATE_KEY!, liberty);
console.log("Address:", wallet.address);

// Deploy a contract — no gas config needed
const contract = await liberty.deploy({
  abi,
  bytecode,
  signer: wallet,
  args: [constructorArg],
});
console.log("Deployed at:", contract.address);

// Call a function — zero fee
const result = await contract.call("get");
console.log("Result:", result);

// Send a transaction — instant finality
const tx = await contract.send("set", [42]);
await tx.waitForFinality(); // resolves in milliseconds
console.log("Finalised:", tx.hash);`} />

      <SubHeading id="sdk-events">Event Streaming</SubHeading>
      <CodeBlock language="typescript" code={`const stream = liberty.events.subscribe({
  address: CONTRACT_ADDRESS,
  abi,
  eventName: "Transfer",
});

stream.on("data", (event) => {
  console.log("Transfer:", event.from, "→", event.to, event.amount.toString());
});

stream.on("error", console.error);

// Stop streaming
stream.unsubscribe();`} />

      <SectionHeading id="react-hooks">React Hooks</SectionHeading>
      <Prose>
        <p>
          The <code className="text-primary">@libertychain/react</code> package provides hooks built on wagmi, pre-configured for Liberty Chain.
        </p>
      </Prose>

      <CodeBlock language="bash" code={`npm install @libertychain/react wagmi viem @tanstack/react-query`} />
      <CodeBlock language="typescript" code={`// App.tsx
import { LibertyProvider } from "@libertychain/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LibertyProvider network="devnet">
        <YourApp />
      </LibertyProvider>
    </QueryClientProvider>
  );
}`} />
      <CodeBlock language="typescript" code={`// Component.tsx
import {
  useLibertyRead,
  useLibertyWrite,
  useLibertyAccount,
} from "@libertychain/react";

export function Counter({ contractAddress, abi }) {
  const { address, isConnected } = useLibertyAccount();

  const { data: count } = useLibertyRead({
    address: contractAddress,
    abi,
    functionName: "get",
    watch: true, // auto-refresh on new blocks
  });

  const { write, isPending } = useLibertyWrite({
    address: contractAddress,
    abi,
    functionName: "set",
  });

  return (
    <div>
      <p>Connected: {address}</p>
      <p>Current count: {count?.toString() ?? "..."}</p>
      <button onClick={() => write({ args: [42n] }) } disabled={isPending}>
        {isPending ? "Sending..." : "Set to 42 (free)"}
      </button>
    </div>
  );
}`} />

      <SectionHeading id="python-sdk">Python SDK</SectionHeading>
      <Prose>
        <p>The Python SDK wraps web3.py with Liberty Chain defaults for backend scripts, bots, and data pipelines.</p>
      </Prose>

      <CodeBlock language="bash" code={`pip install libertychain-py`} />
      <CodeBlock language="python" code={`from libertychain import Liberty, LibertyWallet
from libertychain.contract import Contract

# Connect
lc = Liberty(network="devnet")

# Wallet from private key
wallet = LibertyWallet.from_private_key(lc, "0xabc123...")
print("Address:", wallet.address)

# Load a deployed contract
contract = Contract(
    address="0xYourContract",
    abi=open("abi.json").read(),
    liberty=lc,
    signer=wallet,
)

# Read (free)
value = contract.functions.get().call()
print("Value:", value)

# Write (no gas config needed)
tx = contract.functions.set(42).transact()
receipt = lc.w3.eth.wait_for_transaction_receipt(tx)
print("Status:", receipt["status"])  # 1 = success`} />

      <CodeBlock language="python" code={`# Batch queries with multicall
from libertychain.multicall import multicall

results = multicall(lc, [
    (token_address, erc20_abi, "balanceOf", [user_a]),
    (token_address, erc20_abi, "balanceOf", [user_b]),
    (token_address, erc20_abi, "totalSupply", []),
])
balance_a, balance_b, supply = results
print(f"User A: {balance_a}, User B: {balance_b}, Supply: {supply}")`} />
    </>
  );
}

/* ─────────────────────────────────────────────
   "Was this helpful?" widget
───────────────────────────────────────────── */

function HelpfulWidget({ sectionId }: { sectionId: string }) {
  const [voted, setVoted] = useState<"yes" | "no" | null>(null);
  return (
    <div className="border border-border rounded-xl p-5 my-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold">Was this page helpful?</p>
        <p className="text-xs text-muted-foreground">Your feedback helps us improve the docs.</p>
      </div>
      {voted ? (
        <p className="text-sm text-primary font-medium">Thanks for your feedback!</p>
      ) : (
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setVoted("yes")}
            className="gap-2 flex-1 sm:flex-none min-h-[44px] sm:min-h-0"
            data-testid={`button-helpful-yes-${sectionId}`}
          >
            <ThumbsUp className="w-4 h-4" />
            Yes
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setVoted("no")}
            className="gap-2 flex-1 sm:flex-none min-h-[44px] sm:min-h-0"
            data-testid={`button-helpful-no-${sectionId}`}
          >
            <ThumbsDown className="w-4 h-4" />
            No
          </Button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Content map
───────────────────────────────────────────── */

const contentMap: Record<string, React.ReactNode> = {
  "getting-started": <GettingStartedContent />,
  "smart-contracts": <SmartContractsContent />,
  "tutorials": <TutorialsContent />,
  "cli-tools": <CLIContent />,
  "api-reference": <APIContent />,
  "sdk-libraries": <SDKContent />,
};

/* ─────────────────────────────────────────────
   Page component
───────────────────────────────────────────── */

export default function Documentation() {
  const [activeSection, setActiveSection] = useState("getting-started");
  const [activeItem, setActiveItem]       = useState("introduction");
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [search, setSearch]               = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [readingProgress, setReadingProgress]   = useState(0);
  const [scrollY, setScrollY]                   = useState(0);
  const mainRef     = useRef<HTMLDivElement>(null);
  const chipsRef    = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  /* Filtered sidebar sections */
  const filteredSections = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return sections;
    return sections
      .map((s) => ({
        ...s,
        items: s.items.filter(
          (i) =>
            i.label.toLowerCase().includes(q) ||
            s.title.toLowerCase().includes(q) ||
            s.description.toLowerCase().includes(q)
        ),
      }))
      .filter((s) => s.items.length > 0 || s.title.toLowerCase().includes(q));
  }, [search]);

  /* Scroll spy + progress */
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const allIds = sections.flatMap((s) => [s.id, ...s.items.map((i) => i.id)]);
    function onScroll() {
      const { scrollTop, scrollHeight, clientHeight } = el;
      setScrollY(scrollTop);
      const pct = scrollHeight > clientHeight
        ? Math.round((scrollTop / (scrollHeight - clientHeight)) * 100)
        : 0;
      setReadingProgress(pct);

      let current = allIds[0];
      for (const id of allIds) {
        const node = document.getElementById(id);
        if (node && node.getBoundingClientRect().top < 160) current = id;
      }
      setActiveItem(current);
      const parent = sections.find(
        (s) => s.id === current || s.items.some((i) => i.id === current)
      );
      if (parent) setActiveSection(parent.id);
    }
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  /* Scroll active chip into view */
  useEffect(() => {
    if (!chipsRef.current) return;
    const active = chipsRef.current.querySelector(`[data-chip="${activeSection}"]`) as HTMLElement;
    if (active) {
      active.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeSection]);

  /* Focus mobile search when opened */
  useEffect(() => {
    if (mobileSearchOpen) {
      setTimeout(() => mobileSearchRef.current?.focus(), 50);
    }
  }, [mobileSearchOpen]);

  function scrollToId(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function scrollToTop() {
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* Prev / Next */
  const currentIndex = sections.findIndex((s) => s.id === activeSection);
  const prevSection  = sections[currentIndex - 1] ?? null;
  const nextSection  = sections[currentIndex + 1] ?? null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <div className="flex pt-16">
        {/* ── Mobile sidebar overlay ── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <aside
          className={`
            fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-[min(18rem,85vw)] bg-background border-r border-border flex flex-col
            transition-transform duration-250 ease-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0 lg:w-72 lg:sticky lg:top-16 lg:self-start lg:max-h-[calc(100vh-4rem)]
          `}
          data-testid="doc-sidebar"
        >
          {/* Sidebar top: search + close (mobile) */}
          <div className="p-4 border-b border-border flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search docs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-sm h-9"
                data-testid="input-doc-search"
              />
            </div>
            {/* Close button — mobile only */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
              data-testid="button-sidebar-close"
              aria-label="Close navigation"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Nav list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* External link */}
            <a
              href="https://docs.libertychain.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors font-medium border border-border rounded-lg px-3 py-2.5"
              data-testid="link-external-docs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              docs.libertychain.org
            </a>

            {search && filteredSections.length === 0 && (
              <p className="text-xs text-muted-foreground px-1">No results for "{search}"</p>
            )}

            {filteredSections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <div key={section.id}>
                  <button
                    onClick={() => {
                      setActiveSection(section.id);
                      scrollToId(section.id);
                      setSidebarOpen(false);
                      setSearch("");
                    }}
                    className={`flex items-center gap-2 w-full text-left text-sm font-bold mb-1 transition-colors py-1 ${
                      isActive ? "text-primary" : "text-foreground hover:text-primary"
                    }`}
                    data-testid={`nav-section-${section.id}`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {section.title}
                  </button>
                  <ul className="space-y-0 pl-6 border-l border-border ml-2">
                    {section.items.map((item) => {
                      const isItemActive = activeItem === item.id;
                      return (
                        <li key={item.id}>
                          <button
                            onClick={() => {
                              setActiveSection(section.id);
                              setActiveItem(item.id);
                              scrollToId(item.id);
                              setSidebarOpen(false);
                              setSearch("");
                            }}
                            className={`block w-full text-left text-sm py-2 pl-2 transition-colors border-l-2 -ml-px ${
                              isItemActive
                                ? "text-primary font-medium border-primary"
                                : "text-muted-foreground hover:text-foreground border-transparent"
                            }`}
                            data-testid={`nav-item-${item.id}`}
                          >
                            {item.label}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Sidebar footer */}
          <div className="p-4 border-t border-border">
            <Badge variant="secondary" className="text-xs w-full justify-center">
              Devnet v1.4 · EVM-compatible
            </Badge>
          </div>
        </aside>

        {/* ── Main ── */}
        <main ref={mainRef} className="flex-1 min-w-0 h-[calc(100vh-4rem)] overflow-y-auto" data-testid="doc-main">

          {/* ── Mobile sticky header ── */}
          <div className="sticky top-0 z-20 lg:hidden">
            {/* Reading progress bar */}
            <div className="h-0.5 bg-border w-full" data-testid="reading-progress-bar">
              <div
                className="h-full bg-primary transition-all duration-150"
                style={{ width: `${readingProgress}%` }}
              />
            </div>

            {/* Header row */}
            <div className="bg-background/95 backdrop-blur border-b border-border px-3 py-2.5 flex items-center gap-2">
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                data-testid="button-sidebar-toggle"
                aria-label="Open navigation"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Breadcrumb */}
              <div className="flex-1 min-w-0">
                {mobileSearchOpen ? (
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      ref={mobileSearchRef}
                      type="search"
                      placeholder="Search docs…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-border bg-muted/50 focus:outline-none focus:ring-1 focus:ring-primary"
                      data-testid="input-doc-search-mobile"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs text-muted-foreground truncate">
                      {sections.find((s) => s.id === activeSection)?.title}
                    </span>
                    {activeItem !== activeSection && (
                      <>
                        <ChevronRight className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />
                        <span className="text-xs font-semibold text-foreground truncate">
                          {sections
                            .flatMap((s) => s.items)
                            .find((i) => i.id === activeItem)?.label ?? ""}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Search toggle */}
              <button
                onClick={() => {
                  setMobileSearchOpen((v) => !v);
                  if (mobileSearchOpen) setSearch("");
                }}
                className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                aria-label={mobileSearchOpen ? "Close search" : "Open search"}
                data-testid="button-mobile-search-toggle"
              >
                {mobileSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
              </button>
            </div>

            {/* Section quick-chips */}
            <div
              ref={chipsRef}
              className="flex gap-2 px-3 py-2 overflow-x-auto bg-background border-b border-border scrollbar-none"
              style={{ scrollbarWidth: "none" }}
            >
              {sections.map((s) => {
                const Icon = s.icon;
                const isActive = activeSection === s.id;
                return (
                  <button
                    key={s.id}
                    data-chip={s.id}
                    onClick={() => { scrollToId(s.id); setActiveSection(s.id); }}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                    }`}
                    data-testid={`chip-section-${s.id}`}
                  >
                    <Icon className="w-3 h-3" />
                    {s.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Page content ── */}
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-12">

            {/* Hero */}
            <div className="mb-10 sm:mb-12 pb-8 border-b border-border">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 mb-4">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Documentation</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3 sm:mb-4" data-testid="heading-documentation">
                Developer Docs
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground mb-4">
                Build on Liberty Chain — EVM-compatible, 10,000+ TPS, instant finality,{" "}
                <strong className="text-foreground">zero gas fees</strong>.
              </p>
              <a
                href="https://docs.libertychain.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                Full external reference at docs.libertychain.org
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Overview cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-12 sm:mb-16" data-testid="doc-overview">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => { scrollToId(section.id); setActiveSection(section.id); }}
                    className="text-left border border-border rounded-xl p-4 sm:p-5 hover-elevate active-elevate-2 transition-all group flex sm:block items-start gap-4"
                    data-testid={`card-section-${section.id}`}
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center sm:mb-3">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold mb-1 group-hover:text-primary transition-colors text-sm">{section.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed sm:mb-3 line-clamp-2 sm:line-clamp-none">{section.description}</p>
                      <div className="hidden sm:block space-y-1 mt-2">
                        {section.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <ChevronRight className="w-3 h-3 text-primary/50" />
                            {item.label}
                          </div>
                        ))}
                      </div>
                      {/* Mobile: show items inline */}
                      <div className="sm:hidden flex flex-wrap gap-1.5 mt-2">
                        {section.items.map((item) => (
                          <span key={item.id} className="text-[10px] bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                            {item.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div>
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <div key={section.id} id={section.id} className="scroll-mt-32 lg:scroll-mt-8">
                    <div className="flex items-center gap-3 mt-4 mb-2 pb-3 border-b border-border">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <h2 className="text-xl font-black tracking-tight">{section.title}</h2>
                    </div>
                    {contentMap[section.id]}
                    <HelpfulWidget sectionId={section.id} />
                    <div className="mt-8 mb-16" />
                  </div>
                );
              })}
            </div>

            {/* Prev / Next — full-width on mobile */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-4 pt-8 border-t border-border">
              {prevSection ? (
                <button
                  onClick={() => { setActiveSection(prevSection.id); scrollToId(prevSection.id); }}
                  className="flex items-center gap-3 p-4 sm:p-0 rounded-xl sm:rounded-none border sm:border-0 border-border text-left sm:text-left group hover:border-primary/40 transition-colors"
                  data-testid="button-prev-section"
                >
                  <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Previous</div>
                    <div className="text-sm font-semibold group-hover:text-primary transition-colors">{prevSection.title}</div>
                  </div>
                </button>
              ) : <div />}
              {nextSection ? (
                <button
                  onClick={() => { setActiveSection(nextSection.id); scrollToId(nextSection.id); }}
                  className="flex items-center justify-between gap-3 p-4 sm:p-0 rounded-xl sm:rounded-none border sm:border-0 border-border text-right group hover:border-primary/40 transition-colors"
                  data-testid="button-next-section"
                >
                  <div className="flex-1 text-right">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Next</div>
                    <div className="text-sm font-semibold group-hover:text-primary transition-colors">{nextSection.title}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                </button>
              ) : <div />}
            </div>

            {/* Community card */}
            <div className="mt-12 border border-border rounded-2xl p-6 sm:p-8 bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <span className="font-bold">Need help?</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Join the Liberty Chain developer community for support, feedback, and discussions.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3 flex-shrink-0">
                <Link href="/community">
                  <Button className="gap-2 w-full sm:w-auto" data-testid="button-join-discord">
                    Join Discord
                  </Button>
                </Link>
                <a href="https://docs.libertychain.org/" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                  <Button variant="outline" className="gap-2 w-full" data-testid="button-external-docs-footer">
                    <ExternalLink className="w-3.5 h-3.5" />
                    Full Docs
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── Floating back-to-top (mobile only, appears after scrolling) ── */}
      {scrollY > 400 && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-4 z-50 lg:hidden w-11 h-11 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center transition-all"
          aria-label="Back to top"
          data-testid="button-back-to-top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
