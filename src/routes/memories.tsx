// src/routes/memories.tsx
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Brain, Eye, Lightbulb, MessageSquare } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { MOCK_CUSTOMERS, MOCK_MEMORIES } from "@/data/mock";
import type { MemoryType } from "@/types";

export const Route = createFileRoute("/memories")({
  head: () => ({ meta: [{ title: "Memories · MemoryDesk" }] }),
  component: MemoriesPage,
});

const TYPE_CONFIG: Record<MemoryType, { icon: typeof Brain; color: string; bg: string }> = {
  retain:      { icon: Brain,         color: "text-primary",  bg: "bg-primary/15" },
  recall:      { icon: MessageSquare, color: "text-violet",   bg: "bg-violet/15" },
  reflect:     { icon: Lightbulb,     color: "text-warning",  bg: "bg-warning/15" },
  observation: { icon: Eye,           color: "text-success",  bg: "bg-success/15" },
};

function MemoriesPage() {
  // Flatten all memories with customer info
  const allMemories = MOCK_CUSTOMERS.flatMap((c) =>
    (MOCK_MEMORIES[c.id] ?? []).map((m) => ({ ...m, customerName: c.name, avatarColor: c.avatarColor, avatar: c.avatar }))
  );

  return (
    <AppShell>
      <div className="h-full overflow-y-auto">
        <div className="px-6 py-6 space-y-6 max-w-[1400px] mx-auto">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold tracking-tight">Memory Bank</h1>
            <p className="text-sm text-text-secondary mt-1">
              {allMemories.length} memories retained across {MOCK_CUSTOMERS.length} accounts.
            </p>
          </motion.div>

          <div className="space-y-3">
            {allMemories.map((m, i) => {
              const cfg = TYPE_CONFIG[m.type] ?? TYPE_CONFIG.observation;
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={m.id + m.customerName}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="rounded-xl border border-border bg-surface p-4 flex gap-4 hover:bg-surface-2 transition"
                >
                  <div className={`rounded-lg ${cfg.bg} p-2 h-fit shrink-0`}>
                    <Icon className={`size-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <div
                        className="size-5 rounded flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                        style={{ backgroundColor: m.avatarColor }}
                      >
                        {m.avatar}
                      </div>
                      <span className="text-xs font-semibold">{m.customerName}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${cfg.bg} ${cfg.color}`}>
                        {m.type}
                      </span>
                      <span className="text-[10px] text-text-muted ml-auto">{m.timestamp}</span>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">{m.content}</p>
                    {m.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {m.tags.map((tag) => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-surface-2 text-text-muted border border-border">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-xs text-text-muted">confidence</div>
                    <div className="text-sm font-mono font-medium text-foreground">{m.confidence}%</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
