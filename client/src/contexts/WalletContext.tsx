import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { BrowserProvider } from "ethers";

export type WalletRank = "None" | "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond";

export interface WalletState {
  address: string | null;
  shortAddress: string | null;
  chainId: number | null;
  chainName: string | null;
  lcBalance: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  rank: WalletRank;
  connect: () => Promise<void>;
  disconnect: () => void;
  error: string | null;
}

// LC token rank thresholds (future — once token is live)
// For now all users are "None" since the token isn't launched
const RANK_THRESHOLDS: { rank: WalletRank; min: number }[] = [
  { rank: "Diamond", min: 1_000_000 },
  { rank: "Platinum", min: 100_000 },
  { rank: "Gold", min: 10_000 },
  { rank: "Silver", min: 1_000 },
  { rank: "Bronze", min: 100 },
  { rank: "None", min: 0 },
];

function getRank(lcAmount: number): WalletRank {
  for (const { rank, min } of RANK_THRESHOLDS) {
    if (lcAmount >= min) return rank;
  }
  return "None";
}

function formatAddress(addr: string): string {
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

const LIBERTY_CHAIN_ID = 1337; // placeholder — update when Liberty Chain mainnet launches

const WalletContext = createContext<WalletState | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function getChainName(id: number | null): string | null {
    if (!id) return null;
    if (id === LIBERTY_CHAIN_ID) return "Liberty Chain";
    return KNOWN_CHAINS[id] ?? `Chain ${id}`;
  }

  const disconnect = useCallback(() => {
    setAddress(null);
    setChainId(null);
    localStorage.removeItem("lc_wallet_address");
    localStorage.removeItem("lc_wallet_connected");
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
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      const network = await provider.getNetwork();
      setAddress(addr);
      setChainId(Number(network.chainId));
      localStorage.setItem("lc_wallet_address", addr);
      localStorage.setItem("lc_wallet_connected", "1");
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

  // Auto-reconnect on load if previously connected
  useEffect(() => {
    const wasConnected = localStorage.getItem("lc_wallet_connected");
    const savedAddress = localStorage.getItem("lc_wallet_address");
    if (!wasConnected || !savedAddress) return;

    const eth = (window as any).ethereum;
    if (!eth) return;

    eth.request({ method: "eth_accounts" }).then((accounts: string[]) => {
      if (accounts.length > 0 && accounts[0].toLowerCase() === savedAddress.toLowerCase()) {
        setAddress(accounts[0]);
        eth.request({ method: "eth_chainId" }).then((chainHex: string) => {
          setChainId(parseInt(chainHex, 16));
        });
      } else {
        localStorage.removeItem("lc_wallet_connected");
        localStorage.removeItem("lc_wallet_address");
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
        localStorage.setItem("lc_wallet_address", accounts[0]);
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

  // LC token balance: once the Liberty Chain mainnet is live and token is deployed,
  // replace this with an ERC-20 balanceOf() call to the LC token contract.
  const lcBalance = address ? "0" : null;
  const lcAmount = lcBalance ? parseFloat(lcBalance) : 0;

  const value: WalletState = {
    address,
    shortAddress: address ? formatAddress(address) : null,
    chainId,
    chainName: getChainName(chainId),
    lcBalance,
    isConnecting,
    isConnected: !!address,
    rank: getRank(lcAmount),
    connect,
    disconnect,
    error,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletState {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}

export { RANK_THRESHOLDS };
