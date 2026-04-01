import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/contexts/WalletContext";
import { useForumProfile } from "@/contexts/ForumProfileContext";
import { Wallet, User, Shield, Loader2, CheckCircle2, XCircle, ArrowRight, Lock } from "lucide-react";

function UsernameAvailability({ username, address }: { username: string; address: string }) {
  const [status, setStatus] = useState<{ available: boolean; reason: string | null } | null>(null);
  const [checking, setChecking] = useState(false);

  const check = useCallback(async (name: string) => {
    if (!name || name.length < 3) { setStatus(null); return; }
    setChecking(true);
    try {
      const res = await fetch(`/api/forum/check-username/${encodeURIComponent(name)}?exclude=${encodeURIComponent(address)}`);
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus(null);
    } finally {
      setChecking(false);
    }
  }, [address]);

  if (!username || username.length < 3) return null;

  return (
    <div className="flex items-center gap-1.5 mt-1">
      {checking ? (
        <><Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" /><span className="text-xs text-muted-foreground">Checking...</span></>
      ) : status === null ? null : status.available ? (
        <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /><span className="text-xs text-emerald-500">Available</span></>
      ) : (
        <><XCircle className="w-3.5 h-3.5 text-destructive" /><span className="text-xs text-destructive">{status.reason}</span></>
      )}
    </div>
  );
}

