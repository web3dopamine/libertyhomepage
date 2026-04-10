/**
 * On-chain payment verification for USDT TRC20 (Tron) and BSC (Binance Smart Chain).
 * Uses public APIs — no API keys required.
 */

const USDT_TRC20_CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
const USDT_BSC_CONTRACT = "0x55d398326f99059ff775485246999027b3197955";
const USDT_TRC20_DECIMALS = 6;   // TRC20 USDT: 6 decimals
const USDT_BSC_DECIMALS  = 18;  // BSC USDT (BEP-20): 18 decimals

// ERC20 Transfer event topic
const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

export type Network = "TRC20" | "BSC" | "unknown";

export interface VerifyResult {
  verified: boolean;
  network: Network;
  from?: string;
  to?: string;
  amountUsdt?: number;
  error?: string;
}

/** Detect network from TX hash format. Tron = 64 hex chars (no 0x). BSC/ETH = 0x + 64 hex. */
function detectNetwork(txHash: string): Network {
  const h = txHash.trim();
  if (h.startsWith("0x") && h.length === 66) return "BSC";
  if (!h.startsWith("0x") && /^[0-9a-fA-F]{64}$/.test(h)) return "TRC20";
  return "unknown";
}

/** Normalize address for case-insensitive comparison. */
function normalizeAddr(addr?: string): string {
  if (!addr) return "";
  return addr.trim().toLowerCase();
}

/** Parse a 32-byte padded hex data field as a Tron/EVM address. */
function parsePaddedAddress(hex: string): string {
  // Remove leading 0x if present
  const raw = hex.startsWith("0x") ? hex.slice(2) : hex;
  return "0x" + raw.slice(-40);
}

/** Parse uint256 from hex string. */
function parseUint256(hex: string): bigint {
  const raw = hex.startsWith("0x") ? hex.slice(2) : hex;
  return BigInt("0x" + raw);
}

async function verifyTRC20(
  txHash: string,
  expectedTo: string,
  expectedAmountUsdt: number,
  senderWallet?: string
): Promise<VerifyResult> {
  try {
    // TronScan public API — no key required
    const url = `https://apilist.tronscanapi.com/api/transaction-info?hash=${encodeURIComponent(txHash)}`;
    const resp = await fetch(url, {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!resp.ok) {
      return { verified: false, network: "TRC20", error: `TronScan API error ${resp.status}` };
    }
    const data = await resp.json() as Record<string, unknown>;

    // Check for TRC20 token transfer info
    const tti = data.tokenTransferInfo as Record<string, unknown> | undefined;
    if (!tti) {
      return { verified: false, network: "TRC20", error: "Not a TRC20 token transfer or not confirmed yet." };
    }

    const tokenInfo = tti.tokenInfo as Record<string, unknown> | undefined;
    const tokenAbbr = (tokenInfo?.tokenAbbr as string ?? "").toUpperCase();
    if (tokenAbbr !== "USDT") {
      return { verified: false, network: "TRC20", error: `Token is ${tokenAbbr}, not USDT.` };
    }

    const fromAddr = (tti.from_address ?? data.ownerAddress ?? "") as string;
    const toAddr = (tti.to_address ?? "") as string;
    const amountRaw = BigInt((tti.amount_str as string) ?? "0");
    const amountUsdt = Number(amountRaw) / 10 ** USDT_TRC20_DECIMALS;

    // Validate recipient
    if (normalizeAddr(toAddr) !== normalizeAddr(expectedTo)) {
      return {
        verified: false, network: "TRC20", from: fromAddr, to: toAddr, amountUsdt,
        error: `Payment sent to wrong address. Expected ${expectedTo}, got ${toAddr}.`,
      };
    }

    // Validate amount
    if (amountUsdt < expectedAmountUsdt - 0.01) {
      return {
        verified: false, network: "TRC20", from: fromAddr, to: toAddr, amountUsdt,
        error: `Insufficient amount. Expected ${expectedAmountUsdt} USDT, got ${amountUsdt.toFixed(2)} USDT.`,
      };
    }

    // Optionally validate sender wallet
    if (senderWallet && normalizeAddr(fromAddr) !== normalizeAddr(senderWallet)) {
      return {
        verified: false, network: "TRC20", from: fromAddr, to: toAddr, amountUsdt,
        error: `Sender mismatch. Expected ${senderWallet}, got ${fromAddr}.`,
      };
    }

    return { verified: true, network: "TRC20", from: fromAddr, to: toAddr, amountUsdt };
  } catch (e) {
    return { verified: false, network: "TRC20", error: `Verification failed: ${(e as Error).message}` };
  }
}

async function verifyBSC(
  txHash: string,
  expectedTo: string,
  expectedAmountUsdt: number,
  senderWallet?: string
): Promise<VerifyResult> {
  const BSC_RPC = "https://bsc-dataseed.binance.org/";
  try {
    const resp = await fetch(BSC_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getTransactionReceipt",
        params: [txHash],
        id: 1,
      }),
      signal: AbortSignal.timeout(12_000),
    });
    if (!resp.ok) {
      return { verified: false, network: "BSC", error: `BSC RPC error ${resp.status}` };
    }
    const json = await resp.json() as { result: Record<string, unknown> | null };
    const receipt = json.result;
    if (!receipt) {
      return { verified: false, network: "BSC", error: "Transaction not found or not confirmed yet." };
    }
    if (receipt.status !== "0x1") {
      return { verified: false, network: "BSC", error: "Transaction failed on-chain." };
    }

    // Find USDT Transfer log
    const logs = (receipt.logs ?? []) as Array<Record<string, unknown>>;
    const usdtTransfer = logs.find((log) => {
      const addr = (log.address as string ?? "").toLowerCase();
      const topics = (log.topics as string[]) ?? [];
      return (
        addr === USDT_BSC_CONTRACT.toLowerCase() &&
        topics[0]?.toLowerCase() === TRANSFER_TOPIC.toLowerCase() &&
        topics.length >= 3
      );
    });

    if (!usdtTransfer) {
      return { verified: false, network: "BSC", error: "No USDT Transfer event found in this transaction." };
    }

    const topics = usdtTransfer.topics as string[];
    const fromAddr = parsePaddedAddress(topics[1]);
    const toAddr = parsePaddedAddress(topics[2]);
    const dataHex = (usdtTransfer.data as string) ?? "0x";
    const amountRaw = parseUint256(dataHex);
    const amountUsdt = Number(amountRaw) / 10 ** USDT_BSC_DECIMALS;

    // Validate recipient
    if (normalizeAddr(toAddr) !== normalizeAddr(expectedTo)) {
      return {
        verified: false, network: "BSC", from: fromAddr, to: toAddr, amountUsdt,
        error: `Payment sent to wrong address. Expected ${expectedTo}, got ${toAddr}.`,
      };
    }

    // Validate amount
    if (amountUsdt < expectedAmountUsdt - 0.01) {
      return {
        verified: false, network: "BSC", from: fromAddr, to: toAddr, amountUsdt,
        error: `Insufficient amount. Expected ${expectedAmountUsdt} USDT, got ${amountUsdt.toFixed(2)} USDT.`,
      };
    }

    // Optionally validate sender wallet
    if (senderWallet && normalizeAddr(fromAddr) !== normalizeAddr(senderWallet)) {
      return {
        verified: false, network: "BSC", from: fromAddr, to: toAddr, amountUsdt,
        error: `Sender mismatch. Expected ${senderWallet}, got ${fromAddr}.`,
      };
    }

    return { verified: true, network: "BSC", from: fromAddr, to: toAddr, amountUsdt };
  } catch (e) {
    return { verified: false, network: "BSC", error: `Verification failed: ${(e as Error).message}` };
  }
}

