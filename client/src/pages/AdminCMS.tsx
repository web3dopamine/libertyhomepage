import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { cmsPages, type CMSPage, type CMSField, type CMSSection } from "@/lib/cms-schema";
import {
  ArrowLeft,
  Home,
  Code2,
  Users,
  Radio,
  Shield,
  Globe,
  Building2,
  MessageSquare,
  RefreshCw,
  Save,
  RotateCcw,
  ExternalLink,
  Eye,
  EyeOff,
  Pencil,
  Copy,
  Plus,
  Trash2,
  FileText,
} from "lucide-react";

interface CustomPageDef {
  id: string;
  title: string;
  path: string;
  createdAt: string;
}

const PAGE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home,
  build: Code2,
  community: Users,
  "resilience-layer": Radio,
  validators: Shield,
  ecosystem: Globe,
  institutions: Building2,
  "mesh-messaging": MessageSquare,
};

const CUSTOM_PAGE_SECTIONS: CMSSection[] = [
  {
    id: "hero",
    label: "Hero Section",
    fields: [
      { key: "hero.badge", label: "Badge Text", type: "text", defaultValue: "", hint: "Optional badge above the headline" },
      { key: "hero.title", label: "Headline", type: "text", defaultValue: "Page Title" },
      { key: "hero.subtitle", label: "Subtitle / Body Text", type: "textarea", defaultValue: "" },
      { key: "hero.cta1", label: "Primary Button Text", type: "text", defaultValue: "" },
      { key: "hero.cta1Url", label: "Primary Button URL", type: "url", defaultValue: "" },
      { key: "hero.cta2", label: "Secondary Button Text", type: "text", defaultValue: "" },
      { key: "hero.cta2Url", label: "Secondary Button URL", type: "url", defaultValue: "" },
    ],
  },
  {
    id: "section2",
    label: "Second Section (Optional)",
    fields: [
      { key: "section2.title", label: "Section Title", type: "text", defaultValue: "" },
      { key: "section2.body", label: "Section Body Text", type: "textarea", defaultValue: "" },
    ],
  },
  {
    id: "cards",
    label: "Feature Cards (up to 3)",
    fields: [
      { key: "card1.title", label: "Card 1 Title", type: "text", defaultValue: "" },
      { key: "card1.description", label: "Card 1 Description", type: "textarea", defaultValue: "" },
      { key: "card1.cta", label: "Card 1 Button Text", type: "text", defaultValue: "" },
      { key: "card1.ctaUrl", label: "Card 1 Button URL", type: "url", defaultValue: "" },
      { key: "card2.title", label: "Card 2 Title", type: "text", defaultValue: "" },
      { key: "card2.description", label: "Card 2 Description", type: "textarea", defaultValue: "" },
      { key: "card2.cta", label: "Card 2 Button Text", type: "text", defaultValue: "" },
      { key: "card2.ctaUrl", label: "Card 2 Button URL", type: "url", defaultValue: "" },
      { key: "card3.title", label: "Card 3 Title", type: "text", defaultValue: "" },
      { key: "card3.description", label: "Card 3 Description", type: "textarea", defaultValue: "" },
      { key: "card3.cta", label: "Card 3 Button Text", type: "text", defaultValue: "" },
      { key: "card3.ctaUrl", label: "Card 3 Button URL", type: "url", defaultValue: "" },
    ],
  },
  {
    id: "cta",
    label: "Bottom CTA Section (Optional)",
    fields: [
      { key: "cta.title", label: "CTA Headline", type: "text", defaultValue: "" },
      { key: "cta.body", label: "CTA Body Text", type: "textarea", defaultValue: "" },
      { key: "cta.button1Label", label: "Button 1 Text", type: "text", defaultValue: "" },
      { key: "cta.button1Url", label: "Button 1 URL", type: "url", defaultValue: "" },
      { key: "cta.button2Label", label: "Button 2 Text", type: "text", defaultValue: "" },
      { key: "cta.button2Url", label: "Button 2 URL", type: "url", defaultValue: "" },
    ],
  },
];

