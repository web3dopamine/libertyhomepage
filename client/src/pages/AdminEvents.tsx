import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Calendar, MapPin, Globe2, Plus, Pencil, Trash2, ShieldCheck, ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import type { Event, InsertEvent } from "@shared/schema";
import { eventCategoryValues } from "@shared/schema";

const EMPTY_FORM: InsertEvent = {
  title: "",
  date: "",
  category: "Conference",
  location: "",
  description: "",
  isVirtual: false,
  link: "#",
};

export default function AdminEvents() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [form, setForm] = useState<InsertEvent>(EMPTY_FORM);

  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertEvent) => apiRequest("POST", "/api/events", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setDialogOpen(false);
      setForm(EMPTY_FORM);
      toast({ title: "Event created", description: "The event has been added successfully." });
    },
    onError: () => toast({ title: "Error", description: "Failed to create event.", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertEvent> }) =>
      apiRequest("PUT", `/api/events/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setDialogOpen(false);
      setEditingEvent(null);
      setForm(EMPTY_FORM);
      toast({ title: "Event updated", description: "The event has been updated successfully." });
    },
    onError: () => toast({ title: "Error", description: "Failed to update event.", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/events/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setDeleteId(null);
      toast({ title: "Event deleted", description: "The event has been removed." });
    },
    onError: () => toast({ title: "Error", description: "Failed to delete event.", variant: "destructive" }),
  });

  function openCreate() {
    setEditingEvent(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEdit(event: Event) {
    setEditingEvent(event);
    setForm({
      title: event.title,
      date: typeof event.date === "string" ? event.date : format(new Date(event.date), "yyyy-MM-dd"),
      category: event.category,
      location: event.location,
      description: event.description,
      isVirtual: event.isVirtual,
      link: event.link,
    });
    setDialogOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingEvent) {
      updateMutation.mutate({ id: editingEvent.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  const upcoming = events.filter((e) => new Date(e.date) >= new Date());
  const past = events.filter((e) => new Date(e.date) < new Date());

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-8">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 text-muted-foreground" data-testid="link-admin-back">
                <ChevronLeft className="w-4 h-4" />
                Admin
              </Button>
            </Link>
          </div>

          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold text-primary uppercase tracking-wider">Admin / Events</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight" data-testid="heading-admin-events">
                Manage Events
              </h1>
              <p className="text-muted-foreground mt-2">
                Add, edit, or remove Liberty Chain events visible on the public Events page.
              </p>
            </div>
            <Button size="lg" onClick={openCreate} data-testid="button-add-event">
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {[
              { label: "Total Events", value: events.length },
              { label: "Upcoming", value: upcoming.length },
              { label: "Past", value: past.length },
              { label: "Virtual", value: events.filter((e) => e.isVirtual).length },
            ].map((stat) => (
              <Card key={stat.label} className="p-5 text-center">
                <div className="text-3xl font-black gradient-text">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </Card>
            ))}
          </div>

          {/* Events table */}
          {isLoading ? (
            <div className="text-center py-20 text-muted-foreground">Loading events...</div>
          ) : events.length === 0 ? (
            <Card className="p-16 text-center">
              <p className="text-muted-foreground mb-4">No events yet.</p>
              <Button onClick={openCreate}>Add your first event</Button>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-card/50">
                      <th className="text-left p-4 font-semibold">Event</th>
                      <th className="text-left p-4 font-semibold">Date</th>
                      <th className="text-left p-4 font-semibold">Category</th>
                      <th className="text-left p-4 font-semibold">Location</th>
                      <th className="text-left p-4 font-semibold">Status</th>
                      <th className="p-4" />
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event, i) => {
                      const isUpcoming = new Date(event.date) >= new Date();
                      return (
                        <tr
                          key={event.id}
                          className={`border-b border-border/50 hover:bg-card/40 transition-colors ${
                            i === events.length - 1 ? "border-0" : ""
                          }`}
                          data-testid={`admin-event-row-${event.id}`}
                        >
                          <td className="p-4 max-w-xs">
                            <div className="font-semibold line-clamp-1">{event.title}</div>
                            <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {event.description}
                            </div>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Calendar className="w-3.5 h-3.5" />
                              {format(new Date(event.date), "MMM d, yyyy")}
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="secondary">{event.category}</Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              {event.isVirtual ? (
                                <Globe2 className="w-3.5 h-3.5" />
                              ) : (
                                <MapPin className="w-3.5 h-3.5" />
                              )}
                              <span className="text-xs">{event.location}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge
                              variant={isUpcoming ? "default" : "secondary"}
                              className={isUpcoming ? "bg-primary/10 text-primary border-primary/20" : ""}
                            >
                              {isUpcoming ? "Upcoming" : "Past"}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => openEdit(event)}
                                data-testid={`button-edit-${event.id}`}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setDeleteId(event.id)}
                                data-testid={`button-delete-${event.id}`}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </main>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingEvent(null); setForm(EMPTY_FORM); } }}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit Event" : "Add New Event"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Liberty Chain Developer Summit 2026"
                required
                data-testid="input-event-title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                  data-testid="input-event-date"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={form.category}
                  onValueChange={(val) => setForm({ ...form, category: val as InsertEvent["category"] })}
                >
                  <SelectTrigger id="category" data-testid="select-event-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {eventCategoryValues.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. San Francisco, CA or Online"
                required
                data-testid="input-event-location"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <div className="font-medium text-sm">Virtual Event</div>
                <div className="text-xs text-muted-foreground">Toggle on if this event is online-only</div>
              </div>
              <Switch
                checked={form.isVirtual}
                onCheckedChange={(checked) => setForm({ ...form, isVirtual: checked, location: checked ? "Online" : form.location === "Online" ? "" : form.location })}
                data-testid="switch-virtual"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the event, what attendees can expect, and why they should join..."
                rows={4}
                required
                data-testid="input-event-description"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="link">Registration Link</Label>
              <Input
                id="link"
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                placeholder="https://..."
                data-testid="input-event-link"
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                data-testid="button-cancel-event"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} data-testid="button-save-event">
                {isPending ? "Saving..." : editingEvent ? "Save Changes" : "Create Event"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
