// src/components/Header.tsx
import { Link, useRouter, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Bell, ChevronDown, LayoutGrid, Menu } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useShallow } from "zustand/react/shallow";

export function Header({ title, icon }: { title: string; icon?: ReactNode }) {
  const router = useRouter();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { user, logout } = useAuthStore(
    useShallow((state) => ({
      user: state.user,
      logout: state.logout,
    }))
  );

  const handleLogout = async () => {
    try {
      await logout();
      navigate({ to: "/auth" });
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <header className="bg-card rounded-3xl shadow-soft m-4 lg:ml-0 px-4 lg:px-6 py-3 flex items-center gap-3 sticky top-4 z-30">
      {/* Mobile logo */}
      <div className="lg:hidden flex items-center gap-2 mr-auto">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-[oklch(0.55_0.18_30)] flex items-center justify-center text-white font-bold">
          V
        </div>
        <span className="font-bold">VedaAI</span>
      </div>

      <button
        onClick={() => router.history.back()}
        className="hidden lg:flex w-9 h-9 rounded-full bg-secondary items-center justify-center btn-press hover:bg-secondary/70"
        aria-label="Back"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>
      <div className="hidden lg:flex items-center gap-2 text-sm font-medium">
        {icon ?? <LayoutGrid className="w-4 h-4" />}
        <span>{title}</span>
      </div>

      <div className="flex-1" />

      <button className="relative w-10 h-10 rounded-full hover:bg-secondary flex items-center justify-center btn-press">
        <Bell className="w-[18px] h-[18px]" />
        <span className="absolute top-2 right-2 w-2 h-2 bg-brand rounded-full" />
      </button>

      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-secondary btn-press"
        >
          {user?.profile?.avatarUrl ? (
            <img
              src={user.profile.avatarUrl}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[oklch(0.85_0.08_80)] to-[oklch(0.7_0.12_60)] flex items-center justify-center text-sm text-foreground/85 font-bold">
              {user?.name?.slice(0, 1).toUpperCase() || "👤"}
            </div>
          )}
          <span className="hidden sm:block text-sm font-medium">
            {user?.name || "Guest"}
          </span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-48 bg-popover rounded-2xl shadow-lift border border-border p-2 scale-in origin-top-right z-50">
            <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-secondary text-sm">Profile</button>
            <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-secondary text-sm">Account</button>
            <div className="my-1 border-t border-border" />
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-secondary text-sm text-destructive font-semibold"
            >
              Sign out
            </button>
          </div>
        )}
      </div>

      <button className="lg:hidden w-9 h-9 rounded-full hover:bg-secondary flex items-center justify-center">
        <Menu className="w-4 h-4" />
      </button>
    </header>
  );
}
