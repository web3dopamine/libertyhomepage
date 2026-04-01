import { Navigation } from "@/components/Navigation";
import { Bell, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function Announcements() {
  const announcements = [
    {
      title: "Liberty Chain Mainnet Goes Live",
      date: "March 1, 2025",
      category: "Launch",
      content: "We're thrilled to announce that Liberty Chain mainnet is officially live! Experience true decentralization with 10,000+ TPS and zero gas fees."
    },
    {
      title: "210M LBTC Token Distribution Complete",
      date: "February 28, 2025",
      category: "Token",
      content: "The Liberty Chain token distribution to eligible Bitcoin addresses has been completed. Over 50 million BTC addresses received their LBTC allocation."
    },
    {
      title: "Validator Program Now Open",
      date: "February 15, 2025",
      category: "Network",
      content: "Join the Liberty Chain network as a validator. Applications are now open for community members to participate in securing the network."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <Navigation />
      
      <main className="pt-20 sm:pt-32 pb-12 sm:pb-20">
        <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-8">
          <div className="text-center space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
              <Bell className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">ANNOUNCEMENTS</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight" data-testid="heading-announcements">
              Official Announcements
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Stay up to date with the latest news and updates from Liberty Chain.
            </p>
          </div>

          <div className="grid gap-6 max-w-4xl mx-auto">
            {announcements.map((announcement, index) => (
              <Card key={index} className="p-8 hover-elevate active-elevate-2 transition-all" data-testid={`announcement-card-${index}`}>
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-2 flex-1">
                      <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {announcement.category}
                      </div>
                      <h3 className="text-2xl font-bold">{announcement.title}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{announcement.date}</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {announcement.content}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
