import { Navigation } from "@/components/Navigation";
import { Search, Activity, Blocks, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function BlockExplorer() {
  const stats = [
    { label: "Latest Block", value: "1,234,567", icon: Blocks },
    { label: "Transactions", value: "45.2M", icon: Activity },
    { label: "Active Addresses", value: "892K", icon: Wallet },
    { label: "TPS", value: "10,000+", icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <Navigation />
      
      <main className="pt-20 sm:pt-32 pb-12 sm:pb-20">
        <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-8">
          <div className="text-center space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
              <Search className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">EXPLORER</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight" data-testid="heading-explorer">
              Liberty Block Explorer
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore transactions, blocks, and addresses on the Liberty blockchain.
            </p>
          </div>

          <div className="max-w-3xl mx-auto mb-12">
            <div className="flex gap-4">
              <Input 
                placeholder="Search by address, transaction hash, or block number..." 
                className="h-12 text-base"
                data-testid="input-search"
              />
              <Button size="lg" data-testid="button-search">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => (
              <Card key={index} className="p-6 text-center hover-elevate transition-all" data-testid={`stat-card-${index}`}>
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="text-3xl font-black mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </div>

          <Card className="p-8">
            <h3 className="text-2xl font-bold mb-6">Recent Blocks</h3>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((_, index) => (
                <div key={index} className="flex justify-between items-center p-4 rounded-lg hover-elevate transition-all" data-testid={`block-row-${index}`}>
                  <div className="flex items-center gap-4">
                    <Blocks className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-bold">Block #{1234567 - index}</div>
                      <div className="text-sm text-muted-foreground">{Math.floor(Math.random() * 1000)} transactions</div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">{index + 1} seconds ago</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
