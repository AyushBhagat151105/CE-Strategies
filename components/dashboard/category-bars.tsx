import React from "react";
import { Activity, Flame, ShieldAlert, Users, HeartHandshake, Megaphone, Radio, BellOff } from "lucide-react";

export interface CategoryMetric {
  category: string;
  count: number;
  percentage: number;
}

interface CategoryBarsProps {
  categories: CategoryMetric[];
  total: number;
  loading: boolean;
  selectedCategory?: string;
  onSelectCategory?: (category: string | undefined) => void;
}

const CATEGORY_CONFIG: Record<
  string,
  { label: string; color: string; barBg: string; textClass: string; icon: React.ComponentType<{ className?: string }> }
> = {
  RESCUE: {
    label: "Rescue",
    color: "bg-red-500",
    barBg: "bg-red-500 hover:bg-red-400",
    textClass: "text-red-400",
    icon: Flame,
  },
  EVACUATION: {
    label: "Evacuation",
    color: "bg-orange-500",
    barBg: "bg-orange-500 hover:bg-orange-400",
    textClass: "text-orange-400",
    icon: ShieldAlert,
  },
  INFRASTRUCTURE: {
    label: "Infrastructure",
    color: "bg-amber-500",
    barBg: "bg-amber-500 hover:bg-amber-400",
    textClass: "text-amber-400",
    icon: ShieldAlert,
  },
  VOLUNTEER: {
    label: "Volunteer (#yychelps)",
    color: "bg-emerald-500",
    barBg: "bg-emerald-500 hover:bg-emerald-400",
    textClass: "text-emerald-400",
    icon: Users,
  },
  AID: {
    label: "Aid & Donations",
    color: "bg-cyan-500",
    barBg: "bg-cyan-500 hover:bg-cyan-400",
    textClass: "text-cyan-400",
    icon: HeartHandshake,
  },
  ADVISORY: {
    label: "Advisory & News",
    color: "bg-blue-500",
    barBg: "bg-blue-500 hover:bg-blue-400",
    textClass: "text-blue-400",
    icon: Megaphone,
  },
  NOISE: {
    label: "Filtered Noise",
    color: "bg-slate-600",
    barBg: "bg-slate-600 hover:bg-slate-500",
    textClass: "text-slate-400",
    icon: BellOff,
  },
};

export function CategoryBars({
  categories,
  total,
  loading,
  selectedCategory,
  onSelectCategory,
}: CategoryBarsProps) {
  // Sort with highest priority / emergency first
  const priorityOrder = ["RESCUE", "EVACUATION", "INFRASTRUCTURE", "VOLUNTEER", "AID", "ADVISORY", "NOISE"];
  const sortedCategories = [...categories].sort((a, b) => {
    const idxA = priorityOrder.indexOf(a.category);
    const idxB = priorityOrder.indexOf(b.category);
    return (idxA !== -1 ? idxA : 99) - (idxB !== -1 ? idxB : 99);
  });

  return (
    <div className="rounded-xl border border-border/80 bg-card p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border/60">
        <div>
          <h3 className="font-semibold text-white flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-primary" />
            Crisis Signal Triage Meter
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Calibrated NLP distribution across 8,026 crisis signals
          </p>
        </div>

        {selectedCategory && (
          <button
            type="button"
            onClick={() => onSelectCategory?.(undefined)}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium self-start sm:self-auto"
          >
            Clear category filter ({selectedCategory})
          </button>
        )}
      </div>

      {/* Proportional Stacked Meter */}
      <div className="mt-4">
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800/80 flex shadow-inner">
          {loading ? (
            <div className="h-full w-full animate-pulse bg-slate-800" />
          ) : (
            sortedCategories.map((c) => {
              const conf = CATEGORY_CONFIG[c.category] || {
                color: "bg-slate-500",
                barBg: "bg-slate-500",
              };
              const widthPct = Math.max(c.percentage, c.count > 0 ? 0.6 : 0);
              return (
                <div
                  key={c.category}
                  title={`${conf.label || c.category}: ${c.count.toLocaleString()} (${c.percentage}%)`}
                  style={{ width: `${widthPct}%` }}
                  className={`h-full transition-all duration-300 cursor-pointer ${conf.barBg} ${
                    selectedCategory === c.category ? "ring-2 ring-white z-10" : ""
                  }`}
                  onClick={() =>
                    onSelectCategory?.(selectedCategory === c.category ? undefined : c.category)
                  }
                />
              );
            })
          )}
        </div>
      </div>

      {/* Grid of category chips */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
        {sortedCategories.map((c) => {
          const conf = CATEGORY_CONFIG[c.category] || {
            label: c.category,
            color: "bg-slate-500",
            barBg: "bg-slate-500",
            textClass: "text-slate-300",
            icon: Radio,
          };
          const Icon = conf.icon;
          const isSelected = selectedCategory === c.category;

          return (
            <button
              key={c.category}
              type="button"
              onClick={() => onSelectCategory?.(isSelected ? undefined : c.category)}
              className={`flex flex-col justify-between rounded-lg border p-2.5 text-left transition-all ${
                isSelected
                  ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary"
                  : "border-border/60 bg-secondary/30 hover:border-border hover:bg-secondary/60"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="flex items-center gap-1.5 text-xs font-medium text-foreground truncate">
                  <span className={`h-2 w-2 rounded-full ${conf.color}`} />
                  <span className="truncate">{conf.label}</span>
                </span>
                <Icon className={`h-3 w-3 shrink-0 ${conf.textClass}`} />
              </div>

              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-lg font-bold text-white">
                  {loading ? "--" : c.count.toLocaleString()}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {c.percentage.toFixed(1)}%
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
