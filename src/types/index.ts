export type DealStage =
  | "Qualification"
  | "Discovery"
  | "Proposal"
  | "Negotiation"
  | "Closed Won"
  | "Closed Lost";

export interface Customer {
  id: string;
  name: string;
  company: string;
  role: string;
  avatar: string;
  avatarColor: string;
  dealStage: DealStage;
  dealValue: string;
  lastInteraction: string;
  tags: string[];
  sentiment: "positive" | "neutral" | "at-risk";
  memoryCount: number;
}

export interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: string;
  memoriesUsed?: number;
}

export type MemoryType = "retain" | "recall" | "reflect" | "observation";

export interface MemoryEvent {
  id: string;
  type: MemoryType;
  content: string;
  timestamp: string;
  confidence: number;
  tags: string[];
}

export interface ActivityEvent {
  id: string;
  type: MemoryType;
  customer: string;
  content: string;
  timestamp: string;
}
