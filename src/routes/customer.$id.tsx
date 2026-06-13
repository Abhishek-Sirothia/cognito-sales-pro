import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { CustomerProfile } from "@/components/customer/CustomerProfile";
import { ChatPanel } from "@/components/customer/ChatPanel";
import { MemoryTimeline } from "@/components/customer/MemoryTimeline";
import { BriefingCard } from "@/components/customer/BriefingCard";
import { getCustomer, getMemories, getMessages } from "@/data/mock";

export const Route = createFileRoute("/customer/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `${getCustomer(params.id)?.name ?? "Customer"} · MemoryDesk` },
      { name: "description", content: "Customer workspace with full memory context." },
    ],
  }),
  loader: ({ params }) => {
    const customer = getCustomer(params.id);
    if (!customer) throw notFound();
    return { customer };
  },
  component: CustomerPage,
  notFoundComponent: () => (
    <AppShell>
      <div className="h-full flex items-center justify-center text-text-secondary">
        Customer not found.
      </div>
    </AppShell>
  ),
});

function CustomerPage() {
  const { customer } = Route.useLoaderData();
  const { id } = Route.useParams();
  const memories = getMemories(id);
  const messages = getMessages(id);
  const [briefOpen, setBriefOpen] = useState(false);

  return (
    <AppShell>
      <div className="h-full p-4">
        <div className="grid h-full gap-4 grid-cols-1 lg:grid-cols-[300px_1fr_340px] min-h-0">
          <CustomerProfile
            customer={customer}
            onBrief={() => setBriefOpen(true)}
            onReflect={() => setBriefOpen(true)}
          />
          <ChatPanel
            customer={customer}
            initialMessages={messages}
            onBrief={() => setBriefOpen(true)}
            onReflect={() => setBriefOpen(true)}
          />
          <MemoryTimeline memories={memories} />
        </div>
      </div>
      <BriefingCard customer={customer} open={briefOpen} onClose={() => setBriefOpen(false)} />
    </AppShell>
  );
}
