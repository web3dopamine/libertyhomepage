import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { BrowserProvider } from "ethers";

export type WalletRank = "None" | "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond";

export interface ForumSession {
  address: string;
  signature: string;
  message: string;
  issuedAt: string;
}

export interface WalletState {
  address: string | null;
  shortAddress: string | null;
  chainId: number | null;
  chainName: string | null;
  lcBalance: string | null;
  isConnecting: boolean;
  isSigning: boolean;
  isConnected: boolean;
  isForumAuthenticated: boolean;
  forumSession: ForumSession | null;
  rank: WalletRank;
  connect: () => Promise<void>;
  disconnect: () => void;
  signForumSession: () => Promise<boolean>;
  revokeForumSession: () => void;
  error: string | null;
}

// LC token rank thresholds (future — once token is live on Liberty Chain mainnet)
export const RANK_THRESHOLDS: { rank: WalletRank; min: number }[] = [
  { rank: "Diamond", min: 1_000_000 },
  { rank: "Platinum", min: 100_000 },
  { rank: "Gold", min: 10_000 },
  { rank: "Silver", min: 1_000 },
  { rank: "Bronze", min: 100 },
  { rank: "None", min: 0 },
];

export function getRank(lcAmount: number): WalletRank {
  for (const { rank, min } of RANK_THRESHOLDS) {
    if (lcAmount >= min) return rank;
  }
  return "None";
}

export function formatAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

const KNOWN_CHAINS: Record<number, string> = {
  1: "Ethereum Mainnet",
  5: "Goerli Testnet",
  11155111: "Sepolia Testnet",
  137: "Polygon",
  80001: "Mumbai Testnet",
  56: "BNB Chain",
  43114: "Avalanche",
  42161: "Arbitrum",
  10: "Optimism",
  8453: "Base",
};

const LIBERTY_CHAIN_ID = 1337;

const LIBERTY_CHAIN_CONFIG = {
  chainId: "0x539", // 1337 in hex
  chainName: "Liberty Chain",
  nativeCurrency: {
    name: "Liberty",
    symbol: "LC",
    decimals: 18,
  },
  rpcUrls: ["https://rpc.libertychain.org"],
  blockExplorerUrls: ["https://explorer.libertychain.org"],
};

/**
 * Ensures MetaMask is switched to (or has just added) the Liberty Chain network.
 * - Tries wallet_switchEthereumChain first.
 * - If the chain isn't in MetaMask yet (error 4902), calls wallet_addEthereumChain.
 * - Errors other than user rejection are silently swallowed so the rest of
 *   the connect flow can continue regardless.
 */
async function ensureLibertyChain(eth: any): Promise<void> {
  try {
    await eth.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: LIBERTY_CHAIN_CONFIG.chainId }],
    });
  } catch (switchErr: any) {
    // 4902 = chain not yet added to MetaMask
    if (switchErr?.code === 4902 || switchErr?.code === -32603) {
      try {
        await eth.request({
          method: "wallet_addEthereumChain",
          params: [LIBERTY_CHAIN_CONFIG],
        });
      } catch (addErr: any) {
        // User rejected the "add network" prompt — continue silently
        console.warn("[wallet] User rejected adding Liberty Chain:", addErr?.message);
      }
    } else if (switchErr?.code !== 4001) {
      // Not a user rejection — log but don't block
      console.warn("[wallet] Could not switch to Liberty Chain:", switchErr?.message);
    }
  }
}

const SESSION_KEY = "lc_forum_session";
const WALLET_KEY = "lc_wallet_address";
const CONNECTED_KEY = "lc_wallet_connected";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function buildSiweMessage(address: string, chainId: number | null): string {
  const issuedAt = new Date().toISOString();
  const chain = chainId ?? 1;
  return [
    "Liberty Chain Forum wants you to sign in with your Ethereum account:",
    address,
    "",
    "Sign this message to verify your wallet identity and post in the Liberty Chain community forum.",
    "",
    `URI: https://libertychain.org/forum`,
    "Version: 1",
    `Chain ID: ${chain}`,
    `Nonce: ${Math.random().toString(36).slice(2, 10)}`,
    `Issued At: ${issuedAt}`,
    `Expiration Time: ${new Date(Date.now() + SESSION_TTL_MS).toISOString()}`,
  ].join("\n");
}

function loadSession(address: string): ForumSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s: ForumSession = JSON.parse(raw);
    if (s.address.toLowerCase() !== address.toLowerCase()) return null;
    const issued = new Date(s.issuedAt).getTime();
    if (Date.now() - issued > SESSION_TTL_MS) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

