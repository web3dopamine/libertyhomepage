import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  insertNodeApplicationSchema,
  nodeTypeValues,
  nodeHardwareValues,
  nodeBandwidthValues,
  nodeExperienceValues,
} from "@shared/schema";
import type { InsertNodeApplication } from "@shared/schema";
import {
  Server,
  CheckCircle2,
  Cpu,
  Wifi,
  HardDrive,
  Shield,
  Globe,
  Twitter,
  MessageSquare,
  Zap,
  Lock,
  Activity,
  Award,
} from "lucide-react";

const PERKS = [
  { icon: Award, title: "Early Access", desc: "Be among the first to run a Liberty Chain node before public launch" },
  { icon: Zap, title: "Staking Rewards", desc: "Earn LC tokens for maintaining uptime and validating transactions" },
  { icon: Lock, title: "Network Security", desc: "Help secure the most decentralized EVM chain on the market" },
  { icon: Activity, title: "Priority Support", desc: "Dedicated Discord channel and technical support from the core team" },
];

export default function RunANode() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<InsertNodeApplication>({
    resolver: zodResolver(insertNodeApplicationSchema),
    defaultValues: {
      name: "", email: "", country: "", nodeType: "",
      hardware: "", bandwidth: "", experience: "",
      storageGb: "", ramGb: "", uptime: "",
      twitter: "", telegram: "", discord: "", motivation: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: InsertNodeApplication) =>
      apiRequest("POST", "/api/node-applications", data),
    onSuccess: () => setSubmitted(true),
    onError: async (err: any) => {
      let msg = "Something went wrong. Please try again.";
      try {
        const res = err?.response ?? err;
        const data = typeof res?.json === "function" ? await res.json() : null;
        if (data?.error) msg = typeof data.error === "string" ? data.error : "Validation error — check your fields.";
      } catch {}
      toast({ title: "Application failed", description: msg, variant: "destructive" });
    },
  });

  if (submitted) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">Application Received</h1>
          <p className="text-muted-foreground text-lg max-w-md">
            Thanks for applying to run a Liberty Chain node. We'll review your application and reach out via email.
          </p>
          <div className="flex flex-wrap gap-3 mt-8 justify-center">
            <Button asChild variant="outline">
              <a href="/">Back to Home</a>
            </Button>
            <Button asChild>
              <a href="/forum">Join the Community</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="relative max-w-4xl mx-auto text-center">
          <Badge variant="outline" className="mb-6 gap-2 text-primary border-primary/30 px-4 py-1.5">
            <Server className="w-4 h-4" /> Node Runner Program
          </Badge>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-none mb-6">
            Run a{" "}
            <span className="gradient-text">Liberty Chain</span>{" "}
            Node
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Help power the most decentralized EVM blockchain. Apply to become a node operator — earn staking rewards, secure the network, and be part of the founding infrastructure.
          </p>
        </div>
      </section>

      {/* Perks */}
      <section className="pb-16 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PERKS.map((perk) => (
            <div key={perk.title} className="rounded-xl border border-border bg-card p-5">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <perk.icon className="w-4.5 h-4.5 text-primary" />
              </div>
              <h3 className="font-bold text-sm mb-1">{perk.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{perk.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Form */}
      <section className="pb-24 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl border border-border bg-card p-8 sm:p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Server className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight">Node Runner Application</h2>
                <p className="text-sm text-muted-foreground">All fields marked * are required.</p>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">

                {/* ── Identity ───────────────────────────────── */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5" /> Identity
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Satoshi Nakamoto" {...field} data-testid="input-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@example.com" {...field} data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="mt-4">
                    <FormField control={form.control} name="country" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. United States, Germany, Singapore..." {...field} data-testid="input-country" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                {/* ── Node Setup ─────────────────────────────── */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                    <Server className="w-3.5 h-3.5" /> Node Setup
                  </p>
                  <div className="space-y-4">
                    <FormField control={form.control} name="nodeType" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Node Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-node-type">
                              <SelectValue placeholder="Select the type of node you want to run" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {nodeTypeValues.map((v) => (
                              <SelectItem key={v} value={v}>{v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="hardware" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" /> Hardware Setup *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-hardware">
                              <SelectValue placeholder="Select your hardware environment" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {nodeHardwareValues.map((v) => (
                              <SelectItem key={v} value={v}>{v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="bandwidth" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5"><Wifi className="w-3.5 h-3.5" /> Available Bandwidth *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-bandwidth">
                              <SelectValue placeholder="Select your connection speed" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {nodeBandwidthValues.map((v) => (
                              <SelectItem key={v} value={v}>{v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="grid grid-cols-3 gap-4">
                      <FormField control={form.control} name="storageGb" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1.5"><HardDrive className="w-3.5 h-3.5" /> Storage (GB)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="500" {...field} data-testid="input-storage" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="ramGb" render={({ field }) => (
                        <FormItem>
                          <FormLabel>RAM (GB)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="16" {...field} data-testid="input-ram" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="uptime" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Uptime % Target</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="99" min="0" max="100" {...field} data-testid="input-uptime" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>
                </div>

                {/* ── Experience ─────────────────────────────── */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5" /> Experience
                  </p>
                  <FormField control={form.control} name="experience" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Node Operator Experience *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-experience">
                            <SelectValue placeholder="Select your experience level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {nodeExperienceValues.map((v) => (
                            <SelectItem key={v} value={v}>{v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                {/* ── Social & Community ─────────────────────── */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                    <Twitter className="w-3.5 h-3.5" /> Socials (optional)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormField control={form.control} name="twitter" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5"><Twitter className="w-3.5 h-3.5" />Twitter / X</FormLabel>
                        <FormControl>
                          <Input placeholder="@handle" {...field} data-testid="input-twitter" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="telegram" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" />Telegram</FormLabel>
                        <FormControl>
                          <Input placeholder="@handle" {...field} data-testid="input-telegram" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="discord" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" />Discord</FormLabel>
                        <FormControl>
                          <Input placeholder="username#0000" {...field} data-testid="input-discord" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                {/* ── Motivation ─────────────────────────────── */}
                <FormField control={form.control} name="motivation" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Why do you want to run a Liberty Chain node?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us why you're interested, any relevant background, or why you believe in the Liberty Chain vision..."
                        className="resize-none"
                        rows={4}
                        {...field}
                        data-testid="textarea-motivation"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full text-base font-bold"
                  disabled={mutation.isPending}
                  data-testid="button-submit"
                >
                  {mutation.isPending ? "Submitting…" : "Submit Application"}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By applying you agree to be contacted about the Liberty Chain node program. We do not share your details with third parties.
                </p>
              </form>
            </Form>
          </div>
        </div>
      </section>
    </div>
  );
}
