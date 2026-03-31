import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useState } from "react";
import logoImage from "@assets/Asset 6_1763440187916.png";
import { Rocket, Calendar, Bell, Search, Newspaper, Users, Building2, FileText, Code, Wrench, Heart, Share2, MessageSquare, Palette, Radio, Menu, X, ChevronDown, ChevronRight } from "lucide-react";
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
import { DecryptEffect } from "./DecryptEffect";

const exploreItems = [
  { title: "Events", href: "/events", description: "Discover upcoming events and community gatherings.", icon: Calendar },
  { title: "Announcements", href: "/announcements", description: "Stay up to date with the latest official announcements.", icon: Bell },
  { title: "Block Explorer", href: "https://explorer.libertychain.org/", description: "Explore the Liberty blockchain with the block explorer.", icon: Search },
  { title: "Liberty Media", href: "/liberty-media", description: "Explore featured blogs, video highlights, interviews and announcements from Liberty.", icon: Newspaper },
  { title: "Validators", href: "/validators", description: "View Liberty validator performance and network analytics.", icon: Users },
  { title: "Institutions", href: "/institutions", description: "Learn about blockchain solutions designed for institutional adoption and enterprise needs.", icon: Building2 },
];

const buildItems = [
  { title: "Build", href: "/build", description: "Explore programs, resources, and a world-class community for founders and developers building on Liberty.", icon: Code },
  { title: "Documentation", href: "/documentation", description: "Learn how to write smart contracts on Liberty.", icon: FileText },
  { title: "Developer Tools", href: "/developer-tools", description: "Explore our directory of tools and services used to build on Liberty.", icon: Wrench },
  { title: "Resilience Layer", href: "/resilience-layer", description: "Run a Liberty mesh node. Stay online even when the internet goes down — via Meshtastic LoRa.", icon: Rocket },
  { title: "Mesh Messaging", href: "/mesh-messaging", description: "Wallet-to-wallet encrypted messaging, validator signals, and DAO governance over LoRa — no internet required.", icon: Radio },
];

const resourcesItems = [
  { title: "Liberty Foundation", href: "/liberty-foundation", description: "Learn about the foundation supporting the growth and adoption of Liberty.", icon: Heart },
  { title: "Social Media", href: "/social-media", description: "Follow us on social media for real-time updates, community highlights, and ecosystem news.", icon: Share2 },
  { title: "Community", href: "/community", description: "Join our vibrant community for discussions, support, and collaboration.", icon: MessageSquare },
  { title: "Branding & Media Kit", href: "/branding-media-kit", description: "Official logos, brand guidelines, and media resources for the Liberty ecosystem.", icon: Palette },
];

function HoverableNavLink({ href, text, testId }: { href: string; text: string; testId: string }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <NavigationMenuLink asChild>
      <Link
        href={href}
        className={cn(navigationMenuTriggerStyle(), "text-base font-semibold")}
        data-testid={testId}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span style={{ minWidth: `${text.length}ch`, display: 'inline-block' }}>
          {isHovered ? <DecryptEffect text={text} startDecrypting={true} /> : text}
        </span>
      </Link>
    </NavigationMenuLink>
  );
}

function HoverableNavTrigger({ text, testId }: { text: string; testId: string }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <NavigationMenuTrigger
      className="text-base font-semibold"
      data-testid={testId}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span style={{ minWidth: `${text.length}ch`, display: 'inline-block' }}>
        {isHovered ? <DecryptEffect text={text} startDecrypting={true} /> : text}
      </span>
    </NavigationMenuTrigger>
  );
}

