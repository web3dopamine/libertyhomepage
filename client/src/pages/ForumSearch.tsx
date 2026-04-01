import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Search, ChevronLeft, CheckCircle2, Pin, Lock, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import type { ForumCategory, ForumTopic } from "@shared/schema";

type TopicWithCategory = ForumTopic & { category?: ForumCategory };

function timeAgo(date: string) {
  try { return formatDistanceToNow(new Date(date), { addSuffix: true }); } catch { return ""; }
}

export default function ForumSearch() {
  const [location, navigate] = useLocation();
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const initialQ = params.get("q") || "";
  const [searchInput, setSearchInput] = useState(initialQ);

  const { data, isLoading } = useQuery<{ topics: TopicWithCategory[] }>({
    queryKey: ["/api/forum/search", initialQ],
    queryFn: async () => {
      const r = await fetch(`/api/forum/search?q=${encodeURIComponent(initialQ)}`);
      return r.json();
    },
    enabled: !!initialQ,
  });

  const topics = data?.topics ?? [];

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchInput.trim()) navigate(`/forum/search?q=${encodeURIComponent(searchInput)}`);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-20 sm:pt-32 pb-12">
        <Link href="/forum">
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ChevronLeft className="w-4 h-4" />
            Forum
          </button>
        </Link>
        <h1 className="text-2xl font-bold mb-6">Search Results</h1>

        <form onSubmit={handleSearch} className="flex gap-2 mb-8 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Search topics..." data-testid="input-search" />
          </div>
          <Button type="submit" data-testid="button-search">Search</Button>
        </form>

        {initialQ && (
          <p className="text-sm text-muted-foreground mb-4">
            {isLoading ? "Searching..." : `${topics.length} result${topics.length !== 1 ? "s" : ""} for "${initialQ}"`}
          </p>
        )}

        <div className="space-y-2">
          {topics.map(topic => (
            <Link key={topic.id} href={`/forum/t/${topic.id}/${topic.slug}`}>
              <div className="group rounded-lg border border-border bg-card hover-elevate p-4 cursor-pointer" data-testid={`result-${topic.id}`}>
                <div className="flex items-start gap-2">
                  {topic.pinned && <Pin className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />}
                  {topic.solved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />}
                  {topic.closed && <Lock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />}
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-foreground group-hover:text-primary transition-colors">{topic.title}</span>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {topic.category && (
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: topic.category.color }} />
                          {topic.category.name}
                        </span>
                      )}
                      <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{topic.replyCount}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(topic.lastActivityAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {!isLoading && initialQ && topics.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No topics matched your search.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
