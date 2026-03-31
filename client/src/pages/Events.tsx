import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Event } from '@shared/schema';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, ArrowRight, Globe2, ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

export default function Events() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showUpcoming, setShowUpcoming] = useState(true);

  const categories = ['All', 'Conference', 'Workshop', 'Hackathon', 'Meetup'];

  const { data: allEvents = [], isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });

  const today = new Date();
  const filteredEvents = allEvents.filter((event) => {
    const eventDate = new Date(event.date);
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    const matchesTimeframe = showUpcoming ? eventDate >= today : eventDate < today;
    return matchesCategory && matchesTimeframe;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {/* Header */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6" data-testid="text-events-title">
              Liberty Chain Events
            </h1>
            <p className="text-xl text-muted-foreground" data-testid="text-events-subtitle">
              Join the community at conferences, workshops, hackathons, and meetups around the world.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-y border-border/50 bg-card/30">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
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

            {/* Time filter */}
            <div className="flex gap-2" data-testid="filter-timeframe">
              <Button
                variant={showUpcoming ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowUpcoming(true)}
                data-testid="button-upcoming"
              >
                Upcoming
              </Button>
              <Button
                variant={!showUpcoming ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowUpcoming(false)}
                data-testid="button-past"
              >
                Past
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Events grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-8">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-20" data-testid="text-no-events">
              <p className="text-xl text-muted-foreground">
                No {showUpcoming ? 'upcoming' : 'past'} events in this category.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <Card 
                  key={event.id} 
                  className="group overflow-hidden hover-elevate active-elevate-2 transition-all duration-300"
                  data-testid={`event-card-${event.id}`}
                >
                  {/* Header image */}
                  {event.headerImage ? (
                    <div className="w-full overflow-hidden" style={{ aspectRatio: "16/9" }}>
                      <img
                        src={event.headerImage}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div
                      className="w-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center border-b border-border/30"
                      style={{ aspectRatio: "16/9" }}
                    >
                      <ImageIcon className="w-8 h-8 text-primary/15" />
                    </div>
                  )}

                  <div className="p-6 space-y-4">
                    {/* Category badge */}
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant="secondary"
                        data-testid={`badge-category-${event.id}`}
                      >
                        {event.category}
                      </Badge>
                      {event.isVirtual && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Globe2 className="w-4 h-4" />
                          <span>Virtual</span>
                        </div>
                      )}
                    </div>

                    {/* Event details */}
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors" data-testid={`text-event-title-${event.id}`}>
                        {event.title}
                      </h3>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span data-testid={`text-event-date-${event.id}`}>
                            {format(new Date(event.date), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span data-testid={`text-event-location-${event.id}`}>
                            {event.location}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-3" data-testid={`text-event-description-${event.id}`}>
                        {event.description}
                      </p>
                    </div>

                    {/* CTA */}
                    <Button 
                      variant="ghost" 
                      className="group/button p-0 h-auto hover:bg-transparent w-full justify-start"
                      data-testid={`button-event-details-${event.id}`}
                    >
                      <span className="text-primary font-semibold flex items-center gap-2">
                        Learn more
                        <ArrowRight className="w-4 h-4 group-hover/button:translate-x-1 transition-transform" />
                      </span>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
