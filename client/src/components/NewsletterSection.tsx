import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { CalloutBadge } from "./CalloutBadge";
import { SplitText } from "./SplitText";

export function NewsletterSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setState("loading");
    setErrorMsg("");
    try {
      const res = await apiRequest("POST", "/api/newsletter", { name: name.trim(), email: email.trim() });
      if (!res.ok) {
        const data = await res.json();
        setErrorMsg(data.error || "Something went wrong. Please try again.");
        setState("error");
      } else {
        setState("success");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setState("error");
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px]" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-8 text-center relative z-10">
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex justify-center">
            <CalloutBadge text="Stay Updated" size="lg" data-testid="badge-newsletter" />
          </div>

          <div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[0.9] tracking-tighter" data-testid="text-newsletter-title">
              <SplitText type="words">Never Miss a</SplitText>
              <br />
              <span className="gradient-text">Liberty Update</span>
            </h2>
            <p className="mt-6 text-base sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed" data-testid="text-newsletter-subtitle">
              Get the latest news on network upgrades, ecosystem launches, developer events, and community milestones — delivered straight to your inbox.
            </p>
          </div>

          {state === "success" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 py-8"
              data-testid="newsletter-success"
            >
              <CheckCircle2 className="w-16 h-16 text-primary" />
              <div>
                <p className="text-2xl font-black text-foreground">You're subscribed!</p>
                <p className="text-muted-foreground mt-1">Welcome to the Liberty Chain community, {name}.</p>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-newsletter">
              <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
                <Input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 h-12 bg-background/60 backdrop-blur-sm border-border/60 text-base"
                  required
                  data-testid="input-newsletter-name"
                />
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 h-12 bg-background/60 backdrop-blur-sm border-border/60 text-base"
                  required
                  data-testid="input-newsletter-email"
                />
              </div>

              {state === "error" && (
                <p className="text-sm text-destructive" data-testid="newsletter-error">{errorMsg}</p>
              )}

              <Button
                type="submit"
                size="lg"
                className="group h-12 px-8 text-base"
                disabled={state === "loading"}
                data-testid="button-newsletter-submit"
              >
                <Mail className="mr-2 h-5 w-5" />
                {state === "loading" ? "Subscribing..." : "Subscribe to Newsletter"}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <p className="text-xs text-muted-foreground">
                No spam, ever. Unsubscribe at any time.
              </p>
            </form>
          )}

          {/* Floating email icons decoration */}
          <div className="absolute -left-8 top-1/2 opacity-10 pointer-events-none hidden lg:block">
            <Mail className="w-24 h-24 text-primary rotate-12" />
          </div>
          <div className="absolute -right-8 bottom-1/4 opacity-10 pointer-events-none hidden lg:block">
            <Mail className="w-16 h-16 text-primary -rotate-12" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
