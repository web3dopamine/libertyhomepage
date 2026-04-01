import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, TrendingUp, TrendingDown, Users, CalendarDays, Star, BarChart3 } from "lucide-react";
import { Link } from "wouter";
import { ShieldCheck } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Cell,
} from "recharts";

interface AnalyticsData {
  total: number;
  thisMonth: number;
  lastMonth: number;
  momentumPct: number;
  mostPopular: { eventId: string; title: string; count: number; date: string } | null;
  perEvent: { eventId: string; title: string; count: number; date: string }[];
  monthly: { label: string; month: string; count: number }[];
}

const CHART_COLOR = "hsl(var(--primary))";
const CHART_MUTED = "hsl(var(--muted))";

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  highlight,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  highlight?: boolean;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="text-sm text-muted-foreground font-medium">{label}</span>
        <Icon className={`w-4 h-4 mt-0.5 ${highlight ? "text-primary" : "text-muted-foreground"}`} />
      </div>
      <div className={`text-3xl font-black tabular-nums ${highlight ? "gradient-text" : ""}`}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1.5">{sub}</div>}
    </Card>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-md px-3 py-2 text-sm shadow-md">
      <div className="font-semibold mb-1">{label}</div>
      <div className="text-primary font-bold">{payload[0].value} registrations</div>
    </div>
  );
}

function TruncatedLabel({ x, y, width, value }: any) {
  const maxChars = Math.floor(width / 7);
  const text = value.length > maxChars ? value.slice(0, maxChars - 1) + "…" : value;
  return (
    <text x={x + width / 2} y={y - 5} textAnchor="middle" fontSize={11} fill="hsl(var(--muted-foreground))">
      {text}
    </text>
  );
}

export default function AdminEventAnalytics() {
  const { data, isLoading } = useQuery<AnalyticsData>({ queryKey: ["/api/admin/event-analytics"] });

  const hasTrend = (data?.momentumPct ?? 0) !== 0;
  const trendUp = (data?.momentumPct ?? 0) > 0;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20 sm:pt-32 pb-12 sm:pb-20">
        <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-8">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Button asChild variant="ghost" size="sm" className="gap-1.5 -ml-2 text-muted-foreground" data-testid="link-analytics-back">
              <Link href="/admin/events"><ChevronLeft className="w-4 h-4" />Events</Link>
            </Button>
          </div>

          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold text-primary uppercase tracking-wider">Admin / Events / Analytics</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight" data-testid="heading-event-analytics">
                Event Analytics
              </h1>
              <p className="text-muted-foreground mt-2">Registration trends, per-event counts, and momentum metrics.</p>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-24 text-muted-foreground">Loading analytics…</div>
          ) : !data ? (
            <div className="text-center py-24 text-muted-foreground">Failed to load analytics.</div>
          ) : (
            <div className="space-y-8">
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Total Registrations"
                  value={data.total}
                  icon={Users}
                  highlight
                  sub="All time"
                />
                <StatCard
                  label="This Month"
                  value={data.thisMonth}
                  icon={CalendarDays}
                  sub={
                    hasTrend
                      ? `${trendUp ? "+" : ""}${data.momentumPct}% vs last month`
                      : "No change from last month"
                  }
                />
                <StatCard
                  label="Last Month"
                  value={data.lastMonth}
                  icon={BarChart3}
                  sub="Previous period"
                />
                <StatCard
                  label="Most Popular"
                  value={data.mostPopular ? data.mostPopular.count : 0}
                  icon={Star}
                  sub={data.mostPopular ? data.mostPopular.title : "No events yet"}
                  highlight={!!data.mostPopular}
                />
              </div>

              {/* Momentum badge */}
              {hasTrend && (
                <div className="flex items-center gap-2">
                  {trendUp ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm font-semibold ${trendUp ? "text-green-500" : "text-red-500"}`}>
                    {trendUp ? "+" : ""}{data.momentumPct}% month-over-month
                  </span>
                  <span className="text-xs text-muted-foreground">({data.lastMonth} last month → {data.thisMonth} this month)</span>
                </div>
              )}

              {/* Per-event bar chart */}
              <Card className="p-6">
                <h2 className="text-lg font-bold mb-1">Registrations per Event</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  {data.perEvent.length === 0
                    ? "No events found."
                    : `${data.perEvent.length} event${data.perEvent.length !== 1 ? "s" : ""} total`}
                </p>
                {data.perEvent.length > 0 ? (
                  <ResponsiveContainer width="100%" height={Math.max(220, data.perEvent.length * 52)}>
                    <BarChart
                      data={data.perEvent}
                      layout="vertical"
                      margin={{ top: 4, right: 32, left: 8, bottom: 4 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                      <XAxis
                        type="number"
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                        axisLine={{ stroke: "hsl(var(--border))" }}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="title"
                        width={180}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(val: string) => val.length > 28 ? val.slice(0, 27) + "…" : val}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted)/0.3)" }} />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={32}>
                        {data.perEvent.map((entry, i) => (
                          <Cell
                            key={entry.eventId}
                            fill={entry.count === data.perEvent[0].count && entry.count > 0 ? CHART_COLOR : "hsl(var(--primary)/0.4)"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-muted-foreground text-sm">
                    No events created yet. Add events first to see registration data.
                  </div>
                )}
              </Card>

              {/* Monthly trend line chart */}
              <Card className="p-6">
                <h2 className="text-lg font-bold mb-1">Monthly Registration Trend</h2>
                <p className="text-sm text-muted-foreground mb-6">Last 18 months</p>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={data.monthly} margin={{ top: 4, right: 24, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      tickLine={false}
                      interval={2}
                    />
                    <YAxis
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke={CHART_COLOR}
                      strokeWidth={2.5}
                      dot={{ fill: CHART_COLOR, r: 3, strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: CHART_COLOR, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Per-event detail table */}
              {data.perEvent.length > 0 && (
                <Card className="p-6">
                  <h2 className="text-lg font-bold mb-4">Event Registration Breakdown</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm" data-testid="table-event-breakdown">
                      <thead>
                        <tr className="border-b border-border text-left">
                          <th className="pb-3 font-semibold text-muted-foreground">Event</th>
                          <th className="pb-3 font-semibold text-muted-foreground text-right">Registrations</th>
                          <th className="pb-3 font-semibold text-muted-foreground text-right">Share</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {data.perEvent.map((ev, i) => {
                          const share = data.total === 0 ? 0 : Math.round((ev.count / data.total) * 100);
                          return (
                            <tr key={ev.eventId} className="group" data-testid={`row-event-${ev.eventId}`}>
                              <td className="py-3 pr-4">
                                <div className="flex items-center gap-2">
                                  {i === 0 && ev.count > 0 && (
                                    <Star className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                                  )}
                                  <span className="font-medium">{ev.title}</span>
                                </div>
                              </td>
                              <td className="py-3 text-right tabular-nums">
                                <Badge variant={ev.count > 0 ? "default" : "secondary"} data-testid={`badge-count-${ev.eventId}`}>
                                  {ev.count}
                                </Badge>
                              </td>
                              <td className="py-3 text-right">
                                <span className="text-muted-foreground text-xs">{share}%</span>
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
          )}
        </div>
      </main>
    </div>
  );
}
