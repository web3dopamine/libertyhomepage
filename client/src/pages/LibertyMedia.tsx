import { Navigation } from "@/components/Navigation";
import { Newspaper, Video, Mic, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function LibertyMedia() {
  const mediaItems = [
    {
      type: "Blog Post",
      title: "The Future of Decentralized Finance on Liberty",
      description: "Exploring how Liberty Chain's unique architecture enables a new generation of DeFi applications.",
      icon: FileText,
      date: "March 1, 2025"
    },
    {
      type: "Video",
      title: "Liberty Chain: Technical Deep Dive",
      description: "Watch our CTO explain the technical innovations behind Liberty's 10,000+ TPS performance.",
      icon: Video,
      date: "February 28, 2025"
    },
    {
      type: "Podcast",
      title: "Building the Future with Liberty Chain",
      description: "Interview with the Liberty Foundation team about the vision for true blockchain liberty.",
      icon: Mic,
      date: "February 25, 2025"
    },
    {
      type: "Article",
      title: "Zero Gas Fees: How Liberty Makes it Possible",
      description: "An in-depth look at Liberty's innovative approach to transaction costs.",
      icon: Newspaper,
      date: "February 20, 2025"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <Navigation />
      
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
              <Newspaper className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">MEDIA</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight" data-testid="heading-media">
              Liberty Media Hub
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore featured blogs, video highlights, interviews and announcements from Liberty.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {mediaItems.map((item, index) => (
              <Card key={index} className="p-8 hover-elevate active-elevate-2 transition-all" data-testid={`media-card-${index}`}>
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {item.type}
                  </div>
                  <h3 className="text-2xl font-bold">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between pt-4">
                    <span className="text-sm text-muted-foreground">{item.date}</span>
                    <Button variant="ghost" className="group" data-testid={`button-read-${index}`}>
                      Read More
                      <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
