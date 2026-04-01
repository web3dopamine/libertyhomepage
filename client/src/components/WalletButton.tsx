import { useState } from "react";
import { useWallet, WalletRank } from "@/contexts/WalletContext";
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const RANK_COLORS: Record<WalletRank, string> = {
  None: "bg-zinc-700 text-zinc-300",
  Bronze: "bg-amber-900 text-amber-300",
  Silver: "bg-slate-600 text-slate-200",
  Gold: "bg-yellow-700 text-yellow-200",
  Platinum: "bg-cyan-800 text-cyan-200",
  Diamond: "bg-violet-700 text-violet-200",
};

const RANK_MIN_LC: Record<WalletRank, string> = {
  None: "0 LC",
  Bronze: "100 LC",
  Silver: "1,000 LC",
  Gold: "10,000 LC",
  Platinum: "100,000 LC",
  Diamond: "1,000,000 LC",
};

function WalletAvatar({ address }: { address: string }) {
  // Deterministic color from address
  const hue = parseInt(address.slice(2, 6), 16) % 360;
  const hue2 = parseInt(address.slice(6, 10), 16) % 360;
  return (
    <div
      className="w-7 h-7 rounded-full flex-shrink-0 border border-border"
      style={{
        background: `linear-gradient(135deg, hsl(${hue},70%,45%), hsl(${hue2},80%,35%))`,
      }}
      aria-hidden="true"
    />
  );
}

export function WalletButton() {
  const { address, shortAddress, chainName, lcBalance, isConnecting, isConnected, rank, connect, disconnect, error } = useWallet();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    toast({ title: "Address copied", description: shortAddress ?? "" });
    setTimeout(() => setCopied(false), 2000);
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
          {isConnecting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Wallet className="w-4 h-4" />
          )}
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
        <Button
          size="sm"
          variant="outline"
          className="gap-2"
          data-testid="button-wallet-menu"
        >
          <WalletAvatar address={address!} />
          <span className="font-mono text-xs hidden sm:inline">{shortAddress}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72" data-testid="dropdown-wallet">
        {/* Identity header */}
        <DropdownMenuLabel className="pb-2">
          <div className="flex items-center gap-3">
            <WalletAvatar address={address!} />
            <div className="min-w-0">
              <p className="font-mono text-sm font-semibold truncate" data-testid="text-wallet-address">
                {shortAddress}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <Network className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{chainName ?? "Unknown Network"}</span>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* LC Balance */}
        <div className="px-2 py-2 space-y-2">
          <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">LC Balance</span>
            </div>
            <div className="text-right">
              {lcBalance === "0" ? (
                <span className="text-xs text-muted-foreground italic">Mainnet not yet launched</span>
              ) : (
                <span className="text-sm font-bold font-mono" data-testid="text-lc-balance">
                  {Number(lcBalance).toLocaleString()} LC
                </span>
              )}
            </div>
          </div>

          {/* Rank */}
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
            Rankings are based on LC token holdings. Hold {RANK_MIN_LC[
              rank === "None" ? "Bronze" :
              rank === "Bronze" ? "Silver" :
              rank === "Silver" ? "Gold" :
              rank === "Gold" ? "Platinum" :
              rank === "Platinum" ? "Diamond" : "Diamond"
            ]} to reach the next tier.
          </p>
        </div>

        <DropdownMenuSeparator />

        {/* Voting rights */}
        <DropdownMenuItem disabled className="gap-2 opacity-70 cursor-not-allowed">
          <Vote className="w-4 h-4" />
          <div className="flex-1">
            <span className="text-sm">Voting Rights</span>
          </div>
          <Badge variant="outline" className="text-xs">Soon</Badge>
        </DropdownMenuItem>

        {/* Staking */}
        <DropdownMenuItem disabled className="gap-2 opacity-70 cursor-not-allowed">
          <Coins className="w-4 h-4" />
          <div className="flex-1">
            <span className="text-sm">Stake LC Tokens</span>
          </div>
          <Badge variant="outline" className="text-xs">Soon</Badge>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Copy address */}
        <DropdownMenuItem onClick={handleCopy} className="gap-2" data-testid="button-copy-address">
          {copied ? (
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          {copied ? "Copied!" : "Copy Address"}
        </DropdownMenuItem>

        {/* Disconnect */}
        <DropdownMenuItem
          onClick={disconnect}
          className="gap-2 text-destructive focus:text-destructive"
          data-testid="button-disconnect-wallet"
        >
          <LogOut className="w-4 h-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