function getChainName(id: number | null): string | null {
  if (!id) return null;
  if (id === LIBERTY_CHAIN_ID) return "Liberty Chain";
  return KNOWN_CHAINS[id] ?? `Chain ${id}`;
}

const WalletContext = createContext<WalletState | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [forumSession, setForumSession] = useState<ForumSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  const revokeForumSession = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setForumSession(null);
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setChainId(null);
    setForumSession(null);
    localStorage.removeItem(WALLET_KEY);
    localStorage.removeItem(CONNECTED_KEY);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  const connect = useCallback(async () => {
    const eth = (window as any).ethereum;
    if (!eth) {
      setError("MetaMask is not installed. Please install it from metamask.io");
      return;
    }
    setIsConnecting(true);
    setError(null);
    try {
      const provider = new BrowserProvider(eth);
      await provider.send("eth_requestAccounts", []);
      // Add / switch to Liberty Chain if not already configured
      await ensureLibertyChain(eth);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      const network = await provider.getNetwork();
      setAddress(addr);
      setChainId(Number(network.chainId));
      localStorage.setItem(WALLET_KEY, addr);
      localStorage.setItem(CONNECTED_KEY, "1");
      // Restore existing session if valid
      const session = loadSession(addr);
      if (session) setForumSession(session);
    } catch (err: any) {
      if (err.code === 4001) {
        setError("Connection rejected. Please approve the MetaMask request.");
      } else {
        setError("Failed to connect wallet. Please try again.");
      }
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const signForumSession = useCallback(async (): Promise<boolean> => {
    const eth = (window as any).ethereum;
    if (!eth || !address) return false;
    setIsSigning(true);
    setError(null);
    try {
      const provider = new BrowserProvider(eth);
      const signer = await provider.getSigner();
      const message = buildSiweMessage(address, chainId);
      const signature = await signer.signMessage(message);
      const session: ForumSession = {
        address,
        signature,
        message,
        issuedAt: new Date().toISOString(),
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setForumSession(session);
      return true;
    } catch (err: any) {
      if (err.code === 4001) {
        setError("Signature rejected. Sign the message to verify your identity.");
      } else {
        setError("Failed to sign verification message.");
      }
      return false;
    } finally {
      setIsSigning(false);
    }
  }, [address, chainId]);

  // Auto-reconnect on load if previously connected
  useEffect(() => {
    const wasConnected = localStorage.getItem(CONNECTED_KEY);
    const savedAddress = localStorage.getItem(WALLET_KEY);
    if (!wasConnected || !savedAddress) return;

    const eth = (window as any).ethereum;
    if (!eth) return;

    eth.request({ method: "eth_accounts" }).then((accounts: string[]) => {
      if (accounts.length > 0 && accounts[0].toLowerCase() === savedAddress.toLowerCase()) {
        setAddress(accounts[0]);
        eth.request({ method: "eth_chainId" }).then((chainHex: string) => {
          setChainId(parseInt(chainHex, 16));
        });
        const session = loadSession(accounts[0]);
        if (session) setForumSession(session);
      } else {
        localStorage.removeItem(CONNECTED_KEY);
        localStorage.removeItem(WALLET_KEY);
        localStorage.removeItem(SESSION_KEY);
      }
    }).catch(() => {});
  }, []);

  // Listen for account / chain changes
  useEffect(() => {
    const eth = (window as any).ethereum;
    if (!eth) return;

    const onAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAddress(accounts[0]);
        localStorage.setItem(WALLET_KEY, accounts[0]);
        const session = loadSession(accounts[0]);
        setForumSession(session);
      }
    };

    const onChainChanged = (chainHex: string) => {
      setChainId(parseInt(chainHex, 16));
    };

    eth.on("accountsChanged", onAccountsChanged);
    eth.on("chainChanged", onChainChanged);
    return () => {
      eth.removeListener("accountsChanged", onAccountsChanged);
      eth.removeListener("chainChanged", onChainChanged);
    };
  }, [disconnect]);

  // LC token balance: once Liberty Chain mainnet is live and token is deployed,
  // replace this with an ERC-20 balanceOf() call to the LC token contract address.
  const lcBalance = address ? "0" : null;
  const lcAmount = lcBalance ? parseFloat(lcBalance) : 0;

  const value: WalletState = {
    address,
    shortAddress: address ? formatAddress(address) : null,
    chainId,
    chainName: getChainName(chainId),
    lcBalance,
    isConnecting,
    isSigning,
    isConnected: !!address,
    isForumAuthenticated: !!address && !!forumSession,
    forumSession,
    rank: getRank(lcAmount),
    connect,
    disconnect,
    signForumSession,
    revokeForumSession,
    error,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletState {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}
