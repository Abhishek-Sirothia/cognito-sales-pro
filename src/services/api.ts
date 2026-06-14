// Frontend-only API layer. Falls back to mock data when no backend is reachable.
import { MOCK_CUSTOMERS, getMemories, getMessages } from "@/data/mock";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function safe<T>(promise: Promise<Response>, fallback: T): Promise<T> {
  try {
    const r = await promise;
    if (!r.ok) {
      console.error("API error:", r.status, r.statusText);
      return fallback;
    }
    return (await r.json()) as T;
  } catch (e) {
    console.error("API fetch failed:", e);
    return fallback;
  }
}

export const api = {
  getCustomers: () =>
    safe(fetch(`${BASE_URL}/customers`), MOCK_CUSTOMERS),

  getMemories: (customer_id: string) =>
    safe(fetch(`${BASE_URL}/memories/${customer_id}`), getMemories(customer_id)),

  getMessages: (customer_id: string) =>
    safe(fetch(`${BASE_URL}/messages/${customer_id}`), getMessages(customer_id)),

  chat: async (payload: { customer_id: string; customer_name: string; message: string }) => {
    const fallback = {
      reply: `Based on what I remember about ${payload.customer_name}, here's my take: ${synthesize(payload.message)}`,
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
          "Across recent sessions, the customer's primary blockers are pricing and data residency. Lead with proof, not pitch.",
      },
    ),

  brief: (payload: { customer_id: string; query?: string }) =>
    safe(
      fetch(`${BASE_URL}/brief`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
      null,
    ),
};

function synthesize(message: string) {
  const m = message.toLowerCase();
  if (m.includes("objection") || m.includes("blocker"))
    return "Expect pushback on data privacy (raised 3× historically) and a competitor offer at $190k. Have SOC2 docs ready and bring CFO Rachel Wong into the next thread.";
  if (m.includes("price") || m.includes("pricing"))
    return "The price anchor is $250k annual. Competitor sits at $190k. Justify on uptime SLA, US-only data residency, and named CSM.";
  if (m.includes("next") || m.includes("step"))
    return "Send a written follow-up (he prefers async). Lead with the residency confirmation, attach pricing one-pager, and propose a CFO intro slot next week.";
  return "Lean on what worked: written follow-ups, UI demos, and direct asks. Avoid surprise pricing changes — he doesn't react well to those in real-time.";
}
