import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams, useLocation } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MessageSquare, Pin, CheckCircle2, Lock, Clock, Eye,
  PlusCircle, ChevronLeft, Users, Tag
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ForumCategory, ForumTopic } from "@shared/schema";

type TopicWithCategory = ForumTopic & { category?: ForumCategory };

function timeAgo(date: string) {
  try { return formatDistanceToNow(new Date(date), { addSuffix: true }); } catch { return ""; }
}

function AvatarInitials({ name }: { name: string }) {
  const initials = name.split(" ").map(p => p[0]).join("").toUpperCase().slice(0, 2);
  const colors = ["bg-primary/20 text-primary", "bg-purple-500/20 text-purple-400", "bg-amber-500/20 text-amber-400", "bg-emerald-500/20 text-emerald-400", "bg-rose-500/20 text-rose-400"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return <div className={`h-8 w-8 ${color} rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0`}>{initials}</div>;
}

export default function ForumCategory() {
  const { slug } = useParams<{ slug: string }>();
  const [, navigate] = useLocation();
  const [page, setPage] = useState(1);
  const LIMIT = 30;

  const { data: cat } = useQuery<ForumCategory>({
    queryKey: ["/api/forum/categories", slug],
    queryFn: async () => {
      const r = await fetch(`/api/forum/categories/${slug}`);
      if (!r.ok) throw new Error("Not found");
      return r.json();
    },
  });

  const { data: topicsData } = useQuery<{ topics: TopicWithCategory[]; total: number }>({
    queryKey: ["/api/forum/topics", { categoryId: cat?.id, page }],
    queryFn: async () => {
      if (!cat) return { topics: [], total: 0 };
      const r = await fetch(`/api/forum/topics?categoryId=${cat.id}&page=${page}&limit=${LIMIT}`);
      return r.json();
    },
    enabled: !!cat,
  });

  const topics = topicsData?.topics ?? [];
  const total = topicsData?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT);

  if (!cat) return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-40 text-center text-muted-foreground">Loading...</div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Header */}
      <div className="border-b border-border bg-card/30">
        <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-8 pt-20 sm:pt-32 pb-8">
          <Link href="/forum">
            <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4" data-testid="link-back-forum">
              <ChevronLeft className="w-4 h-4" />
              Forum
            </button>
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-4 h-4 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: cat.color }} />
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">{cat.name}</h1>
                {cat.description && <p className="text-muted-foreground mt-1">{cat.description}</p>}
              </div>
            </div>
            <Link href={`/forum/new?categoryId=${cat.id}`}>
              <Button className="gap-2 flex-shrink-0" data-testid="button-new-topic-in-cat">
                <PlusCircle className="w-4 h-4" />
                New Topic
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
        {topics.length === 0 ? (
          <div className="text-center py-24 border border-border rounded-lg">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground mb-4">No topics yet in this category.</p>
            <Link href={`/forum/new?categoryId=${cat.id}`}>
              <Button className="gap-2">
                <PlusCircle className="w-4 h-4" />
                Start the first topic
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Topic list header */}
            <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 pb-2 text-xs text-muted-foreground font-medium uppercase tracking-wide">
              <span>Topic</span>
              <span className="w-16 text-right">Replies</span>
              <span className="w-16 text-right">Views</span>
              <span className="w-28 text-right">Last Post</span>
              <span className="w-8" />
            </div>

            <div className="space-y-1">
              {topics.map(topic => (
                <Link key={topic.id} href={`/forum/t/${topic.id}/${topic.slug}`}>
                  <div className="group rounded-lg border border-border hover-elevate cursor-pointer px-4 py-3 sm:grid sm:grid-cols-[1fr_auto_auto_auto_auto] sm:gap-4 sm:items-center" data-testid={`row-topic-${topic.id}`}>
                    {/* Title col */}
                    <div className="flex items-start gap-3 min-w-0">
                      <AvatarInitials name={topic.authorName} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {topic.pinned && <Pin className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                          {topic.solved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                          {topic.closed && <Lock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
                          <span className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">{topic.title}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs text-muted-foreground">by {topic.authorName}</span>
                          {topic.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 h-4">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Stats — hidden on mobile */}
                    <div className="hidden sm:flex items-center justify-end w-16">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {topic.replyCount}
                      </span>
                    </div>
                    <div className="hidden sm:flex items-center justify-end w-16">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {topic.viewCount}
                      </span>
                    </div>
                    <div className="hidden sm:block w-28 text-right text-xs text-muted-foreground">
                      {timeAgo(topic.lastActivityAt)}
                    </div>
                    <div className="hidden sm:flex justify-end w-8">
                      {topic.solved && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)} data-testid="button-prev-page">Prev</Button>
                <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} data-testid="button-next-page">Next</Button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
