import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Check, Eye, EyeOff, Sparkles, X } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · MemoryDesk" },
      { name: "description", content: "Configure API keys, memory backends, and team access." },
    ],
  }),
  component: SettingsPage,
});

const TEAM = [
  { name: "You", email: "you@acme.com", role: "Owner", color: "#4F7EF7" },
  { name: "Priya Nair", email: "priya@acme.com", role: "Admin", color: "#7C5EF7" },
  { name: "Marcus Lee", email: "marcus@acme.com", role: "Sales Rep", color: "#22C55E" },
  { name: "Anna Kowalski", email: "anna@acme.com", role: "Sales Rep", color: "#F59E0B" },
];

function SettingsPage() {
  return (
    <AppShell>
      <div className="h-full overflow-y-auto">
        <div className="px-8 py-6 space-y-8 max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <p className="text-sm text-text-secondary mt-1">Configure your workspace and integrations.</p>
          </motion.div>

          <Section title="API Configuration" desc="Connect your AI provider and memory backend.">
            <KeyRow label="Groq API Key" placeholder="gsk_..." />
            <KeyRow label="Hindsight Key" placeholder="hs_..." />
            <KeyRow label="Hindsight URL" placeholder="https://api.hindsight.vectorize.io" reveal />
          </Section>

          <Section title="Hindsight Status" desc="Live connection to your memory cloud.">
            <div className="rounded-xl border border-border bg-background p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="size-2 rounded-full bg-success pulse-dot" />
                <span className="font-medium">Connected to Hindsight Cloud</span>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2">
                <Stat label="Memory Banks" value="5 active" />
                <Stat label="Total Memories" value="94" />
                <Stat label="Observations" value="12" />
              </div>
            </div>
          </Section>

          <Section title="Theme" desc="MemoryDesk is optimized for dark mode.">
            <div className="rounded-xl border border-border bg-background p-4 flex items-center gap-3">
              <div className="size-10 rounded-lg bg-gradient-to-br from-primary to-violet flex items-center justify-center">
                <Sparkles className="size-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">Dark · Default</div>
                <div className="text-xs text-text-muted">Designed for long sessions. Light mode coming soon.</div>
              </div>
              <span className="text-[10px] font-mono px-2 py-1 rounded-full bg-primary/15 text-primary border border-primary/30">
                ACTIVE
              </span>
            </div>
          </Section>

          <Section title="Team Management" desc="Who can access this workspace.">
            <div className="rounded-xl border border-border bg-background divide-y divide-border">
              {TEAM.map((m) => (
                <div key={m.email} className="px-4 py-3 flex items-center gap-3">
                  <div className="size-9 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: m.color }}>
                    {m.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{m.name}</div>
                    <div className="text-xs text-text-muted">{m.email}</div>
                  </div>
                  <RoleBadge role={m.role} />
                </div>
              ))}
            </div>
          </Section>

          <div className="flex items-center gap-2 text-xs text-text-muted pt-4 pb-12">
            <Brain className="size-3.5 text-violet" />
            MemoryDesk · v0.1 alpha · Built for sales teams who refuse to forget.
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="text-xs text-text-muted mt-0.5">{desc}</p>
      </div>
      <div className="space-y-2">{children}</div>
    </motion.section>
  );
}

function KeyRow({ label, placeholder, reveal = false }: { label: string; placeholder: string; reveal?: boolean }) {
  const [shown, setShown] = useState(reveal);
  const [status, setStatus] = useState<"idle" | "ok" | "fail">("idle");
  return (
    <div className="rounded-xl border border-border bg-background p-3 flex items-center gap-2">
      <div className="w-36 text-xs text-text-secondary">{label}</div>
      <input
        type={shown ? "text" : "password"}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm font-mono text-foreground placeholder:text-text-muted focus:outline-none"
        defaultValue={reveal ? placeholder : "••••••••••••••••••"}
      />
      <button
        onClick={() => setShown((s) => !s)}
        className="size-8 rounded-md hover:bg-surface-2 text-text-secondary hover:text-foreground flex items-center justify-center transition"
      >
        {shown ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
      </button>
      <button
        onClick={() => {
          setStatus("idle");
          setTimeout(() => setStatus(Math.random() > 0.15 ? "ok" : "fail"), 600);
        }}
        className="h-8 px-3 rounded-md text-xs font-medium border border-border hover:bg-surface-2 text-text-secondary hover:text-foreground transition flex items-center gap-1.5"
      >
        {status === "ok" ? <><Check className="size-3 text-success" /> Connected</> :
         status === "fail" ? <><X className="size-3 text-destructive" /> Failed</> :
         "Test"}
      </button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-text-muted">{label}</div>
      <div className="text-sm font-mono mt-1">{value}</div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    Owner: "bg-primary/15 text-primary border-primary/30",
    Admin: "bg-violet/15 text-violet border-violet/30",
    "Sales Rep": "bg-surface-2 text-text-secondary border-border",
  };
  return (
    <span className={`text-[10px] px-2 py-1 rounded-full border font-medium ${map[role] ?? map["Sales Rep"]}`}>
      {role}
    </span>
  );
}
