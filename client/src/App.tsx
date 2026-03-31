import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import Events from "@/pages/Events";
import Blog from "@/pages/Blog";
import Ecosystem from "@/pages/Ecosystem";
import Announcements from "@/pages/Announcements";
import BlockExplorer from "@/pages/BlockExplorer";
import LibertyMedia from "@/pages/LibertyMedia";
import Validators from "@/pages/Validators";
import Institutions from "@/pages/Institutions";
import Build from "@/pages/Build";
import Documentation from "@/pages/Documentation";
import DeveloperTools from "@/pages/DeveloperTools";
import LibertyFoundation from "@/pages/LibertyFoundation";
import SocialMedia from "@/pages/SocialMedia";
import Community from "@/pages/Community";
import BrandingMediaKit from "@/pages/BrandingMediaKit";
import ResilienceLayer from "@/pages/ResilienceLayer";
import MeshMessaging from "@/pages/MeshMessaging";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminEvents from "@/pages/AdminEvents";
import AdminWaitlist from "@/pages/AdminWaitlist";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/events" component={Events} />
      <Route path="/blog" component={Blog} />
      <Route path="/ecosystem" component={Ecosystem} />
      <Route path="/announcements" component={Announcements} />
      <Route path="/block-explorer" component={BlockExplorer} />
      <Route path="/liberty-media" component={LibertyMedia} />
      <Route path="/validators" component={Validators} />
      <Route path="/institutions" component={Institutions} />
      <Route path="/build" component={Build} />
      <Route path="/documentation" component={Documentation} />
      <Route path="/developer-tools" component={DeveloperTools} />
      <Route path="/liberty-foundation" component={LibertyFoundation} />
      <Route path="/social-media" component={SocialMedia} />
      <Route path="/community" component={Community} />
      <Route path="/branding-media-kit" component={BrandingMediaKit} />
      <Route path="/resilience-layer" component={ResilienceLayer} />
      <Route path="/mesh-messaging" component={MeshMessaging} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/events" component={AdminEvents} />
      <Route path="/admin/waitlist" component={AdminWaitlist} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
