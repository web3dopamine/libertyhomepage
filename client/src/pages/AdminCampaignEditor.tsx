import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeft, GripVertical, Trash2, ChevronDown, ChevronUp, Plus, Send,
  Type, AlignLeft, Image, MousePointerClick, Minus, Space, BarChart3, Upload, Copy, Save,
} from "lucide-react";
import { blocksToBodyHtml } from "@shared/email-builder";
import type { EmailBlock, BlockType, EmailCampaign, CsvRecipient } from "@shared/schema";
import { emailBlockDefaults } from "@shared/schema";
import { nanoid } from "nanoid";

// ── Preview HTML generator ─────────────────────────────────
function buildPreviewHtml(blocks: EmailBlock[]): string {
  const body = blocksToBodyHtml(blocks);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <style>body{margin:0;padding:20px;background:#080f0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;}
  a{color:#2EB8B8;}
  </style>
</head>
<body>
  <div style="max-width:600px;margin:0 auto;">
    <!-- Header -->
    <div style="height:4px;background:linear-gradient(90deg,#1a8888,#2EB8B8 40%,#38d4d4 70%,#2EB8B8);border-radius:3px 3px 0 0;"></div>
    <div style="background:linear-gradient(160deg,#0a1f1f,#071515,#050e0e);padding:28px 40px 20px;border-radius:0;">
      <div style="color:#2EB8B8;font-size:18px;font-weight:900;letter-spacing:0.06em;">LIBERTY CHAIN</div>
      <div style="color:#3a7070;font-size:11px;margin-top:6px;letter-spacing:0.08em;text-transform:uppercase;">Built for Freedom · Zero Gas · 10,000+ TPS</div>
    </div>
    <div style="height:1px;background:linear-gradient(90deg,transparent,#1a3a3a 30%,#2EB8B820 60%,transparent);"></div>
    <!-- Body -->
    <div style="background:#0b1818;padding:44px 40px;">${body || '<p style="color:#4a7070;font-style:italic;">Add blocks on the left to build your email...</p>'}</div>
    <!-- Footer -->
    <div style="height:1px;background:linear-gradient(90deg,transparent,#1a3a3a 30%,#1a3a3a 70%,transparent);"></div>
    <div style="background:#060c0c;padding:20px 40px 24px;">
      <p style="color:#3a5a5a;font-size:11px;margin:0 0 4px;">© ${new Date().getFullYear()} Liberty Chain · <a href="https://libertychain.org" style="color:#2EB8B8;text-decoration:none;">libertychain.org</a></p>
      <p style="color:#2a4040;font-size:11px;margin:0;">You received this email because you signed up for Liberty Chain updates.</p>
    </div>
  </div>
</body></html>`;
}

// ── Block type meta ────────────────────────────────────────
const BLOCK_ICONS: Record<BlockType, typeof Type> = {
  heading: Type,
  text: AlignLeft,
  image: Image,
  button: MousePointerClick,
  divider: Minus,
  spacer: Space,
};

const BLOCK_LABELS: Record<BlockType, string> = {
  heading: "Heading",
  text: "Text",
  image: "Image",
  button: "Button",
  divider: "Divider",
  spacer: "Spacer",
};

const BLOCK_TYPES: BlockType[] = ["heading", "text", "image", "button", "divider", "spacer"];

// ── Sortable block item ────────────────────────────────────
function SortableBlockItem({
  block, isSelected, onSelect, onDelete,
}: {
  block: EmailBlock;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const Icon = BLOCK_ICONS[block.type];

  function summary() {
    const p = block.props;
    switch (block.type) {
      case "heading": return p.text?.slice(0, 60) || "Heading";
      case "text": return p.content?.slice(0, 60) || "Text block";
      case "image": return p.src ? `Image: ${p.src.slice(0, 40)}` : "Image (no URL set)";
      case "button": return `${p.label || "Button"} → ${p.url || ""}`;
      case "divider": return "Horizontal rule";
      case "spacer": return `${p.height || "32"}px spacer`;
    }
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={`flex items-center gap-2 rounded-md border cursor-pointer transition-colors ${
          isSelected
            ? "border-[#2EB8B8] bg-[#0a2424]"
            : "border-[#1a3a3a] bg-[#0a1818] hover:border-[#2a4040]"
        }`}
        onClick={onSelect}
        data-testid={`block-item-${block.id}`}
      >
        <div
          {...attributes}
          {...listeners}
          className="px-2 py-3 text-[#3a6060] hover:text-[#7aacac] cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4" />
        </div>
        <Icon className="w-4 h-4 text-[#2EB8B8] shrink-0" />
        <div className="flex-1 min-w-0 py-2">
          <span className="text-xs font-bold text-[#4a8080] uppercase tracking-wide">{BLOCK_LABELS[block.type]}</span>
          <p className="text-xs text-[#6a9090] truncate mt-0.5">{summary()}</p>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="shrink-0 mr-1 text-red-400/60 hover:text-red-400"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          data-testid={`button-delete-block-${block.id}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ── Block editor form ──────────────────────────────────────
function BlockEditorForm({
  block, onChange,
}: {
  block: EmailBlock;
  onChange: (props: Record<string, string>) => void;
}) {
  const p = block.props;
  const field = (key: string, label: string, type: "text" | "textarea" | "url" | "color" | "number" = "text") => (
    <div key={key} className="mb-3">
      <label className="text-xs font-semibold text-[#4a8080] uppercase tracking-wide block mb-1">{label}</label>
      {type === "textarea" ? (
        <Textarea
          value={p[key] || ""}
          onChange={(e) => onChange({ ...p, [key]: e.target.value })}
          rows={4}
          className="bg-[#071212] border-[#1a3a3a] text-white text-sm resize-none"
          data-testid={`block-field-${key}`}
        />
      ) : type === "color" ? (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={p[key] || "#2EB8B8"}
            onChange={(e) => onChange({ ...p, [key]: e.target.value })}
            className="w-8 h-8 rounded border border-[#1a3a3a] bg-transparent cursor-pointer"
            data-testid={`block-field-${key}`}
          />
          <Input
            value={p[key] || ""}
            onChange={(e) => onChange({ ...p, [key]: e.target.value })}
            placeholder="#2EB8B8"
            className="bg-[#071212] border-[#1a3a3a] text-white text-sm font-mono flex-1"
          />
        </div>
      ) : (
        <Input
          type={type}
          value={p[key] || ""}
          onChange={(e) => onChange({ ...p, [key]: e.target.value })}
          className="bg-[#071212] border-[#1a3a3a] text-white text-sm"
          data-testid={`block-field-${key}`}
        />
      )}
    </div>
  );

  const alignSelect = (key: string, label: string) => (
    <div className="mb-3">
      <label className="text-xs font-semibold text-[#4a8080] uppercase tracking-wide block mb-1">{label}</label>
      <Select value={p[key] || "left"} onValueChange={(v) => onChange({ ...p, [key]: v })}>
        <SelectTrigger className="bg-[#071212] border-[#1a3a3a] text-white text-sm" data-testid={`block-field-${key}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-[#0a1818] border-[#1a3a3a]">
          <SelectItem value="left">Left</SelectItem>
          <SelectItem value="center">Center</SelectItem>
          <SelectItem value="right">Right</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  switch (block.type) {
    case "heading":
      return (
        <div>
          {field("text", "Text")}
          <div className="mb-3">
            <label className="text-xs font-semibold text-[#4a8080] uppercase tracking-wide block mb-1">Size</label>
            <Select value={p.tag || "h1"} onValueChange={(v) => onChange({ ...p, tag: v })}>
              <SelectTrigger className="bg-[#071212] border-[#1a3a3a] text-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0a1818] border-[#1a3a3a]">
                <SelectItem value="h1">H1 — Large (28px)</SelectItem>
                <SelectItem value="h2">H2 — Medium (22px)</SelectItem>
                <SelectItem value="h3">H3 — Small (18px)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {alignSelect("align", "Alignment")}
          {field("color", "Text Color", "color")}
        </div>
      );
    case "text":
      return (
        <div>
          {field("content", "Content", "textarea")}
          {alignSelect("align", "Alignment")}
          {field("color", "Text Color", "color")}
        </div>
      );
    case "image":
      return (
        <div>
          {field("src", "Image URL", "url")}
          {field("alt", "Alt Text")}
          {field("link", "Link URL (optional)", "url")}
          {field("width", "Width (e.g. 100%)")}
          {alignSelect("align", "Alignment")}
        </div>
      );
    case "button":
      return (
        <div>
          {field("label", "Button Text")}
          {field("url", "Button URL", "url")}
          {field("bgColor", "Background Color", "color")}
          {field("textColor", "Text Color", "color")}
          {alignSelect("align", "Alignment")}
        </div>
      );
    case "divider":
      return (
        <div>
          {field("color", "Line Color", "color")}
          {field("spacing", "Vertical Spacing (px)")}
        </div>
      );
    case "spacer":
      return (
        <div>
          {field("height", "Height (px)", "number")}
        </div>
      );
    default:
      return null;
  }
}

// ── Analytics tab ──────────────────────────────────────────
function AnalyticsTab({ campaign }: { campaign: EmailCampaign }) {
  const pct = (n: number, d: number) => d ? `${Math.round((n / d) * 100)}%` : "0%";
  const topLinks = Object.entries(campaign.clickedLinks)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Emails Sent", value: campaign.sentCount, color: "text-white" },
          { label: "Unique Opens", value: campaign.openedIds.length, color: "text-[#2EB8B8]" },
          { label: "Open Rate", value: pct(campaign.openedIds.length, campaign.sentCount), color: "text-[#2EB8B8]" },
          { label: "Total Opens", value: campaign.openCount, color: "text-[#66cccc]" },
          { label: "Unique Clicks", value: campaign.clickedIds.length, color: "text-[#2EB8B8]" },
          { label: "Click Rate", value: pct(campaign.clickedIds.length, campaign.sentCount), color: "text-[#2EB8B8]" },
          { label: "Total Clicks", value: campaign.clickCount, color: "text-[#66cccc]" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[#071212] rounded-lg border border-[#1a3a3a] p-4">
            <p className="text-xs text-[#4a7070] mb-1">{label}</p>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {topLinks.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-[#4a8080] uppercase tracking-wide mb-3">Top Clicked Links</h4>
          <div className="space-y-2">
            {topLinks.map(([url, count]) => (
              <div key={url} className="flex items-center gap-3 bg-[#071212] rounded border border-[#1a3a3a] px-3 py-2">
                <span className="flex-1 text-xs text-[#7aacac] truncate">{url}</span>
                <span className="text-xs font-bold text-[#2EB8B8] shrink-0">{count} click{count !== 1 ? "s" : ""}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {campaign.sentCount === 0 && (
        <div className="text-center py-12 text-[#4a7070]">
          <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Send this campaign to see analytics here.</p>
        </div>
      )}
    </div>
  );
}

// ── Main campaign editor ───────────────────────────────────
export default function AdminCampaignEditor() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: campaign, isLoading } = useQuery<EmailCampaign>({
    queryKey: ["/api/campaigns", params.id],
    queryFn: () => fetch(`/api/campaigns/${params.id}`).then((r) => r.json()),
  });

  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [audienceType, setAudienceType] = useState<EmailCampaign["audienceType"]>("all");
  const [customEmails, setCustomEmails] = useState("");
  const [csvRecipients, setCsvRecipients] = useState<CsvRecipient[]>([]);
  const [blocks, setBlocks] = useState<EmailBlock[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const previewRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (campaign) {
      setName(campaign.name || "");
      setSubject(campaign.subject || "");
      setPreviewText(campaign.previewText || "");
      setAudienceType(campaign.audienceType || "all");
      setCustomEmails(campaign.customEmails || "");
      setCsvRecipients(campaign.csvRecipients || []);
      setBlocks(campaign.blocks || []);
      setIsDirty(false);
    }
  }, [campaign]);

  // Live preview
  useEffect(() => {
    if (previewRef.current) {
      const html = buildPreviewHtml(blocks);
      const doc = previewRef.current.contentDocument;
      if (doc) { doc.open(); doc.write(html); doc.close(); }
    }
  }, [blocks]);

  const saveMutation = useMutation({
    mutationFn: () =>
      apiRequest("PUT", `/api/campaigns/${params.id}`, {
        name, subject, previewText, audienceType, customEmails, csvRecipients, blocks,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns", params.id] });
      setIsDirty(false);
      toast({ title: "Saved", description: "Campaign saved successfully." });
    },
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      // Auto-save first
      await apiRequest("PUT", `/api/campaigns/${params.id}`, {
        name, subject, previewText, audienceType, customEmails, csvRecipients, blocks,
      });
      const res = await apiRequest("POST", `/api/campaigns/${params.id}/send`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns", params.id] });
      setIsDirty(false);
      toast({ title: "Campaign sent!", description: `${data.sent} emails sent${data.failed ? `, ${data.failed} failed` : ""}.` });
    },
    onError: (err: any) => {
      toast({ title: "Send failed", description: err.message, variant: "destructive" });
    },
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIdx = blocks.findIndex((b) => b.id === active.id);
      const newIdx = blocks.findIndex((b) => b.id === over.id);
      const newBlocks = arrayMove(blocks, oldIdx, newIdx);
      setBlocks(newBlocks);
      setIsDirty(true);
    }
  }

  function addBlock(type: BlockType) {
    const block: EmailBlock = {
      id: nanoid(),
      type,
      props: { ...emailBlockDefaults[type] },
    };
    setBlocks((prev) => [...prev, block]);
    setSelectedBlockId(block.id);
    setIsDirty(true);
  }

  function deleteBlock(id: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    if (selectedBlockId === id) setSelectedBlockId(null);
    setIsDirty(true);
  }

  function updateBlockProps(id: string, props: Record<string, string>) {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, props } : b)));
    setIsDirty(true);
  }

  function handleCsvUpload(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
      const recipients: CsvRecipient[] = [];
      const hasHeader = lines[0]?.toLowerCase().includes("email");
      const start = hasHeader ? 1 : 0;
      for (let i = start; i < lines.length; i++) {
        const parts = lines[i].split(",").map((p) => p.trim().replace(/"/g, ""));
        const email = parts.find((p) => p.includes("@")) || "";
        if (!email) continue;
        const name = parts.find((p) => !p.includes("@") && p.length > 0) || "";
        recipients.push({ name, email });
      }
      setCsvRecipients(recipients);
      setAudienceType("csv");
      setIsDirty(true);
      toast({ title: `${recipients.length} contacts imported from CSV` });
    };
    reader.readAsText(file);
  }

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) || null;
  const canSend = subject.trim() && blocks.length > 0;

  if (isLoading) {
    return <div className="min-h-screen bg-[#050e0e] flex items-center justify-center text-[#4a8080]">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#050e0e] text-white flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-[#1a3a3a] bg-[#060e0e] sticky top-0 z-10">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/campaigns">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <input
            value={name}
            onChange={(e) => { setName(e.target.value); setIsDirty(true); }}
            placeholder="Campaign name..."
            className="bg-transparent text-white font-bold text-lg outline-none w-full placeholder:text-[#3a5050]"
            data-testid="input-campaign-name"
          />
        </div>
        {campaign && (
          <Badge className={`shrink-0 text-xs border ${
            campaign.status === "sent" ? "bg-teal-900/50 text-teal-300 border-teal-700" :
            campaign.status === "sending" ? "bg-amber-900/50 text-amber-300 border-amber-700" :
            "bg-zinc-800 text-zinc-300 border-zinc-700"
          }`}>
            {campaign.status}
          </Badge>
        )}
        {isDirty && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            data-testid="button-save-campaign"
            className="text-[#2EB8B8]"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            {saveMutation.isPending ? "Saving..." : "Save"}
          </Button>
        )}
        <Button
          onClick={() => sendMutation.mutate()}
          disabled={sendMutation.isPending || !canSend}
          data-testid="button-send-campaign"
          className="bg-[#2EB8B8] text-black font-bold hover:bg-[#38d4d4] shrink-0"
        >
          <Send className="w-3.5 h-3.5 mr-2" />
          {sendMutation.isPending ? "Sending..." : "Send Campaign"}
        </Button>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="w-[380px] shrink-0 border-r border-[#1a3a3a] flex flex-col overflow-y-auto">
          <Tabs defaultValue="content" className="flex-1 flex flex-col">
            <TabsList className="w-full rounded-none border-b border-[#1a3a3a] bg-[#060e0e] shrink-0 gap-0 p-0 h-auto">
              {["content", "settings", "analytics"].map((t) => (
                <TabsTrigger
                  key={t}
                  value={t}
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-[#2EB8B8] data-[state=active]:bg-transparent data-[state=active]:text-[#2EB8B8] text-xs font-bold uppercase tracking-wide py-3 text-[#4a7070]"
                >
                  {t}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Content tab: block editor */}
            <TabsContent value="content" className="flex-1 p-4 space-y-4 m-0">
              {/* Add blocks */}
              <div>
                <p className="text-xs font-bold text-[#4a8080] uppercase tracking-wide mb-2">Add Block</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {BLOCK_TYPES.map((type) => {
                    const Icon = BLOCK_ICONS[type];
                    return (
                      <button
                        key={type}
                        onClick={() => addBlock(type)}
                        data-testid={`button-add-block-${type}`}
                        className="flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-md border border-[#1a3a3a] hover-elevate text-[#6a9090] hover:text-[#2EB8B8] text-xs font-medium transition-colors bg-[#071212]"
                      >
                        <Icon className="w-4 h-4" />
                        {BLOCK_LABELS[type]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Block list */}
              {blocks.length > 0 ? (
                <div>
                  <p className="text-xs font-bold text-[#4a8080] uppercase tracking-wide mb-2">Blocks ({blocks.length})</p>
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-1.5">
                        {blocks.map((block) => (
                          <div key={block.id}>
                            <SortableBlockItem
                              block={block}
                              isSelected={selectedBlockId === block.id}
                              onSelect={() => setSelectedBlockId(selectedBlockId === block.id ? null : block.id)}
                              onDelete={() => deleteBlock(block.id)}
                            />
                            {/* Inline block editor */}
                            {selectedBlockId === block.id && (
                              <div className="mt-1 mb-2 rounded-md border border-[#2EB8B8]/30 bg-[#071f1f] p-3">
                                <BlockEditorForm
                                  block={block}
                                  onChange={(props) => updateBlockProps(block.id, props)}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              ) : (
                <div className="text-center py-10 text-[#4a7070] border border-dashed border-[#1a3a3a] rounded-lg">
                  <p className="text-sm">Add blocks above to build your email</p>
                </div>
              )}
            </TabsContent>

            {/* Settings tab */}
            <TabsContent value="settings" className="flex-1 p-4 space-y-4 m-0">
              <div>
                <label className="text-xs font-bold text-[#4a8080] uppercase tracking-wide block mb-1">Subject Line</label>
                <Input
                  value={subject}
                  onChange={(e) => { setSubject(e.target.value); setIsDirty(true); }}
                  placeholder="Your email subject..."
                  className="bg-[#071212] border-[#1a3a3a] text-white"
                  data-testid="input-campaign-subject"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#4a8080] uppercase tracking-wide block mb-1">Preview Text</label>
                <Input
                  value={previewText}
                  onChange={(e) => { setPreviewText(e.target.value); setIsDirty(true); }}
                  placeholder="Short text shown in inbox preview..."
                  className="bg-[#071212] border-[#1a3a3a] text-white"
                  data-testid="input-campaign-preview-text"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#4a8080] uppercase tracking-wide block mb-1">Audience Segment</label>
                <Select
                  value={audienceType}
                  onValueChange={(v) => { setAudienceType(v as any); setIsDirty(true); }}
                  data-testid="select-audience-type"
                >
                  <SelectTrigger className="bg-[#071212] border-[#1a3a3a] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a1818] border-[#1a3a3a]">
                    <SelectItem value="all">All Contacts</SelectItem>
                    <SelectItem value="waitlist">Waitlist Only</SelectItem>
                    <SelectItem value="accelerator">Accelerator Applicants</SelectItem>
                    <SelectItem value="events">Event Registrations</SelectItem>
                    <SelectItem value="csv">CSV Upload</SelectItem>
                    <SelectItem value="custom">Custom Email List</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {audienceType === "csv" && (
                <div>
                  <label className="text-xs font-bold text-[#4a8080] uppercase tracking-wide block mb-2">CSV Upload</label>
                  <div
                    className="border-2 border-dashed border-[#1a3a3a] rounded-lg p-6 text-center cursor-pointer hover:border-[#2EB8B8]/50 transition-colors"
                    onClick={() => document.getElementById("csv-upload")?.click()}
                    data-testid="button-upload-csv"
                  >
                    <Upload className="w-6 h-6 text-[#2EB8B8]/50 mx-auto mb-2" />
                    <p className="text-sm text-[#5a8080]">
                      {csvRecipients.length > 0
                        ? `${csvRecipients.length} contacts imported`
                        : "Click to upload a CSV file"}
                    </p>
                    <p className="text-xs text-[#3a5050] mt-1">Columns: name, email</p>
                    <input
                      id="csv-upload"
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCsvUpload(f); }}
                    />
                  </div>
                  {csvRecipients.length > 0 && (
                    <div className="mt-2 max-h-32 overflow-y-auto rounded border border-[#1a3a3a]">
                      {csvRecipients.slice(0, 20).map((r, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-1.5 border-b border-[#0f2828] last:border-0">
                          <span className="text-xs text-[#6a9090] flex-1 truncate">{r.email}</span>
                          {r.name && <span className="text-xs text-[#4a7070]">{r.name}</span>}
                        </div>
                      ))}
                      {csvRecipients.length > 20 && (
                        <p className="text-xs text-[#4a7070] text-center py-2">+{csvRecipients.length - 20} more</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {audienceType === "custom" && (
                <div>
                  <label className="text-xs font-bold text-[#4a8080] uppercase tracking-wide block mb-1">Email Addresses</label>
                  <Textarea
                    value={customEmails}
                    onChange={(e) => { setCustomEmails(e.target.value); setIsDirty(true); }}
                    placeholder="Enter emails separated by commas or new lines&#10;e.g. jane@example.com, john@example.com"
                    rows={6}
                    className="bg-[#071212] border-[#1a3a3a] text-white text-sm font-mono"
                    data-testid="input-custom-emails"
                  />
                  <div className="mt-2">
                    <label className="text-xs font-bold text-[#4a8080] uppercase tracking-wide block mb-2">Or also upload CSV</label>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#1a3a3a] text-[#7aacac]"
                      onClick={() => document.getElementById("csv-upload-custom")?.click()}
                    >
                      <Upload className="w-3.5 h-3.5 mr-2" />
                      Upload CSV
                      {csvRecipients.length > 0 && ` (${csvRecipients.length})`}
                    </Button>
                    <input
                      id="csv-upload-custom"
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCsvUpload(f); }}
                    />
                  </div>
                </div>
              )}

              <Button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                variant="outline"
                className="w-full border-[#1a3a3a] text-[#7aacac]"
                data-testid="button-save-settings"
              >
                <Save className="w-3.5 h-3.5 mr-2" />
                {saveMutation.isPending ? "Saving..." : "Save Settings"}
              </Button>
            </TabsContent>

            {/* Analytics tab */}
            <TabsContent value="analytics" className="flex-1 p-4 m-0">
              {campaign ? <AnalyticsTab campaign={campaign} /> : null}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right panel: live preview */}
        <div className="flex-1 flex flex-col bg-[#040a0a]">
          <div className="flex items-center gap-3 px-4 py-2 border-b border-[#1a3a3a] bg-[#060e0e]">
            <p className="text-xs font-bold text-[#4a8080] uppercase tracking-wide">Live Preview</p>
            <div className="flex-1" />
            <p className="text-xs text-[#2a4040]">Updates as you edit blocks</p>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <div className="max-w-[620px] mx-auto shadow-2xl rounded-lg overflow-hidden">
              <iframe
                ref={previewRef}
                title="Email Preview"
                className="w-full bg-[#080f0f] border-0"
                style={{ height: "800px", minHeight: "600px" }}
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
