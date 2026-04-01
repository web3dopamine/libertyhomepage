import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  GripVertical, LayoutList, Save, RotateCcw,
  Gauge, Radio, Code2, Globe, Network, Shield,
  Newspaper, Handshake, Mail, Map,
} from "lucide-react";

// ── Section registry ────────────────────────────────────────────────────────
const DEFAULT_ORDER = [
  "performance", "meshtastic", "evm", "network",
  "trilemma", "ecosystem", "press", "partners", "newsletter", "roadmap",
];

const SECTION_META: Record<string, {
  label: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = {
  performance:  { label: "Performance",     description: "TPS stats, zero gas fees, and instant finality metrics",          Icon: Gauge },
  meshtastic:   { label: "Meshtastic",      description: "Mesh networking and Meshtastic integration overview",             Icon: Radio },
  evm:          { label: "EVM Compatible",  description: "EVM compatibility details and developer tooling",                 Icon: Code2 },
  network:      { label: "Network",         description: "Testnet overview, validator requirements, join the network",      Icon: Network },
  trilemma:     { label: "Trilemma",        description: "Scalability, security, and decentralization deep dive",          Icon: Shield },
  ecosystem:    { label: "Ecosystem",       description: "Partner dApps, integrations, and ecosystem overview",            Icon: Globe },
  press:        { label: "Press",           description: "Media coverage and press mentions",                               Icon: Newspaper },
  partners:     { label: "Partners",        description: "Strategic partners and collaborators",                            Icon: Handshake },
  newsletter:   { label: "Newsletter",      description: "Newsletter signup form for visitors",                             Icon: Mail },
  roadmap:      { label: "Roadmap",         description: "Vision badge, headline, and milestone timeline",                 Icon: Map },
};

export default function AdminSections() {
  const { toast } = useToast();

  const { data: savedOrder = [] } = useQuery<string[]>({
    queryKey: ["/api/section-order"],
  });

  const [localOrder, setLocalOrder] = useState<string[]>([]);
  const isDirty = localOrder.join(",") !== savedOrder.join(",");

  // Sync from server (only when not dirty)
  useEffect(() => {
    if (savedOrder.length > 0) {
      setLocalOrder(savedOrder);
    }
  }, [savedOrder.join(",")]);

  // ── Drag-to-reorder ─────────────────────────────────────────────────────
  const dragIdx = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  function onDragStart(i: number) { dragIdx.current = i; }
  function onDragEnter(i: number) { setDragOver(i); }

  function onDrop() {
    const from = dragIdx.current;
    const to = dragOver;
    if (from === null || to === null || from === to) return;
    const next = [...localOrder];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setLocalOrder(next);
    dragIdx.current = null;
    setDragOver(null);
  }

  function onDragEnd() {
    setDragOver(null);
    dragIdx.current = null;
  }

  // ── Move with arrow buttons ─────────────────────────────────────────────
  function moveUp(i: number) {
    if (i === 0) return;
    const next = [...localOrder];
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    setLocalOrder(next);
  }

  function moveDown(i: number) {
    if (i === localOrder.length - 1) return;
    const next = [...localOrder];
    [next[i], next[i + 1]] = [next[i + 1], next[i]];
    setLocalOrder(next);
  }

  // ── Save mutation ───────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: (order: string[]) =>
      apiRequest("PUT", "/api/section-order", order).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/section-order"] });
      toast({ title: "Section order saved" });
    },
    onError: () => toast({ title: "Failed to save order", variant: "destructive" }),
  });

  function handleReset() {
    setLocalOrder(DEFAULT_ORDER);
    toast({ title: "Reset to default order — click Save to apply" });
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <LayoutList className="w-5 h-5 text-primary" />
              <h1 className="text-2xl font-bold">Section Order</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Drag or use the arrow buttons to reorder the homepage sections. Hero and Footer are fixed.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="default"
              onClick={handleReset}
              disabled={saveMutation.isPending}
              data-testid="button-reset-order"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Default
            </Button>
            <Button
              size="default"
              onClick={() => saveMutation.mutate(localOrder)}
              disabled={!isDirty || saveMutation.isPending}
              data-testid="button-save-order"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveMutation.isPending ? "Saving…" : "Save Order"}
            </Button>
          </div>
        </div>

        {/* Fixed: Hero (always first) */}
        <div className="mb-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-1">Always First</p>
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border/40 bg-muted/20 opacity-50 cursor-not-allowed select-none">
            <div className="w-8 flex items-center justify-center text-muted-foreground/30">
              <GripVertical className="w-4 h-4" />
            </div>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-none">
              <Gauge className="w-4 h-4 text-primary/50" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground/50">Hero</p>
              <p className="text-xs text-muted-foreground/50">Main landing section with headline, CTA, and globe</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 bg-muted/30 px-2 py-0.5 rounded-full">Fixed</span>
          </div>
        </div>

        {/* Reorderable sections */}
        <div className="my-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-1">Reorderable Sections</p>
          <div className="flex flex-col gap-2">
            {localOrder.map((id, i) => {
              const meta = SECTION_META[id];
              if (!meta) return null;
              const { label, description, Icon } = meta;
              const isOver = dragOver === i;

              return (
                <div
                  key={id}
                  draggable
                  onDragStart={() => onDragStart(i)}
                  onDragEnter={() => onDragEnter(i)}
                  onDragOver={e => e.preventDefault()}
                  onDrop={onDrop}
                  onDragEnd={onDragEnd}
                  data-testid={`section-row-${id}`}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-150 cursor-grab active:cursor-grabbing select-none ${
                    isOver
                      ? "border-primary/50 bg-primary/8 scale-[1.01]"
                      : "border-border/40 bg-card hover-elevate"
                  }`}
                >
                  {/* Drag handle */}
                  <div className="w-8 flex items-center justify-center text-muted-foreground/40 flex-none">
                    <GripVertical className="w-4 h-4" />
                  </div>

                  {/* Section icon */}
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-none">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="text-xs text-muted-foreground truncate">{description}</p>
                  </div>

                  {/* Position number */}
                  <span className="text-[11px] font-bold text-muted-foreground/50 w-5 text-right flex-none">
                    {i + 2}
                  </span>

                  {/* Up / Down buttons */}
                  <div className="flex flex-col gap-0.5 flex-none">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-5 w-5"
                      onClick={() => moveUp(i)}
                      disabled={i === 0}
                      data-testid={`button-move-up-${id}`}
                      title="Move up"
                    >
                      <span className="text-[10px] leading-none">▲</span>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-5 w-5"
                      onClick={() => moveDown(i)}
                      disabled={i === localOrder.length - 1}
                      data-testid={`button-move-down-${id}`}
                      title="Move down"
                    >
                      <span className="text-[10px] leading-none">▼</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fixed: Footer (always last) */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-1">Always Last</p>
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border/40 bg-muted/20 opacity-50 cursor-not-allowed select-none">
            <div className="w-8 flex items-center justify-center text-muted-foreground/30">
              <GripVertical className="w-4 h-4" />
            </div>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-none">
              <Mail className="w-4 h-4 text-primary/50" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground/50">Connect / Footer</p>
              <p className="text-xs text-muted-foreground/50">Final CTA section and footer links</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 bg-muted/30 px-2 py-0.5 rounded-full">Fixed</span>
          </div>
        </div>

        {isDirty && (
          <p className="mt-6 text-xs text-primary font-medium text-center">
            You have unsaved changes — click "Save Order" to apply them.
          </p>
        )}
      </div>
    </div>
  );
}
