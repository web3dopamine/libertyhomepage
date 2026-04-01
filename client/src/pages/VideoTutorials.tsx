import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  PlayCircle, BookOpen, Code2, Zap, Bell, ArrowRight,
  Clock, Star, X, Youtube, Film,
} from "lucide-react";
import type { VideoTutorial } from "@shared/schema";

// ── Video URL helpers ────────────────────────────────────────────────────
function parseVideo(url: string): { type: "youtube" | "vimeo" | null; id: string | null } {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (yt) return { type: "youtube", id: yt[1] };
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return { type: "vimeo", id: vm[1] };
  return { type: null, id: null };
}

function autoThumbnail(url: string): string {
  const { type, id } = parseVideo(url);
  if (type === "youtube" && id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  return "";
}

function embedUrl(url: string): string | null {
  const { type, id } = parseVideo(url);
  if (type === "youtube" && id) return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
  if (type === "vimeo" && id) return `https://player.vimeo.com/video/${id}?autoplay=1`;
  return null;
}

// ── Planned series (fallback) ────────────────────────────────────────────
const plannedSeries = [
  { icon: BookOpen, title: "Getting Started", description: "Everything you need to go from zero to your first Liberty Chain transaction.", episodes: 6 },
  { icon: Code2, title: "Smart Contract Development", description: "Deploy Solidity contracts on Liberty Chain — from Hello World to production DeFi.", episodes: 8 },
  { icon: Zap, title: "Zero Gas Patterns", description: "Design patterns and architectural strategies unique to a zero-fee EVM chain.", episodes: 5 },
  { icon: PlayCircle, title: "Building a dApp", description: "End-to-end tutorial: build, test, and deploy a full-stack decentralized application.", episodes: 10 },
];

// ── Video embed modal ────────────────────────────────────────────────────
function EmbedModal({ video, onClose }: { video: VideoTutorial; onClose: () => void }) {
  const embed = embedUrl(video.videoUrl);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          data-testid="button-close-modal"
        >
          <X className="w-4 h-4" />
        </button>
        {embed ? (
          <div className="aspect-video">
            <iframe
              src={embed}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        ) : (
          <div className="aspect-video flex items-center justify-center text-muted-foreground">
            <p>Unable to embed this video. <a href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">Open directly</a></p>
          </div>
        )}
        <div className="p-4">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {video.category && <Badge variant="outline" className="text-xs">{video.category}</Badge>}
            {video.duration && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />{video.duration}
              </span>
            )}
          </div>
          <h3 className="font-bold text-lg">{video.title}</h3>
          {video.description && <p className="text-sm text-muted-foreground mt-1">{video.description}</p>}
        </div>
      </div>
    </div>
  );
}

