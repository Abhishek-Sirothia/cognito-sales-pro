import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Eye, RefreshCw, Save } from "lucide-react";
import type { MemoryEvent, MemoryType } from "@/types";

const META: Record<MemoryType, { label: string; icon: typeof Brain; color: string; bar: string }> = {
  observation: { label: "OBSERVATION", icon: Eye, color: "text-violet bg-violet/10 border-violet/30", bar: "bg-violet" },
  retain: { label: "RETAIN", icon: Save, color: "text-primary bg-primary/10 border-primary/30", bar: "bg-primary" },
  recall: { label: "RECALL", icon: RefreshCw, color: "text-success bg-success/10 border-success/30", bar: "bg-success" },
  reflect: { label: "REFLECT", icon: Brain, color: "text-warning bg-warning/10 border-warning/30", bar: "bg-warning" },
};

const TABS: Array<{ key: "all" | MemoryType; label: string }> = [
  { key: "all", label: "All" },
  { key: "retain", label: "Retain" },
  { key: "recall", label: "Recall" },
  { key: "reflect", label: "Reflect" },
  { key: "observation", label: "Observe" },
];

export function MemoryTimeline({ memories }: { memories: MemoryEvent[] }) {
  const [tab, setTab] = useState<"all" | MemoryType>("all");
  const filtered = tab === "all" ? memories : memories.filter((m) => m.type === tab);

  return (
    <div className="rounded-xl border border-border bg-surface flex flex-col h-full min-h-0">
      <div className="shrink-0 px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Brain className="size-4 text-violet" /> Memory Timeline
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-2 border border-border text-text-secondary">
            {memories.length}
          </span>
        </div>
        <div className="flex gap-1 mt-3 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`text-[10px] px-2 py-1 rounded-md font-medium uppercase tracking-wider transition shrink-0 ${
                tab === t.key
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "text-text-muted hover:text-foreground border border-transparent"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((m, i) => {
            const meta = META[m.type];
            const Icon = meta.icon;
            return (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.25, delay: i * 0.03 }}
                className="rounded-lg border border-border bg-background p-3 space-y-2"
              >
                <div className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${meta.color}`}>
                  <Icon className="size-3" /> {meta.label}
                </div>
                <p className="text-xs text-foreground leading-relaxed">{m.content}</p>
                <div>
                  <div className="flex items-center justify-between text-[10px] text-text-muted mb-1 font-mono">
                    <span>confidence</span>
                    <span>{m.confidence}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-surface-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${m.confidence}%` }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      className={`h-full rounded-full ${meta.bar}`}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {m.tags.map((t) => (
                      <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-surface-2 border border-border text-text-secondary font-mono">
                        {t}
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] text-text-muted font-mono">{m.timestamp}</span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
