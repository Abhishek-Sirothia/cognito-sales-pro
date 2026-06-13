import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BarChart3, Brain, MessageSquare, Users } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { InteractionTrend, SentimentChart } from "@/components/insights/InsightCharts";
import { MOCK_CUSTOMERS } from "@/data/mock";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Insights · MemoryDesk" },
      { name: "description", content: "Memory trends and customer health analytics." },
    ],
  }),
  component: InsightsPage,
});

function InsightsPage() {
  const totalMemories = MOCK_CUSTOMERS.reduce((s, c) => s + c.memoryCount, 0);
  return (
    <AppShell>
      <div className="h-full overflow-y-auto">
        <div className="px-8 py-6 space-y-6 max-w-[1600px] mx-auto">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold tracking-tight">Insights</h1>
            <p className="text-sm text-text-secondary mt-1">Memory trends and account health over time.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatsCard icon={Users} label="Active Accounts" value={MOCK_CUSTOMERS.length} hint="across pipeline" accent="primary" delay={0} />
            <StatsCard icon={MessageSquare} label="Sessions / mo" value={134} hint="+22% MoM" accent="violet" delay={0.05} />
            <StatsCard icon={Brain} label="Total Memories" value={totalMemories} hint="all customers" accent="success" delay={0.1} />
            <StatsCard icon={BarChart3} label="Avg Sentiment" value={73} hint="+6 pts vs last month" accent="warning" delay={0.15} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <InteractionTrend />
            <SentimentChart />
          </div>

          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border bg-surface"
          >
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-sm font-semibold">Customer Health</h3>
              <p className="text-xs text-text-muted mt-0.5">Per-account scorecard</p>
            </div>
            <div className="px-5 py-2 grid grid-cols-[1fr_120px_120px_120px_120px] text-[10px] uppercase tracking-wider text-text-muted font-medium">
              <span>Customer</span><span>Sentiment</span><span>Memories</span><span>Last Activity</span><span>Stage</span>
            </div>
            <div className="divide-y divide-border">
              {MOCK_CUSTOMERS.map((c) => {
                const score = c.sentiment === "positive" ? 85 : c.sentiment === "neutral" ? 60 : 42;
                const color = score < 60 ? "text-destructive" : score < 80 ? "text-warning" : "text-success";
                return (
                  <div key={c.id} className="px-5 py-3 grid grid-cols-[1fr_120px_120px_120px_120px] items-center hover:bg-surface-2 transition">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: c.avatarColor }}>
                        {c.avatar}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{c.name}</div>
                        <div className="text-xs text-text-muted">{c.company}</div>
                      </div>
                    </div>
                    <span className={`text-sm font-mono ${color}`}>{score}</span>
                    <span className="text-sm font-mono text-text-secondary">{c.memoryCount}</span>
                    <span className="text-xs text-text-secondary">{c.lastInteraction}</span>
                    <span className="text-xs text-text-secondary">{c.dealStage}</span>
                  </div>
                );
              })}
            </div>
          </motion.section>
        </div>
      </div>
    </AppShell>
  );
}
