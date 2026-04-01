import { useState } from "react";
import { useWallet, WalletRank, RANK_THRESHOLDS } from "@/contexts/WalletContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Wallet,
  Copy,
  LogOut,
  Vote,
  Coins,
  AlertCircle,
  CheckCircle2,
  Trophy,
  Network,
  Loader2,
  ShieldCheck,
  ShieldOff,
  PenLine,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const RANK_COLORS: Record<WalletRank, string> = {
  None: "bg-zinc-700 text-zinc-300",
  Bronze: "bg-amber-900/60 text-amber-300",
  Silver: "bg-slate-600 text-slate-200",
  Gold: "bg-yellow-700/60 text-yellow-200",
  Platinum: "bg-cyan-800/60 text-cyan-200",
  Diamond: "bg-violet-700/60 text-violet-200",
};

export const RANK_NEXT: Record<WalletRank, string> = {
  None: "100 LC for Bronze",
  Bronze: "1,000 LC for Silver",
  Silver: "10,000 LC for Gold",
  Gold: "100,000 LC for Platinum",
  Platinum: "1,000,000 LC for Diamond",
  Diamond: "Max rank reached",
};

export function WalletAvatar({ address, size = "sm" }: { address: string; size?: "sm" | "md" | "lg" }) {
  const hue = parseInt(address.slice(2, 6), 16) % 360;
  const hue2 = parseInt(address.slice(6, 10), 16) % 360;
  const sz = size === "lg" ? "w-10 h-10" : size === "md" ? "w-8 h-8" : "w-7 h-7";
  return (
    <div
      className={`${sz} rounded-full flex-shrink-0 border border-border`}
      style={{ background: `linear-gradient(135deg, hsl(${hue},70%,45%), hsl(${hue2},80%,35%))` }}
      aria-hidden="true"
    />
  );
}

export function WalletButton() {
  const {
    address, shortAddress, chainName, lcBalance, isConnecting, isSigning,
    isConnected, isForumAuthenticated, rank, connect, disconnect,
    signForumSession, revokeForumSession, error,
  } = useWallet();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    toast({ title: "Address copied", description: shortAddress ?? "" });
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSign() {
    const ok = await signForumSession();
    if (ok) toast({ title: "Identity verified!", description: "You can now post in wallet-gated categories." });
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-end gap-1">
        <Button
          size="sm"
          variant="outline"
          onClick={connect}
          disabled={isConnecting}
          data-testid="button-connect-wallet"
          className="gap-2"
        >
          {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
          {isConnecting ? "Connecting…" : "Connect Wallet"}
        </Button>
        {error && (
          <p className="text-xs text-destructive flex items-center gap-1 max-w-[200px]">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2" data-testid="button-wallet-menu">
          <div className="relative">
            <WalletAvatar address={address!} />
            {isForumAuthenticated && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border border-background flex items-center justify-center">
                <CheckCircle2 className="w-2 h-2 text-white" />
              </div>
            )}
          </div>
          <span className="font-mono text-xs hidden sm:inline">{shortAddress}</span>
          {isForumAuthenticated && (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 hidden sm:inline" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80" data-testid="dropdown-wallet">
        {/* Identity header */}
        <DropdownMenuLabel className="pb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <WalletAvatar address={address!} size="md" />
              {isForumAuthenticated && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
                  <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-sm font-semibold truncate" data-testid="text-wallet-address">
                {shortAddress}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <Network className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{chainName ?? "Unknown Network"}</span>
              </div>
            </div>
            {isForumAuthenticated ? (
              <Badge className="text-xs gap-1 bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shrink-0">
                <ShieldCheck className="w-3 h-3" /> Verified
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs shrink-0 text-muted-foreground">
                Unverified
              </Badge>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* SIWE sign-in prompt */}
        {!isForumAuthenticated ? (
          <div className="px-2 py-2">
            <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 space-y-2">
              <div className="flex items-start gap-2">
                <ShieldOff className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-amber-300">Identity not verified</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Sign a message to prove wallet ownership and unlock posting in members-only categories.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                className="w-full gap-2 bg-amber-500/20 border border-amber-500/40 text-amber-200 hover:bg-amber-500/30"
                onClick={handleSign}
                disabled={isSigning}
                data-testid="button-sign-in-ethereum"
                variant="outline"
              >
                {isSigning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PenLine className="w-3.5 h-3.5" />}
                {isSigning ? "Waiting for signature…" : "Sign In with Ethereum"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="px-2 py-2">
            <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-emerald-300">Identity verified</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    You can post in all wallet-gated categories.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <DropdownMenuSeparator />

        {/* LC Balance + Rank */}
        <div className="px-2 py-2 space-y-2">
          <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">LC Balance</span>
            </div>
            <span className="text-xs text-muted-foreground italic">Mainnet pending</span>
          </div>

          <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Rank</span>
            </div>
            <Badge className={`text-xs ${RANK_COLORS[rank]}`} data-testid="badge-wallet-rank">
              {rank === "None" ? "Unranked" : rank}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground px-1">
            {RANK_NEXT[rank]}
          </p>
        </div>

        <DropdownMenuSeparator />

        {/* Voting rights */}
        <DropdownMenuItem disabled className="gap-2 opacity-60 cursor-not-allowed">
          <Vote className="w-4 h-4" />
          <span className="text-sm flex-1">Voting Rights</span>
          <Badge variant="outline" className="text-xs">Soon</Badge>
        </DropdownMenuItem>

        {/* Staking */}
        <DropdownMenuItem disabled className="gap-2 opacity-60 cursor-not-allowed">
          <Coins className="w-4 h-4" />
          <span className="text-sm flex-1">Stake LC Tokens</span>
          <Badge variant="outline" className="text-xs">Soon</Badge>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Copy address */}
        <DropdownMenuItem onClick={handleCopy} className="gap-2" data-testid="button-copy-address">
          {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy Address"}
        </DropdownMenuItem>

        {/* Revoke forum session if authenticated */}
        {isForumAuthenticated && (
          <DropdownMenuItem onClick={revokeForumSession} className="gap-2 text-muted-foreground" data-testid="button-revoke-session">
            <ShieldOff className="w-4 h-4" />
            Revoke Forum Session
          </DropdownMenuItem>
        )}

        {/* Disconnect */}
        <DropdownMenuItem onClick={disconnect} className="gap-2 text-destructive focus:text-destructive" data-testid="button-disconnect-wallet">
          <LogOut className="w-4 h-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
