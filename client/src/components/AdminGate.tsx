import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";

const SESSION_KEY = "lc_admin_auth";
const ADMIN_PASSWORD = "Tester1234";

interface AdminGateProps {
  children: React.ReactNode;
}

export function AdminGate({ children }: AdminGateProps) {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === "1") {
      setAuthed(true);
    }
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setAuthed(true);
      setError(false);
    } else {
      setError(true);
      setPassword("");
    }
  }

  if (authed) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-sm rounded-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Admin Access</h1>
          <p className="text-sm text-muted-foreground">Enter your password to continue.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="admin-password">Password</Label>
            <div className="relative">
              <Input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                placeholder="Enter password"
                autoFocus
                className={error ? "border-destructive pr-10" : "pr-10"}
                data-testid="input-admin-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
                data-testid="button-toggle-password"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <p className="text-xs text-destructive" data-testid="text-password-error">
                Incorrect password. Please try again.
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" data-testid="button-admin-login">
            Unlock Admin
          </Button>
        </form>
      </Card>
    </div>
  );
}
