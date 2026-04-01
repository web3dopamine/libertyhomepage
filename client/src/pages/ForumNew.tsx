import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Bold, Italic, Code, List, Link2, Quote, X, PlusCircle, Wallet } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { Link } from "wouter";
import type { ForumCategory } from "@shared/schema";

function renderMarkdown(md: string) {
  return DOMPurify.sanitize(marked.parse(md, { breaks: true, gfm: true }) as string);
}

function MarkdownToolbar({ onInsert }: { onInsert: (before: string, after: string, placeholder?: string) => void }) {
  return (
    <div className="flex items-center gap-0.5 p-1 border-b border-border">
      <button type="button" onClick={() => onInsert("**", "**", "bold text")} className="p-1.5 rounded hover-elevate text-muted-foreground" title="Bold"><Bold className="w-3.5 h-3.5" /></button>
      <button type="button" onClick={() => onInsert("*", "*", "italic text")} className="p-1.5 rounded hover-elevate text-muted-foreground" title="Italic"><Italic className="w-3.5 h-3.5" /></button>
      <button type="button" onClick={() => onInsert("`", "`", "code")} className="p-1.5 rounded hover-elevate text-muted-foreground" title="Code"><Code className="w-3.5 h-3.5" /></button>
      <button type="button" onClick={() => onInsert("\n```\n", "\n```", "code block")} className="p-1.5 rounded hover-elevate text-muted-foreground" title="Code block"><Code className="w-3.5 h-3.5 opacity-60" /></button>
      <div className="w-px h-4 bg-border mx-0.5" />
      <button type="button" onClick={() => onInsert("\n- ", "", "item")} className="p-1.5 rounded hover-elevate text-muted-foreground" title="List"><List className="w-3.5 h-3.5" /></button>
      <button type="button" onClick={() => onInsert("[", "](https://)", "text")} className="p-1.5 rounded hover-elevate text-muted-foreground" title="Link"><Link2 className="w-3.5 h-3.5" /></button>
      <button type="button" onClick={() => onInsert("\n> ", "", "quote")} className="p-1.5 rounded hover-elevate text-muted-foreground" title="Quote"><Quote className="w-3.5 h-3.5" /></button>
    </div>
  );
}

