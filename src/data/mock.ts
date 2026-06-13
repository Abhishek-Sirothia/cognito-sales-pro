import type { Customer, Message, MemoryEvent, ActivityEvent } from "@/types";

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "john-chen-amex",
    name: "John Chen",
    company: "American Express",
    role: "VP of Digital Partnerships",
    avatar: "JC",
    avatarColor: "#4F7EF7",
    dealStage: "Proposal",
    dealValue: "$250,000",
    lastInteraction: "2 days ago",
    tags: ["Enterprise", "High Value", "Data Privacy"],
    sentiment: "neutral",
    memoryCount: 23,
  },
  {
    id: "sarah-malik-salesforce",
    name: "Sarah Malik",
    company: "Salesforce",
    role: "Director of Enterprise Sales",
    avatar: "SM",
    avatarColor: "#7C5EF7",
    dealStage: "Negotiation",
    dealValue: "$180,000",
    lastInteraction: "5 hours ago",
    tags: ["Enterprise", "API Integration"],
    sentiment: "positive",
    memoryCount: 17,
  },
  {
    id: "raj-patel-stripe",
    name: "Raj Patel",
    company: "Stripe",
    role: "Head of Partnerships",
    avatar: "RP",
    avatarColor: "#22C55E",
    dealStage: "Discovery",
    dealValue: "$95,000",
    lastInteraction: "1 week ago",
    tags: ["Mid-Market", "Fast Mover"],
    sentiment: "positive",
    memoryCount: 8,
  },
  {
    id: "emily-torres-notion",
    name: "Emily Torres",
    company: "Notion",
    role: "Chief Revenue Officer",
    avatar: "ET",
    avatarColor: "#F59E0B",
    dealStage: "Closed Won",
    dealValue: "$320,000",
    lastInteraction: "3 days ago",
    tags: ["Customer", "Expansion", "Reference"],
    sentiment: "positive",
    memoryCount: 41,
  },
  {
    id: "david-kim-openai",
    name: "David Kim",
    company: "OpenAI",
    role: "Enterprise Account Manager",
    avatar: "DK",
    avatarColor: "#EF4444",
    dealStage: "Qualification",
    dealValue: "$500,000",
    lastInteraction: "Today",
    tags: ["Strategic", "Long Cycle"],
    sentiment: "at-risk",
    memoryCount: 5,
  },
];

export const MOCK_MEMORIES: Record<string, MemoryEvent[]> = {
  "john-chen-amex": [
    { id: "m1", type: "observation", content: "John consistently raises data privacy concerns — flagged in 3 of 5 sessions", timestamp: "Auto-generated · May 15", confidence: 94, tags: ["pattern", "blocker"] },
    { id: "m2", type: "retain", content: "Deal value discussed: $250,000 annual. Competitor offer at $190k from rival vendor.", timestamp: "May 10", confidence: 100, tags: ["pricing", "competitor"] },
    { id: "m3", type: "recall", content: "Recalled pricing objection history before today's negotiation call", timestamp: "May 10", confidence: 87, tags: ["recall"] },
    { id: "m4", type: "retain", content: "John prefers async follow-ups via email. Extremely busy during Q2 planning.", timestamp: "April 5", confidence: 100, tags: ["preference"] },
    { id: "m5", type: "retain", content: "Security team lead Priya Nair raised API rate limit concerns during April demo.", timestamp: "March 28", confidence: 100, tags: ["technical", "blocker"] },
    { id: "m6", type: "reflect", content: "Pattern: pricing conversations stall when CFO not in room. Recommend looping in Rachel Wong early.", timestamp: "March 22", confidence: 82, tags: ["strategy"] },
  ],
  "sarah-malik-salesforce": [
    { id: "m1", type: "retain", content: "Sarah's team wants native API webhooks within 30 days of signing.", timestamp: "May 12", confidence: 100, tags: ["technical", "commitment"] },
    { id: "m2", type: "observation", content: "Strong buying signals — referenced internal Q3 budget twice this week.", timestamp: "May 11", confidence: 91, tags: ["signal", "positive"] },
    { id: "m3", type: "recall", content: "Pulled prior integration scope before architecture review.", timestamp: "May 09", confidence: 88, tags: ["recall"] },
  ],
  "raj-patel-stripe": [
    { id: "m1", type: "retain", content: "Raj wants a 14-day pilot with 3 internal teams before commit.", timestamp: "May 02", confidence: 100, tags: ["pilot"] },
    { id: "m2", type: "observation", content: "Decision velocity high — typically signs within 2 weeks of demo.", timestamp: "April 28", confidence: 86, tags: ["pattern"] },
  ],
  "emily-torres-notion": [
    { id: "m1", type: "retain", content: "Closed at $320k annual. Renewal at month 11. Push for 2-year on renewal.", timestamp: "May 10", confidence: 100, tags: ["closed", "renewal"] },
    { id: "m2", type: "reflect", content: "Emily is a power reference. Ask for intro to peers at Linear and Figma.", timestamp: "May 08", confidence: 92, tags: ["expansion"] },
  ],
  "david-kim-openai": [
    { id: "m1", type: "observation", content: "Engagement dropping — 3 unanswered emails in 10 days. At risk.", timestamp: "May 14", confidence: 89, tags: ["risk", "pattern"] },
    { id: "m2", type: "retain", content: "Internal champion left OpenAI in April. Need new sponsor.", timestamp: "May 01", confidence: 100, tags: ["blocker"] },
  ],
};

export const MOCK_MESSAGES: Record<string, Message[]> = {
  "john-chen-amex": [
    { id: "msg1", role: "agent", content: "I know **John Chen** from American Express. I have **23 memories** about him across 5 sessions. Ask me anything or click **Brief Me** for a pre-call summary.", timestamp: "Just now", memoriesUsed: 0 },
  ],
};

export const MOCK_ACTIVITY: ActivityEvent[] = [
  { id: "a1", type: "observation", customer: "John Chen", content: "Pattern detected: privacy concern recurrence", timestamp: "2m ago" },
  { id: "a2", type: "retain", customer: "Sarah Malik", content: "Call outcome logged from negotiation session", timestamp: "1h ago" },
  { id: "a3", type: "recall", customer: "Raj Patel", content: "Briefing generated for pilot review", timestamp: "3h ago" },
  { id: "a4", type: "reflect", customer: "Emily Torres", content: "Expansion opportunity surfaced", timestamp: "6h ago" },
  { id: "a5", type: "observation", customer: "David Kim", content: "At-risk pattern flagged — 3 missed replies", timestamp: "Yesterday" },
  { id: "a6", type: "retain", customer: "John Chen", content: "Competitor pricing data retained", timestamp: "Yesterday" },
];

export function getCustomer(id: string): Customer | undefined {
  return MOCK_CUSTOMERS.find((c) => c.id === id);
}

export function getMemories(id: string): MemoryEvent[] {
  return MOCK_MEMORIES[id] ?? [];
}

export function getMessages(id: string): Message[] {
  return MOCK_MESSAGES[id] ?? [
    {
      id: "seed",
      role: "agent",
      content: `I have memory of this customer. Ask anything or click **Brief Me** for a pre-call summary.`,
      timestamp: "Just now",
      memoriesUsed: 0,
    },
  ];
}
