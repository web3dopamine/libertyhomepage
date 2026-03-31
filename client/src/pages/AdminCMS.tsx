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
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { cmsPages, type CMSPage, type CMSField } from "@/lib/cms-schema";
import {
  ArrowLeft,
  Home,
  Code2,
  Users,
  Radio,
  Shield,
  Globe,
  RefreshCw,
  Save,
  RotateCcw,
  ExternalLink,
  Eye,
  EyeOff,
  Pencil,
} from "lucide-react";

const PAGE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home,
  build: Code2,
  community: Users,
  "resilience-layer": Radio,
  validators: Shield,
  ecosystem: Globe,
};

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
        {value !== field.defaultValue && (
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
      <p className="text-xs text-muted-foreground/60 truncate">
        Default: {field.defaultValue.length > 80 ? field.defaultValue.slice(0, 80) + "…" : field.defaultValue}
      </p>
    </div>
  );
}

function CMSEditor({ page, onSaved }: { page: CMSPage; onSaved: () => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const allFields = page.sections.flatMap((s) => s.fields);

  const defaultValues = useRef<Record<string, string>>({});
  allFields.forEach((f) => { defaultValues.current[f.key] = f.defaultValue; });

  const { data: savedContent = {} } = useQuery<Record<string, string>>({
    queryKey: [`/api/cms/content/${page.id}`],
  });

  const [editedValues, setEditedValues] = useState<Record<string, string>>(() => {
    const d: Record<string, string> = {};
    allFields.forEach((f) => { d[f.key] = f.defaultValue; });
    return d;
  });

  // Merge server values into edit state when they first arrive
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

  return (
    <div className="flex flex-col h-full">
      {/* Editor header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 shrink-0">
        <div>
          <h2 className="font-bold text-lg">{page.title}</h2>
          <p className="text-xs text-muted-foreground">{page.path}</p>
        </div>
        <div className="flex gap-2">
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
        {page.sections.map((section) => (
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
      {/* Preview header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 shrink-0">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Preview</span>
          <Badge variant="outline" className="text-xs font-mono">{page.path}</Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleRefresh}
            title="Refresh preview"
            data-testid="button-preview-refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowPreview((v) => !v)}
            title={showPreview ? "Hide preview" : "Show preview"}
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
          <Button size="icon" variant="ghost" asChild title="Open in new tab">
            <a href={previewUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </div>

      {/* iframe */}
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

function CMSContent() {
  const [selectedPageId, setSelectedPageId] = useState<string>(cmsPages[0].id);
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0);

  const selectedPage = cmsPages.find((p) => p.id === selectedPageId) ?? cmsPages[0];

  const handleSaved = useCallback(() => {
    setPreviewRefreshKey((k) => k + 1);
  }, []);

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
          <p className="text-xs text-muted-foreground">Edit page text and preview live changes</p>
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Live preview
        </div>
      </div>

      {/* 3-panel layout */}
      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 73px)" }}>
        {/* Left: page list */}
        <div className="w-52 shrink-0 border-r border-border/50 bg-card/30 flex flex-col overflow-y-auto">
          <div className="p-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Pages</p>
            <nav className="space-y-0.5">
              {cmsPages.map((page) => {
                const Icon = PAGE_ICONS[page.id] ?? Home;
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
                    <span>{page.title}</span>
                    {isSelected && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Center: editor */}
        <div className="w-96 shrink-0 border-r border-border/50 overflow-hidden flex flex-col">
          <CMSEditor
            key={selectedPage.id}
            page={selectedPage}
            onSaved={handleSaved}
          />
        </div>

        {/* Right: preview */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <PreviewPanel page={selectedPage} refreshKey={previewRefreshKey} />
        </div>
      </div>
    </div>
  );
}

export default function AdminCMS() {
  return <CMSContent />;
}
