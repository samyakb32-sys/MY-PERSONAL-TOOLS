"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessagesSquare,
  Bot,
  Wrench,
  FolderGit2,
  Settings,
  LogOut,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

const navItems = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/social", label: "Social", icon: MessagesSquare },
  { href: "/ai-hub", label: "AI Hub", icon: Bot },
  { href: "/dev-tools", label: "Dev Tools", icon: Wrench },
  { href: "/creations", label: "My Creations", icon: FolderGit2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, configured, signOut } = useAuth();

  return (
    <aside className="hidden w-56 shrink-0 border-r bg-sidebar text-sidebar-foreground md:flex md:flex-col">
      <div className="flex flex-col justify-center gap-0.5 border-b px-4 py-3">
        <span className="text-lg font-bold tracking-wide">ARIXIA</span>
        <span
          className="text-sm text-sidebar-foreground/70"
          style={{ fontFamily: "'Brush Script MT', 'Brush Script Std', cursive" }}
        >
          All in one space
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-2">
        {navItems.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      {configured && user && (
        <div className="flex items-center justify-between gap-2 border-t p-3">
          <span className="truncate text-xs text-sidebar-foreground/70">{user.email}</span>
          <button
            type="button"
            onClick={() => signOut()}
            aria-label="Sign out"
            className="rounded-md p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      )}
    </aside>
  );
}