function FieldEditor({
  field,
  value,
  onChange,
}: {
  field: CMSField;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">{field.label}</Label>
        {value !== field.defaultValue && value !== "" && (
          <Badge variant="secondary" className="text-xs">edited</Badge>
        )}
      </div>
      {field.hint && (
        <p className="text-xs text-muted-foreground">{field.hint}</p>
      )}
      {field.type === "textarea" ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="text-sm font-mono resize-y"
          data-testid={`cms-field-${field.key}`}
        />
      ) : (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-sm"
          data-testid={`cms-field-${field.key}`}
        />
      )}
      {field.defaultValue && (
        <p className="text-xs text-muted-foreground/60 truncate">
          Default: {field.defaultValue.length > 80 ? field.defaultValue.slice(0, 80) + "…" : field.defaultValue}
        </p>
      )}
    </div>
  );
}

function CMSEditor({
  page,
  sections,
  onSaved,
  onClone,
  isCustom,
  onDeleteCustom,
}: {
  page: CMSPage;
  sections: CMSSection[];
  onSaved: () => void;
  onClone: (currentContent: Record<string, string>) => void;
  isCustom: boolean;
  onDeleteCustom?: () => void;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const allFields = sections.flatMap((s) => s.fields);

  const { data: savedContent = {} } = useQuery<Record<string, string>>({
    queryKey: [`/api/cms/content/${page.id}`],
  });

  const [editedValues, setEditedValues] = useState<Record<string, string>>(() => {
    const d: Record<string, string> = {};
    allFields.forEach((f) => { d[f.key] = f.defaultValue; });
    return d;
  });

  const savedInitialized = useRef(false);
  useEffect(() => {
    if (!savedInitialized.current && Object.keys(savedContent).length > 0) {
      savedInitialized.current = true;
      setEditedValues((prev) => {
        const next = { ...prev };
        allFields.forEach((f) => {
          if (savedContent[f.key] !== undefined) next[f.key] = savedContent[f.key];
        });
        return next;
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedContent]);

  // Reset when page changes
  useEffect(() => {
    savedInitialized.current = false;
    const d: Record<string, string> = {};
    allFields.forEach((f) => { d[f.key] = f.defaultValue; });
    setEditedValues(d);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.id]);

  const saveMutation = useMutation({
    mutationFn: async (fields: Record<string, string>) => {
      await apiRequest("PUT", `/api/cms/content/${page.id}`, fields);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/cms/content/${page.id}`] });
      toast({ title: "Saved", description: `${page.title} page content updated.` });
      onSaved();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save content.", variant: "destructive" });
    },
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/cms/content/${page.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/cms/content/${page.id}`] });
      const defaults: Record<string, string> = {};
      allFields.forEach((f) => { defaults[f.key] = f.defaultValue; });
      setEditedValues(defaults);
      savedInitialized.current = false;
      toast({ title: "Reset", description: `${page.title} restored to defaults.` });
      onSaved();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to reset content.", variant: "destructive" });
    },
  });

  const hasChanges = allFields.some(
    (f) => editedValues[f.key] !== (savedContent[f.key] ?? f.defaultValue)
  );

  const handleSave = () => {
    const toSave: Record<string, string> = {};
    allFields.forEach((f) => {
      toSave[f.key] = editedValues[f.key] ?? f.defaultValue;
    });
    saveMutation.mutate(toSave);
  };

  const handleReset = () => {
    if (confirm(`Reset all ${page.title} page content to defaults?`)) {
      resetMutation.mutate();
    }
  };

  const handleClone = () => {
    const content: Record<string, string> = {};
    allFields.forEach((f) => {
      content[f.key] = editedValues[f.key] ?? f.defaultValue;
    });
    onClone(content);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Editor header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 shrink-0">
        <div className="min-w-0">
          <h2 className="font-bold text-base truncate">{page.title}</h2>
          <p className="text-xs text-muted-foreground font-mono">{page.path}</p>
        </div>
        <div className="flex gap-1 shrink-0 ml-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleClone}
            title="Clone this page"
            data-testid="button-cms-clone"
          >
            <Copy className="w-4 h-4" />
          </Button>
          {isCustom && onDeleteCustom && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                if (confirm(`Delete the "${page.title}" custom page?`)) onDeleteCustom();
              }}
              title="Delete custom page"
              data-testid="button-cms-delete"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleReset}
            disabled={resetMutation.isPending}
            data-testid="button-cms-reset"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saveMutation.isPending || !hasChanges}
            data-testid="button-cms-save"
          >
            <Save className="w-4 h-4 mr-1" />
            {saveMutation.isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {sections.map((section) => (
          <div key={section.id}>
            <div className="flex items-center gap-2 mb-3">
              <Pencil className="w-3.5 h-3.5 text-primary" />
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider">{section.label}</h3>
            </div>
            <div className="space-y-4">
              {section.fields.map((field) => (
                <FieldEditor
                  key={field.key}
                  field={field}
                  value={editedValues[field.key] ?? field.defaultValue}
                  onChange={(val) => setEditedValues((prev) => ({ ...prev, [field.key]: val }))}
                />
              ))}
            </div>
            <Separator className="mt-6" />
          </div>
        ))}

        {hasChanges && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-primary">
            You have unsaved changes. Click Save to apply them.
          </div>
        )}
      </div>
    </div>
  );
}