export function ForumGate({ children }: { children: React.ReactNode }) {
  const { isConnected, shortAddress, address, connect } = useWallet();
  const { profile, isLoading, hasProfile, registerProfile } = useForumProfile();

  const [displayMode, setDisplayMode] = useState<"username" | "wallet">("wallet");
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [availStatus, setAvailStatus] = useState<{ available: boolean; reason: string | null } | null>(null);
  const [checkingAvail, setCheckingAvail] = useState(false);

  // Pass through if authenticated and has profile
  if (isConnected && !isLoading && hasProfile) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleConnect = async () => {
    setIsConnecting(true);
    try { await connect(); } catch {}
    finally { setIsConnecting(false); }
  };

  const handleUsernameChange = async (val: string) => {
    setUsername(val);
    setUsernameError("");
    setAvailStatus(null);
    if (!val || val.length < 3) return;
    if (!/^[a-zA-Z0-9_-]+$/.test(val)) {
      setUsernameError("Only letters, numbers, _ and - allowed");
      return;
    }
    if (val.length > 20) {
      setUsernameError("Max 20 characters");
      return;
    }
    setCheckingAvail(true);
    try {
      const res = await fetch(`/api/forum/check-username/${encodeURIComponent(val)}?exclude=${encodeURIComponent(address ?? "")}`);
      const data = await res.json();
      setAvailStatus(data);
    } catch {}
    finally { setCheckingAvail(false); }
  };

  const handleRegister = async () => {
    if (displayMode === "username") {
      if (!username || username.length < 3) { setUsernameError("Username must be at least 3 characters"); return; }
      if (!/^[a-zA-Z0-9_-]+$/.test(username)) { setUsernameError("Only letters, numbers, _ and - allowed"); return; }
      if (availStatus && !availStatus.available) { setUsernameError(availStatus.reason ?? "Username taken"); return; }
    }
    setIsRegistering(true);
    try {
      await registerProfile({
        username: displayMode === "username" ? username : "",
        displayMode,
      });
    } catch {}
    finally { setIsRegistering(false); }
  };

  const previewName = displayMode === "username" && username ? username : (shortAddress ?? "0x????...????");
  const canJoin = displayMode === "wallet" || (username.length >= 3 && !usernameError && (availStatus?.available ?? false));

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16">
      {/* Brand header */}
      <div className="mb-10 flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Lock className="w-7 h-7 text-primary" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Liberty Chain Forum</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {!isConnected ? "Exclusive access for wallet holders" : "Set up your forum identity"}
          </p>
        </div>
      </div>

      <div className="w-full max-w-md">
        {/* Step indicators */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className={`flex items-center gap-2 text-sm font-medium ${isConnected ? "text-emerald-500" : "text-foreground"}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${isConnected ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-500" : "bg-primary/20 border-primary/40 text-primary"}`}>
              {isConnected ? <CheckCircle2 className="w-3.5 h-3.5" /> : "1"}
            </div>
            Connect Wallet
          </div>
          <div className="w-8 h-px bg-border" />
          <div className={`flex items-center gap-2 text-sm font-medium ${isConnected && hasProfile ? "text-emerald-500" : isConnected ? "text-foreground" : "text-muted-foreground"}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${isConnected ? "bg-primary/20 border-primary/40 text-primary" : "border-border text-muted-foreground"}`}>
              2
            </div>
            Choose Identity
          </div>
        </div>

        {/* Step 1: Connect wallet */}
        {!isConnected && (
          <div className="rounded-xl border border-border bg-card p-6 space-y-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-base font-semibold">
                <Wallet className="w-4 h-4 text-primary" />
                Connect your MetaMask wallet
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The Liberty Chain Forum is exclusively accessible to wallet holders. Connect your MetaMask wallet to verify ownership and gain access to all community discussions.
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                { icon: Shield, text: "Your wallet address serves as your identity" },
                { icon: User, text: "Choose a username or stay pseudonymous" },
                { icon: CheckCircle2, text: "One wallet — one account, permanent access" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <Icon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  {text}
                </div>
              ))}
            </div>

            <Button
              className="w-full gap-2"
              size="lg"
              onClick={handleConnect}
              disabled={isConnecting}
              data-testid="button-connect-wallet-gate"
            >
              {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
              {isConnecting ? "Connecting…" : "Connect MetaMask"}
            </Button>
          </div>
        )}

        {/* Step 2: Profile setup */}
        {isConnected && !hasProfile && (
          <div className="rounded-xl border border-border bg-card p-6 space-y-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-base font-semibold">
                <User className="w-4 h-4 text-primary" />
                Set up your forum identity
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Connected: <span className="font-mono">{shortAddress}</span>
              </div>
            </div>

            {/* Display mode toggle */}
            <div className="space-y-2">
              <p className="text-sm font-medium">How should others see you?</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDisplayMode("wallet")}
                  data-testid="button-mode-wallet"
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-colors ${
                    displayMode === "wallet"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover-elevate"
                  }`}
                >
                  <Wallet className="w-4 h-4" />
                  Wallet Address
                  <span className="font-mono text-[10px] opacity-70">{shortAddress}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayMode("username")}
                  data-testid="button-mode-username"
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-colors ${
                    displayMode === "username"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover-elevate"
                  }`}
                >
                  <User className="w-4 h-4" />
                  Username
                  <span className="text-[10px] opacity-70">Choose your name</span>
                </button>
              </div>
            </div>

            {/* Username input */}
            {displayMode === "username" && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="forum-username">Username</label>
                <Input
                  id="forum-username"
                  placeholder="e.g. crypto_dev_42"
                  value={username}
                  onChange={e => handleUsernameChange(e.target.value)}
                  className="font-mono"
                  data-testid="input-forum-username"
                  maxLength={20}
                />
                <div className="flex items-center gap-1.5 min-h-4">
                  {usernameError ? (
                    <><XCircle className="w-3.5 h-3.5 text-destructive" /><span className="text-xs text-destructive">{usernameError}</span></>
                  ) : checkingAvail ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" /><span className="text-xs text-muted-foreground">Checking…</span></>
                  ) : availStatus !== null ? (
                    availStatus.available
                      ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /><span className="text-xs text-emerald-500">Available</span></>
                      : <><XCircle className="w-3.5 h-3.5 text-destructive" /><span className="text-xs text-destructive">{availStatus.reason}</span></>
                  ) : username.length > 0 && username.length < 3 ? (
                    <span className="text-xs text-muted-foreground">At least 3 characters</span>
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">3–20 characters, letters / numbers / _ / - only. Can be changed later.</p>
              </div>
            )}

            {/* Preview */}
            <div className="rounded-md bg-muted/30 border border-border p-3">
              <p className="text-xs text-muted-foreground mb-1.5">Preview — how you will appear:</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                  {previewName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold">{previewName}</p>
                  {displayMode === "wallet" && (
                    <Badge className="text-[10px] gap-1 px-1.5 py-0 bg-primary/15 text-primary border-primary/30 mt-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <Button
              className="w-full gap-2"
              size="lg"
              onClick={handleRegister}
              disabled={isRegistering || (displayMode === "username" && !canJoin)}
              data-testid="button-join-forum"
            >
              {isRegistering ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {isRegistering ? "Setting up…" : "Join the Forum"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
