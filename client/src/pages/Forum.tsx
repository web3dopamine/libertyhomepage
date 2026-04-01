import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  MessageSquare, Users, TrendingUp, Pin, CheckCircle2,
  Lock, Search, PlusCircle, Tag, Clock, Eye, ChevronRight
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ForumCategory, ForumTopic } from "@shared/schema";

type CategoryWithCounts = ForumCategory & { topicCount: number; replyCount: number };
type TopicWithCategory = ForumTopic & { category?: ForumCategory };

function timeAgo(date: string) {
  try { return formatDistanceToNow(new Date(date), { addSuffix: true }); } catch { return ""; }
}

function AvatarInitials({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  const initials = name.split(" ").map(p => p[0]).join("").toUpperCase().slice(0, 2);
  const colors = ["bg-primary/20 text-primary", "bg-purple-500/20 text-purple-400", "bg-amber-500/20 text-amber-400", "bg-emerald-500/20 text-emerald-400", "bg-rose-500/20 text-rose-400"];
  const color = colors[name.charCodeAt(0) % colors.length];
  const sz = size === "sm" ? "h-7 w-7 text-xs" : "h-9 w-9 text-sm";
  return <div className={`${sz} ${color} rounded-full flex items-center justify-center font-bold flex-shrink-0`}>{initials}</div>;
}

export default function Forum() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");

  const { data: categories = [] } = useQuery<CategoryWithCounts[]>({ queryKey: ["/api/forum/categories"] });
  const { data: latestData } = useQuery<{ topics: TopicWithCategory[]; total: number }>({ queryKey: ["/api/forum/topics"] });
  const { data: tags = [] } = useQuery<string[]>({ queryKey: ["/api/forum/tags"] });

  const latestTopics = latestData?.topics ?? [];

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) navigate(`/forum/search?q=${encodeURIComponent(search)}`);
  }

  const totalTopics = categories.reduce((s, c) => s + c.topicCount, 0);
  const totalReplies = categories.reduce((s, c) => s + c.replyCount, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Header */}
      <div className="border-b border-border bg-card/30">
        <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-8 pt-20 sm:pt-32 pb-8 sm:pb-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-primary text-sm font-medium mb-2">
                <MessageSquare className="w-4 h-4" />
                Community Forum
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                Liberty Chain Forum
              </h1>
              <p className="text-muted-foreground mt-2 max-w-xl">
                Discuss all things Liberty Chain — from governance proposals to developer tips and ecosystem news.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link href="/forum/new">
                <Button data-testid="button-new-topic" className="gap-2">
                  <PlusCircle className="w-4 h-4" />
                  New Topic
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="font-medium text-foreground">{totalTopics.toLocaleString()}</span> topics
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span className="font-medium text-foreground">{totalReplies.toLocaleString()}</span> replies
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="font-medium text-foreground">{categories.length}</span> categories
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {/* Search + Tags bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search topics..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                data-testid="input-forum-search"
              />
            </div>
            <Button type="submit" variant="outline" data-testid="button-forum-search">Search</Button>
          </form>
          {tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              {tags.slice(0, 8).map(tag => (
                <Link key={tag} href={`/forum?tag=${encodeURIComponent(tag)}`}>
                  <Badge variant="secondary" className="cursor-pointer text-xs hover-elevate" data-testid={`badge-tag-${tag}`}>{tag}</Badge>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Categories */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-lg font-bold text-foreground mb-4">Categories</h2>
            {categories.map(cat => (
              <Link key={cat.id} href={`/forum/c/${cat.slug}`}>
                <div className="group rounded-lg border border-border bg-card hover-elevate cursor-pointer" data-testid={`card-category-${cat.id}`}>
                  <div className="p-4 flex items-start gap-4">
                    <div className="w-3 h-3 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">{cat.name}</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
                      </div>
                      {cat.description && <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{cat.description}</p>}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{cat.topicCount} topics</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{cat.replyCount} replies</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {categories.length === 0 && (
              <div className="text-center py-16 text-muted-foreground border border-border rounded-lg">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No categories yet. Check back soon.</p>
              </div>
            )}
          </div>

          {/* Latest Topics sidebar */}
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4">Latest Topics</h2>
            <div className="space-y-1">
              {latestTopics.slice(0, 15).map(topic => (
                <Link key={topic.id} href={`/forum/t/${topic.id}/${topic.slug}`}>
                  <div className="group flex items-start gap-3 p-2.5 rounded-md hover-elevate cursor-pointer" data-testid={`link-topic-${topic.id}`}>
                    <AvatarInitials name={topic.authorName} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {topic.pinned && <Pin className="w-3 h-3 text-primary flex-shrink-0" />}
                        {topic.solved && <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />}
                        {topic.closed && <Lock className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
                        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">{topic.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {topic.category && (
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: topic.category.color }} />
                            {topic.category.name}
                          </span>
                        )}
                        <span className="flex items-center gap-1"><MessageSquare className="w-2.5 h-2.5" />{topic.replyCount}</span>
                        <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{timeAgo(topic.lastActivityAt)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              {latestTopics.length === 0 && (
                <div className="text-center py-8 text-muted-foreground/50 text-sm">
                  No topics yet — be the first to post!
                </div>
              )}
            </div>
            {latestTopics.length > 0 && (
              <Link href="/forum/latest">
                <Button variant="outline" size="sm" className="w-full mt-4" data-testid="button-see-all-topics">
                  See all topics
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