// ── Video card ────────────────────────────────────────────────────────────
function VideoCard({ video, onClick, index }: { video: VideoTutorial; onClick: () => void; index: number }) {
  const thumb = video.thumbnailUrl || autoThumbnail(video.videoUrl);
  const { type } = parseVideo(video.videoUrl);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <Card
        className="overflow-hidden cursor-pointer group hover-elevate h-full flex flex-col"
        onClick={onClick}
        data-testid={`card-video-${video.id}`}
      >
        {/* Thumbnail */}
        <div className="relative aspect-video bg-muted overflow-hidden flex-none">
          {thumb ? (
            <img src={thumb} alt={video.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <PlayCircle className="w-12 h-12 text-primary/40" />
            </div>
          )}
          {/* Play overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
              <PlayCircle className="w-7 h-7 text-black" />
            </div>
          </div>
          {/* Duration badge */}
          {video.duration && (
            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-white text-xs font-mono">
              {video.duration}
            </div>
          )}
          {/* Platform badge */}
          {type === "youtube" && (
            <div className="absolute top-2 left-2 w-6 h-6 rounded bg-red-600 flex items-center justify-center">
              <Youtube className="w-3.5 h-3.5 text-white" />
            </div>
          )}
          {type === "vimeo" && (
            <div className="absolute top-2 left-2 w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
              <Film className="w-3.5 h-3.5 text-white" />
            </div>
          )}
          {video.featured && (
            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center">
              <Star className="w-3 h-3 text-black fill-black" />
            </div>
          )}
        </div>
        {/* Content */}
        <div className="p-4 flex-1 flex flex-col gap-2">
          {video.category && (
            <Badge variant="outline" className="text-xs w-fit">{video.category}</Badge>
          )}
          <h3 className="font-bold leading-snug flex-1">{video.title}</h3>
          {video.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────
export default function VideoTutorials() {
  const { data: videos = [] } = useQuery<VideoTutorial[]>({
    queryKey: ["/api/video-tutorials"],
  });

  const [playing, setPlaying] = useState<VideoTutorial | null>(null);

  const featured = videos.filter(v => v.featured);
  const regular  = videos.filter(v => !v.featured);
  const categories = [...new Set(videos.map(v => v.category).filter(Boolean))];

  const hasVideos = videos.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card flex flex-col">
      <Navigation />

      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-6xl mx-auto px-8">

          {/* Hero */}
          <div className="text-center space-y-6 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-6">
                <PlayCircle className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">VIDEO TUTORIALS</span>
              </div>

              <h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-[0.9]"
                data-testid="heading-video-tutorials"
              >
                Learn Liberty Chain
              </h1>

              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Step-by-step video guides for developers and builders — from your first transaction to shipping production applications.
              </p>
            </motion.div>

            {/* Coming Soon banner (only when no videos) */}
            {!hasVideos && (
              <motion.div
                className="inline-flex flex-col items-center gap-3 px-10 py-8 rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-sm"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
                  </span>
                  <Badge variant="secondary" className="text-sm font-bold px-3 py-1">
                    Coming Soon
                  </Badge>
                </div>
                <p className="text-base text-muted-foreground max-w-sm text-center">
                  Our tutorial series is in production. Subscribe to be notified when the first videos drop.
                </p>
                <Button size="lg" className="group mt-1" asChild>
                  <a href="https://discord.gg/libertychain" target="_blank" rel="noopener noreferrer" data-testid="button-video-notify">
                    <Bell className="w-4 h-4 mr-2" />
                    Get Notified on Discord
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Button>
              </motion.div>
            )}
          </div>

          {/* ── Live videos ─────────────────────────────── */}
          {hasVideos && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              {/* Featured */}
              {featured.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-xl font-black tracking-tight mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    Featured
                  </h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {featured.map((v, i) => (
                      <VideoCard key={v.id} video={v} index={i} onClick={() => setPlaying(v)} />
                    ))}
                  </div>
                </div>
              )}

              {/* Category sections */}
              {categories.length > 0 ? (
                categories.map(cat => {
                  const catVideos = regular.filter(v => v.category === cat);
                  if (!catVideos.length) return null;
                  return (
                    <div key={cat} className="mb-12">
                      <h2 className="text-xl font-black tracking-tight mb-4">{cat}</h2>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {catVideos.map((v, i) => (
                          <VideoCard key={v.id} video={v} index={i} onClick={() => setPlaying(v)} />
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                // No categories — flat grid
                <div className="mb-12">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {regular.map((v, i) => (
                      <VideoCard key={v.id} video={v} index={i} onClick={() => setPlaying(v)} />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Planned series (always shown when no live videos; hidden when videos exist) */}
          {!hasVideos && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h2 className="text-2xl font-black tracking-tight mb-2" data-testid="heading-planned-series">
                Planned Series
              </h2>
              <p className="text-muted-foreground mb-8">
                Here's what we're building for you. More series will be announced as the platform grows.
              </p>

              <div className="grid sm:grid-cols-2 gap-6">
                {plannedSeries.map((series, index) => (
                  <motion.div
                    key={series.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.08 }}
                  >
                    <Card className="p-6 h-full flex flex-col gap-4" data-testid={`card-series-${index}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                          <series.icon className="w-5 h-5 text-primary" />
                        </div>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {series.episodes} episodes
                        </Badge>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-black mb-2">{series.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {series.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-50" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary/40" />
                        </span>
                        In production
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* In the meantime / CTA */}
          <motion.div
            className="mt-16 rounded-2xl border border-border/50 bg-card/50 p-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <h2 className="text-2xl font-black mb-3">
              {hasVideos ? "More resources" : "In the meantime"}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              {hasVideos
                ? "Dive deeper with our written documentation, developer tools, and community."
                : "Get started with our written documentation, developer tools, and community Discord while tutorials are being prepared."}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/documentation" data-testid="button-video-docs">
                  Read the Documentation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/build" data-testid="button-video-build">
                  Explore Build Resources
                </Link>
              </Button>
            </div>
          </motion.div>

        </div>
      </main>

      <Footer />

      {/* ── Embed modal ─────────────────────────────────── */}
      {playing && <EmbedModal video={playing} onClose={() => setPlaying(null)} />}
    </div>
  );
}