function MobileMenuSection({
  label,
  items,
  onClose,
}: {
  label: string;
  items: { title: string; href: string; icon: React.ElementType }[];
  onClose: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/20">
      <button
        className="flex items-center justify-between w-full px-6 py-4 text-sm font-bold tracking-widest uppercase text-muted-foreground"
        onClick={() => setOpen((v) => !v)}
        data-testid={`mobile-nav-toggle-${label.toLowerCase()}`}
      >
        {label}
        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      {open && (
        <div className="pb-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isExternal = item.href.startsWith('http');
            const itemClass = "flex items-center gap-3 px-8 py-3 text-sm font-medium hover-elevate transition-colors";
            const itemContent = (
              <>
                <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                {item.title}
              </>
            );
            return isExternal ? (
              <a
                key={item.title}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={itemClass}
                data-testid={`mobile-nav-item-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={onClose}
              >
                {itemContent}
              </a>
            ) : (
              <Link
                key={item.title}
                href={item.href}
                className={itemClass}
                data-testid={`mobile-nav-item-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={onClose}
              >
                {itemContent}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/20 bg-gradient-to-b from-background via-background/98 to-background/95 backdrop-blur-2xl shadow-2xl shadow-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="hover-elevate active-elevate-2 rounded-xl px-3 py-2 -ml-3 cursor-pointer transition-all duration-500 ease-out" data-testid="logo-main">
              <Link href="/" data-testid="link-home" className="block">
                <img src={logoImage} alt="Liberty Chain" className="h-9 sm:h-12 w-auto" />
              </Link>
            </div>

            {/* Desktop Navigation Menu */}
            <div className="hidden md:flex items-center gap-2">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <HoverableNavLink href="/" text="HOME" testId="link-nav-home" />
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <HoverableNavTrigger text="EXPLORE" testId="nav-trigger-explore" />
                    <NavigationMenuContent>
                      <ul className="grid w-[500px] gap-3 p-6 md:grid-cols-2" data-testid="nav-content-explore">
                        {exploreItems.map((item) => (
                          <ListItem key={item.title} title={item.title} href={item.href} icon={item.icon}>
                            {item.description}
                          </ListItem>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <HoverableNavTrigger text="BUILD" testId="nav-trigger-build" />
                    <NavigationMenuContent>
                      <ul className="grid w-[500px] gap-3 p-6 md:grid-cols-2" data-testid="nav-content-build">
                        {buildItems.map((item) => (
                          <ListItem key={item.title} title={item.title} href={item.href} icon={item.icon}>
                            {item.description}
                          </ListItem>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <HoverableNavTrigger text="RESOURCES" testId="nav-trigger-resources" />
                    <NavigationMenuContent>
                      <ul className="grid w-[500px] gap-3 p-6 md:grid-cols-2" data-testid="nav-content-resources">
                        {resourcesItems.map((item) => (
                          <ListItem key={item.title} title={item.title} href={item.href} icon={item.icon}>
                            {item.description}
                          </ListItem>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* Right side: CTA (desktop) + Hamburger (mobile) */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex font-semibold border-2 transition-all duration-500"
                data-testid="button-explore-testnet"
                asChild
              >
                <a href="https://explorer.libertychain.org/" target="_blank" rel="noopener noreferrer">EXPLORE TESTNET</a>
              </Button>

              {/* Hamburger button — mobile only */}
              <button
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover-elevate transition-colors"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Toggle menu"
                data-testid="button-mobile-menu-toggle"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          data-testid="mobile-menu-overlay"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute top-16 left-0 right-0 bottom-0 bg-background border-t border-border/20 overflow-y-auto">
            {/* HOME link */}
            <div className="border-b border-border/20">
              <Link
                href="/"
                className="flex items-center px-6 py-4 text-sm font-bold tracking-widest uppercase"
                onClick={() => setMobileOpen(false)}
                data-testid="mobile-nav-home"
              >
                HOME
              </Link>
            </div>

            <MobileMenuSection label="Explore" items={exploreItems} onClose={() => setMobileOpen(false)} />
            <MobileMenuSection label="Build" items={buildItems} onClose={() => setMobileOpen(false)} />
            <MobileMenuSection label="Resources" items={resourcesItems} onClose={() => setMobileOpen(false)} />

            {/* CTA */}
            <div className="p-6">
              <Button
                variant="outline"
                className="w-full font-semibold border-2"
                data-testid="button-explore-testnet-mobile"
                asChild
              >
                <a href="https://explorer.libertychain.org/" target="_blank" rel="noopener noreferrer">EXPLORE TESTNET</a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
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
  const isExternal = href.startsWith('http');
  const inner = (
    <div className="flex items-start gap-3">
      <Icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
      <div className="space-y-1">
        <div className="text-sm font-bold leading-none">{title}</div>
        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
          {children}
        </p>
      </div>
    </div>
  );
  const linkClass = cn(
    "block select-none space-y-1 rounded-md p-4 leading-none no-underline outline-none transition-colors hover-elevate active-elevate-2",
    className
  );
  return (
    <li>
      {isExternal ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
          data-testid={`nav-item-${title.toLowerCase().replace(/\s+/g, '-')}`}
          {...props}
        >
          {inner}
        </a>
      ) : (
        <Link
          href={href}
          className={linkClass}
          data-testid={`nav-item-${title.toLowerCase().replace(/\s+/g, '-')}`}
          {...props}
        >
          {inner}
        </Link>
      )}
    </li>
  );
};
