import { useState, useEffect, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Code2,
  Terminal,
  FileText,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  Menu,
  X,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Content model
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
];

/* ─────────────────────────────────────────────
   Code block component
───────────────────────────────────────────── */

function CodeBlock({ code, language = "bash" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative group rounded-xl overflow-hidden border border-border bg-[#0d1117] my-4">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-border">
        <span className="text-xs text-muted-foreground font-mono">{language}</span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono leading-relaxed text-[#e6edf3]">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Info / Warning callout
───────────────────────────────────────────── */

function Callout({
  type = "info",
  children,
}: {
  type?: "info" | "tip" | "warning";
  children: React.ReactNode;
}) {
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

/* ─────────────────────────────────────────────
   Section heading
───────────────────────────────────────────── */

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

/* ─────────────────────────────────────────────
   Content sections
───────────────────────────────────────────── */

function GettingStartedContent() {
  return (
    <>
      <SectionHeading id="introduction">Introduction</SectionHeading>
      <Prose>
        <p>
          Liberty Chain is a next-generation, EVM-compatible Layer 1 blockchain designed for
          freedom, performance, and true decentralisation. It delivers{" "}
          <strong className="text-foreground">10,000+ TPS</strong>, instant finality, and{" "}
          <strong className="text-foreground">zero gas fees</strong> — so you can build without
          limits.
        </p>
        <p>
          Because Liberty Chain is fully EVM-compatible, any smart contract written in{" "}
          <strong className="text-foreground">Solidity</strong> and any tooling you already use with
          Ethereum (Hardhat, Foundry, Remix, ethers.js, wagmi) works on Liberty out of the box. No
          rewrites, no new languages.
        </p>
      </Prose>

      <Callout type="tip">
        Liberty Chain has <strong>no gas fees</strong>. You do not need to set gas prices or hold
        native tokens to pay for transactions. Just send — and it lands instantly.
      </Callout>

      <div className="grid sm:grid-cols-3 gap-4 my-6">
        {[
          { label: "Throughput", value: "10,000+ TPS" },
          { label: "Finality", value: "Instant" },
          { label: "Gas fees", value: "Zero" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-primary">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mt-6">
        <a
          href="https://docs.libertychain.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
        >
          View the full external documentation
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* ── Installation ── */}
      <SectionHeading id="installation">Installation</SectionHeading>
      <Prose>
        <p>
          Use your preferred Ethereum toolchain. Liberty Chain's RPC is fully compatible with all
          standard EVM development environments.
        </p>
      </Prose>

      <SubHeading id="install-hardhat">Option A — Hardhat</SubHeading>
      <CodeBlock language="bash" code={`npm install --save-dev hardhat
npx hardhat init`} />
      <p className="text-sm text-muted-foreground mb-2">
        Then configure the Liberty network in <code className="text-primary">hardhat.config.ts</code>:
      </p>
      <CodeBlock language="typescript" code={`import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    liberty: {
      url: "https://rpc.libertychain.org",
      chainId: 1337,
      // No gas fees — leave gasPrice unset or set to 0
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

# Start a new project
forge init my-liberty-app
cd my-liberty-app`} />
      <p className="text-sm text-muted-foreground mb-2">Deploy to Liberty Devnet:</p>
      <CodeBlock language="bash" code={`forge script script/Deploy.s.sol \\
  --rpc-url https://devnet-rpc.libertychain.org \\
  --broadcast`} />

      <Callout type="info">
        Liberty Chain is currently in <strong>Devnet</strong>. The Devnet RPC is{" "}
        <code className="text-primary">https://devnet-rpc.libertychain.org</code>. Mainnet details
        will be published on launch.
      </Callout>

      {/* ── Your First Contract ── */}
      <SectionHeading id="your-first-contract">Your First Contract</SectionHeading>
      <Prose>
        <p>
          Let's deploy a simple storage contract to Liberty Devnet. Because there are no gas fees,
          you can iterate freely without worrying about cost.
        </p>
      </Prose>

      <SubHeading id="write-contract">1. Write the contract</SubHeading>
      <CodeBlock language="solidity" code={`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title SimpleStorage — your first Liberty Chain contract
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

      <SubHeading id="deploy-contract">2. Deploy with Hardhat</SubHeading>
      <CodeBlock language="bash" code={`npx hardhat run scripts/deploy.ts --network libertyDevnet`} />
      <CodeBlock language="typescript" code={`// scripts/deploy.ts
import { ethers } from "hardhat";

async function main() {
  const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
  const contract = await SimpleStorage.deploy();
  await contract.waitForDeployment();
  console.log("Deployed to:", await contract.getAddress());
}

main().catch(console.error);`} />

      <SubHeading id="interact-contract">3. Interact with the contract</SubHeading>
      <CodeBlock language="typescript" code={`import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("https://devnet-rpc.libertychain.org");
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

const abi = ["function set(uint256) external", "function get() external view returns (uint256)"];
const contract = new ethers.Contract("0xYourDeployedAddress", abi, wallet);

// Set a value — no gas fees required
await contract.set(42);

// Read the value back
const val = await contract.get();
console.log("Value:", val.toString()); // 42`} />
    </>
  );
}

function SmartContractsContent() {
  return (
    <>
      <SectionHeading id="contract-basics">Contract Basics</SectionHeading>
      <Prose>
        <p>
          Liberty Chain supports the full Solidity feature set. Every contract that runs on Ethereum
          runs on Liberty without modification. The key difference: there are no gas fees, so
          contracts can be called freely by any user.
        </p>
      </Prose>

      <SubHeading id="erc20">ERC-20 Token</SubHeading>
      <CodeBlock language="solidity" code={`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LibertyToken is ERC20, Ownable {
    constructor(address initialOwner)
        ERC20("LibertyToken", "LBT")
        Ownable(initialOwner)
    {
        // Mint 1,000,000 LBT to deployer
        _mint(initialOwner, 1_000_000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}`} />

      <CodeBlock language="bash" code={`npm install @openzeppelin/contracts`} />

      <SubHeading id="erc721">ERC-721 NFT</SubHeading>
      <CodeBlock language="solidity" code={`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LibertyNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    constructor(address initialOwner)
        ERC721("LibertyNFT", "LNFT")
        Ownable(initialOwner)
    {}

    function mint(address to, string memory uri) external onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        return tokenId;
    }
}`} />

      <Callout type="tip">
        On Liberty Chain, NFT minting has <strong>no gas cost</strong> for the end user. You can
        build gasless mint flows without any meta-transaction relay infrastructure.
      </Callout>

      <SectionHeading id="advanced-patterns">Advanced Patterns</SectionHeading>

      <SubHeading id="upgradeable">Upgradeable Contracts</SubHeading>
      <Prose>
        <p>
          Use OpenZeppelin's UUPS or Transparent proxy patterns to deploy upgradeable contracts on
          Liberty Chain. The workflow is identical to Ethereum.
        </p>
      </Prose>
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

      <SubHeading id="multicall">Batching with Multicall</SubHeading>
      <Prose>
        <p>
          Because Liberty Chain has instant finality and no gas fees, multicall is useful for
          atomically grouping reads — and for UX (batching multiple writes into a single user
          interaction).
        </p>
      </Prose>
      <CodeBlock language="typescript" code={`import { ethers } from "ethers";

// Use Multicall3 — deployed at the same address as on Ethereum mainnet
const MULTICALL3 = "0xcA11bde05977b3631167028862bE2a173976CA11";
const multicall = new ethers.Contract(MULTICALL3, multicall3Abi, provider);

const calls = [
  { target: tokenAddress, allowFailure: false, callData: token.interface.encodeFunctionData("balanceOf", [userAddress]) },
  { target: tokenAddress, allowFailure: false, callData: token.interface.encodeFunctionData("totalSupply") },
];

const results = await multicall.aggregate3(calls);`} />

      <SubHeading id="events">Event Indexing</SubHeading>
      <CodeBlock language="typescript" code={`const provider = new ethers.JsonRpcProvider("https://rpc.libertychain.org");
const contract = new ethers.Contract(address, abi, provider);

// Listen for live events
contract.on("Transfer", (from, to, amount, event) => {
  console.log(\`\${from} → \${to}: \${ethers.formatEther(amount)} LBT\`);
});

// Query historical events
const filter = contract.filters.Transfer(null, userAddress);
const logs = await contract.queryFilter(filter, 0, "latest");`} />

      <SectionHeading id="security-best-practices">Security Best Practices</SectionHeading>
      <Prose>
        <p>
          Liberty Chain's zero-fee model doesn't change the security landscape of Solidity — the
          same best practices apply.
        </p>
      </Prose>

      {[
        {
          title: "Checks-Effects-Interactions",
          desc: "Always perform state changes before external calls to prevent reentrancy.",
          code: `// ✅ Safe — state updated BEFORE external call
function withdraw(uint256 amount) external {
    require(balances[msg.sender] >= amount, "Insufficient balance");
    balances[msg.sender] -= amount;          // Effect first
    (bool ok,) = msg.sender.call{value: amount}(""); // Interaction last
    require(ok, "Transfer failed");
}`,
        },
        {
          title: "Reentrancy Guard",
          desc: "Use OpenZeppelin's ReentrancyGuard for any function that moves ETH or calls external contracts.",
          code: `import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract SafeVault is ReentrancyGuard {
    function withdraw() external nonReentrant {
        // Safe from reentrancy
    }
}`,
        },
        {
          title: "Access Control",
          desc: "Use role-based access control for admin functions.",
          code: `import "@openzeppelin/contracts/access/AccessControl.sol";

contract Managed is AccessControl {
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    function adminAction() external onlyRole(MANAGER_ROLE) {
        // Only MANAGER_ROLE addresses can call this
    }
}`,
        },
      ].map((item) => (
        <div key={item.title}>
          <SubHeading id={item.title.toLowerCase().replace(/\s/g, "-")}>{item.title}</SubHeading>
          <p className="text-sm text-muted-foreground mb-2">{item.desc}</p>
          <CodeBlock language="solidity" code={item.code} />
        </div>
      ))}

      <Callout type="warning">
        Always audit your contracts before deploying to Mainnet. Liberty Chain's no-fee model means
        contracts can be called at extremely high volume — ensure your logic handles this correctly.
      </Callout>
    </>
  );
}

function CLIContent() {
  return (
    <>
      <SectionHeading id="cli-installation">Installation</SectionHeading>
      <Prose>
        <p>
          The Liberty CLI (<code className="text-primary">liberty</code>) provides tools for
          compiling, deploying, and interacting with contracts on Liberty Chain from your terminal.
        </p>
      </Prose>

      <SubHeading id="cli-npm">Install via npm</SubHeading>
      <CodeBlock language="bash" code={`npm install -g @libertychain/cli

# Verify installation
liberty --version`} />

      <SubHeading id="cli-curl">Install via curl (Linux / macOS)</SubHeading>
      <CodeBlock language="bash" code={`curl -sSL https://install.libertychain.org | bash
source ~/.bashrc   # or ~/.zshrc

liberty --version`} />

      <Callout type="info">
        The CLI requires Node.js ≥ 18. Install via{" "}
        <a href="https://nodejs.org" className="text-primary hover:underline">
          nodejs.org
        </a>{" "}
        or with <code className="text-primary">nvm install --lts</code>.
      </Callout>

      <SectionHeading id="commands-reference">Commands Reference</SectionHeading>

      {[
        {
          cmd: "liberty init",
          desc: "Scaffold a new Liberty Chain project with Hardhat or Foundry preset.",
          example: "liberty init my-project --template hardhat-ts",
        },
        {
          cmd: "liberty compile",
          desc: "Compile all Solidity contracts in the project.",
          example: "liberty compile",
        },
        {
          cmd: "liberty deploy",
          desc: "Deploy a compiled contract to a configured network.",
          example: "liberty deploy --network libertyDevnet --contract SimpleStorage",
        },
        {
          cmd: "liberty call",
          desc: "Call a read-only contract function.",
          example: `liberty call --address 0xABC... --abi ./abi.json --fn "get()"`,
        },
        {
          cmd: "liberty send",
          desc: "Send a write transaction. No gas fees required — just sign and send.",
          example: `liberty send --address 0xABC... --abi ./abi.json --fn "set(uint256)" --args 42`,
        },
        {
          cmd: "liberty accounts",
          desc: "List all configured wallet accounts.",
          example: "liberty accounts --show-balance",
        },
        {
          cmd: "liberty node",
          desc: "Start a local Liberty node for development.",
          example: "liberty node --port 8545",
        },
        {
          cmd: "liberty verify",
          desc: "Verify and publish contract source on the Liberty block explorer.",
          example: "liberty verify --address 0xABC... --network liberty",
        },
      ].map((item) => (
        <div key={item.cmd} className="border border-border rounded-xl p-5 my-3">
          <div className="flex items-start justify-between gap-3 mb-2">
            <code className="text-primary font-mono font-bold text-sm">{item.cmd}</code>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{item.desc}</p>
          <CodeBlock language="bash" code={item.example} />
        </div>
      ))}

      <SectionHeading id="configuration">Configuration</SectionHeading>
      <Prose>
        <p>
          The CLI reads from a <code className="text-primary">liberty.config.json</code> file in
          your project root. You can also set values via environment variables.
        </p>
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
  }
}`} />

      <SubHeading id="env-vars">Environment Variables</SubHeading>
      <CodeBlock language="bash" code={`# .env
DEPLOYER_PRIVATE_KEY=0xabc123...
LIBERTY_RPC_URL=https://rpc.libertychain.org
LIBERTY_CHAIN_ID=1337`} />

      <Callout type="tip">
        Never commit private keys to source control. Use a <code>.env</code> file and add it to{" "}
        <code>.gitignore</code>.
      </Callout>
    </>
  );
}

function APIContent() {
  return (
    <>
      <SectionHeading id="json-rpc">JSON-RPC API</SectionHeading>
      <Prose>
        <p>
          Liberty Chain exposes a standard Ethereum JSON-RPC API. Any tool or library that works
          with <code className="text-primary">eth_*</code> methods will work with Liberty Chain
          out of the box.
        </p>
        <p>
          <strong className="text-foreground">RPC Endpoint:</strong>{" "}
          <code className="text-primary">https://rpc.libertychain.org</code>
          <br />
          <strong className="text-foreground">Devnet RPC:</strong>{" "}
          <code className="text-primary">https://devnet-rpc.libertychain.org</code>
        </p>
      </Prose>

      <SubHeading id="rpc-network">Network Info</SubHeading>
      <CodeBlock language="bash" code={`curl -X POST https://rpc.libertychain.org \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'

# Response:
# {"jsonrpc":"2.0","id":1,"result":"0x539"}  → chain ID 1337`} />

      {[
        {
          method: "eth_blockNumber",
          desc: "Returns the current block number.",
          request: `{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}`,
          response: `{"jsonrpc":"2.0","id":1,"result":"0x1a4f2c"}`,
        },
        {
          method: "eth_getBalance",
          desc: "Returns the balance of an account.",
          request: `{"jsonrpc":"2.0","method":"eth_getBalance","params":["0xAddress","latest"],"id":1}`,
          response: `{"jsonrpc":"2.0","id":1,"result":"0x0"}`,
        },
        {
          method: "eth_sendRawTransaction",
          desc: "Submits a signed transaction. No gas price needed — set gasPrice to 0 or omit.",
          request: `{"jsonrpc":"2.0","method":"eth_sendRawTransaction","params":["0xSignedTxHex"],"id":1}`,
          response: `{"jsonrpc":"2.0","id":1,"result":"0xTxHash"}`,
        },
        {
          method: "eth_call",
          desc: "Executes a read-only call without creating a transaction.",
          request: `{"jsonrpc":"2.0","method":"eth_call","params":[{"to":"0xAddress","data":"0xCallData"},"latest"],"id":1}`,
          response: `{"jsonrpc":"2.0","id":1,"result":"0xReturnData"}`,
        },
        {
          method: "eth_getLogs",
          desc: "Returns event logs matching a filter.",
          request: `{"jsonrpc":"2.0","method":"eth_getLogs","params":[{
  "fromBlock": "0x0",
  "toBlock": "latest",
  "address": "0xContractAddress",
  "topics": ["0xEventSignatureHash"]
}],"id":1}`,
          response: `{"jsonrpc":"2.0","id":1,"result":[{ "blockNumber":"0x1a4f2c", "transactionHash":"0x...", ... }]}`,
        },
      ].map((item) => (
        <div key={item.method} className="border border-border rounded-xl p-5 my-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="font-mono text-xs">{item.method}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{item.desc}</p>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Request</p>
          <CodeBlock language="json" code={item.request} />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Response</p>
          <CodeBlock language="json" code={item.response} />
        </div>
      ))}

      <Callout type="tip">
        Because Liberty Chain has <strong>zero gas fees</strong>, you can set{" "}
        <code className="text-primary">gasPrice: "0x0"</code> in all transactions. Your users never
        need native tokens to interact with your dApp.
      </Callout>

      <SectionHeading id="web3-integration">Web3 Integration</SectionHeading>

      <SubHeading id="ethersjs">ethers.js v6</SubHeading>
      <CodeBlock language="bash" code={`npm install ethers`} />
      <CodeBlock language="typescript" code={`import { ethers } from "ethers";

// Provider
const provider = new ethers.JsonRpcProvider("https://rpc.libertychain.org");

// Wallet
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

// Network info
const network = await provider.getNetwork();
console.log("Chain ID:", network.chainId); // 1337n

// Send a zero-fee transaction
const tx = await wallet.sendTransaction({
  to: "0xRecipientAddress",
  value: ethers.parseEther("0"),
  // gasPrice is 0 on Liberty Chain
});
await tx.wait();
console.log("Confirmed:", tx.hash);`} />

      <SubHeading id="wagmi">wagmi + viem</SubHeading>
      <CodeBlock language="bash" code={`npm install wagmi viem @tanstack/react-query`} />
      <CodeBlock language="typescript" code={`import { defineChain } from "viem";
import { createConfig, http } from "wagmi";

// Define Liberty Chain
export const libertyChain = defineChain({
  id: 1337,
  name: "Liberty Chain",
  nativeCurrency: { name: "Liberty", symbol: "LIB", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.libertychain.org"] },
  },
  blockExplorers: {
    default: { name: "Liberty Explorer", url: "https://explorer.libertychain.org" },
  },
  // No gas fees
  fees: { baseFeeMultiplier: 0 },
});

export const wagmiConfig = createConfig({
  chains: [libertyChain],
  transports: { [libertyChain.id]: http() },
});`} />

      <SubHeading id="metamask">MetaMask / Wallet Setup</SubHeading>
      <CodeBlock language="typescript" code={`// Add Liberty Chain to MetaMask programmatically
await window.ethereum.request({
  method: "wallet_addEthereumChain",
  params: [{
    chainId: "0x539",           // 1337 in hex
    chainName: "Liberty Chain",
    nativeCurrency: { name: "Liberty", symbol: "LIB", decimals: 18 },
    rpcUrls: ["https://rpc.libertychain.org"],
    blockExplorerUrls: ["https://explorer.libertychain.org"],
  }],
});`} />

      <SectionHeading id="graphql-api">GraphQL API</SectionHeading>
      <Prose>
        <p>
          Liberty Chain provides a GraphQL endpoint for querying on-chain data with flexible,
          nested queries — ideal for dashboards, analytics, and explorers.
        </p>
        <p>
          <strong className="text-foreground">GraphQL Endpoint:</strong>{" "}
          <code className="text-primary">https://graph.libertychain.org/graphql</code>
        </p>
      </Prose>

      <SubHeading id="graphql-block">Query: Latest Block</SubHeading>
      <CodeBlock language="graphql" code={`query LatestBlock {
  block(number: null) {
    number
    hash
    timestamp
    transactionCount
    gasUsed
  }
}`} />

      <SubHeading id="graphql-txns">Query: Account Transactions</SubHeading>
      <CodeBlock language="graphql" code={`query AccountTransactions($address: String!) {
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
    timestamp
    status
  }
}`} />

      <SubHeading id="graphql-events">Query: Contract Events</SubHeading>
      <CodeBlock language="graphql" code={`query TokenTransfers($contract: String!, $from: Int!) {
  transferEvents(
    where: { contractAddress: $contract, blockNumber_gte: $from }
    orderBy: blockNumber
    orderDirection: asc
  ) {
    transactionHash
    from
    to
    amount
    blockNumber
  }
}`} />

      <SubHeading id="graphql-client">Using the GraphQL Client</SubHeading>
      <CodeBlock language="bash" code={`npm install graphql-request graphql`} />
      <CodeBlock language="typescript" code={`import { GraphQLClient, gql } from "graphql-request";

const client = new GraphQLClient("https://graph.libertychain.org/graphql");

const LATEST_BLOCK = gql\`
  query { block(number: null) { number hash timestamp } }
\`;

const data = await client.request<{ block: { number: number; hash: string } }>(LATEST_BLOCK);
console.log("Latest block:", data.block.number);`} />

      <div className="mt-10 border border-primary/20 bg-primary/5 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-black text-lg mb-1">View the full API reference</h3>
          <p className="text-sm text-muted-foreground">
            Detailed method signatures, error codes, and live playground.
          </p>
        </div>
        <a
          href="https://docs.libertychain.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0"
        >
          <Button className="group gap-2">
            Open External Docs
            <ExternalLink className="w-4 h-4" />
          </Button>
        </a>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */

const contentMap: Record<string, React.ReactNode> = {
  "getting-started": <GettingStartedContent />,
  "smart-contracts": <SmartContractsContent />,
  "cli-tools": <CLIContent />,
  "api-reference": <APIContent />,
};

export default function Documentation() {
  const [activeSection, setActiveSection] = useState("getting-started");
  const [activeItem, setActiveItem] = useState("introduction");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  function scrollToId(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;

    const allIds = sections.flatMap((s) => [s.id, ...s.items.map((i) => i.id)]);

    function onScroll() {
      let current = allIds[0];
      for (const id of allIds) {
        const node = document.getElementById(id);
        if (node && node.getBoundingClientRect().top < 160) {
          current = id;
        }
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <div className="flex pt-16">
        {/* ── Sidebar overlay (mobile) ── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/60 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <aside
          className={`
            fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-72 bg-background border-r border-border overflow-y-auto
            transition-transform duration-200 ease-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0 lg:sticky lg:top-16 lg:self-start lg:max-h-[calc(100vh-4rem)]
          `}
          data-testid="doc-sidebar"
        >
          <div className="p-6 space-y-6">
            {/* External docs link */}
            <a
              href="https://docs.libertychain.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors font-medium border border-border rounded-lg px-3 py-2"
              data-testid="link-external-docs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              docs.libertychain.org
            </a>

            {sections.map((section) => {
              const Icon = section.icon;
              const isOpen = activeSection === section.id;
              return (
                <div key={section.id}>
                  <button
                    onClick={() => {
                      setActiveSection(section.id);
                      scrollToId(section.id);
                      setSidebarOpen(false);
                    }}
                    className={`flex items-center gap-2 w-full text-left text-sm font-bold mb-2 transition-colors ${
                      isOpen ? "text-primary" : "text-foreground hover:text-primary"
                    }`}
                    data-testid={`nav-section-${section.id}`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {section.title}
                  </button>

                  <ul className="space-y-1 pl-6">
                    {section.items.map((item) => (
                      <li key={item.id}>
                        <button
                          onClick={() => {
                            setActiveSection(section.id);
                            setActiveItem(item.id);
                            scrollToId(item.id);
                            setSidebarOpen(false);
                          }}
                          className={`block w-full text-left text-sm py-0.5 transition-colors ${
                            activeItem === item.id
                              ? "text-primary font-medium"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                          data-testid={`nav-item-${item.id}`}
                        >
                          {item.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </aside>

        {/* ── Main content ── */}
        <main
          ref={mainRef}
          className="flex-1 min-w-0 h-[calc(100vh-4rem)] overflow-y-auto"
          data-testid="doc-main"
        >
          {/* Mobile header */}
          <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md hover:bg-muted transition-colors"
              data-testid="button-sidebar-toggle"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-sm font-semibold">
              {sections.find((s) => s.id === activeSection)?.title}
            </span>
          </div>

          <div className="max-w-3xl mx-auto px-6 lg:px-10 py-12">
            {/* Hero */}
            <div className="mb-12 pb-8 border-b border-border">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 mb-4">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Documentation</span>
              </div>
              <h1
                className="text-4xl sm:text-5xl font-black tracking-tight mb-4"
                data-testid="heading-documentation"
              >
                Developer Docs
              </h1>
              <p className="text-lg text-muted-foreground mb-4">
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

            {/* Section overview cards */}
            <div className="grid sm:grid-cols-2 gap-4 mb-16" data-testid="doc-overview">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => { scrollToId(section.id); setActiveSection(section.id); }}
                    className="text-left border border-border rounded-xl p-5 hover-elevate active-elevate-2 transition-all group"
                    data-testid={`card-section-${section.id}`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-bold mb-1 group-hover:text-primary transition-colors text-sm">
                      {section.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{section.description}</p>
                    <div className="mt-3 space-y-1">
                      {section.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <ChevronRight className="w-3 h-3 text-primary/50" />
                          {item.label}
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* All content rendered linearly — sections scroll into view */}
            <div className="space-y-0">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <div key={section.id} id={section.id} className="scroll-mt-8">
                    <div className="flex items-center gap-3 mt-4 mb-2 pb-3 border-b border-border">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <h2 className="text-xl font-black tracking-tight">{section.title}</h2>
                    </div>
                    {contentMap[section.id]}
                    <div className="mt-16" />
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="mt-8 pt-8 border-t border-border text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Something missing? Contribute to the docs or ask the community.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <a
                  href="https://docs.libertychain.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="gap-2">
                    <ExternalLink className="w-3.5 h-3.5" />
                    External Docs
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