function PreviewPanel({ page, refreshKey }: { page: CMSPage; refreshKey: number }) {
  const [showPreview, setShowPreview] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const previewUrl = window.location.origin + page.path;

  return (
    <div className="flex flex-col h-full border-l border-border/50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 shrink-0">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Preview</span>
          <Badge variant="outline" className="text-xs font-mono">{page.path}</Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" onClick={handleRefresh} title="Refresh preview" data-testid="button-preview-refresh">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => setShowPreview((v) => !v)} title={showPreview ? "Hide preview" : "Show preview"}>
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
          <Button size="icon" variant="ghost" asChild title="Open in new tab">
            <a href={previewUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </div>

      {showPreview ? (
        <div className="flex-1 overflow-hidden">
          <iframe
            key={refreshKey}
            ref={iframeRef}
            src={previewUrl}
            className="w-full h-full border-0"
            title={`Preview of ${page.title}`}
            data-testid="iframe-cms-preview"
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center space-y-2">
            <EyeOff className="w-8 h-8 mx-auto opacity-30" />
            <p className="text-sm">Preview hidden</p>
            <Button size="sm" variant="outline" onClick={() => setShowPreview(true)}>Show Preview</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function NewPageDialog({
  open,
  onOpenChange,
  onCreated,
  cloneContent,
  cloneTitle,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (pageId: string) => void;
  cloneContent?: Record<string, string>;
  cloneTitle?: string;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [title, setTitle] = useState(cloneTitle ? `Copy of ${cloneTitle}` : "");
  const [slug, setSlug] = useState("");

  useEffect(() => {
    if (open) {
      setTitle(cloneTitle ? `Copy of ${cloneTitle}` : "");
      setSlug("");
    }
  }, [open, cloneTitle]);

  const createMutation = useMutation({
    mutationFn: async () => {
      const path = `/custom/${slug.replace(/^\//, "").replace(/\s+/g, "-").toLowerCase()}`;
      const res = await apiRequest("POST", "/api/cms/pages", {
        title: title.trim(),
        path,
        cloneContent: cloneContent || undefined,
      });
      return res.json();
    },
    onSuccess: (page: CustomPageDef) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/pages"] });
      toast({ title: cloneContent ? "Page cloned!" : "Page created!", description: `"${page.title}" is ready to edit.` });
      onCreated(page.id);
      onOpenChange(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create page.", variant: "destructive" });
    },
  });

  const autoSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{cloneContent ? "Clone Page" : "New Custom Page"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Page Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Partnership Program"
              data-testid="input-page-title"
            />
          </div>
          <div className="space-y-1.5">
            <Label>URL Slug</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground font-mono">/custom/</span>
              <Input
                value={slug || autoSlug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder={autoSlug || "my-page"}
                className="font-mono text-sm"
                data-testid="input-page-slug"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Final URL: /custom/{slug || autoSlug || "my-page"}
            </p>
          </div>
          {cloneContent && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-primary">
              Content from the original page will be copied to this new page.
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending || !title.trim()}
            data-testid="button-create-page"
          >
            {createMutation.isPending ? "Creating…" : cloneContent ? "Clone Page" : "Create Page"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CMSContent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedPageId, setSelectedPageId] = useState<string>(cmsPages[0].id);
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0);
  const [showNewPageDialog, setShowNewPageDialog] = useState(false);
  const [cloneState, setCloneState] = useState<{ content: Record<string, string>; title: string } | null>(null);

  const { data: customPages = [] } = useQuery<CustomPageDef[]>({
    queryKey: ["/api/cms/pages"],
  });

  const deletePageMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/cms/pages/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/pages"] });
      setSelectedPageId(cmsPages[0].id);
      toast({ title: "Page deleted" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete page.", variant: "destructive" });
    },
  });

  const builtInPage = cmsPages.find((p) => p.id === selectedPageId);
  const customPage = customPages.find((p) => p.id === selectedPageId);

  const activePage: CMSPage | null = builtInPage
    ? builtInPage
    : customPage
    ? { id: customPage.id, title: customPage.title, path: customPage.path, sections: CUSTOM_PAGE_SECTIONS, isCustom: true }
    : null;

  const activeSections = activePage?.isCustom ? CUSTOM_PAGE_SECTIONS : (activePage?.sections ?? []);

  const handleSaved = useCallback(() => {
    setPreviewRefreshKey((k) => k + 1);
  }, []);

  const handleClone = useCallback((content: Record<string, string>) => {
    const page = builtInPage || (customPage ? { id: customPage.id, title: customPage.title, path: customPage.path } : null);
    if (!page) return;
    setCloneState({ content, title: page.title });
    setShowNewPageDialog(true);
  }, [builtInPage, customPage]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm px-6 py-4 flex items-center gap-4 shrink-0">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Admin
          </Link>
        </Button>
        <Separator orientation="vertical" className="h-5" />
        <div>
          <h1 className="text-lg font-black tracking-tight">Content Editor</h1>
          <p className="text-xs text-muted-foreground">Edit every page — all text, buttons, and links</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Button size="sm" variant="outline" onClick={() => { setCloneState(null); setShowNewPageDialog(true); }} data-testid="button-new-page">
            <Plus className="w-4 h-4 mr-1" />
            New Page
          </Button>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Live preview
          </div>
        </div>
      </div>

      {/* 3-panel layout */}
      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 73px)" }}>

        {/* Left: page list */}
        <div className="w-52 shrink-0 border-r border-border/50 bg-card/30 flex flex-col overflow-y-auto">
          <div className="p-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Built-in Pages</p>
            <nav className="space-y-0.5">
              {cmsPages.map((page) => {
                const Icon = PAGE_ICONS[page.id] ?? FileText;
                const isSelected = page.id === selectedPageId;
                return (
                  <button
                    key={page.id}
                    onClick={() => setSelectedPageId(page.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                      isSelected
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-card"
                    }`}
                    data-testid={`cms-page-${page.id}`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{page.title}</span>
                    {isSelected && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                  </button>
                );
              })}
            </nav>

            {customPages.length > 0 && (
              <>
                <Separator className="my-3" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Custom Pages</p>
                <nav className="space-y-0.5">
                  {customPages.map((page) => {
                    const isSelected = page.id === selectedPageId;
                    return (
                      <button
                        key={page.id}
                        onClick={() => setSelectedPageId(page.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                          isSelected
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-card"
                        }`}
                        data-testid={`cms-page-${page.id}`}
                      >
                        <FileText className="w-4 h-4 shrink-0" />
                        <span className="truncate">{page.title}</span>
                        {isSelected && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                      </button>
                    );
                  })}
                </nav>
              </>
            )}

            <div className="mt-3 px-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 text-muted-foreground"
                onClick={() => { setCloneState(null); setShowNewPageDialog(true); }}
                data-testid="button-new-page-sidebar"
              >
                <Plus className="w-4 h-4" />
                New Page
              </Button>
            </div>
          </div>
        </div>

        {/* Center: editor */}
        <div className="w-96 shrink-0 border-r border-border/50 overflow-hidden flex flex-col">
          {activePage ? (
            <CMSEditor
              key={activePage.id}
              page={activePage}
              sections={activeSections}
              onSaved={handleSaved}
              onClone={handleClone}
              isCustom={!!activePage.isCustom}
              onDeleteCustom={activePage.isCustom ? () => deletePageMutation.mutate(activePage.id) : undefined}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground p-8 text-center">
              <div>
                <FileText className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Select a page to edit</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: preview */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {activePage && (
            <PreviewPanel page={activePage} refreshKey={previewRefreshKey} />
          )}
        </div>
      </div>

      <NewPageDialog
        open={showNewPageDialog}
        onOpenChange={(v) => { setShowNewPageDialog(v); if (!v) setCloneState(null); }}
        onCreated={(id) => setSelectedPageId(id)}
        cloneContent={cloneState?.content}
        cloneTitle={cloneState?.title}
      />
    </div>
  );
}

export default function AdminCMS() {
  return <CMSContent />;
}
