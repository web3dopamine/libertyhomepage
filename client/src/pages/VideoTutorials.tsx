import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { PlayCircle, BookOpen, Code2, Zap, Bell, ArrowRight } from "lucide-react";

const plannedSeries = [
  {
    icon: BookOpen,
    title: "Getting Started",
    description: "Everything you need to go from zero to your first Liberty Chain transaction.",
    episodes: 6,
  },
  {
    icon: Code2,
    title: "Smart Contract Development",
    description: "Deploy Solidity contracts on Liberty Chain — from Hello World to production DeFi.",
    episodes: 8,
  },
  {
    icon: Zap,
    title: "Zero Gas Patterns",
    description: "Design patterns and architectural strategies unique to a zero-fee EVM chain.",
    episodes: 5,
  },
  {
    icon: PlayCircle,
    title: "Building a dApp",
    description: "End-to-end tutorial: build, test, and deploy a full-stack decentralized application.",
    episodes: 10,
  },
];

export default function VideoTutorials() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card flex flex-col">
      <Navigation />

      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-8">

          {/* Hero */}
          <div className="text-center space-y-6 mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-6">
                <PlayCircle className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">VIDEO TUTORIALS</span>
              </div>

              <h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-[0.9]"
                data-testid="heading-video-tutorials"
              >
                Learn Liberty Chain
              </h1>

              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Step-by-step video guides for developers and builders — from your first transaction to shipping production applications.
              </p>
            </motion.div>

            {/* Coming Soon banner */}
            <motion.div
              className="inline-flex flex-col items-center gap-3 px-10 py-8 rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
                </span>
                <Badge variant="secondary" className="text-sm font-bold px-3 py-1">
                  Coming Soon
                </Badge>
              </div>
              <p className="text-base text-muted-foreground max-w-sm text-center">
                Our tutorial series is in production. Subscribe to be notified when the first videos drop.
              </p>
              <Button size="lg" className="group mt-1" asChild>
                <a href="https://discord.gg/libertychain" target="_blank" rel="noopener noreferrer" data-testid="button-video-notify">
                  <Bell className="w-4 h-4 mr-2" />
                  Get Notified on Discord
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
            </motion.div>
          </div>

          {/* Planned series */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-2xl font-black tracking-tight mb-2" data-testid="heading-planned-series">
              Planned Series
            </h2>
            <p className="text-muted-foreground mb-8">
              Here's what we're building for you. More series will be announced as the platform grows.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              {plannedSeries.map((series, index) => (
                <motion.div
                  key={series.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.08 }}
                >
                  <Card className="p-6 h-full flex flex-col gap-4" data-testid={`card-series-${index}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <series.icon className="w-5 h-5 text-primary" />
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {series.episodes} episodes
                      </Badge>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-black mb-2">{series.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {series.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-50" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary/40" />
                      </span>
                      In production
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* In the meantime */}
          <motion.div
            className="mt-16 rounded-2xl border border-border/50 bg-card/50 p-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <h2 className="text-2xl font-black mb-3">In the meantime</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Get started with our written documentation, developer tools, and community Discord while tutorials are being prepared.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/documentation" data-testid="button-video-docs">
                  Read the Documentation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/build" data-testid="button-video-build">
                  Explore Build Resources
                </Link>
              </Button>
            </div>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
