import { Bell, ChevronDown, Search } from "lucide-react";

export function Navbar() {
  return (
    <header className="h-14 shrink-0 border-b border-border bg-background/80 backdrop-blur-md flex items-center px-5 gap-4 sticky top-0 z-20">
      <div className="relative flex-1 max-w-lg">
        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          placeholder="Search customers or memories..."
          className="w-full h-9 pl-9 pr-16 rounded-lg bg-surface border border-border text-sm text-foreground placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition"
        />
        <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-text-muted border border-border rounded px-1.5 py-0.5 bg-background">
          ⌘K
        </kbd>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <button className="size-9 rounded-lg border border-border bg-surface hover:bg-surface-2 flex items-center justify-center text-text-secondary hover:text-foreground transition relative">
          <Bell className="size-4" />
          <span className="absolute top-2 right-2 size-1.5 rounded-full bg-primary" />
        </button>
        <button className="h-9 px-3 rounded-lg border border-border bg-surface hover:bg-surface-2 flex items-center gap-2 text-sm text-text-secondary hover:text-foreground transition">
          Acme Inc
          <ChevronDown className="size-3" />
        </button>
        <div className="size-9 rounded-full bg-gradient-to-br from-primary to-violet flex items-center justify-center text-xs font-bold">
          YO
        </div>
      </div>
    </header>
  );
}
