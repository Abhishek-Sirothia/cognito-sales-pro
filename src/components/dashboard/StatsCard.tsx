import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import type { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  label: string;
  value: number;
  hint: string;
  accent?: "primary" | "violet" | "success" | "warning";
  delay?: number;
}

const ACCENTS = {
  primary: "from-primary/20 to-primary/5 text-primary",
  violet: "from-violet/20 to-violet/5 text-violet",
  success: "from-success/20 to-success/5 text-success",
  warning: "from-warning/20 to-warning/5 text-warning",
};

export function StatsCard({ icon: Icon, label, value, hint, accent = "primary", delay = 0 }: Props) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toString());

  useEffect(() => {
    const controls = animate(count, value, { duration: 1.2, ease: "easeOut", delay });
    return controls.stop;
  }, [value, delay, count]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="relative rounded-xl border border-border bg-surface p-5 overflow-hidden glow-blue"
    >
      <div className={`absolute -top-12 -right-12 size-32 rounded-full bg-gradient-to-br ${ACCENTS[accent]} blur-2xl opacity-60`} />
      <div className="relative flex items-start justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-text-secondary text-xs font-medium uppercase tracking-wider">
            <Icon className="size-3.5" />
            {label}
          </div>
          <motion.div className="text-3xl font-bold tracking-tight tabular-nums">
            {rounded}
          </motion.div>
          <div className="text-xs text-text-muted">{hint}</div>
        </div>
      </div>
    </motion.div>
  );
}
