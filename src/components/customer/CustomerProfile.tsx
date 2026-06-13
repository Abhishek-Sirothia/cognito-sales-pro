import { motion } from "framer-motion";
import { Brain, Search, Sparkles } from "lucide-react";
import type { Customer, DealStage } from "@/types";

const STAGE_STYLES: Record<DealStage, string> = {
  Qualification: "bg-violet/15 text-violet border-violet/30",
  Discovery: "bg-primary/15 text-primary border-primary/30",
  Proposal: "bg-warning/15 text-warning border-warning/30",
  Negotiation: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  "Closed Won": "bg-success/15 text-success border-success/30",
  "Closed Lost": "bg-text-muted/10 text-text-muted border-text-muted/30",
};

const SENT = {
  positive: { dot: "bg-success", label: "Positive", glow: "" },
  neutral: { dot: "bg-warning", label: "Neutral", glow: "" },
  "at-risk": { dot: "bg-destructive pulse-dot", label: "At Risk", glow: "" },
};

interface Props {
  customer: Customer;
  onBrief: () => void;
  onReflect: () => void;
}

export function CustomerProfile({ customer, onBrief, onReflect }: Props) {
  const sent = SENT[customer.sentiment];
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="rounded-xl border border-border bg-surface p-5 flex flex-col gap-5 h-full overflow-y-auto"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div
            className="size-16 rounded-2xl flex items-center justify-center text-lg font-bold text-white"
            style={{ backgroundColor: customer.avatarColor }}
          >
            {customer.avatar}
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight leading-tight">{customer.name}</h2>
            <p className="text-xs text-text-secondary mt-0.5">{customer.role}</p>
            <p className="text-xs text-text-muted">{customer.company}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-text-secondary">
          <span className={`size-2 rounded-full ${sent.dot}`} />
          {sent.label}
        </div>
      </div>

      <div className="h-px bg-border" />

      <div className="space-y-3">
        <Row label="Deal stage">
          <span className={`text-[10px] font-medium px-2 py-1 rounded-full border ${STAGE_STYLES[customer.dealStage]}`}>
            {customer.dealStage}
          </span>
        </Row>
        <Row label="Deal value"><span className="font-mono text-sm">{customer.dealValue}</span></Row>
        <Row label="Last interaction"><span className="text-sm text-text-secondary">{customer.lastInteraction}</span></Row>
        <Row label="Memories">
          <span className="inline-flex items-center gap-1.5 text-sm font-mono">
            <Brain className="size-3.5 text-violet" />
            {customer.memoryCount}
          </span>
        </Row>
      </div>

      <div className="h-px bg-border" />

      <div>
        <div className="text-[10px] uppercase tracking-wider text-text-muted mb-2 font-medium">Tags</div>
        <div className="flex flex-wrap gap-1.5">
          {customer.tags.map((t) => (
            <span key={t} className="text-[10px] px-2 py-1 rounded-full bg-surface-2 border border-border text-text-secondary">
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="h-px bg-border" />

      <div className="space-y-2 mt-auto">
        <button
          onClick={onBrief}
          className="w-full h-10 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 transition glow-blue"
        >
          <Sparkles className="size-4" />
          Brief Me
        </button>
        <button
          onClick={onReflect}
          className="w-full h-10 rounded-lg border border-violet/40 text-violet hover:bg-violet/10 text-sm font-medium flex items-center justify-center gap-2 transition"
        >
          <Search className="size-4" />
          Deep Reflect
        </button>
      </div>
    </motion.div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-text-muted">{label}</span>
      {children}
    </div>
  );
}
