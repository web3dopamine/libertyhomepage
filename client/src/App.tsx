import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WalletProvider } from "@/contexts/WalletContext";
import { ForumProfileProvider } from "@/contexts/ForumProfileContext";
import { ForumGate } from "@/components/ForumGate";
import ForumGuide from "@/pages/ForumGuide";
import Home from "@/pages/Home";
import Events from "@/pages/Events";
import Blog from "@/pages/Blog";
import Ecosystem from "@/pages/Ecosystem";
import Announcements from "@/pages/Announcements";
import BlockExplorer from "@/pages/BlockExplorer";
import LibertyMedia from "@/pages/LibertyMedia";
import MediaPost from "@/pages/MediaPost";
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
import AdminAccelerator from "@/pages/AdminAccelerator";
import AdminSettings from "@/pages/AdminSettings";
import AdminContacts from "@/pages/AdminContacts";
import AdminCMS from "@/pages/AdminCMS";
import AdminSocials from "@/pages/AdminSocials";
import AdminCampaigns from "@/pages/AdminCampaigns";
import AdminCampaignEditor from "@/pages/AdminCampaignEditor";
import AdminAutoresponders from "@/pages/AdminAutoresponders";
import AdminRoadmap from "@/pages/AdminRoadmap";
import AdminVideoTutorials from "@/pages/AdminVideoTutorials";
import AdminSections from "@/pages/AdminSections";
import AdminEventAnalytics from "@/pages/AdminEventAnalytics";
import AdminForum from "@/pages/AdminForum";
import AdminNodeWaitlist from "@/pages/AdminNodeWaitlist";
import AdminMediaHub from "@/pages/AdminMediaHub";
import RunANode from "@/pages/RunANode";
import Forum from "@/pages/Forum";
import ForumCategory from "@/pages/ForumCategory";
import ForumTopicPage from "@/pages/ForumTopic";
import ForumNew from "@/pages/ForumNew";
import ForumSearch from "@/pages/ForumSearch";
import VideoTutorials from "@/pages/VideoTutorials";
import AcceleratorApply from "@/pages/AcceleratorApply";
import { AdminGate } from "@/components/AdminGate";
import CustomPage from "@/pages/CustomPage";
import NotFound from "@/pages/not-found";
import { useQuery } from "@tanstack/react-query";

interface CustomPageDef {
  id: string;
  title: string;
  path: string;
  createdAt: string;
}

function CustomPageResolver({ slug }: { slug: string }) {
  const { data: pages = [] } = useQuery<CustomPageDef[]>({
    queryKey: ["/api/cms/pages"],
  });
  const page = pages.find((p) => p.path === `/custom/${slug}`);
  if (!page) return <NotFound />;
  return <CustomPage pageId={page.id} />;
}

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
      <Route path="/liberty-media/:id" component={MediaPost} />
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
      <Route path="/admin">
        {() => <AdminGate><AdminDashboard /></AdminGate>}
      </Route>
      <Route path="/admin/events/analytics">
        {() => <AdminGate><AdminEventAnalytics /></AdminGate>}
      </Route>
      <Route path="/admin/events">
        {() => <AdminGate><AdminEvents /></AdminGate>}
      </Route>
      <Route path="/admin/waitlist">
        {() => <AdminGate><AdminWaitlist /></AdminGate>}
      </Route>
      <Route path="/admin/accelerator">
        {() => <AdminGate><AdminAccelerator /></AdminGate>}
      </Route>
      <Route path="/admin/settings">
        {() => <AdminGate><AdminSettings /></AdminGate>}
      </Route>
      <Route path="/admin/contacts">
        {() => <AdminGate><AdminContacts /></AdminGate>}
      </Route>
      <Route path="/admin/cms">
        {() => <AdminGate><AdminCMS /></AdminGate>}
      </Route>
      <Route path="/admin/socials">
        {() => <AdminGate><AdminSocials /></AdminGate>}
      </Route>
      <Route path="/admin/campaigns/:id">
        {(params) => <AdminGate><AdminCampaignEditor /></AdminGate>}
      </Route>
      <Route path="/admin/campaigns">
        {() => <AdminGate><AdminCampaigns /></AdminGate>}
      </Route>
      <Route path="/admin/autoresponders">
        {() => <AdminGate><AdminAutoresponders /></AdminGate>}
      </Route>
      <Route path="/admin/roadmap">
        {() => <AdminGate><AdminRoadmap /></AdminGate>}
      </Route>
      <Route path="/admin/video-tutorials">
        {() => <AdminGate><AdminVideoTutorials /></AdminGate>}
      </Route>
      <Route path="/admin/sections">
        {() => <AdminGate><AdminSections /></AdminGate>}
      </Route>
      <Route path="/admin/forum" component={AdminForum} />
      <Route path="/admin/media-hub" component={AdminMediaHub} />
      <Route path="/admin/node-waitlist">
        {() => <AdminGate><AdminNodeWaitlist /></AdminGate>}
      </Route>
      <Route path="/run-a-node" component={RunANode} />
      <Route path="/forum/guide" component={ForumGuide} />
      <Route path="/forum/search">
        {() => <ForumGate><ForumSearch /></ForumGate>}
      </Route>
      <Route path="/forum/new">
        {() => <ForumGate><ForumNew /></ForumGate>}
      </Route>
      <Route path="/forum/c/:slug">
        {() => <ForumGate><ForumCategory /></ForumGate>}
      </Route>
      <Route path="/forum/t/:id/:slug">
        {() => <ForumGate><ForumTopicPage /></ForumGate>}
      </Route>
      <Route path="/forum">
        {() => <ForumGate><Forum /></ForumGate>}
      </Route>
      <Route path="/video-tutorials" component={VideoTutorials} />
      <Route path="/accelerator/apply" component={AcceleratorApply} />
      <Route path="/custom/:slug">
        {(params) => <CustomPageResolver slug={params.slug} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <ForumProfileProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ForumProfileProvider>
      </WalletProvider>
    </QueryClientProvider>
  );
}

export default App;
