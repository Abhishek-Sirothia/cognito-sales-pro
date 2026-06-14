// src/components/dashboard/RecentActivity.tsx
import { motion } from "framer-motion";
import { Brain, MessageSquare, Eye, Lightbulb } from "lucide-react";
import type { ActivityEvent, MemoryType } from "@/types";

const TYPE_CONFIG: Record<MemoryType, { icon: typeof Brain; color: string; bg: string; label: string }> = {
  retain:      { icon: Brain,        color: "text-primary",     bg: "bg-primary/15",     label: "Retained" },
  recall:      { icon: MessageSquare,color: "text-violet",      bg: "bg-violet/15",      label: "Recalled" },
  reflect:     { icon: Lightbulb,    color: "text-warning",     bg: "bg-warning/15",     label: "Reflected" },
  observation: { icon: Eye,          color: "text-success",     bg: "bg-success/15",     label: "Observed" },
};

export function RecentActivity({ activities }: { activities: ActivityEvent[] }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">Recent Activity</h2>
      </div>

      {activities.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
          No recent activity yet.
        </div>
      ) : (
        <ul className="space-y-3 flex-1 overflow-y-auto">
          {activities.map((item, i) => {
            const cfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.observation;
            const Icon = cfg.icon;
            return (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.04 * i }}
                className="flex items-start gap-3"
              >
                <div className={`mt-0.5 rounded-lg ${cfg.bg} p-1.5 shrink-0`}>
                  <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-semibold text-foreground">{item.customer}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${cfg.bg} ${cfg.color} border-current/30`}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5 leading-relaxed line-clamp-2">
                    {item.content}
                  </p>
                  <p className="text-[10px] text-text-muted mt-1">{item.timestamp}</p>
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}
    </div>
  );
}