export default function ForumNew() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isConnected, shortAddress, address } = useWallet();
  const search = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const prefillCategory = search.get("categoryId") || "";

  const [form, setForm] = useState({
    categoryId: prefillCategory,
    title: "",
    authorName: localStorage.getItem("forum_name") || "",
    authorEmail: localStorage.getItem("forum_email") || "",
    content: "",
    tags: [] as string[],
  });

  // Auto-fill author name with wallet address when wallet is connected
  useEffect(() => {
    if (isConnected && shortAddress) {
      setForm(f => ({ ...f, authorName: shortAddress, authorEmail: `${address!.toLowerCase()}@wallet.libertychain` }));
    }
  }, [isConnected, shortAddress, address]);

  const [preview, setPreview] = useState(false);
  const [newTag, setNewTag] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: categories = [] } = useQuery<ForumCategory[]>({ queryKey: ["/api/forum/categories"] });

  function insertMarkdown(before: string, after: string, placeholder?: string) {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart; const end = ta.selectionEnd;
    const selected = form.content.slice(start, end) || placeholder || "";
    setForm(f => ({ ...f, content: f.content.slice(0, start) + before + selected + after + f.content.slice(end) }));
    setTimeout(() => { ta.focus(); }, 0);
  }

  function addTag() {
    const tag = newTag.trim().toLowerCase().replace(/\s+/g, "-");
    if (tag && !form.tags.includes(tag) && form.tags.length < 5) {
      setForm(f => ({ ...f, tags: [...f.tags, tag] }));
    }
    setNewTag("");
  }

  const createMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/forum/topics", form),
    onSuccess: async (res) => {
      const data = await res.json();
      localStorage.setItem("forum_name", form.authorName);
      localStorage.setItem("forum_email", form.authorEmail);
      toast({ title: "Topic created!" });
      navigate(`/forum/t/${data.topic.id}/${data.topic.slug}`);
    },
    onError: (e: Error) => toast({ title: "Failed to create topic", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl 2xl:max-w-5xl mx-auto px-4 sm:px-8 pt-20 sm:pt-32 pb-12">
        <Link href="/forum">
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6" data-testid="link-back">
            <ChevronLeft className="w-4 h-4" />
            Forum
          </button>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-8">Create New Topic</h1>

        <div className="space-y-6">
          {/* Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Label htmlFor="name">Your Name *</Label>
                {isConnected && (
                  <Badge className="text-xs gap-1 bg-primary/20 text-primary border-primary/30">
                    <Wallet className="w-3 h-3" /> Wallet Verified
                  </Badge>
                )}
              </div>
              <Input
                id="name"
                value={form.authorName}
                onChange={e => setForm(f => ({ ...f, authorName: e.target.value }))}
                placeholder="Display name"
                data-testid="input-author-name"
                readOnly={isConnected}
                className={isConnected ? "font-mono" : ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={form.authorEmail}
                onChange={e => setForm(f => ({ ...f, authorEmail: e.target.value }))}
                placeholder="your@email.com"
                data-testid="input-author-email"
                readOnly={isConnected}
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label>Category *</Label>
            <Select value={form.categoryId} onValueChange={v => setForm(f => ({ ...f, categoryId: v }))}>
              <SelectTrigger data-testid="select-category">
                <SelectValue placeholder="Choose a category..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Topic Title *</Label>
            <Input id="title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Summarize your topic in a clear title..." className="text-base" data-testid="input-title" />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label>Tags <span className="text-muted-foreground font-normal">(optional, up to 5)</span></Label>
            <div className="flex items-center gap-2 flex-wrap">
              {form.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button type="button" onClick={() => setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }))} className="hover:text-destructive" data-testid={`remove-tag-${tag}`}><X className="w-3 h-3" /></button>
                </Badge>
              ))}
              {form.tags.length < 5 && (
                <div className="flex items-center gap-1">
                  <Input
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                    placeholder="Add tag..."
                    className="h-7 text-xs w-28"
                    data-testid="input-new-tag"
                  />
                  <Button type="button" size="sm" variant="ghost" onClick={addTag} className="h-7 px-2" data-testid="button-add-tag"><PlusCircle className="w-3.5 h-3.5" /></Button>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <Label>Post Content *</Label>
            <div className="border border-border rounded-md overflow-hidden">
              <MarkdownToolbar onInsert={insertMarkdown} />
              <div className="flex border-b border-border">
                <button type="button" onClick={() => setPreview(false)} className={`px-3 py-1.5 text-xs font-medium transition-colors ${!preview ? "text-foreground border-b-2 border-primary" : "text-muted-foreground"}`} data-testid="tab-write">Write</button>
                <button type="button" onClick={() => setPreview(true)} className={`px-3 py-1.5 text-xs font-medium transition-colors ${preview ? "text-foreground border-b-2 border-primary" : "text-muted-foreground"}`} data-testid="tab-preview">Preview</button>
              </div>
              {preview ? (
                <div className="prose prose-invert prose-sm max-w-none p-4 min-h-[200px]" dangerouslySetInnerHTML={{ __html: renderMarkdown(form.content) }} />
              ) : (
                <Textarea
                  ref={textareaRef}
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="Write your post content here... Markdown is supported."
                  className="border-0 rounded-none resize-none font-mono text-sm min-h-[200px]"
                  data-testid="input-content"
                />
              )}
            </div>
            <p className="text-xs text-muted-foreground">Markdown supported: **bold**, *italic*, `code`, ```code blocks```, [links](url), &gt; quotes</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !form.title || !form.categoryId || !form.authorName || !form.authorEmail || !form.content}
              data-testid="button-create-topic"
            >
              {createMutation.isPending ? "Creating..." : "Create Topic"}
            </Button>
            <Link href="/forum">
              <Button variant="ghost" data-testid="button-cancel">Cancel</Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
