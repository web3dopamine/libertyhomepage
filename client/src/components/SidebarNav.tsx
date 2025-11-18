import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar-nav";
import { Zap, Code, Globe, Shield, Package, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import logoImage from "@assets/Asset 6_1763440187916.png";

export function SidebarNav() {
  const links = [
    {
      label: "Performance",
      href: "#performance",
      icon: (
        <Zap className="text-primary h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "EVM Compatible",
      href: "#evm",
      icon: (
        <Code className="text-primary h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Network",
      href: "#network",
      icon: (
        <Globe className="text-primary h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Trilemma",
      href: "#trilemma",
      icon: (
        <Shield className="text-primary h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Ecosystem",
      href: "#ecosystem",
      icon: (
        <Package className="text-primary h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Get Started",
      href: "#footer",
      icon: (
        <Sparkles className="text-primary h-5 w-5 flex-shrink-0" />
      ),
    },
  ];

  return (
    <Sidebar>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <Logo />
          <div className="mt-8 flex flex-col gap-2">
            {links.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
          </div>
        </div>
      </SidebarBody>
    </Sidebar>
  );
}

export const Logo = () => {
  return (
    <Link
      href="/"
      className="font-normal flex space-x-2 items-center text-sm py-1 relative z-20"
      data-testid="sidebar-logo"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2"
      >
        <img src={logoImage} alt="Liberty Chain" className="h-8 w-auto" />
      </motion.div>
    </Link>
  );
};
