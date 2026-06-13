import { motion } from "framer-motion";
import { Brain, Eye, RefreshCw, Save } from "lucide-react";
import type { ActivityEvent, MemoryType } from "@/types";

const ICONS: Record<MemoryType, typeof Brain> = {
  observation: Eye,
  retain: Save,
  recall: RefreshCw,
  reflect: Brain,
};

const COLORS: Record<MemoryType, string> = {
  observation: "text-violet bg-violet/10",
  retain: "text-primary bg-primary/10",
  recall: "text-success bg-success/10",
  reflect: "text-warning bg-warning/10",
};

export function RecentActivity({ events }: { events: ActivityEvent[] }) {
  return (
    <div className="rounded-xl border border-border bg-surface flex flex-col h-full min-h-0">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Recent Memory Events</h3>
          <p className="text-xs text-text-muted mt-0.5">Live feed across your accounts</p>
        </div>
        <span className="size-2 rounded-full bg-success pulse-dot" />
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {events.map((e, i) => {
          const Icon = ICONS[e.type];
          return (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.05 * i }}
              className="flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-surface-2 transition cursor-pointer"
            >
              <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${COLORS[e.type]}`}>
                <Icon className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className={`font-mono uppercase tracking-wider ${COLORS[e.type].split(" ")[0]}`}>
                    {e.type}
                  </span>
                  <span className="text-text-muted">·</span>
                  <span className="font-medium text-foreground">{e.customer}</span>
                </div>
                <p className="text-xs text-text-secondary mt-1 line-clamp-2">{e.content}</p>
                <span className="text-[10px] text-text-muted font-mono mt-1 inline-block">{e.timestamp}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
