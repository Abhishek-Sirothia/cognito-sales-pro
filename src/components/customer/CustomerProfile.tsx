// src/components/customer/CustomerProfile.tsx
import { motion } from "framer-motion";
import { Brain, Search, Sparkles } from "lucide-react";
import { useState } from "react";
import type { Customer, DealStage } from "@/types";
import { api } from "@/services/api";

const STAGE_STYLES: Record<DealStage, string> = {
  Discovery: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Qualification: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Proposal: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Negotiation: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  "Closed Won": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

interface CustomerProfileProps {
  customer: Customer;
}

export function CustomerProfile({ customer: initialCustomer }: CustomerProfileProps) {
  const [customer, setCustomer] = useState<Customer>(initialCustomer);
  const [currentStage, setCurrentStage] = useState<DealStage>(customer.stage);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStageChange = async (newStage: DealStage) => {
    setIsUpdating(true);
    setCurrentStage(newStage);
    try {
      const res = await api.updateCustomerStage(customer.id, newStage);
      if (res && (res as any).customer) {
        setCustomer((res as any).customer);
      }
    } catch (e) {
      console.error("Failed to persist updated deal stage metadata state:", e);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 backdrop-blur-xl">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-purple-500/10 blur-2xl" />

      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-600 text-xl font-bold text-white shadow-lg shadow-purple-600/20">
            {customer.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{customer.name}</h2>
              <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${STAGE_STYLES[currentStage]}`}>
                {currentStage}
              </span>
            </div>
            <p className="text-neutral-400">
              {customer.role} at <span className="text-white font-medium">{customer.company}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-neutral-800/60 pt-4 sm:flex sm:border-0 sm:pt-0">
          <div className="rounded-xl bg-neutral-950/40 p-3 border border-neutral-800/40 min-w-[110px]">
            <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold mb-0.5">Pipeline Value</p>
            <p className="text-lg font-bold text-white tracking-tight">{customer.deal_value}</p>
          </div>
          <div className="rounded-xl bg-neutral-950/40 p-3 border border-neutral-800/40 min-w-[130px]">
            <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold mb-1">Pipeline Action</p>
            
            <select
              value={currentStage}
              disabled={isUpdating}
              onChange={(e) => handleStageChange(e.target.value as DealStage)}
              className="bg-transparent text-sm font-medium text-purple-400 hover:text-purple-300 focus:outline-none cursor-pointer disabled:opacity-50"
            >
              <option value="Discovery" className="bg-neutral-950 text-white">Discovery</option>
              <option value="Qualification" className="bg-neutral-950 text-white">Qualification</option>
              <option value="Proposal" className="bg-neutral-950 text-white">Proposal</option>
              <option value="Negotiation" className="bg-neutral-950 text-white">Negotiation</option>
              <option value="Closed Won" className="bg-neutral-950 text-white">Closed Won</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}