"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Flame,
  Radio,
  ShieldAlert,
  MapPin,
  Globe,
  ChevronLeft,
  ChevronRight,
} from "@/components/icons";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: Radio, iconClass: "text-cream" },
  { href: "/triage", label: "Triage Queue", icon: ShieldAlert, iconClass: "text-amber-400" },
  { href: "/map", label: "Flood Map", icon: MapPin, iconClass: "text-emerald-400" },
  { href: "/world-map", label: "World Flood Map", icon: Globe, iconClass: "text-cyan-400" },
];

const COLLAPSE_STORAGE_KEY = "ce-strategies-sidebar-collapsed";

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(COLLAPSE_STORAGE_KEY);
    if (stored) setCollapsed(stored === "true");
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(COLLAPSE_STORAGE_KEY, String(next));
      return next;
    });
  };

  return (
    <aside
      className={`sticky top-0 relative flex h-screen shrink-0 flex-col border-r border-border/40 bg-card/60 backdrop-blur transition-all duration-200 ${
        collapsed ? "w-[72px]" : "w-60"
      }`}
    >
      <button
        type="button"
        onClick={toggleCollapsed}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3 bottom-20 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-md hover:bg-secondary hover:text-foreground transition-colors"
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>
      {/* Brand */}
      <div className={`flex items-center gap-3 px-4 py-5 ${collapsed ? "justify-center px-0" : ""}`}>
        <div className="h-9 w-9 shrink-0 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
          <Flame className="h-5 w-5" />
        </div>
        {!collapsed && (
          <span className="text-xs font-mono uppercase bg-red-950/80 text-red-400 px-1.5 py-0.5 rounded border border-red-800 inline-block">
            Crisis Ops
          </span>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                collapsed ? "justify-center px-0" : ""
              } ${
                isActive
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${item.iconClass}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Status */}
      <div className="border-t border-border/40 p-3">
        <div
          className={`flex items-center gap-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 text-xs font-mono px-2.5 py-1 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400 animate-pulse" />
          {!collapsed && <span>System Live</span>}
        </div>
      </div>
    </aside>
  );
}
