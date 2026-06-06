import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileBottomNav } from "./MobileBottomNav";

export function AppShell({
  children,
  title,
  icon,
}: {
  children: ReactNode;
  title: string;
  icon?: ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pb-24 lg:pb-4">
        <Header title={title} icon={icon} />
        <main className="flex-1 px-4 lg:pl-0 lg:pr-4">{children}</main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
