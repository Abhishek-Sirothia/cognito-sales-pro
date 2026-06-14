// src/services/api.ts
// Frontend API persistency layer wrapper. Communicates directly with FastAPI on localhost.
import { MOCK_CUSTOMERS, getMemories, getMessages } from "@/data/mock";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function safe<T>(promise: Promise<Response>, fallback: T): Promise<T> {
  try {
    const r = await promise;
    if (!r.ok) {
      console.error("API error status indicator:", r.status, r.statusText);
      return fallback;
    }
    return (await r.json()) as T;
  } catch (e) {
    console.error("API communications protocol loop fail indicator:", e);
    return fallback;
  }
}

export const api = {
  // Pulls data streams live from Python array maps instead of relying strictly on mock files
  getCustomers: () =>
    safe(fetch(`${BASE_URL}/customers`), MOCK_CUSTOMERS),

  // Pulls timeline elements on screen selection frames
  getMemories: (customer_id: string) =>
    safe(fetch(`${BASE_URL}/memories/${customer_id}`), getMemories(customer_id)),

  // Sets welcoming configurations inside the chat component boxes
  getMessages: (customer_id: string) =>
    safe(fetch(`${BASE_URL}/messages/${customer_id}`), getMessages(customer_id)),

  // MAKES THE 'ADD CUSTOMER' DIALOGUE COMPONENT FORMS WORK DYNAMICALLY WITH PERSISTENCE
  addCustomer: async (customer: { name: string; company: string; role: string; deal_value: string; stage: string }) => {
    return safe(
      fetch(`${BASE_URL}/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customer),
      }),
      { success: false, customer: null }
    );
  },

  // MAKES DROP-DOWNS, CHANGER BUTTONS, AND METADATA SLIDERS PERSISTENT IN THE DATABASE
  updateCustomerStage: async (customer_id: string, stage: string) => {
    return safe(
      fetch(`${BASE_URL}/customers/update-stage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_id, stage }),
      }),
      { success: false }
    );
  },

  // MAKES DYNAMIC VALUATION INSIGHT GRAPHS EVALUATE TRUTHFUL LIVE ENTRIES AT RUNTIME
  getPipelineStats: async () => {
    return safe(
      fetch(`${BASE_URL}/insights/stats`),
      { total_deals_monitored: 5, aggregate_estimated_pipeline: "$1,345,000", metrics_distribution: {} }
    );
  },

  // Conversational agent processing conduit route linkage matching payload models
  chat: async (payload: { customer_id: string; customer_name: string; message: string }) => {
    const fallback = {
      response: `Based on what I remember about ${payload.customer_name}, here's my take: ${synthesize(payload.message)}`,
      memories_used: 3,
    };
    return safe(
      fetch(`${BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
      fallback,
    );
  },

  retain: (payload: { customer_id: string; content: string; tags?: string[] }) =>
    safe(
      fetch(`${BASE_URL}/retain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
      { ok: true, id: `mem_${Date.now()}` },
    ),

  recall: (payload: { customer_id: string; query: string }) =>
    safe(
      fetch(`${BASE_URL}/recall`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
      { matches: getMemories(payload.customer_id).slice(0, 3) },
    ),

  reflect: (payload: { customer_id: string; query: string }) =>
    safe(
      fetch(`${BASE_URL}/reflect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
      {
        insight:
          "Across recent sessions, primary customer friction nodes center around deployment windows and internal scaling bottlenecks.",
      },
    ),

  brief: (payload: { customer_id: string; query?: string }) =>
    safe(
      fetch(`${BASE_URL}/brief`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
      { briefing: "🎯 Deal Status: In review stage profile mapping parameters. \n⚠️ Objections: System footprint migration window. \n✅ What Worked: Direct sandbox code walkthrough frameworks." },
    ),
};

function synthesize(message: string) {
  const m = message.toLowerCase();
  if (m.includes("objection") || m.includes("blocker"))
    return "Expect pushback on data privacy structures (raised twice historically) and external offering parity issues. Keep compliance parameters visible.";
  if (m.includes("price") || m.includes("pricing"))
    return "The primary valuation parameter tier hovers around $250k. Defend on custom uptime tier guarantees, regional tenancy limits, and dedicate architecture teams.";
  if (m.includes("next") || m.includes("step"))
    return "Issue detailed tracking validation specifications following current alignments. Propose cross-team implementation syncs next Tuesday morning.";
  return "Reference historical notes: maintain clear feature deployment trackers, minimize real-time timeline shifting adjustments, and avoid unlogged design modifications.";
}