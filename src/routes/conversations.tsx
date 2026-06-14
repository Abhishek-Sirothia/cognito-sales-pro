// src/routes/conversations.tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { MOCK_CUSTOMERS } from "@/data/mock";

export const Route = createFileRoute("/conversations")({
  head: () => ({ meta: [{ title: "Conversations · MemoryDesk" }] }),
  component: ConversationsPage,
});

function ConversationsPage() {
  return (
    <AppShell>
      <div className="h-full overflow-y-auto">
        <div className="px-6 py-6 space-y-6 max-w-[1400px] mx-auto">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold tracking-tight">Conversations</h1>
            <p className="text-sm text-text-secondary mt-1">All AI chat sessions across your accounts.</p>
          </motion.div>

          <div className="rounded-xl border border-border bg-surface divide-y divide-border overflow-hidden">
            {MOCK_CUSTOMERS.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to="/customer/$id"
                  params={{ id: c.id }}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-surface-2 transition group"
                >
                  <div
                    className="size-10 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ backgroundColor: c.avatarColor }}
                  >
                    {c.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold">{c.name}</div>
                    <div className="text-xs text-text-muted truncate">{c.role} · {c.company}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-text-secondary">{c.lastInteraction}</div>
                    <div className="text-[10px] text-text-muted mt-0.5">{c.memoryCount} memories</div>
                  </div>
                  <MessageSquare className="size-4 text-text-muted group-hover:text-primary transition" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
