import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import logoImage from "@assets/Asset 6_1763440187916.png";
import { Rocket, Calendar, Bell, Search, Newspaper, Users, Building2, FileText, Code, Wrench, Heart, Share2, MessageSquare, Palette } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const exploreItems = [
  {
    title: "Events",
    href: "/events",
    description: "Discover upcoming events and community gatherings.",
    icon: Calendar,
  },
  {
    title: "Announcements",
    href: "/announcements",
    description: "Stay up to date with the latest official announcements.",
    icon: Bell,
  },
  {
    title: "Block Explorer",
    href: "/block-explorer",
    description: "Explore the Liberty blockchain with the block explorer.",
    icon: Search,
  },
  {
    title: "Liberty Media",
    href: "/liberty-media",
    description: "Explore featured blogs, video highlights, interviews and announcements from Liberty.",
    icon: Newspaper,
  },
  {
    title: "Validators",
    href: "/validators",
    description: "View Liberty validator performance and network analytics.",
    icon: Users,
  },
  {
    title: "Institutions",
    href: "/institutions",
    description: "Learn about blockchain solutions designed for institutional adoption and enterprise needs.",
    icon: Building2,
  },
];

const buildItems = [
  {
    title: "Build",
    href: "/build",
    description: "Explore programs, resources, and a world-class community for founders and developers building on Liberty.",
    icon: Code,
  },
  {
    title: "Documentation",
    href: "/documentation",
    description: "Learn how to write smart contracts on Liberty.",
    icon: FileText,
  },
  {
    title: "Developer Tools",
    href: "/developer-tools",
    description: "Explore our directory of tools and services used to build on Liberty.",
    icon: Wrench,
  },
];

const resourcesItems = [
  {
    title: "Liberty Foundation",
    href: "/liberty-foundation",
    description: "Learn about the foundation supporting the growth and adoption of Liberty.",
    icon: Heart,
  },
  {
    title: "Social Media",
    href: "/social-media",
    description: "Follow us on social media for real-time updates, community highlights, and ecosystem news.",
    icon: Share2,
  },
  {
    title: "Community",
    href: "/community",
    description: "Join our vibrant community for discussions, support, and collaboration.",
    icon: MessageSquare,
  },
  {
    title: "Branding & Media Kit",
    href: "/branding-media-kit",
    description: "Official logos, brand guidelines, and media resources for the Liberty ecosystem.",
    icon: Palette,
  },
];

export function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/20 bg-gradient-to-b from-background via-background/98 to-background/95 backdrop-blur-2xl shadow-2xl shadow-primary/10">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="hover-elevate active-elevate-2 rounded-xl px-4 py-2 -ml-4 cursor-pointer transition-all duration-500 ease-out" data-testid="logo-main">
            <Link href="/" data-testid="link-home" className="block">
              <img src={logoImage} alt="Liberty Chain" className="h-12 w-auto" />
            </Link>
          </div>

          {/* Navigation Menu */}
          <div className="hidden md:flex items-center gap-2">
            <NavigationMenu>
              <NavigationMenuList>
                {/* HOME */}
                <NavigationMenuItem>
                  <Link href="/">
                    <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "text-base font-semibold")} data-testid="link-nav-home">
                      HOME
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                {/* EXPLORE Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-base font-semibold" data-testid="nav-trigger-explore">
                    EXPLORE
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[500px] gap-3 p-6 md:grid-cols-2" data-testid="nav-content-explore">
                      {exploreItems.map((item) => (
                        <ListItem
                          key={item.title}
                          title={item.title}
                          href={item.href}
                          icon={item.icon}
                        >
                          {item.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* BUILD Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-base font-semibold" data-testid="nav-trigger-build">
                    BUILD
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[500px] gap-3 p-6 md:grid-cols-2" data-testid="nav-content-build">
                      {buildItems.map((item) => (
                        <ListItem
                          key={item.title}
                          title={item.title}
                          href={item.href}
                          icon={item.icon}
                        >
                          {item.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* RESOURCES Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-base font-semibold" data-testid="nav-trigger-resources">
                    RESOURCES
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[500px] gap-3 p-6 md:grid-cols-2" data-testid="nav-content-resources">
                      {resourcesItems.map((item) => (
                        <ListItem
                          key={item.title}
                          title={item.title}
                          href={item.href}
                          icon={item.icon}
                        >
                          {item.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* CTA Button */}
          <Button 
            variant="outline" 
            size="lg" 
            className="font-semibold border-2 hover:bg-background/50 transition-all duration-500"
            data-testid="button-explore-testnet"
          >
            EXPLORE TESTNET
          </Button>
        </div>
      </div>
    </nav>
  );
}

const ListItem = ({
  className,
  title,
  children,
  icon: Icon,
  href,
  ...props
}: {
  className?: string;
  title: string;
  children: React.ReactNode;
  icon: React.ElementType;
  href: string;
}) => {
  return (
    <li>
      <Link 
        href={href}
        className={cn(
          "block select-none space-y-1 rounded-md p-4 leading-none no-underline outline-none transition-colors hover-elevate active-elevate-2",
          className
        )}
        data-testid={`nav-item-${title.toLowerCase().replace(/\s+/g, '-')}`}
        {...props}
      >
        <div className="flex items-start gap-3">
          <Icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <div className="text-sm font-bold leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          </div>
        </div>
      </Link>
    </li>
  );
};
