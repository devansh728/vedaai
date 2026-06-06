import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutGrid, FileText, BookOpen, Sparkles, Plus } from "lucide-react";

const items = [
  { to: "/", icon: LayoutGrid, label: "Home" },
  { to: "/assignments", icon: FileText, label: "Assignments" },
  { to: "/library", icon: BookOpen, label: "Library" },
  { to: "/toolkit", icon: Sparkles, label: "AI Toolkit" },
];

export function MobileBottomNav() {
  const { location } = useRouterState();
  const path = location.pathname;

  return (
    <>
      <Link
        to="/create"
        className="lg:hidden fixed bottom-20 right-5 z-40 w-12 h-12 rounded-full bg-brand text-brand-foreground flex items-center justify-center shadow-lift btn-press"
        aria-label="Create"
      >
        <Plus className="w-5 h-5" />
      </Link>
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-primary text-primary-foreground rounded-t-3xl px-2 py-3 flex items-center justify-around shadow-lift">
        {items.map((it) => {
          const active = it.to === path || (it.to !== "/" && path.startsWith(it.to));
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to as string}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[11px] transition ${
                active ? "text-white" : "text-white/50"
              }`}
            >
              <Icon className="w-5 h-5" />
              {it.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