/**
 * Verify a USDT payment (TRC20 or BSC) given a TX hash.
 * Auto-detects network from the hash format.
 * Accepts separate BSC and TRC20 recipient addresses.
 */
export async function verifyUsdtPayment(opts: {
  txHash: string;
  /** BSC/EVM wallet address (0x...) — used when TX hash looks like a BSC transaction */
  expectedBscAddress?: string;
  /** TRC20/Tron wallet address (T...) — used when TX hash looks like a TRC20 transaction */
  expectedTrc20Address?: string;
  /** Legacy single-address compat — used as fallback if BSC/TRC20 specific address is missing */
  expectedToAddress?: string;
  expectedAmountUsdt: number;
  senderWallet?: string;
}): Promise<VerifyResult> {
  const { txHash, expectedBscAddress, expectedTrc20Address, expectedToAddress, expectedAmountUsdt, senderWallet } = opts;
  const network = detectNetwork(txHash);

  const bscAddr  = expectedBscAddress  || expectedToAddress || "";
  const trc20Addr = expectedTrc20Address || expectedToAddress || "";

  if (network === "TRC20") {
    if (!trc20Addr) return { verified: false, network: "TRC20", error: "No TRC20 receiving address is configured." };
    return verifyTRC20(txHash, trc20Addr, expectedAmountUsdt, senderWallet);
  } else if (network === "BSC") {
    if (!bscAddr) return { verified: false, network: "BSC", error: "No BSC receiving address is configured." };
    return verifyBSC(txHash, bscAddr, expectedAmountUsdt, senderWallet);
  } else {
    // Unknown format — try both
    if (trc20Addr) {
      const trc = await verifyTRC20(txHash, trc20Addr, expectedAmountUsdt, senderWallet);
      if (trc.verified) return trc;
    }
    if (bscAddr) {
      const bsc = await verifyBSC(txHash, bscAddr, expectedAmountUsdt, senderWallet);
      if (bsc.verified) return bsc;
    }
    return { verified: false, network: "unknown", error: "Could not verify on TRC20 or BSC. Check hash format." };
  }
}
