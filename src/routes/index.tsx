// src/routes/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BarChart3, Brain, MessageSquare, Plus, Users, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { CustomerRow } from "@/components/dashboard/CustomerCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { api } from "@/services/api";
import { MOCK_CUSTOMERS, MOCK_ACTIVITY } from "@/data/mock";
import type { Customer } from "@/types";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

const STAGE_COLORS: Record<string, string> = {
  Discovery:     "bg-primary/15 text-primary border-primary/30",
  Qualification: "bg-violet/15 text-violet border-violet/30",
  Proposal:      "bg-warning/15 text-warning border-warning/30",
  Negotiation:   "bg-orange-500/15 text-orange-400 border-orange-500/30",
  "Closed Won":  "bg-success/15 text-success border-success/30",
  "Closed Lost": "bg-surface-2 text-text-muted border-border",
};

function Dashboard() {
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [stats, setStats] = useState<any>({
    total_deals_monitored: MOCK_CUSTOMERS.length,
    aggregate_estimated_pipeline: "$1,345,000",
    metrics_distribution: { Proposal: 1, Negotiation: 1 },
  });
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form field states
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [value, setValue] = useState("");
  const [stage, setStage] = useState("Discovery");

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const liveCustomers = await api.getCustomers();

      let raw: any[] = [];
      if (Array.isArray(liveCustomers)) {
        raw = liveCustomers;
      } else if (liveCustomers && typeof liveCustomers === "object" && "customers" in liveCustomers) {
        raw = (liveCustomers as any).customers ?? [];
      } else if (liveCustomers && typeof liveCustomers === "object" && "LIVE_CUSTOMERS" in liveCustomers) {
        raw = (liveCustomers as any).LIVE_CUSTOMERS ?? [];
      }

      // Map raw API data to typed Customer shape, fall back to mock if empty
      if (raw.length > 0) {
        const mapped: Customer[] = raw.map((c: any, i: number) => ({
          id:              c.id              ?? `customer-${i}`,
          name:            c.name            ?? "Unknown",
          company:         c.company         ?? "—",
          role:            c.role            ?? "—",
          avatar:          c.avatar          ?? (c.name?.slice(0, 2).toUpperCase() ?? "??"),
          avatarColor:     c.avatarColor     ?? "#4F7EF7",
          dealStage:       c.stage ?? c.dealStage ?? "Discovery",
          dealValue:       c.deal_value ?? c.dealValue ?? "$0",
          lastInteraction: c.lastInteraction ?? "—",
          tags:            c.tags            ?? [],
          sentiment:       c.sentiment       ?? "neutral",
          memoryCount:     c.memoryCount     ?? 0,
        }));
        setCustomers(mapped);
      }

      const liveStats = await api.getPipelineStats();
      if (liveStats) setStats(liveStats);
    } catch (e) {
      console.error("Dashboard load error:", e);
      // Keep mock data on failure — already set as default state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !company) return;

    const res = await api.addCustomer({
      name,
      company,
      role:       role  || "Executive Stakeholder",
      deal_value: value || "$50,000",
      stage,
    });

    if (res) {
      setName(""); setCompany(""); setRole(""); setValue("");
      setIsOpen(false);
      await loadDashboardData();
    }
  };

  const metricCards = [
    {
      label: "Pipeline Value",
      value: stats?.aggregate_estimated_pipeline ?? "$0",
      sub:   "Live aggregate",
      icon:  TrendingUp,
      color: "text-primary",
    },
    {
      label: "Active Accounts",
      value: String(stats?.total_deals_monitored ?? customers.length),
      sub:   "Vector sandboxes",
      icon:  Users,
      color: "text-violet",
    },
    {
      label: "Proposal Stage",
      value: String(stats?.metrics_distribution?.["Proposal"] ?? 0),
      sub:   "Pending closure",
      icon:  MessageSquare,
      color: "text-warning",
    },
    {
      label: "Negotiation",
      value: String(stats?.metrics_distribution?.["Negotiation"] ?? 0),
      sub:   "Final review",
      icon:  Brain,
      color: "text-success",
    },
  ];

  return (
    <AppShell>
      <div className="h-full overflow-y-auto">
        <div className="px-6 py-6 space-y-6 max-w-[1600px] mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start justify-between gap-4"
          >
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Pipeline Workspace</h1>
              <p className="text-sm text-text-secondary mt-1">
                Contextual Sales Intelligence · Vector Memory Center
              </p>
            </div>
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary/90 hover:scale-105 active:scale-95 shrink-0"
            >
              <Plus className="h-4 w-4" /> Add New Deal
            </button>
          </motion.div>

          {/* Metric cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metricCards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-xl border border-border bg-surface p-5 relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                    {card.label}
                  </span>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
                <div className="text-2xl font-bold tracking-tight">{card.value}</div>
                <p className={`text-xs mt-1 ${card.color}`}>{card.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Main grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Customer list */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
                  Client Pipeline Matrix
                </h2>
                <span className="text-xs text-text-muted">{customers.length} accounts</span>
              </div>

              {/* Column headers */}
              <div className="grid grid-cols-[1fr_130px_110px_110px_60px_20px] items-center gap-4 px-4 py-2 text-[10px] uppercase tracking-wider text-text-muted font-medium">
                <span>Customer</span>
                <span>Stage</span>
                <span>Value</span>
                <span>Last Activity</span>
                <span>Mem</span>
                <span />
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16 text-text-muted text-sm">
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    Synchronizing intelligence streams...
                  </motion.div>
                </div>
              ) : customers.length > 0 ? (
                <div className="rounded-xl border border-border bg-surface overflow-hidden divide-y divide-border">
                  {customers.map((customer, i) => (
                    <CustomerRow key={customer.id} customer={customer} index={i} />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-surface p-8 text-center text-text-muted text-sm">
                  No client accounts yet. Click <span className="text-primary font-medium">Add New Deal</span> to get started.
                </div>
              )}
            </div>

            {/* Recent activity */}
            <div>
              <RecentActivity activities={MOCK_ACTIVITY} />
            </div>
          </div>

        </div>
      </div>

      {/* Add customer modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl"
          >
            <h2 className="text-lg font-bold mb-5">New Customer Pipeline</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: "Contact Full Name",      value: name,    set: setName,    placeholder: "John Doe",                  required: true },
                { label: "Account / Company",       value: company, set: setCompany, placeholder: "Stripe",                    required: true },
                { label: "Corporate Role",          value: role,    set: setRole,    placeholder: "Director of Infrastructure", required: false },
                { label: "Estimated Deal Value",    value: value,   set: setValue,   placeholder: "$150,000",                  required: false },
              ].map((field) => (
                <div key={field.label}>
                  <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    value={field.value}
                    onChange={(e) => field.set(e.target.value)}
                    required={field.required}
                    placeholder={field.placeholder}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-text-muted focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition"
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
                  Workflow Stage
                </label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition"
                >
                  {["Discovery", "Qualification", "Proposal", "Negotiation", "Closed Won"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm text-text-secondary hover:text-foreground transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition"
                >
                  Save Pipeline
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AppShell>
  );
}