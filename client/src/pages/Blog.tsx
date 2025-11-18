import { useState } from 'react';
import { libertyChainData, BlogPost } from '@shared/schema';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Technical', 'Community', 'Announcements', 'Tutorials'];

  const filteredPosts = libertyChainData.blog.filter((post) => {
    return selectedCategory === 'All' || post.category === selectedCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {/* Header */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6" data-testid="text-blog-title">
              Liberty Chain Blog
            </h1>
            <p className="text-xl text-muted-foreground" data-testid="text-blog-subtitle">
              Stay updated with the latest news, technical articles, and community stories from the Liberty Chain ecosystem.
            </p>
          </div>
        </div>
      </section>

      {/* Category filter */}
      <section className="py-8 border-y border-border/50 bg-card/30">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-wrap gap-2" data-testid="filter-categories">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                data-testid={`button-category-${category.toLowerCase()}`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog posts */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {filteredPosts.map((post) => (
              <Card 
                key={post.id} 
                className="group overflow-hidden hover-elevate active-elevate-2 transition-all duration-300"
                data-testid={`blog-post-${post.id}`}
              >
                {/* Post image placeholder */}
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="p-6 space-y-4">
                  {/* Category and meta */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <Badge 
                      variant="secondary"
                      data-testid={`badge-category-${post.id}`}
                    >
                      {post.category}
                    </Badge>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span data-testid={`text-post-date-${post.id}`}>
                          {format(new Date(post.date), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span data-testid={`text-post-author-${post.id}`}>
                          {post.author}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Post content */}
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold line-clamp-2 group-hover:text-primary transition-colors" data-testid={`text-post-title-${post.id}`}>
                      {post.title}
                    </h3>
                    
                    <p className="text-muted-foreground line-clamp-3" data-testid={`text-post-excerpt-${post.id}`}>
                      {post.excerpt}
                    </p>
                  </div>

                  {/* Read more */}
                  <Button 
                    variant="ghost" 
                    className="group/button p-0 h-auto hover:bg-transparent"
                    data-testid={`button-read-more-${post.id}`}
                  >
                    <span className="text-primary font-semibold flex items-center gap-2">
                      Read more
                      <ArrowRight className="w-4 h-4 group-hover/button:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
