import { Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wallet, User, MessageSquare, Shield, CheckCircle2,
  ArrowRight, ExternalLink, ChevronLeft, Download,
  UserCircle, PenLine, ThumbsUp, Pin, Tag, Search
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Download,
    title: "Install MetaMask",
    description: "MetaMask is a free browser extension (or mobile app) that acts as your crypto wallet. You don't need any funds — it's just used to verify your identity.",
    action: {
      label: "Get MetaMask",
      href: "https://metamask.io/download/",
      external: true,
    },
    notes: [
      "Available for Chrome, Firefox, Brave, Edge, and mobile",
      "Takes about 2 minutes to install and set up",
      "You'll create a 12-word recovery phrase — keep it safe",
      "No crypto required to join the forum",
    ],
  },
  {
    number: "02",
    icon: Wallet,
    title: "Visit the Forum & Connect",
    description: "Head to the Liberty Chain Forum. You'll be greeted by the access screen — click 'Connect MetaMask' and approve the connection request in the MetaMask pop-up.",
    action: {
      label: "Go to Forum",
      href: "/forum",
      external: false,
    },
    notes: [
      "MetaMask will ask you to select an account — choose any account",
      "The forum only reads your wallet address, nothing else",
      "No transaction is signed — it's free and instant",
    ],
  },
  {
    number: "03",
    icon: UserCircle,
    title: "Choose Your Identity",
    description: "Once connected you'll set up your forum profile. Pick how you want to appear to the community:",
    action: null,
    notes: [],
    options: [
      {
        icon: User,
        label: "Username",
        detail: "Choose a custom handle like \"crypto_dev_42\". 3–20 characters, letters/numbers/underscore/hyphen.",
      },
      {
        icon: Wallet,
        label: "Wallet Address",
        detail: "Stay pseudonymous. Your shortened address (e.g. 0x1a2b…3c4d) will be your display name.",
      },
    ],
  },
  {
    number: "04",
    icon: PenLine,
    title: "Start Posting",
    description: "You're in! Browse categories, read threads, and post your first reply or create a new topic. All posts support Markdown formatting.",
    action: null,
    notes: [
      "Create a new topic from any category page",
      "Reply to existing topics by scrolling to the bottom",
      "Like posts with the heart button",
      "Your wallet provides a 'Verified' badge on your posts",
    ],
  },
];

const features = [
  { icon: Shield, label: "Wallet Verified", detail: "Every post is linked to a real wallet address, keeping the community spam-free." },
  { icon: Tag, label: "Markdown Support", detail: "Format your posts with bold, italic, code blocks, lists, links, and more." },
  { icon: ThumbsUp, label: "Likes & Solved", detail: "Upvote helpful replies. Topic authors can mark the best answer as solved." },
  { icon: Pin, label: "Pinned Topics", detail: "Important announcements and guides are pinned by the Liberty Foundation team." },
  { icon: Search, label: "Full Search", detail: "Search across all topics and posts instantly from the forum homepage." },
  { icon: MessageSquare, label: "Categories", detail: "Discussions, Governance, Ecosystem, Support — organised by topic area." },
];

const faqs = [
  {
    q: "Do I need any cryptocurrency to join?",
    a: "No. Your MetaMask wallet just proves you have an address. You don't need to hold any tokens or pay any fees to read or post in the forum.",
  },
  {
    q: "Can I change my username later?",
    a: "Yes. Your profile settings (coming soon) will let you update your display name at any time. Old posts will keep the name they were posted under.",
  },
  {
    q: "Is my email address required?",
    a: "No. The forum uses your wallet address as your identity. No email, phone number, or personal information is required.",
  },
  {
    q: "What is a \"Wallet Verified\" badge?",
    a: "Posts from wallet-connected users show a Verified badge, letting other members know the post came from a real wallet holder — not an anonymous account.",
  },
  {
    q: "Can I use MetaMask Mobile?",
    a: "Yes. The MetaMask mobile app includes a built-in browser. Open the Liberty Chain website from within that browser and the connection flow works the same way.",
  },
  {
    q: "What if I don't want to use MetaMask?",
    a: "MetaMask is the only wallet currently supported. Support for WalletConnect and other providers is planned for a future update.",
  },
];

export default function ForumGuide() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-3xl 2xl:max-w-4xl mx-auto px-4 sm:px-8 pt-24 sm:pt-32 pb-20">

        {/* Back link */}
        <Link href="/forum">
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8" data-testid="link-back-to-forum">
            <ChevronLeft className="w-4 h-4" />
            Back to Forum
          </button>
        </Link>

        {/* Header */}
        <div className="mb-12">
          <Badge className="mb-4 text-xs bg-primary/15 text-primary border-primary/30">Guide</Badge>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">How to Join &amp; Post in the Forum</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            The Liberty Chain Forum is open to all wallet holders. This guide walks you through everything — from installing MetaMask to posting your first reply. No crypto needed, just a wallet address.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-8 mb-16">
          {steps.map((step, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-6 sm:p-7" data-testid={`step-${step.number}`}>
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <step.icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-primary/60 font-mono">STEP {step.number}</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold mb-2">{step.title}</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">{step.description}</p>

                  {/* Identity options */}
                  {step.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      {step.options.map(opt => (
                        <div key={opt.label} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                          <opt.icon className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold">{opt.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{opt.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Bullet notes */}
                  {step.notes.length > 0 && (
                    <ul className="space-y-1.5 mb-4">
                      {step.notes.map(note => (
                        <li key={note} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary/60 flex-shrink-0 mt-0.5" />
                          {note}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Action button */}
                  {step.action && (
                    step.action.external ? (
                      <a href={step.action.href} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="gap-2" data-testid={`button-step-${step.number}`}>
                          {step.action.label}
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </a>
                    ) : (
                      <Link href={step.action.href}>
                        <Button size="sm" className="gap-2" data-testid={`button-step-${step.number}`}>
                          {step.action.label}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Forum features */}
        <div className="mb-16">
          <h2 className="text-xl font-bold mb-6">What you can do in the Forum</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map(f => (
              <div key={f.label} className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card">
                <f.icon className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold">{f.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{f.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="text-xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-lg border border-border p-5">
                <p className="font-semibold mb-2 text-sm">{faq.q}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-5 justify-between">
          <div>
            <h3 className="font-bold text-lg mb-1">Ready to join?</h3>
            <p className="text-sm text-muted-foreground">Connect your wallet and become a Liberty Chain community member.</p>
          </div>
          <Link href="/forum">
            <Button size="lg" className="gap-2 flex-shrink-0" data-testid="button-cta-join-forum">
              <Wallet className="w-4 h-4" />
              Join the Forum
            </Button>
          </Link>
        </div>

      </div>
      <Footer />
    </div>
  );
}
