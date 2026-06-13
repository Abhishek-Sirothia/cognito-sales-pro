import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Brain, ChevronRight } from "lucide-react";
import type { Customer, DealStage } from "@/types";

const STAGE_STYLES: Record<DealStage, string> = {
  Qualification: "bg-violet/15 text-violet border-violet/30",
  Discovery: "bg-primary/15 text-primary border-primary/30",
  Proposal: "bg-warning/15 text-warning border-warning/30",
  Negotiation: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  "Closed Won": "bg-success/15 text-success border-success/30",
  "Closed Lost": "bg-text-muted/10 text-text-muted border-text-muted/30",
};

const SENTIMENT_DOT = {
  positive: "bg-success",
  neutral: "bg-warning",
  "at-risk": "bg-destructive pulse-dot",
};

export function CustomerRow({ customer, index }: { customer: Customer; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.05 * index }}
    >
      <Link
        to="/customer/$id"
        params={{ id: customer.id }}
        className="group relative grid grid-cols-[1fr_140px_120px_120px_80px_24px] items-center gap-4 px-4 py-3 rounded-lg border border-transparent hover:border-border hover:bg-surface-2 transition-all"
      >
        <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-primary opacity-0 group-hover:opacity-100 transition" />

        <div className="flex items-center gap-3 min-w-0">
          <div
            className="size-9 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ backgroundColor: customer.avatarColor }}
          >
            {customer.avatar}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold truncate">{customer.name}</span>
              <span className={`size-1.5 rounded-full ${SENTIMENT_DOT[customer.sentiment]}`} />
            </div>
            <div className="text-xs text-text-muted truncate">
              {customer.role} · {customer.company}
            </div>
          </div>
        </div>

        <span className={`text-[10px] font-medium px-2 py-1 rounded-full border w-fit ${STAGE_STYLES[customer.dealStage]}`}>
          {customer.dealStage}
        </span>

        <span className="text-sm font-mono text-foreground">{customer.dealValue}</span>
        <span className="text-xs text-text-secondary">{customer.lastInteraction}</span>

        <span className="flex items-center gap-1.5 text-xs text-text-secondary">
          <Brain className="size-3.5 text-violet" />
          <span className="font-mono tabular-nums">{customer.memoryCount}</span>
        </span>

        <ChevronRight className="size-4 text-text-muted group-hover:text-primary transition" />
      </Link>
    </motion.div>
  );
}
