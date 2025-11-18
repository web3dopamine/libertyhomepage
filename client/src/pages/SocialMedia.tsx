import { Navigation } from "@/components/Navigation";
import { Share2 } from "lucide-react";
import { SiX, SiGithub, SiDiscord, SiTelegram, SiYoutube, SiMedium } from "react-icons/si";
import { Card } from "@/components/ui/card";

export default function SocialMedia() {
  const socialPlatforms = [
    {
      name: "X (Twitter)",
      handle: "@LibertyChain",
      description: "Follow us for real-time updates, community highlights, and ecosystem news.",
      icon: SiX,
      link: "https://twitter.com/libertychain",
      color: "text-foreground"
    },
    {
      name: "Discord",
      handle: "Liberty Community",
      description: "Join our Discord server for community discussions, support, and collaboration.",
      icon: SiDiscord,
      link: "https://discord.gg/libertychain",
      color: "text-[#5865F2]"
    },
    {
      name: "GitHub",
      handle: "liberty-chain",
      description: "Explore our open-source repositories and contribute to the ecosystem.",
      icon: SiGithub,
      link: "https://github.com/liberty-chain",
      color: "text-foreground"
    },
    {
      name: "Telegram",
      handle: "LibertyChainOfficial",
      description: "Join our Telegram channel for instant updates and community chat.",
      icon: SiTelegram,
      link: "https://t.me/libertychain",
      color: "text-[#0088cc]"
    },
    {
      name: "YouTube",
      handle: "Liberty Chain",
      description: "Watch tutorials, technical deep dives, and community updates.",
      icon: SiYoutube,
      link: "https://youtube.com/@libertychain",
      color: "text-[#FF0000]"
    },
    {
      name: "Medium",
      handle: "@libertychain",
      description: "Read our latest blog posts, technical articles, and ecosystem updates.",
      icon: SiMedium,
      link: "https://medium.com/@libertychain",
      color: "text-foreground"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <Navigation />
      
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
              <Share2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">SOCIAL MEDIA</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight" data-testid="heading-social">
              Connect With Us
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Follow Liberty Chain across all platforms for updates, community highlights, and ecosystem news.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {socialPlatforms.map((platform, index) => (
              <a
                key={index}
                href={platform.link}
                target="_blank"
                rel="noopener noreferrer"
                data-testid={`social-card-${index}`}
              >
                <Card className="p-8 h-full hover-elevate active-elevate-2 transition-all cursor-pointer">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <platform.icon className={`w-6 h-6 ${platform.color}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1">{platform.name}</h3>
                      <p className="text-sm text-primary font-mono">{platform.handle}</p>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {platform.description}
                    </p>
                  </div>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
