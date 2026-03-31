import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import {
  ChevronLeft,
  Users,
  Search,
  Download,
  Mail,
  Filter,
  ArrowUpDown,
  CalendarCheck,
} from "lucide-react";
import { SiX, SiTelegram } from "react-icons/si";

interface Contact {
  id: string;
  name: string;
  email: string;
  source: "waitlist" | "accelerator" | "event-registration";
  tag: string;
  date: string;
  twitter: string;
  telegram: string;
  signupPage: string;
}

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  waitlist: { label: "Waitlist", color: "text-blue-400 border-blue-400/30" },
  accelerator: { label: "Accelerator", color: "text-purple-400 border-purple-400/30" },
  "event-registration": { label: "Event", color: "text-teal-400 border-teal-400/30" },
};

const STAGE_LABELS: Record<string, string> = {
  applied: "Applied",
  review: "In Review",
  interview: "Interview",
  accepted: "Accepted",
  rejected: "Rejected",
};

type FilterSource = "all" | "waitlist" | "accelerator" | "event-registration";

export default function AdminContacts() {
  const [search, setSearch] = useState("");
  const [filterSource, setFilterSource] = useState<FilterSource>("all");
  const [sortField, setSortField] = useState<"name" | "date">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const { data: contacts = [], isLoading } = useQuery<Contact[]>({
    queryKey: ["/api/admin/contacts"],
  });

  const filtered = useMemo(() => {
    let list = [...contacts];
    if (filterSource !== "all") list = list.filter((c) => c.source === filterSource);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.tag.toLowerCase().includes(q) ||
          c.twitter.toLowerCase().includes(q) ||
          c.telegram.toLowerCase().includes(q) ||
          c.signupPage.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") cmp = a.name.localeCompare(b.name);
      else cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [contacts, search, filterSource, sortField, sortDir]);

  function toggleSort(field: "name" | "date") {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  }

  function exportCSV() {
    const header = "Name,Email,X/Twitter,Telegram,Source,Signup Page,Tag,Date";
    const rows = filtered.map((c) =>
      [
        c.name,
        c.email,
        c.twitter || "",
        c.telegram || "",
        c.source,
        c.signupPage,
        c.source === "accelerator" ? (STAGE_LABELS[c.tag] ?? c.tag) : c.tag,
        new Date(c.date).toLocaleDateString(),
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `liberty-chain-contacts-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const waitlistCount = contacts.filter((c) => c.source === "waitlist").length;
  const acceleratorCount = contacts.filter((c) => c.source === "accelerator").length;
  const eventCount = contacts.filter((c) => c.source === "event-registration").length;

  const filterButtons: { key: FilterSource; label: string }[] = [
    { key: "all", label: "All" },
    { key: "waitlist", label: "Waitlist" },
    { key: "accelerator", label: "Accelerator" },
    { key: "event-registration", label: "Events" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-24 sm:py-28">

        {/* Back */}
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2" data-testid="button-back-dashboard">
          <Link href="/admin"><ChevronLeft className="w-4 h-4 mr-1" />Dashboard</Link>
        </Button>

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight" data-testid="heading-contacts">Contact Database</h1>
              <p className="text-sm text-muted-foreground">All contacts from waitlist, accelerator &amp; event registrations</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            disabled={filtered.length === 0}
            data-testid="button-export-csv"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Contacts", value: contacts.length, icon: Users },
            { label: "Waitlist", value: waitlistCount, icon: Mail },
            { label: "Accelerator", value: acceleratorCount, icon: Filter },
            { label: "Event Registrations", value: eventCount, icon: CalendarCheck },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
              <p className="text-2xl font-black">{value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, handle, or event..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-sm"
              data-testid="input-contact-search"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {filterButtons.map(({ key, label }) => (
              <Button
                key={key}
                variant={filterSource === key ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterSource(key)}
                data-testid={`button-filter-${key}`}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[2fr_2fr_1.5fr_1fr] gap-4 px-4 py-3 border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <button
              className="flex items-center gap-1.5 hover:text-foreground transition-colors text-left"
              onClick={() => toggleSort("name")}
              data-testid="button-sort-name"
            >
              <ArrowUpDown className="w-3 h-3" />
              Name &amp; Handles
            </button>
            <span>Email</span>
            <span>Signed Up Via</span>
            <button
              className="flex items-center gap-1.5 hover:text-foreground transition-colors text-left"
              onClick={() => toggleSort("date")}
              data-testid="button-sort-date"
            >
              <ArrowUpDown className="w-3 h-3" />
              Date
            </button>
          </div>

          {/* Rows */}
          {isLoading ? (
            <div className="py-16 text-center text-muted-foreground text-sm">Loading contacts...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                {search || filterSource !== "all" ? "No contacts match your filter." : "No contacts yet."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((contact) => {
                const src = SOURCE_LABELS[contact.source] ?? { label: contact.source, color: "" };
                const tagLabel = contact.source === "accelerator"
                  ? (STAGE_LABELS[contact.tag] ?? contact.tag)
                  : contact.tag;
                return (
                  <div
                    key={contact.id}
                    className="grid grid-cols-[2fr_2fr_1.5fr_1fr] gap-4 px-4 py-3.5 hover:bg-muted/20 transition-colors items-start"
                    data-testid={`row-contact-${contact.id}`}
                  >
                    {/* Name + social handles */}
                    <div className="min-w-0">
                      <span className="font-medium text-sm block truncate">{contact.name}</span>
                      <div className="flex flex-col gap-0.5 mt-1">
                        {contact.twitter && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground" data-testid={`text-twitter-${contact.id}`}>
                            <SiX className="w-2.5 h-2.5 flex-shrink-0" />
                            <span className="truncate">{contact.twitter}</span>
                          </span>
                        )}
                        {contact.telegram && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground" data-testid={`text-telegram-${contact.id}`}>
                            <SiTelegram className="w-2.5 h-2.5 flex-shrink-0" />
                            <span className="truncate">{contact.telegram}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors truncate flex items-center gap-1.5 self-center"
                      data-testid={`link-email-${contact.id}`}
                    >
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      {contact.email}
                    </a>

                    {/* Source + signup page */}
                    <div className="min-w-0 self-center">
                      <Badge
                        variant="outline"
                        className={`text-xs w-fit ${src.color} mb-1`}
                        data-testid={`badge-source-${contact.id}`}
                      >
                        {src.label}
                      </Badge>
                      <p className="text-xs text-muted-foreground truncate" title={contact.signupPage}>
                        {contact.signupPage}
                        {tagLabel ? ` · ${tagLabel}` : ""}
                      </p>
                    </div>

                    {/* Date */}
                    <span className="text-xs text-muted-foreground self-center">
                      {new Date(contact.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {filtered.length > 0 && (
          <p className="text-xs text-muted-foreground mt-3 text-right">
            Showing {filtered.length} of {contacts.length} contacts
          </p>
        )}
      </div>
    </div>
  );
}
