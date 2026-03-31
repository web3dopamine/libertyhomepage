import { Navigation } from "@/components/Navigation";
import { Users, TrendingUp, Shield, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Validators() {
  const [, navigate] = useLocation();

  const validatorStats = [
    { label: "Active Validators", value: "1,247", icon: Users },
    { label: "Network Uptime", value: "99.99%", icon: Shield },
    { label: "Avg Block Time", value: "0.4s", icon: Zap },
    { label: "Total Stake", value: "45.2M LBTC", icon: TrendingUp },
  ];

  const topValidators = [
    { name: "Liberty Foundation", stake: "2.5M LBTC", uptime: "100%", blocks: "45,678" },
    { name: "Decentralized Nodes", stake: "1.8M LBTC", uptime: "99.98%", blocks: "42,134" },
    { name: "Community Validator", stake: "1.5M LBTC", uptime: "99.95%", blocks: "38,921" },
    { name: "Global Stake Pool", stake: "1.2M LBTC", uptime: "99.92%", blocks: "35,567" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <Navigation />
      
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">VALIDATORS</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight" data-testid="heading-validators">
              Network Validators
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              View Liberty validator performance and network analytics.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {validatorStats.map((stat, index) => (
              <Card key={index} className="p-6 text-center hover-elevate transition-all" data-testid={`validator-stat-${index}`}>
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="text-3xl font-black mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </div>

          <Card className="p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Top Validators</h3>
              <Button variant="outline" data-testid="button-become-validator" onClick={() => navigate("/documentation")}>
                Become a Validator
              </Button>
            </div>
            <div className="space-y-4">
              {topValidators.map((validator, index) => (
                <div key={index} className="flex justify-between items-center p-4 rounded-lg hover-elevate transition-all" data-testid={`validator-row-${index}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="font-bold">{validator.name}</div>
                      <div className="text-sm text-muted-foreground">{validator.stake} staked</div>
                    </div>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div>
                      <div className="text-muted-foreground">Uptime</div>
                      <div className="font-semibold">{validator.uptime}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Blocks</div>
                      <div className="font-semibold">{validator.blocks}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
