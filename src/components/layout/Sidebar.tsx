import { Link, useRouterState } from "@tanstack/react-router";
import { Brain, LayoutDashboard, Users, MessageSquare, BarChart3, Settings, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; match?: string };
const NAV: NavItem[] = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/", label: "Customers", icon: Users, match: "customers" },
  { to: "/", label: "Conversations", icon: MessageSquare, match: "conversations" },
  { to: "/", label: "Memories", icon: Brain, match: "memories" },
  { to: "/insights", label: "Insights", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="w-[240px] shrink-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="h-14 flex items-center gap-2 px-5 border-b border-sidebar-border">
        <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-violet flex items-center justify-center glow-blue">
          <Brain className="size-4 text-white" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-bold tracking-tight">MemoryDesk</span>
          <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider">v0.1 · alpha</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map((item, i) => {
          const active = item.to === "/" && !item.match ? pathname === "/" : false;
          return (
            <Link
              key={i}
              to={item.to}
              className="group relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-foreground hover:bg-sidebar-accent transition-colors"
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r bg-primary"
                />
              )}
              <item.icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3 space-y-1">
        <Link
          to="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-foreground hover:bg-sidebar-accent transition-colors"
        >
          <Settings className="size-4" />
          <span>Settings</span>
        </Link>
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
          <div className="size-8 rounded-full bg-gradient-to-br from-primary to-violet flex items-center justify-center text-xs font-bold">
            YO
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium">You</span>
            <span className="text-[10px] text-text-muted flex items-center gap-1">
              <Sparkles className="size-2.5" /> Pro plan
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
