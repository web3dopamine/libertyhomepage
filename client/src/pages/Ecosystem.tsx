import { useState } from 'react';
import { libertyChainData, EcosystemApp } from '@shared/schema';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, ArrowRight, Star } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

export default function Ecosystem() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'DeFi', 'NFTs', 'Gaming', 'Infrastructure', 'DAOs'];

  const filteredApps = libertyChainData.ecosystemApps.filter((app) => {
    const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Separate featured and non-featured apps
  const featuredApps = filteredApps.filter(app => app.featured);
  const regularApps = filteredApps.filter(app => !app.featured);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {/* Header */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6" data-testid="text-ecosystem-page-title">
              Ecosystem Directory
            </h1>
            <p className="text-xl text-muted-foreground" data-testid="text-ecosystem-page-subtitle">
              Discover apps built on Liberty Chain—fast, scalable, and completely decentralized.
            </p>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 border-y border-border/50 bg-card/30">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search apps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-apps"
              />
            </div>

            {/* Category filter */}
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
        </div>
      </section>

      {/* Featured apps */}
      {featuredApps.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-8">
            <h2 className="text-3xl font-black mb-8 flex items-center gap-2" data-testid="text-featured-apps">
              <Star className="w-6 h-6 text-primary fill-primary" />
              Featured Apps
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredApps.map((app) => (
                <Card 
                  key={app.id} 
                  className="group overflow-hidden hover-elevate active-elevate-2 transition-all duration-300"
                  data-testid={`app-card-${app.id}`}
                >
                  <div className="p-6 space-y-4">
                    {/* App logo placeholder */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">
                        {app.name.charAt(0)}
                      </span>
                    </div>

                    {/* App details */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold group-hover:text-primary transition-colors" data-testid={`text-app-name-${app.id}`}>
                          {app.name}
                        </h3>
                        <Badge variant="secondary" data-testid={`badge-category-${app.id}`}>
                          {app.category}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-app-description-${app.id}`}>
                        {app.description}
                      </p>
                    </div>

                    {/* CTA */}
                    <Button 
                      variant="ghost" 
                      className="group/button p-0 h-auto hover:bg-transparent w-full justify-start"
                      data-testid={`button-visit-app-${app.id}`}
                    >
                      <span className="text-primary font-semibold flex items-center gap-2">
                        Visit app
                        <ArrowRight className="w-4 h-4 group-hover/button:translate-x-1 transition-transform" />
                      </span>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Regular apps */}
      {regularApps.length > 0 && (
        <section className={`${featuredApps.length > 0 ? 'pb-16' : 'py-16'}`}>
          <div className="max-w-7xl mx-auto px-8">
            {featuredApps.length > 0 && (
              <h2 className="text-3xl font-black mb-8" data-testid="text-all-apps">
                All Apps
              </h2>
            )}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularApps.map((app) => (
                <Card 
                  key={app.id} 
                  className="group overflow-hidden hover-elevate active-elevate-2 transition-all duration-300"
                  data-testid={`app-card-${app.id}`}
                >
                  <div className="p-6 space-y-4">
                    {/* App logo placeholder */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">
                        {app.name.charAt(0)}
                      </span>
                    </div>

                    {/* App details */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold group-hover:text-primary transition-colors" data-testid={`text-app-name-${app.id}`}>
                          {app.name}
                        </h3>
                        <Badge variant="secondary" data-testid={`badge-category-${app.id}`}>
                          {app.category}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-app-description-${app.id}`}>
                        {app.description}
                      </p>
                    </div>

                    {/* CTA */}
                    <Button 
                      variant="ghost" 
                      className="group/button p-0 h-auto hover:bg-transparent w-full justify-start"
                      data-testid={`button-visit-app-${app.id}`}
                    >
                      <span className="text-primary font-semibold flex items-center gap-2">
                        Visit app
                        <ArrowRight className="w-4 h-4 group-hover/button:translate-x-1 transition-transform" />
                      </span>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* No results */}
      {filteredApps.length === 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-8 text-center" data-testid="text-no-apps">
            <p className="text-xl text-muted-foreground">
              No apps found matching your search.
            </p>
          </div>
        </section>
      )}
      <Footer />
    </div>
  );
}
