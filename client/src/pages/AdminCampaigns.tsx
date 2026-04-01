import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Copy, Trash2, Mail, BarChart3, Send, Edit, Zap } from "lucide-react";
import type { EmailCampaign } from "@shared/schema";

const AUDIENCE_LABELS: Record<string, string> = {
  all: "All Contacts",
  waitlist: "Waitlist",
  accelerator: "Accelerator",
  events: "Event Registrations",
  csv: "CSV Upload",
  custom: "Custom List",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-zinc-800 text-zinc-300 border-zinc-700",
  sending: "bg-amber-900/50 text-amber-300 border-amber-700",
  sent: "bg-teal-900/50 text-teal-300 border-teal-700",
};

function pct(num: number, denom: number): string {
  if (!denom) return "—";
  return `${Math.round((num / denom) * 100)}%`;
}

export default function AdminCampaigns() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: campaigns = [], isLoading } = useQuery<EmailCampaign[]>({
    queryKey: ["/api/campaigns"],
  });

  const cloneMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/campaigns/${id}/clone`),
    onSuccess: async (res) => {
      const cloned: EmailCampaign = await res.json();
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({ title: "Campaign cloned", description: `"${cloned.name}" created as a draft.` });
      navigate(`/admin/campaigns/${cloned.id}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/campaigns/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({ title: "Campaign deleted" });
    },
  });

  return (
    <div className="min-h-screen bg-[#050e0e] text-white">
      <div className="max-w-6xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-white">Email Campaigns</h1>
            <p className="text-sm text-[#4a8080] mt-0.5">Create, send, and track your email campaigns</p>
          </div>
          <Button
            data-testid="button-new-campaign"
            onClick={() => {
              apiRequest("POST", "/api/campaigns", { name: "Untitled Campaign" })
                .then((r) => r.json())
                .then((c: EmailCampaign) => {
                  queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
                  navigate(`/admin/campaigns/${c.id}`);
                });
            }}
            className="bg-[#2EB8B8] text-black font-bold hover:bg-[#38d4d4]"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </div>

        {/* Stats bar */}
        {campaigns.length > 0 && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total", value: campaigns.length, icon: Mail },
              { label: "Sent", value: campaigns.filter((c) => c.status === "sent").length, icon: Send },
              { label: "Total Emails Sent", value: campaigns.reduce((s, c) => s + c.sentCount, 0), icon: Zap },
              { label: "Avg Open Rate", value: (() => { const sent = campaigns.filter(c=>c.sentCount>0); if(!sent.length) return "—"; const avg = sent.reduce((s,c)=>s+(c.openedIds.length/c.sentCount),0)/sent.length; return `${Math.round(avg*100)}%`; })(), icon: BarChart3 },
            ].map(({ label, value, icon: Icon }) => (
              <Card key={label} className="bg-[#0a1818] border-[#1a3a3a]">
                <CardContent className="pt-4 pb-4 px-5">
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-[#2EB8B8]" />
                    <div>
                      <p className="text-xs text-[#4a8080] font-medium">{label}</p>
                      <p className="text-xl font-black text-white">{value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Campaign list */}
        {isLoading ? (
          <div className="text-center py-20 text-[#4a8080]">Loading campaigns...</div>
        ) : campaigns.length === 0 ? (
          <Card className="bg-[#0a1818] border-[#1a3a3a] border-dashed">
            <CardContent className="py-20 text-center">
              <Mail className="w-12 h-12 text-[#2EB8B8]/30 mx-auto mb-4" />
              <p className="text-[#7aacac] text-lg font-semibold mb-2">No campaigns yet</p>
              <p className="text-[#4a8080] text-sm mb-6">Create your first email campaign to get started.</p>
              <Button
                data-testid="button-create-first-campaign"
                onClick={() => {
                  apiRequest("POST", "/api/campaigns", { name: "Untitled Campaign" })
                    .then((r) => r.json())
                    .then((c: EmailCampaign) => {
                      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
                      navigate(`/admin/campaigns/${c.id}`);
                    });
                }}
                className="bg-[#2EB8B8] text-black font-bold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Campaign
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="bg-[#0a1818] border-[#1a3a3a] hover-elevate">
                <CardContent className="py-4 px-5">
                  <div className="flex items-start gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap gap-y-1">
                        <h3
                          className="font-bold text-white text-base truncate cursor-pointer hover:text-[#2EB8B8] transition-colors"
                          onClick={() => navigate(`/admin/campaigns/${campaign.id}`)}
                          data-testid={`campaign-name-${campaign.id}`}
                        >
                          {campaign.name || "Untitled Campaign"}
                        </h3>
                        <Badge className={`text-xs border ${STATUS_COLORS[campaign.status]} no-default-active-elevate shrink-0`}>
                          {campaign.status}
                        </Badge>
                      </div>
                      {campaign.subject && (
                        <p className="text-sm text-[#5a9090] truncate mb-2">{campaign.subject}</p>
                      )}
                      <div className="flex items-center gap-5 text-xs text-[#4a7070] flex-wrap">
                        <span>{AUDIENCE_LABELS[campaign.audienceType] || campaign.audienceType}</span>
                        <span>Created {new Date(campaign.createdAt).toLocaleDateString()}</span>
                        {campaign.sentAt && <span>Sent {new Date(campaign.sentAt).toLocaleDateString()}</span>}
                      </div>
                    </div>

                    {/* Analytics */}
                    {campaign.sentCount > 0 && (
                      <div className="flex items-center gap-5 text-sm text-center shrink-0">
                        <div>
                          <p className="font-bold text-white">{campaign.sentCount}</p>
                          <p className="text-xs text-[#4a7070]">Sent</p>
                        </div>
                        <div>
                          <p className="font-bold text-[#2EB8B8]">{pct(campaign.openedIds.length, campaign.sentCount)}</p>
                          <p className="text-xs text-[#4a7070]">Opens</p>
                        </div>
                        <div>
                          <p className="font-bold text-[#2EB8B8]">{pct(campaign.clickedIds.length, campaign.sentCount)}</p>
                          <p className="text-xs text-[#4a7070]">Clicks</p>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        data-testid={`button-edit-campaign-${campaign.id}`}
                        onClick={() => navigate(`/admin/campaigns/${campaign.id}`)}
                        title="Edit campaign"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        data-testid={`button-clone-campaign-${campaign.id}`}
                        onClick={() => cloneMutation.mutate(campaign.id)}
                        title="Clone campaign"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            data-testid={`button-delete-campaign-${campaign.id}`}
                            title="Delete campaign"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-[#0a1818] border-[#1a3a3a]">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">Delete Campaign</AlertDialogTitle>
                            <AlertDialogDescription className="text-[#7aacac]">
                              Are you sure you want to delete "{campaign.name}"? This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-[#1a3a3a] text-[#7aacac]">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate(campaign.id)}
                              className="bg-red-600 text-white hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
