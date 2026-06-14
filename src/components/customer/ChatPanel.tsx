import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Brain, Paperclip, Save, Search, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Customer, Message } from "@/types";
import { api } from "@/services/api";

interface Props {
  customer: Customer;
  initialMessages: Message[];
  onBrief: () => void;
  onReflect: () => void;
}

export function ChatPanel({ customer, initialMessages, onBrief, onReflect }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  async function send() {
    const text = input.trim();
    if (!text || thinking) return;
    const userMsg: Message = {
      id: `u_${Date.now()}`,
      role: "user",
      content: text,
      timestamp: nowLabel(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setThinking(true);

    const res = await api.chat({
      customer_id: customer.id,
      customer_name: customer.name,
      message: text,
    });

    setThinking(false);
    setMessages((m) => [
      ...m,
      {
        id: `a_${Date.now()}`,
        role: "agent",
        content: res.response,
        timestamp: nowLabel(),
        memoriesUsed: res.memories_used ?? 0,
      },
    ]);
  }

  return (
    <div className="flex flex-col h-full rounded-xl border border-border bg-surface min-h-0">
      <div className="h-14 shrink-0 border-b border-border px-4 flex items-center gap-3">
        <Link to="/" className="text-xs text-text-secondary hover:text-foreground">← Back</Link>
        <div className="h-4 w-px bg-border" />
        <div className="text-sm font-medium">{customer.name}</div>
        <div className="text-xs text-text-muted">· {customer.company}</div>
        <div className="ml-auto flex items-center gap-2">
          <ToolButton icon={Sparkles} label="Brief Me" onClick={onBrief} variant="primary" />
          <ToolButton icon={Search} label="Reflect" onClick={onReflect} />
          <ToolButton icon={Save} label="Log" onClick={() => {}} />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <MessageBubble key={m.id} msg={m} customer={customer} />
          ))}
        </AnimatePresence>
        {thinking && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3"
          >
            <Avatar className="bg-gradient-to-br from-primary to-violet">
              <Brain className="size-3.5 text-white" />
            </Avatar>
            <div className="bg-surface-2 border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
              <Dot delay={0} /><Dot delay={0.15} /><Dot delay={0.3} />
            </div>
          </motion.div>
        )}
        <div ref={endRef} />
      </div>

      <div className="shrink-0 border-t border-border p-4">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={`Ask about ${customer.name}...`}
            rows={1}
            className="w-full resize-none rounded-xl bg-background border border-border pl-4 pr-14 py-3 text-sm placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition min-h-[48px] max-h-32"
          />
          <button
            onClick={send}
            disabled={!input.trim() || thinking}
            className="absolute right-2 bottom-2 size-9 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed text-primary-foreground flex items-center justify-center transition"
          >
            <ArrowUp className="size-4" />
          </button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <FootChip icon={Save} label="Log Outcome" />
          <FootChip icon={Paperclip} label="Attach" />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg, customer }: { msg: Message; customer: Customer }) {
  const isAgent = msg.role === "agent";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isAgent ? "" : "flex-row-reverse"}`}
    >
      <Avatar
        className={isAgent ? "bg-gradient-to-br from-primary to-violet" : ""}
        style={isAgent ? undefined : { backgroundColor: customer.avatarColor }}
      >
        {isAgent ? <Brain className="size-3.5 text-white" /> : <span className="text-[10px] font-bold text-white">YO</span>}
      </Avatar>
      <div className={`max-w-[75%] ${isAgent ? "" : "items-end flex flex-col"}`}>
        <div className={`flex items-center gap-2 text-[10px] text-text-muted mb-1 ${isAgent ? "" : "flex-row-reverse"}`}>
          <span className="font-medium text-text-secondary">{isAgent ? "MemoryDesk" : "You"}</span>
          <span>·</span>
          <span className="font-mono">{msg.timestamp}</span>
        </div>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isAgent
              ? "bg-surface-2 border border-border rounded-tl-sm text-foreground"
              : "bg-primary text-primary-foreground rounded-tr-sm"
          }`}
          dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }}
        />
        {isAgent && msg.memoriesUsed ? (
          <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-1 rounded-full bg-violet/10 border border-violet/30 text-violet">
            <Brain className="size-3" /> {msg.memoriesUsed} memories recalled
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

function formatMarkdown(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground">$1</strong>');
}

function Avatar({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${className}`} style={style}>
      {children}
    </div>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="typing-dot size-1.5 rounded-full bg-text-secondary"
      style={{ animationDelay: `${delay}s` }}
    />
  );
}

function ToolButton({ icon: Icon, label, onClick, variant }: { icon: typeof Brain; label: string; onClick: () => void; variant?: "primary" }) {
  const base = "h-8 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 transition";
  const v =
    variant === "primary"
      ? "bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25"
      : "border border-border text-text-secondary hover:text-foreground hover:bg-surface-2";
  return (
    <button onClick={onClick} className={`${base} ${v}`}>
      <Icon className="size-3.5" /> {label}
    </button>
  );
}

function FootChip({ icon: Icon, label }: { icon: typeof Brain; label: string }) {
  return (
    <button className="h-7 px-2.5 rounded-md text-[11px] text-text-secondary hover:text-foreground hover:bg-surface-2 border border-border flex items-center gap-1.5 transition">
      <Icon className="size-3" /> {label}
    </button>
  );
}

function nowLabel() {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
