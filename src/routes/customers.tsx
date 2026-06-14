// src/routes/customers.tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { CustomerRow } from "@/components/dashboard/CustomerCard";
import { MOCK_CUSTOMERS } from "@/data/mock";

export const Route = createFileRoute("/customers")({
  head: () => ({ meta: [{ title: "Customers · MemoryDesk" }] }),
  component: CustomersPage,
});

function CustomersPage() {
  return (
    <AppShell>
      <div className="h-full overflow-y-auto">
        <div className="px-6 py-6 space-y-6 max-w-[1400px] mx-auto">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
            <p className="text-sm text-text-secondary mt-1">All monitored accounts and deal stages.</p>
          </motion.div>

          {/* Column headers */}
          <div className="grid grid-cols-[1fr_130px_110px_110px_60px_20px] items-center gap-4 px-4 py-2 text-[10px] uppercase tracking-wider text-text-muted font-medium">
            <span>Customer</span><span>Stage</span><span>Value</span><span>Last Activity</span><span>Mem</span><span />
          </div>

          <div className="rounded-xl border border-border bg-surface overflow-hidden divide-y divide-border">
            {MOCK_CUSTOMERS.map((customer, i) => (
              <CustomerRow key={customer.id} customer={customer} index={i} />
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
