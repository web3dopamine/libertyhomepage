import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2, Edit, Zap, Clock, Send, AlignLeft, Type, Image, MousePointerClick, Minus, Space, LayoutTemplate, Mail } from "lucide-react";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { blocksToBodyHtml } from "@shared/email-builder";
import type { EmailBlock, BlockType, Autoresponder, EmailTemplate, EmailCampaign } from "@shared/schema";
import { emailBlockDefaults } from "@shared/schema";
import { nanoid } from "nanoid";

const TRIGGER_LABELS: Record<string, string> = {
  waitlist_signup: "Waitlist Signup",
  accelerator_apply: "Accelerator Application",
  event_register: "Event Registration",
  newsletter_signup: "Newsletter Signup",
};

const BLOCK_ICONS: Record<BlockType, typeof Type> = {
  heading: Type,
  text: AlignLeft,
  image: Image,
  button: MousePointerClick,
  divider: Minus,
  spacer: Space,
};
const BLOCK_LABELS: Record<BlockType, string> = {
  heading: "Heading", text: "Text", image: "Image", button: "Button", divider: "Divider", spacer: "Spacer",
};
const BLOCK_TYPES: BlockType[] = ["heading", "text", "image", "button", "divider", "spacer"];

function SortableBlock({ block, isSelected, onSelect, onDelete }: {
  block: EmailBlock; isSelected: boolean; onSelect: () => void; onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const Icon = BLOCK_ICONS[block.type];
  const summary = () => {
    const p = block.props;
    if (block.type === "heading") return p.text?.slice(0, 50) || "Heading";
    if (block.type === "text") return p.content?.slice(0, 50) || "Text";
    if (block.type === "image") return p.src ? `Image: ${p.src.slice(0, 30)}` : "No URL";
    if (block.type === "button") return `${p.label || "Button"}`;
    if (block.type === "divider") return "Divider line";
    return `${p.height || "32"}px space`;
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={`flex items-center gap-2 rounded-md border cursor-pointer ${isSelected ? "border-[#2EB8B8] bg-[#0a2424]" : "border-[#1a3a3a] bg-[#0a1818] hover:border-[#2a4040]"}`}
        onClick={onSelect}
      >
        <div {...attributes} {...listeners} className="px-2 py-3 text-[#3a6060] cursor-grab" onClick={(e) => e.stopPropagation()}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><circle cx="4" cy="3" r="1.2"/><circle cx="10" cy="3" r="1.2"/><circle cx="4" cy="7" r="1.2"/><circle cx="10" cy="7" r="1.2"/><circle cx="4" cy="11" r="1.2"/><circle cx="10" cy="11" r="1.2"/></svg>
        </div>
        <Icon className="w-3.5 h-3.5 text-[#2EB8B8]" />
        <div className="flex-1 min-w-0 py-2">
          <span className="text-xs font-bold text-[#4a8080]">{BLOCK_LABELS[block.type]}</span>
          <p className="text-xs text-[#5a8080] truncate">{summary()}</p>
        </div>
        <Button size="icon" variant="ghost" className="mr-1 text-red-400/50 hover:text-red-400" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

function BlockEditorForm({ block, onChange }: { block: EmailBlock; onChange: (props: Record<string, string>) => void }) {
  const p = block.props;
  const f = (key: string, label: string, type: "text" | "textarea" | "url" | "color" | "number" = "text") => (
    <div key={key} className="mb-2">
      <label className="text-xs text-[#4a7070] block mb-1">{label}</label>
      {type === "textarea" ? (
        <textarea value={p[key] || ""} onChange={(e) => onChange({ ...p, [key]: e.target.value })} rows={3} className="w-full bg-[#040c0c] border border-[#1a3a3a] text-white text-xs rounded px-2 py-1.5 resize-none" />
      ) : type === "color" ? (
        <div className="flex gap-2">
          <input type="color" value={p[key] || "#2EB8B8"} onChange={(e) => onChange({ ...p, [key]: e.target.value })} className="w-7 h-7 rounded border border-[#1a3a3a] bg-transparent cursor-pointer" />
          <input value={p[key] || ""} onChange={(e) => onChange({ ...p, [key]: e.target.value })} className="flex-1 bg-[#040c0c] border border-[#1a3a3a] text-white text-xs rounded px-2 py-1.5 font-mono" />
        </div>
      ) : (
        <input type={type} value={p[key] || ""} onChange={(e) => onChange({ ...p, [key]: e.target.value })} className="w-full bg-[#040c0c] border border-[#1a3a3a] text-white text-xs rounded px-2 py-1.5" />
      )}
    </div>
  );
  switch (block.type) {
    case "heading": return <>{f("text","Text")}<div className="mb-2"><label className="text-xs text-[#4a7070] block mb-1">Size</label><select value={p.tag||"h1"} onChange={(e)=>onChange({...p,tag:e.target.value})} className="w-full bg-[#040c0c] border border-[#1a3a3a] text-white text-xs rounded px-2 py-1.5"><option value="h1">H1</option><option value="h2">H2</option><option value="h3">H3</option></select></div>{f("color","Color","color")}</>;
    case "text": return <>{f("content","Content","textarea")}{f("color","Color","color")}</>;
    case "image": return <>{f("src","Image URL","url")}{f("alt","Alt Text")}{f("link","Link URL","url")}</>;
    case "button": return <>{f("label","Label")}{f("url","URL","url")}{f("bgColor","Background","color")}{f("textColor","Text Color","color")}</>;
    case "divider": return <>{f("color","Color","color")}</>;
    case "spacer": return <>{f("height","Height (px)","number")}</>;
    default: return null;
  }
}

function BlockEditor({ blocks, setBlocks }: { blocks: EmailBlock[]; setBlocks: (b: EmailBlock[]) => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oi = blocks.findIndex(b => b.id === active.id);
      const ni = blocks.findIndex(b => b.id === over.id);
      setBlocks(arrayMove(blocks, oi, ni));
    }
  }
  function addBlock(type: BlockType) {
    const b: EmailBlock = { id: nanoid(), type, props: { ...emailBlockDefaults[type] } };
    setBlocks([...blocks, b]);
    setSelectedId(b.id);
  }
  function deleteBlock(id: string) {
    setBlocks(blocks.filter(b => b.id !== id));
    if (selectedId === id) setSelectedId(null);
  }
  function updateProps(id: string, props: Record<string, string>) {
    setBlocks(blocks.map(b => b.id === id ? { ...b, props } : b));
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-bold text-[#4a8080] mb-2">Add Block</p>
        <div className="grid grid-cols-3 gap-1">
          {BLOCK_TYPES.map(type => {
            const Icon = BLOCK_ICONS[type];
            return (
              <button key={type} onClick={() => addBlock(type)} className="flex flex-col items-center gap-1 py-2 px-1 rounded border border-[#1a3a3a] hover-elevate text-[#6a9090] text-xs bg-[#071212]">
                <Icon className="w-3.5 h-3.5 text-[#2EB8B8]" />
                {BLOCK_LABELS[type]}
              </button>
            );
          })}
        </div>
      </div>
      {blocks.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-1">
              {blocks.map(block => (
                <div key={block.id}>
                  <SortableBlock
                    block={block}
                    isSelected={selectedId === block.id}
                    onSelect={() => setSelectedId(selectedId === block.id ? null : block.id)}
                    onDelete={() => deleteBlock(block.id)}
                  />
                  {selectedId === block.id && (
                    <div className="mt-1 mb-1 rounded border border-[#2EB8B8]/30 bg-[#071f1f] p-3">
                      <BlockEditorForm block={block} onChange={(p) => updateProps(block.id, p)} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

const ALL_LISTS = [
  { id: "waitlist", label: "Waitlist" },
  { id: "accelerator", label: "Accelerator" },
  { id: "events", label: "Event Registrants" },
  { id: "newsletter", label: "Newsletter Subscribers" },
];

function AutoresponderDialog({
  ar, open, onClose,
}: { ar?: Autoresponder | null; open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const isEdit = !!ar;

  // Basic settings
  const [name, setName] = useState(ar?.name || "");
  const [trigger, setTrigger] = useState<string>(ar?.trigger || "waitlist_signup");
  const [subject, setSubject] = useState(ar?.subject || "");
  const [blocks, setBlocks] = useState<EmailBlock[]>(ar?.blocks || []);
  const [tab, setTab] = useState("settings");

  // Delay – stored in hours, shown in hours or days
  const initHours = ar?.delayHours ?? 0;
  const [delayUnit, setDelayUnit] = useState<"hours" | "days">(initHours > 0 && initHours % 24 === 0 ? "days" : "hours");
  const [delayAmount, setDelayAmount] = useState(initHours > 0 && initHours % 24 === 0 ? initHours / 24 : initHours);
  const delayHours = delayUnit === "days" ? delayAmount * 24 : delayAmount;

  // Audience lists to broadcast to
  const [broadcastLists, setBroadcastLists] = useState<string[]>(ar?.broadcastLists || []);
  const toggleList = (id: string) => setBroadcastLists(prev =>
    prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
  );
  const toggleAll = () => setBroadcastLists(broadcastLists.length === ALL_LISTS.length ? [] : ALL_LISTS.map(l => l.id));

  // Content source
  const [sourceType, setSourceType] = useState<string>(ar?.sourceType || "custom");
  const [selectedTemplateId, setSelectedTemplateId] = useState(ar?.sourceType === "template" ? ar.sourceId : "");
  const [selectedCampaignId, setSelectedCampaignId] = useState(ar?.sourceType === "campaign" ? ar.sourceId : "");

  const { data: templates = [] } = useQuery<EmailTemplate[]>({ queryKey: ["/api/email-templates"] });
  const { data: campaigns = [] } = useQuery<EmailCampaign[]>({ queryKey: ["/api/campaigns"] });

  function loadFromTemplate(id: string) {
    const tpl = templates.find(t => t.id === id);
    if (!tpl) return;
    setBlocks(tpl.blocks.map(b => ({ ...b, id: nanoid() })));
    setSelectedTemplateId(id);
    setSourceType("template");
    toast({ title: `Loaded "${tpl.name}"` });
    setTab("content");
  }

  function loadFromCampaign(id: string) {
    const camp = campaigns.find(c => c.id === id);
    if (!camp) return;
    setBlocks(camp.blocks.map(b => ({ ...b, id: nanoid() })));
    if (!subject && camp.subject) setSubject(camp.subject);
    setSelectedCampaignId(id);
    setSourceType("campaign");
    toast({ title: `Loaded from "${camp.name}"` });
    setTab("content");
  }

  const previewHtml = () => {
    const body = blocksToBodyHtml(blocks);
    return `<html><head><style>body{margin:0;padding:16px;background:#0b1818;font-family:sans-serif;color:#7aacac;}</style></head><body>${body || '<p style="color:#4a7070;font-style:italic;">No blocks yet...</p>'}</body></html>`;
  };

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        name, trigger, delayHours, subject, blocks, active: true,
        sourceType, sourceId: sourceType === "template" ? selectedTemplateId : sourceType === "campaign" ? selectedCampaignId : "",
        broadcastLists,
      };
      return isEdit
        ? apiRequest("PUT", `/api/autoresponders/${ar!.id}`, payload)
        : apiRequest("POST", "/api/autoresponders", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/autoresponders"] });
      toast({ title: isEdit ? "Autoresponder updated" : "Autoresponder created" });
      onClose();
    },
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0a1818] border-[#1a3a3a] max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">{isEdit ? "Edit Autoresponder" : "New Autoresponder"}</DialogTitle>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-[#071212] border border-[#1a3a3a] mb-4 flex-wrap h-auto gap-0">
            <TabsTrigger value="settings" className="data-[state=active]:bg-[#0a2424] data-[state=active]:text-[#2EB8B8] text-[#4a7070]">Settings</TabsTrigger>
            <TabsTrigger value="audience" className="data-[state=active]:bg-[#0a2424] data-[state=active]:text-[#2EB8B8] text-[#4a7070]">Audience</TabsTrigger>
            <TabsTrigger value="source" className="data-[state=active]:bg-[#0a2424] data-[state=active]:text-[#2EB8B8] text-[#4a7070]">Content Source</TabsTrigger>
            <TabsTrigger value="content" className="data-[state=active]:bg-[#0a2424] data-[state=active]:text-[#2EB8B8] text-[#4a7070]">Email Editor</TabsTrigger>
            <TabsTrigger value="preview" className="data-[state=active]:bg-[#0a2424] data-[state=active]:text-[#2EB8B8] text-[#4a7070]">Preview</TabsTrigger>
          </TabsList>

          {/* ── Settings ── */}
          <TabsContent value="settings" className="space-y-5">
            <div>
              <label className="text-xs font-bold text-[#4a8080] block mb-1">Name</label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Welcome Email" className="bg-[#071212] border-[#1a3a3a] text-white" data-testid="input-autoresponder-name" />
            </div>

            <div>
              <label className="text-xs font-bold text-[#4a8080] block mb-1">Trigger Event</label>
              <Select value={trigger} onValueChange={setTrigger}>
                <SelectTrigger className="bg-[#071212] border-[#1a3a3a] text-white" data-testid="select-autoresponder-trigger">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0a1818] border-[#1a3a3a]">
                  <SelectItem value="waitlist_signup">Waitlist Signup</SelectItem>
                  <SelectItem value="accelerator_apply">Accelerator Application</SelectItem>
                  <SelectItem value="event_register">Event Registration</SelectItem>
                  <SelectItem value="newsletter_signup">Newsletter Signup</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-[#4a7070] mt-1">This autoresponder fires when someone completes the selected action.</p>
            </div>

            <div>
              <label className="text-xs font-bold text-[#4a8080] block mb-1">Send Delay</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  value={delayAmount}
                  onChange={e => setDelayAmount(Number(e.target.value))}
                  className="bg-[#071212] border-[#1a3a3a] text-white w-24"
                  data-testid="input-autoresponder-delay"
                />
                <Select value={delayUnit} onValueChange={(v) => setDelayUnit(v as "hours" | "days")}>
                  <SelectTrigger className="bg-[#071212] border-[#1a3a3a] text-white w-28" data-testid="select-autoresponder-delay-unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a1818] border-[#1a3a3a]">
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-[#5a8080]">after trigger</span>
              </div>
              <p className="text-xs text-[#4a7070] mt-1">
                {delayAmount === 0 ? "Sends immediately when triggered." : `Sends ${delayAmount} ${delayUnit} after the trigger event. = ${delayHours} hours total.`}
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-[#4a8080] block mb-1">Subject Line</label>
              <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Email subject..." className="bg-[#071212] border-[#1a3a3a] text-white" data-testid="input-autoresponder-subject" />
            </div>
          </TabsContent>

          {/* ── Audience ── */}
          <TabsContent value="audience" className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-[#e0f0f0] mb-1">Send to triggering individual</p>
              <p className="text-xs text-[#4a7070]">This autoresponder always sends to the person who triggered it (e.g. the person who just signed up).</p>
            </div>
            <div className="border-t border-[#1a3a3a] pt-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-[#e0f0f0]">Also broadcast to contact lists</p>
                  <p className="text-xs text-[#4a7070] mt-0.5">Optionally send to everyone on these lists when this autoresponder fires.</p>
                </div>
                <Button variant="ghost" size="sm" onClick={toggleAll} className="text-[#2EB8B8] text-xs shrink-0" data-testid="button-toggle-all-lists">
                  {broadcastLists.length === ALL_LISTS.length ? "Deselect All" : "Select All"}
                </Button>
              </div>
              <div className="space-y-3">
                {ALL_LISTS.map(list => (
                  <div key={list.id} className="flex items-center gap-3 rounded-md border border-[#1a3a3a] bg-[#071212] px-4 py-3" data-testid={`checkbox-list-${list.id}`}>
                    <Checkbox
                      id={`list-${list.id}`}
                      checked={broadcastLists.includes(list.id)}
                      onCheckedChange={() => toggleList(list.id)}
                      className="border-[#2EB8B8] data-[state=checked]:bg-[#2EB8B8] data-[state=checked]:border-[#2EB8B8]"
                    />
                    <label htmlFor={`list-${list.id}`} className="text-sm text-[#c0d8d8] cursor-pointer select-none">{list.label}</label>
                  </div>
                ))}
              </div>
              {broadcastLists.length > 0 && (
                <p className="text-xs text-[#2EB8B8] mt-3">
                  Broadcasting to: {broadcastLists.map(l => ALL_LISTS.find(x => x.id === l)?.label).join(", ")}
                </p>
              )}
            </div>
          </TabsContent>

          {/* ── Content Source ── */}
          <TabsContent value="source" className="space-y-5">
            <div>
              <p className="text-sm font-semibold text-[#e0f0f0] mb-1">Load from Template</p>
              <p className="text-xs text-[#4a7070] mb-3">Pick a saved or premium template to pre-fill the email editor.</p>
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {templates.map(tpl => (
                  <div key={tpl.id} className={`flex items-center justify-between gap-2 rounded-md border px-3 py-2.5 bg-[#071212] ${selectedTemplateId === tpl.id && sourceType === "template" ? "border-[#2EB8B8]" : "border-[#1a3a3a]"}`} data-testid={`source-template-${tpl.id}`}>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#e0f0f0] truncate">{tpl.name}</p>
                      {tpl.isPremium && <Badge className="text-[10px] bg-yellow-900/30 text-yellow-400 border-yellow-800 mt-0.5">Premium</Badge>}
                    </div>
                    <Button size="sm" variant="ghost" className="shrink-0 text-[#2EB8B8]" onClick={() => loadFromTemplate(tpl.id)} data-testid={`button-load-source-template-${tpl.id}`}>
                      {selectedTemplateId === tpl.id && sourceType === "template" ? "Loaded" : "Use"}
                    </Button>
                  </div>
                ))}
                {templates.length === 0 && <p className="text-xs text-[#4a7070]">No templates saved yet.</p>}
              </div>
            </div>

            <div className="border-t border-[#1a3a3a] pt-4">
              <p className="text-sm font-semibold text-[#e0f0f0] mb-1">Load from Campaign</p>
              <p className="text-xs text-[#4a7070] mb-3">Copy the blocks from an existing campaign email.</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {campaigns.filter(c => c.blocks?.length > 0).map(camp => (
                  <div key={camp.id} className={`flex items-center justify-between gap-2 rounded-md border px-3 py-2.5 bg-[#071212] ${selectedCampaignId === camp.id && sourceType === "campaign" ? "border-[#2EB8B8]" : "border-[#1a3a3a]"}`} data-testid={`source-campaign-${camp.id}`}>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#e0f0f0] truncate">{camp.name || "Unnamed Campaign"}</p>
                      <p className="text-xs text-[#4a7070] truncate">{camp.subject}</p>
                    </div>
                    <Button size="sm" variant="ghost" className="shrink-0 text-[#2EB8B8]" onClick={() => loadFromCampaign(camp.id)} data-testid={`button-load-source-campaign-${camp.id}`}>
                      {selectedCampaignId === camp.id && sourceType === "campaign" ? "Loaded" : "Use"}
                    </Button>
                  </div>
                ))}
                {campaigns.filter(c => c.blocks?.length > 0).length === 0 && <p className="text-xs text-[#4a7070]">No campaigns with content found.</p>}
              </div>
            </div>

            <div className="border-t border-[#1a3a3a] pt-4">
              <Button variant="outline" size="sm" className="border-[#1a3a3a] text-[#7aacac]" onClick={() => { setSourceType("custom"); setTab("content"); }} data-testid="button-build-custom">
                Build Custom Email Instead
              </Button>
            </div>
          </TabsContent>

          {/* ── Email Editor ── */}
          <TabsContent value="content">
            <BlockEditor blocks={blocks} setBlocks={setBlocks} />
          </TabsContent>

          {/* ── Preview ── */}
          <TabsContent value="preview">
            <div className="rounded-lg overflow-hidden border border-[#1a3a3a]">
              <iframe
                srcDoc={previewHtml()}
                title="Preview"
                className="w-full border-0"
                style={{ height: "400px" }}
                sandbox="allow-same-origin"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-4 border-t border-[#1a3a3a]">
          <div className="text-xs text-[#4a7070]">
            {broadcastLists.length > 0 && (
              <span>Lists: {broadcastLists.map(l => ALL_LISTS.find(x => x.id === l)?.label).join(", ")}</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose} className="text-[#7aacac]">Cancel</Button>
            <Button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || !name.trim() || !subject.trim()}
              className="bg-[#2EB8B8] text-black font-bold"
              data-testid="button-save-autoresponder"
            >
              {mutation.isPending ? "Saving..." : isEdit ? "Save Changes" : "Create Autoresponder"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminAutoresponders() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Autoresponder | null>(null);

  const { data: autoresponders = [], isLoading } = useQuery<Autoresponder[]>({
    queryKey: ["/api/autoresponders"],
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      apiRequest("PUT", `/api/autoresponders/${id}`, { active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/autoresponders"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/autoresponders/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/autoresponders"] });
      toast({ title: "Autoresponder deleted" });
    },
  });

  return (
    <div className="min-h-screen bg-[#050e0e] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-white">Autoresponders</h1>
            <p className="text-sm text-[#4a8080] mt-0.5">Automated emails triggered by user actions</p>
          </div>
          <Button
            onClick={() => { setEditTarget(null); setDialogOpen(true); }}
            className="bg-[#2EB8B8] text-black font-bold"
            data-testid="button-new-autoresponder"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Autoresponder
          </Button>
        </div>

        {/* Info box */}
        <div className="mb-6 bg-[#0a2020] border border-[#2EB8B8]/20 rounded-lg px-4 py-3 flex items-start gap-3">
          <Zap className="w-4 h-4 text-[#2EB8B8] mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-[#7aacac] font-semibold">How autoresponders work</p>
            <p className="text-xs text-[#4a8080] mt-0.5">Autoresponders automatically fire when the specified trigger occurs. For immediate sends (0h delay), they fire at the moment of the action. For delayed sends, the server schedules them while running. A Resend API key must be configured in Settings.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-[#4a8080]">Loading...</div>
        ) : autoresponders.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#1a3a3a] rounded-lg">
            <Zap className="w-10 h-10 text-[#2EB8B8]/20 mx-auto mb-4" />
            <p className="text-[#7aacac] font-semibold mb-1">No autoresponders yet</p>
            <p className="text-sm text-[#4a7070] mb-6">Create one to automatically email users when they sign up or apply.</p>
            <Button onClick={() => { setEditTarget(null); setDialogOpen(true); }} className="bg-[#2EB8B8] text-black font-bold">
              <Plus className="w-4 h-4 mr-2" /> Create Autoresponder
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {autoresponders.map((ar) => (
              <div key={ar.id} className="bg-[#0a1818] border border-[#1a3a3a] rounded-lg px-5 py-4 flex items-start gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap gap-y-1">
                    <h3 className="font-bold text-white" data-testid={`ar-name-${ar.id}`}>{ar.name}</h3>
                    <Badge className={`text-xs border shrink-0 ${ar.active ? "bg-teal-900/50 text-teal-300 border-teal-700" : "bg-zinc-800 text-zinc-400 border-zinc-700"}`}>
                      {ar.active ? "Active" : "Paused"}
                    </Badge>
                  </div>
                  <p className="text-sm text-[#5a9090] mb-1">{ar.subject || "(no subject)"}</p>
                  <div className="flex items-center gap-4 text-xs text-[#4a7070] flex-wrap">
                    <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{TRIGGER_LABELS[ar.trigger] || ar.trigger}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{ar.delayHours === 0 ? "Immediate" : ar.delayHours % 24 === 0 ? `${ar.delayHours / 24}d delay` : `${ar.delayHours}h delay`}</span>
                    <span className="flex items-center gap-1"><Send className="w-3 h-3" />{ar.sentCount} sent</span>
                    <span>{ar.blocks.length} block{ar.blocks.length !== 1 ? "s" : ""}</span>
                    {ar.broadcastLists?.length > 0 && (
                      <span className="flex items-center gap-1 text-[#2EB8B8]">
                        <Mail className="w-3 h-3" />+{ar.broadcastLists.length} list{ar.broadcastLists.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={ar.active}
                      onCheckedChange={(v) => toggleMutation.mutate({ id: ar.id, active: v })}
                      data-testid={`toggle-ar-${ar.id}`}
                    />
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => { setEditTarget(ar); setDialogOpen(true); }} data-testid={`button-edit-ar-${ar.id}`}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost" data-testid={`button-delete-ar-${ar.id}`}>
                        <Trash2 className="w-4 h-4 text-red-400/60" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-[#0a1818] border-[#1a3a3a]">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Delete Autoresponder</AlertDialogTitle>
                        <AlertDialogDescription className="text-[#7aacac]">Delete "{ar.name}"? This cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-[#1a3a3a] text-[#7aacac]">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteMutation.mutate(ar.id)} className="bg-red-600 text-white">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AutoresponderDialog
        ar={editTarget}
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditTarget(null); }}
      />
    </div>
  );
}
