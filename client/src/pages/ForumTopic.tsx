import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquare, Pin, CheckCircle2, Lock, Eye, Heart,
  ChevronLeft, PencilLine, Trash2, Flag, Share2,
  Quote, Bold, Italic, Code, List, Link2, Clock, Tag, Wallet
} from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { formatDistanceToNow, format } from "date-fns";
import { marked } from "marked";
import DOMPurify from "dompurify";
import type { ForumCategory, ForumTopic, ForumPost } from "@shared/schema";

type TopicWithCat = ForumTopic & { category?: ForumCategory };

function timeAgo(date: string) {
  try { return formatDistanceToNow(new Date(date), { addSuffix: true }); } catch { return ""; }
}
function fullDate(date: string) {
  try { return format(new Date(date), "MMM d, yyyy 'at' h:mm a"); } catch { return date; }
}

function renderMarkdown(md: string): string {
  const html = marked.parse(md, { breaks: true, gfm: true }) as string;
  return DOMPurify.sanitize(html);
}

function AvatarInitials({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name.split(" ").map(p => p[0]).join("").toUpperCase().slice(0, 2);
  const colors = ["bg-primary/20 text-primary", "bg-purple-500/20 text-purple-400", "bg-amber-500/20 text-amber-400", "bg-emerald-500/20 text-emerald-400", "bg-rose-500/20 text-rose-400"];
  const color = colors[name.charCodeAt(0) % colors.length];
  const sz = size === "sm" ? "h-7 w-7 text-xs" : size === "lg" ? "h-12 w-12 text-base" : "h-10 w-10 text-sm";
  return <div className={`${sz} ${color} rounded-full flex items-center justify-center font-bold flex-shrink-0`}>{initials}</div>;
}

function MarkdownToolbar({ onInsert }: { onInsert: (before: string, after: string, placeholder?: string) => void }) {
  return (
    <div className="flex items-center gap-0.5 p-1 border-b border-border">
      <button type="button" onClick={() => onInsert("**", "**", "bold text")} className="p-1.5 rounded hover-elevate text-muted-foreground hover:text-foreground" title="Bold" data-testid="toolbar-bold"><Bold className="w-3.5 h-3.5" /></button>
      <button type="button" onClick={() => onInsert("*", "*", "italic text")} className="p-1.5 rounded hover-elevate text-muted-foreground hover:text-foreground" title="Italic" data-testid="toolbar-italic"><Italic className="w-3.5 h-3.5" /></button>
      <button type="button" onClick={() => onInsert("`", "`", "code")} className="p-1.5 rounded hover-elevate text-muted-foreground hover:text-foreground" title="Inline code" data-testid="toolbar-code"><Code className="w-3.5 h-3.5" /></button>
      <button type="button" onClick={() => onInsert("\n```\n", "\n```", "code block")} className="p-1.5 rounded hover-elevate text-muted-foreground hover:text-foreground" title="Code block" data-testid="toolbar-code-block"><Code className="w-3.5 h-3.5 opacity-60" /></button>
      <div className="w-px h-4 bg-border mx-0.5" />
      <button type="button" onClick={() => onInsert("\n- ", "", "list item")} className="p-1.5 rounded hover-elevate text-muted-foreground hover:text-foreground" title="List" data-testid="toolbar-list"><List className="w-3.5 h-3.5" /></button>
      <button type="button" onClick={() => onInsert("[", "](https://)", "link text")} className="p-1.5 rounded hover-elevate text-muted-foreground hover:text-foreground" title="Link" data-testid="toolbar-link"><Link2 className="w-3.5 h-3.5" /></button>
      <button type="button" onClick={() => onInsert("\n> ", "", "quoted text")} className="p-1.5 rounded hover-elevate text-muted-foreground hover:text-foreground" title="Blockquote" data-testid="toolbar-quote"><Quote className="w-3.5 h-3.5" /></button>
    </div>
  );
}

function PostCard({ post, isOp, topicId, topicSolved, isAdmin, onLike, onMarkAnswer, onDelete, onEdit }: {
  post: ForumPost; isOp: boolean; topicId: string; topicSolved: boolean;
  isAdmin: boolean; onLike: (id: string) => void; onMarkAnswer: (id: string) => void;
  onDelete: (id: string) => void; onEdit: (post: ForumPost) => void;
}) {
  const [showEdit, setShowEdit] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [preview, setPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function insertMarkdown(before: string, after: string, placeholder?: string) {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart; const end = ta.selectionEnd;
    const selected = editContent.slice(start, end) || placeholder || "";
    const newContent = editContent.slice(0, start) + before + selected + after + editContent.slice(end);
    setEditContent(newContent);
  }

  return (
    <div id={`post-${post.id}`} className={`rounded-lg border ${post.isAnswer ? "border-emerald-500/40 bg-emerald-500/5" : "border-border bg-card"} overflow-hidden`} data-testid={`card-post-${post.id}`}>
      {post.isAnswer && (
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Accepted Answer
        </div>
      )}
      <div className="p-4 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center gap-1">
            <AvatarInitials name={post.authorName} size="lg" />
            {isOp && <span className="text-[10px] text-primary font-medium">OP</span>}
          </div>
          <div className="flex-1 min-w-0">
            {/* Post header */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <span className="font-semibold text-foreground">{post.authorName}</span>
                <span className="text-xs text-muted-foreground ml-2" title={fullDate(post.createdAt)}>{timeAgo(post.createdAt)}</span>
                {post.editedAt && <span className="text-xs text-muted-foreground ml-1">(edited)</span>}
              </div>
              <div className="flex items-center gap-0.5 text-muted-foreground flex-shrink-0">
                <span className="text-xs mr-1">#{post.postNumber}</span>
              </div>
            </div>

            {/* Content */}
            {showEdit ? (
              <div className="space-y-2">
                <div className="border border-border rounded-md overflow-hidden">
                  <MarkdownToolbar onInsert={insertMarkdown} />
                  <div className="flex border-b border-border">
                    <button type="button" onClick={() => setPreview(false)} className={`px-3 py-1.5 text-xs font-medium transition-colors ${!preview ? "text-foreground border-b-2 border-primary" : "text-muted-foreground"}`} data-testid="tab-edit">Write</button>
                    <button type="button" onClick={() => setPreview(true)} className={`px-3 py-1.5 text-xs font-medium transition-colors ${preview ? "text-foreground border-b-2 border-primary" : "text-muted-foreground"}`} data-testid="tab-preview">Preview</button>
                  </div>
                  {preview ? (
                    <div className="prose prose-invert prose-sm max-w-none p-3 min-h-[80px]" dangerouslySetInnerHTML={{ __html: renderMarkdown(editContent) }} />
                  ) : (
                    <Textarea ref={textareaRef} value={editContent} onChange={e => setEditContent(e.target.value)} className="border-0 rounded-none resize-none font-mono text-sm min-h-[80px]" data-testid="input-edit-content" />
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => { onEdit({ ...post, content: editContent }); setShowEdit(false); }} data-testid="button-save-edit">Save</Button>
                  <Button size="sm" variant="outline" onClick={() => setShowEdit(false)} data-testid="button-cancel-edit">Cancel</Button>
                </div>
              </div>
            ) : (
              <div
                className="prose prose-invert prose-sm max-w-none text-foreground/90 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
              />
            )}

            {/* Actions */}
            <div className="flex items-center gap-1 mt-4">
              <button
                type="button"
                onClick={() => onLike(post.id)}
                className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-muted-foreground hover-elevate transition-colors"
                data-testid={`button-like-${post.id}`}
              >
                <Heart className="w-3.5 h-3.5" />
                {post.likeCount > 0 && <span>{post.likeCount}</span>}
              </button>
              {!isOp && topicSolved === false && isAdmin && (
                <button type="button" onClick={() => onMarkAnswer(post.id)} className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-muted-foreground hover-elevate" data-testid={`button-answer-${post.id}`} title="Mark as solution">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button type="button" onClick={() => setShowEdit(!showEdit)} className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-muted-foreground hover-elevate" data-testid={`button-edit-${post.id}`} title="Edit">
                <PencilLine className="w-3.5 h-3.5" />
              </button>
              {isAdmin && (
                <button type="button" onClick={() => onDelete(post.id)} className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-muted-foreground hover-elevate" data-testid={`button-delete-${post.id}`} title="Delete">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ForumTopicPage() {
  const { id } = useParams<{ id: string; slug: string }>();
  const { toast } = useToast();
  const { isConnected, shortAddress, address } = useWallet();
  const [replyName, setReplyName] = useState(() => localStorage.getItem("forum_name") || "");
  const [replyEmail, setReplyEmail] = useState(() => localStorage.getItem("forum_email") || "");

  // Sync reply author fields from wallet when connected
  useEffect(() => {
    if (isConnected && shortAddress && address) {
      setReplyName(shortAddress);
      setReplyEmail(`${address.toLowerCase()}@wallet.libertychain`);
    }
  }, [isConnected, shortAddress, address]);
  const [replyContent, setReplyContent] = useState("");
  const [replyPreview, setReplyPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isAdmin = sessionStorage.getItem("lc_admin_auth") === "1";

  const { data: topic, isLoading } = useQuery<TopicWithCat>({
    queryKey: ["/api/forum/topics", id],
    queryFn: async () => { const r = await fetch(`/api/forum/topics/${id}`); return r.json(); },
  });

  const { data: posts = [] } = useQuery<ForumPost[]>({
    queryKey: ["/api/forum/topics", id, "posts"],
    queryFn: async () => { const r = await fetch(`/api/forum/topics/${id}/posts`); return r.json(); },
    enabled: !!id,
  });

  // Increment view count once
  useEffect(() => {
    if (id) fetch(`/api/forum/topics/${id}/view`, { method: "POST" });
  }, [id]);

  function insertMarkdown(before: string, after: string, placeholder?: string) {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart; const end = ta.selectionEnd;
    const selected = replyContent.slice(start, end) || placeholder || "";
    setReplyContent(replyContent.slice(0, start) + before + selected + after + replyContent.slice(end));
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + before.length, start + before.length + selected.length); }, 0);
  }

  const replyMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/forum/topics/${id}/posts`, { authorName: replyName, authorEmail: replyEmail, content: replyContent }),
    onSuccess: () => {
      localStorage.setItem("forum_name", replyName);
      localStorage.setItem("forum_email", replyEmail);
      setReplyContent("");
      queryClient.invalidateQueries({ queryKey: ["/api/forum/topics", id, "posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/forum/topics", id] });
      toast({ title: "Reply posted!" });
    },
    onError: (e: Error) => toast({ title: "Failed to post", description: e.message, variant: "destructive" }),
  });

  const likeMutation = useMutation({
    mutationFn: (postId: string) => apiRequest("POST", `/api/forum/posts/${postId}/like`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/forum/topics", id, "posts"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (postId: string) => apiRequest("DELETE", `/api/forum/posts/${postId}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/forum/topics", id, "posts"] }); toast({ title: "Post deleted" }); },
  });

  const editMutation = useMutation({
    mutationFn: (post: ForumPost) => apiRequest("PUT", `/api/forum/posts/${post.id}`, { content: post.content }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/forum/topics", id, "posts"] }); toast({ title: "Post updated" }); },
  });

  const answerMutation = useMutation({
    mutationFn: (postId: string) => apiRequest("PUT", `/api/forum/topics/${id}/solve/${postId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/topics", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/forum/topics", id, "posts"] });
      toast({ title: "Solution marked!" });
    },
  });

  const topicMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiRequest("PUT", `/api/forum/topics/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/forum/topics", id] }),
  });

  if (isLoading) return (
    <div className="min-h-screen bg-background"><Navigation /><div className="pt-40 text-center text-muted-foreground">Loading...</div><Footer /></div>
  );
  if (!topic) return (
    <div className="min-h-screen bg-background"><Navigation /><div className="pt-40 text-center text-muted-foreground">Topic not found.</div><Footer /></div>
  );

  const opPost = posts[0];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Topic header */}
      <div className="border-b border-border bg-card/30">
        <div className="max-w-4xl 2xl:max-w-5xl mx-auto px-4 sm:px-8 pt-20 sm:pt-32 pb-6">
          <Link href={topic.category ? `/forum/c/${topic.category.slug}` : "/forum"}>
            <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4" data-testid="link-back-category">
              <ChevronLeft className="w-4 h-4" />
              {topic.category?.name ?? "Forum"}
            </button>
          </Link>

          <div className="flex items-start gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {topic.pinned && <Badge variant="outline" className="gap-1 text-primary border-primary/30"><Pin className="w-3 h-3" />Pinned</Badge>}
                {topic.closed && <Badge variant="secondary" className="gap-1"><Lock className="w-3 h-3" />Closed</Badge>}
                {topic.solved && <Badge variant="outline" className="gap-1 text-emerald-400 border-emerald-500/30"><CheckCircle2 className="w-3 h-3" />Solved</Badge>}
                {topic.category && (
                  <Link href={`/forum/c/${topic.category.slug}`}>
                    <Badge className="gap-1 cursor-pointer" style={{ backgroundColor: topic.category.color + "20", color: topic.category.color, borderColor: topic.category.color + "40" }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: topic.category.color }} />
                      {topic.category.name}
                    </Badge>
                  </Link>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">{topic.title}</h1>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{topic.replyCount} replies</span>
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{topic.viewCount} views</span>
                {topic.tags.map(tag => (
                  <Link key={tag} href={`/forum?tag=${encodeURIComponent(tag)}`}>
                    <span className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"><Tag className="w-3 h-3" />{tag}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Admin topic controls */}
          {isAdmin && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
              <Button size="sm" variant="outline" onClick={() => topicMutation.mutate({ pinned: !topic.pinned })} data-testid="button-pin-topic">
                <Pin className="w-3.5 h-3.5 mr-1" />{topic.pinned ? "Unpin" : "Pin"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => topicMutation.mutate({ closed: !topic.closed })} data-testid="button-close-topic">
                <Lock className="w-3.5 h-3.5 mr-1" />{topic.closed ? "Reopen" : "Close"}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl 2xl:max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-4">
        {/* Posts */}
        {posts.map((post, idx) => (
          <PostCard
            key={post.id}
            post={post}
            isOp={idx === 0}
            topicId={id}
            topicSolved={topic.solved}
            isAdmin={isAdmin}
            onLike={postId => likeMutation.mutate(postId)}
            onMarkAnswer={postId => answerMutation.mutate(postId)}
            onDelete={postId => deleteMutation.mutate(postId)}
            onEdit={p => editMutation.mutate(p)}
          />
        ))}

        {/* Reply composer */}
        {!topic.closed && (
          <div className="border border-border rounded-lg bg-card overflow-hidden mt-8" id="reply-composer">
            <div className="px-4 py-3 border-b border-border bg-muted/20">
              <span className="font-medium text-sm">Post a Reply</span>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="reply-name">Your Name *</Label>
                    {isConnected && (
                      <Badge className="text-xs gap-1 bg-primary/20 text-primary border-primary/30">
                        <Wallet className="w-3 h-3" /> Wallet Verified
                      </Badge>
                    )}
                  </div>
                  <Input
                    id="reply-name"
                    value={replyName}
                    onChange={e => setReplyName(e.target.value)}
                    placeholder="Display name"
                    data-testid="input-reply-name"
                    readOnly={isConnected}
                    className={isConnected ? "font-mono" : ""}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reply-email">Email *</Label>
                  <Input
                    id="reply-email"
                    type="email"
                    value={replyEmail}
                    onChange={e => setReplyEmail(e.target.value)}
                    placeholder="your@email.com"
                    data-testid="input-reply-email"
                    readOnly={isConnected}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Reply *</Label>
                <div className="border border-border rounded-md overflow-hidden">
                  <MarkdownToolbar onInsert={insertMarkdown} />
                  <div className="flex border-b border-border">
                    <button type="button" onClick={() => setReplyPreview(false)} className={`px-3 py-1.5 text-xs font-medium transition-colors ${!replyPreview ? "text-foreground border-b-2 border-primary" : "text-muted-foreground"}`} data-testid="tab-write">Write</button>
                    <button type="button" onClick={() => setReplyPreview(true)} className={`px-3 py-1.5 text-xs font-medium transition-colors ${replyPreview ? "text-foreground border-b-2 border-primary" : "text-muted-foreground"}`} data-testid="tab-preview-reply">Preview</button>
                  </div>
                  {replyPreview ? (
                    <div className="prose prose-invert prose-sm max-w-none p-3 min-h-[120px]" dangerouslySetInnerHTML={{ __html: renderMarkdown(replyContent) }} />
                  ) : (
                    <Textarea
                      ref={textareaRef}
                      value={replyContent}
                      onChange={e => setReplyContent(e.target.value)}
                      placeholder="Write your reply... Markdown is supported."
                      className="border-0 rounded-none resize-none font-mono text-sm min-h-[120px]"
                      data-testid="input-reply-content"
                    />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Markdown supported: **bold**, *italic*, `code`, [link](url)</p>
              </div>

              <Button
                onClick={() => replyMutation.mutate()}
                disabled={replyMutation.isPending || !replyName || !replyEmail || !replyContent}
                data-testid="button-post-reply"
              >
                {replyMutation.isPending ? "Posting..." : "Post Reply"}
              </Button>
            </div>
          </div>
        )}

        {topic.closed && (
          <div className="flex items-center gap-2 p-4 border border-border rounded-lg bg-muted/10 text-muted-foreground text-sm">
            <Lock className="w-4 h-4 flex-shrink-0" />
            This topic is closed. No new replies are allowed.
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
