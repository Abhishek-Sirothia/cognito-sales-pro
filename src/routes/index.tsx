import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BarChart3, Brain, MessageSquare, Plus, Users } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { CustomerRow } from "@/components/dashboard/CustomerCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { MOCK_ACTIVITY, MOCK_CUSTOMERS } from "@/data/mock";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview · MemoryDesk" },
      { name: "description", content: "Your customer intelligence dashboard." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const totalMemories = MOCK_CUSTOMERS.reduce((s, c) => s + c.memoryCount, 0);
  return (
    <AppShell>
      <div className="h-full overflow-y-auto">
        <div className="px-8 py-6 space-y-6 max-w-[1600px] mx-auto">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
            <p className="text-sm text-text-secondary mt-1">
              What your AI remembers about your pipeline this week.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatsCard icon={Users} label="Customers" value={MOCK_CUSTOMERS.length} hint="+2 this week" accent="primary" delay={0} />
            <StatsCard icon={MessageSquare} label="Sessions" value={47} hint="+8 today" accent="violet" delay={0.05} />
            <StatsCard icon={Brain} label="Memories" value={totalMemories} hint="Growing fast" accent="success" delay={0.1} />
            <StatsCard icon={BarChart3} label="Observations" value={12} hint="Auto-detected" accent="warning" delay={0.15} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-4">
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-xl border border-border bg-surface flex flex-col min-h-[480px]"
            >
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold">Your Customers</h2>
                  <p className="text-xs text-text-muted mt-0.5">Active accounts with memory</p>
                </div>
                <button className="h-8 px-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium flex items-center gap-1.5 transition glow-blue">
                  <Plus className="size-3.5" /> Add Customer
                </button>
              </div>
              <div className="px-3 py-2 grid grid-cols-[1fr_140px_120px_120px_80px_24px] gap-4 text-[10px] uppercase tracking-wider text-text-muted font-medium px-4">
                <span>Customer</span>
                <span>Stage</span>
                <span>Value</span>
                <span>Last seen</span>
                <span>Memories</span>
                <span />
              </div>
              <div className="flex-1 p-1">
                {MOCK_CUSTOMERS.map((c, i) => (
                  <CustomerRow key={c.id} customer={c} index={i} />
                ))}
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="min-h-[480px]"
            >
              <RecentActivity events={MOCK_ACTIVITY} />
            </motion.section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
