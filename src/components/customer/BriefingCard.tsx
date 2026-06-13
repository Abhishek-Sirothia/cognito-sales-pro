import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Brain, CheckCircle2, Clipboard, MessageSquare, RefreshCw, Target, X } from "lucide-react";
import type { Customer } from "@/types";

interface Props {
  customer: Customer;
  open: boolean;
  onClose: () => void;
}

export function BriefingCard({ customer, open, onClose }: Props) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(t);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[85vh] rounded-2xl border border-border bg-surface shadow-2xl flex flex-col glow-blue"
          >
            <div className="shrink-0 px-6 py-5 border-b border-border flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <Clipboard className="size-3.5" /> Pre-Call Briefing
                </div>
                <h2 className="text-lg font-bold mt-1">
                  {customer.name} <span className="text-text-muted font-normal">·</span>{" "}
                  <span className="text-text-secondary font-normal">{customer.company}</span>{" "}
                  <span className="text-text-muted font-normal">·</span>{" "}
                  <span className="text-primary font-normal">{customer.dealStage}</span>
                </h2>
              </div>
              <button
                onClick={onClose}
                className="size-8 rounded-lg border border-border hover:bg-surface-2 flex items-center justify-center text-text-secondary hover:text-foreground transition"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loading ? (
                <Skeleton />
              ) : (
                <>
                  <Section icon={Target} title="Deal Status" tint="primary">
                    <p>
                      <span className="font-mono">{customer.dealValue}</span> · {customer.dealStage} stage ·{" "}
                      <span className="text-text-secondary">5 interactions</span>
                    </p>
                  </Section>
                  <Section icon={AlertTriangle} title="Key Watch-outs" tint="warning">
                    <ul className="space-y-1.5">
                      <li>Data privacy flagged 3× — have SOC2 ready</li>
                      <li>Competitor offer at $190k on the table</li>
                      <li>CFO Rachel Wong must approve any deal</li>
                    </ul>
                  </Section>
                  <Section icon={CheckCircle2} title="What Has Worked" tint="success">
                    <ul className="space-y-1.5">
                      <li>Detailed written follow-ups (not calls)</li>
                      <li>UI demos (he responded positively)</li>
                    </ul>
                  </Section>
                  <Section icon={MessageSquare} title="Preferences" tint="violet">
                    <ul className="space-y-1.5">
                      <li>Async email follow-ups preferred</li>
                      <li>Busy during Q2 planning</li>
                    </ul>
                  </Section>
                  <Section icon={RefreshCw} title="Suggested Next Steps" tint="primary">
                    <ol className="space-y-1.5 list-decimal list-inside">
                      <li>Lead with US-only data residency confirmation</li>
                      <li>Prepare pricing justification vs competitor</li>
                      <li>Schedule CFO intro call</li>
                    </ol>
                  </Section>
                  <div className="pt-2 flex items-center gap-2 text-xs text-text-muted">
                    <Brain className="size-3.5 text-violet" />
                    Generated from {customer.memoryCount} memories across 5 sessions
                  </div>
                </>
              )}
            </div>

            <div className="shrink-0 px-6 py-4 border-t border-border flex items-center justify-between">
              <button
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => setLoading(false), 1200);
                }}
                className="text-xs text-text-secondary hover:text-foreground flex items-center gap-1.5 transition"
              >
                <RefreshCw className="size-3.5" /> Regenerate
              </button>
              <button
                onClick={onClose}
                className="h-9 px-4 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const TINTS = {
  primary: "text-primary bg-primary/10",
  warning: "text-warning bg-warning/10",
  success: "text-success bg-success/10",
  violet: "text-violet bg-violet/10",
} as const;

function Section({
  icon: Icon,
  title,
  tint,
  children,
}: {
  icon: typeof Target;
  title: string;
  tint: keyof typeof TINTS;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className={`size-7 rounded-lg flex items-center justify-center ${TINTS[tint]}`}>
          <Icon className="size-3.5" />
        </div>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="text-sm text-text-secondary leading-relaxed pl-9">{children}</div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-32 bg-surface-2 rounded" />
          <div className="h-3 w-full bg-surface-2 rounded" />
          <div className="h-3 w-5/6 bg-surface-2 rounded" />
        </div>
      ))}
    </div>
  );
}
