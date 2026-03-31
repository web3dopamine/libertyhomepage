import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Event } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Calendar, MapPin, Globe2, ImageIcon, CheckCircle2 } from 'lucide-react';
import { SiX, SiTelegram } from 'react-icons/si';
import { format } from 'date-fns';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

interface RegForm {
  name: string;
  email: string;
  twitter: string;
  telegram: string;
}

const EMPTY_REG: RegForm = { name: '', email: '', twitter: '', telegram: '' };

export default function Events() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showUpcoming, setShowUpcoming] = useState(true);
  const [regDialog, setRegDialog] = useState<{ open: boolean; event: Event | null }>({ open: false, event: null });
  const [regForm, setRegForm] = useState<RegForm>(EMPTY_REG);
  const [regDone, setRegDone] = useState(false);
  const { toast } = useToast();

  const categories = ['All', 'Conference', 'Workshop', 'Hackathon', 'Meetup'];

  const { data: allEvents = [] } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });

  const today = new Date();
  const filteredEvents = allEvents.filter((event) => {
    const eventDate = new Date(event.date);
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    const matchesTimeframe = showUpcoming ? eventDate >= today : eventDate < today;
    return matchesCategory && matchesTimeframe;
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegForm) =>
      apiRequest('POST', `/api/events/${regDialog.event?.id}/register`, data),
    onSuccess: () => {
      setRegDone(true);
    },
    onError: (err: Error) => {
      const msg = err.message.includes('409')
        ? 'You are already registered for this event.'
        : 'Something went wrong. Please try again.';
      toast({ title: 'Registration failed', description: msg, variant: 'destructive' });
    },
  });

  function openRegDialog(event: Event) {
    setRegDialog({ open: true, event });
    setRegForm(EMPTY_REG);
    setRegDone(false);
  }

  function closeRegDialog() {
    setRegDialog({ open: false, event: null });
    setRegForm(EMPTY_REG);
    setRegDone(false);
  }

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
                  className="group overflow-hidden transition-all duration-300 flex flex-col"
                  data-testid={`event-card-${event.id}`}
                >
                  {/* Header image */}
                  {event.headerImage ? (
                    <div className="w-full overflow-hidden" style={{ aspectRatio: '16/9' }}>
                      <img
                        src={event.headerImage}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div
                      className="w-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center border-b border-border/30"
                      style={{ aspectRatio: '16/9' }}
                    >
                      <ImageIcon className="w-8 h-8 text-primary/15" />
                    </div>
                  )}

                  <div className="p-6 space-y-4 flex flex-col flex-1">
                    {/* Category + virtual */}
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" data-testid={`badge-category-${event.id}`}>
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
                    <div className="space-y-3 flex-1">
                      <h3
                        className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors"
                        data-testid={`text-event-title-${event.id}`}
                      >
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

                      <p
                        className="text-sm text-muted-foreground line-clamp-3"
                        data-testid={`text-event-description-${event.id}`}
                      >
                        {event.description}
                      </p>
                    </div>

                    {/* CTA */}
                    <Button
                      className="w-full"
                      onClick={() => openRegDialog(event)}
                      data-testid={`button-register-${event.id}`}
                    >
                      Register
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Registration Dialog */}
      <Dialog open={regDialog.open} onOpenChange={(open) => { if (!open) closeRegDialog(); }}>
        <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            {!regDone && regDialog.event && (
              <>
                <DialogTitle className="text-xl font-black" data-testid="dialog-reg-title">
                  Register for Event
                </DialogTitle>
                <DialogDescription asChild>
                  <div>
                    <span className="font-semibold text-foreground">{regDialog.event.title as string}</span>
                    <span className="block text-sm text-muted-foreground mt-0.5">
                      {format(new Date(regDialog.event.date), 'MMMM d, yyyy')} &middot; {regDialog.event.location}
                    </span>
                  </div>
                </DialogDescription>
              </>
            )}
          </DialogHeader>

          {regDone ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center" data-testid="reg-success">
              <CheckCircle2 className="w-12 h-12 text-primary" />
              <p className="text-xl font-bold">You&apos;re registered!</p>
              <p className="text-sm text-muted-foreground">
                A confirmation has been sent to {regForm.email}. See you there!
              </p>
              <Button variant="outline" size="sm" className="mt-2" onClick={closeRegDialog} data-testid="button-close-reg">
                Close
              </Button>
            </div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); registerMutation.mutate(regForm); }}
              className="space-y-4 pt-1"
              data-testid="form-event-register"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="reg-name">Name *</Label>
                  <Input
                    id="reg-name"
                    value={regForm.name}
                    onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                    placeholder="Your full name"
                    required
                    data-testid="input-reg-name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-email">Email *</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    placeholder="you@example.com"
                    required
                    data-testid="input-reg-email"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="reg-twitter" className="flex items-center gap-1.5">
                    <SiX className="w-3 h-3" />
                    X / Twitter
                    <span className="text-muted-foreground text-xs font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="reg-twitter"
                    value={regForm.twitter}
                    onChange={(e) => setRegForm({ ...regForm, twitter: e.target.value })}
                    placeholder="@handle"
                    data-testid="input-reg-twitter"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-telegram" className="flex items-center gap-1.5">
                    <SiTelegram className="w-3 h-3" />
                    Telegram
                    <span className="text-muted-foreground text-xs font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="reg-telegram"
                    value={regForm.telegram}
                    onChange={(e) => setRegForm({ ...regForm, telegram: e.target.value })}
                    placeholder="@handle"
                    data-testid="input-reg-telegram"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={registerMutation.isPending}
                data-testid="button-submit-register"
              >
                {registerMutation.isPending ? 'Registering...' : 'Register Now'}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                A confirmation email will be sent to you. No spam, ever.
              </p>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
