// src/components/Sidebar.tsx
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutGrid,
  Users,
  FileText,
  BookOpen,
  PieChart,
  Settings,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const nav = [
  { to: "/assignments", icon: FileText, label: "Assignments", match: "assignments" },
  { to: "/groups", icon: Users, label: "My Groups", match: "groups" },
];

export function Sidebar() {
  const { location } = useRouterState();
  const path = location.pathname;
  const user = useAuthStore((state) => state.user);

  return (
    <aside className="hidden lg:flex w-[280px] shrink-0 flex-col bg-card rounded-3xl shadow-soft p-5 m-4 sticky top-4 h-[calc(100vh-2rem)]">
      <div className="flex items-center gap-2 px-2 py-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-[oklch(0.55_0.18_30)] flex items-center justify-center text-white font-bold text-lg shadow-card">
          V
        </div>
        <span className="text-xl font-bold tracking-tight">VedaAI</span>
      </div>

      <Link
        to="/create"
        className="btn-press mt-5 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-full py-3 px-5 font-medium ring-2 ring-brand/40 hover:ring-brand/70 shadow-card"
      >
        <Sparkles className="w-4 h-4" />
        Create Assignment
      </Link>

      <nav className="mt-8 flex flex-col gap-1">
        {nav.map((item) => {
          const active =
            (item.to === "/" && path === "/") ||
            (item.to !== "/" && path.startsWith(item.to)) ||
            (item.match === "assignments" && path.startsWith("/assignments"));
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to as string}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              }`}
            >
              <Icon className="w-[18px] h-[18px]" />
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3">
        <div className="flex items-center gap-3 p-3 rounded-2xl border border-border">
          {user?.profile?.avatarUrl ? (
            <img
              src={user.profile.avatarUrl}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[oklch(0.85_0.08_80)] to-[oklch(0.7_0.12_60)] flex items-center justify-center text-base">
              👨‍🏫
            </div>
          )}
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">
              {user?.institution?.name || "No School Added"}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {user?.institution?.location || "Onboarding Pending"}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
