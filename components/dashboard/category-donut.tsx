"use client";

import { useMemo, useState } from "react";
import { Label, Pie, PieChart, Sector } from "recharts";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";
import { Activity } from "@/components/icons";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";

export interface CategoryMetric {
  category: string;
  count: number;
  percentage: number;
}

interface CategoryDonutProps {
  categories: CategoryMetric[];
  total: number;
  loading: boolean;
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  RESCUE: { label: "Rescue", color: "#ef4444" },
  EVACUATION: { label: "Evacuation", color: "#f97316" },
  INFRASTRUCTURE: { label: "Infrastructure", color: "#f59e0b" },
  VOLUNTEER: { label: "Volunteer (#yychelps)", color: "#10b981" },
  AID: { label: "Aid & Donations", color: "#06b6d4" },
  ADVISORY: { label: "Advisory & News", color: "#f7f3ec" },
  NOISE: { label: "Filtered Noise", color: "#475569" },
};

const CHART_CONFIG = {
  count: { label: "Signals" },
  ...CATEGORY_CONFIG,
} satisfies ChartConfig;

const PRIORITY_ORDER = ["RESCUE", "EVACUATION", "INFRASTRUCTURE", "VOLUNTEER", "AID", "ADVISORY", "NOISE"];

export function CategoryDonut({ categories, total, loading }: CategoryDonutProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const chartData = useMemo(
    () =>
      [...categories]
        .filter((c) => c.count > 0 && CATEGORY_CONFIG[c.category])
        .sort((a, b) => {
          const idxA = PRIORITY_ORDER.indexOf(a.category);
          const idxB = PRIORITY_ORDER.indexOf(b.category);
          return (idxA !== -1 ? idxA : 99) - (idxB !== -1 ? idxB : 99);
        })
        .map((c) => ({
          category: c.category,
          count: c.count,
          percentage: c.percentage,
          fill: `var(--color-${c.category})`,
        })),
    [categories]
  );

  const active = activeIndex !== undefined ? chartData[activeIndex] : undefined;

  return (
    <div
      className="rounded-xl border border-transparent bg-card p-4 transition-colors hover:border-border/80"
      onMouseLeave={() => setActiveIndex(undefined)}
    >
      <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
        <Activity className="h-4 w-4 text-primary" />
        Signal Triage Meter
      </h3>

      {loading ? (
        <div className="mt-4 flex justify-center">
          <div className="h-40 w-40 animate-pulse rounded-full bg-slate-800/60" />
        </div>
      ) : (
        <>
          <ChartContainer config={CHART_CONFIG} className="mx-auto mt-2 aspect-square w-full max-w-[220px]">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="category"
                innerRadius={58}
                outerRadius={80}
                strokeWidth={3}
                activeIndex={activeIndex}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
                  <g>
                    <Sector {...props} outerRadius={outerRadius + 6} />
                    <Sector {...props} outerRadius={outerRadius + 14} innerRadius={outerRadius + 8} />
                  </g>
                )}
              >
                <Label
                  content={({ viewBox }) => {
                    if (!viewBox || !("cx" in viewBox) || viewBox.cx == null || viewBox.cy == null) return null;
                    const conf = active ? CATEGORY_CONFIG[active.category] : undefined;
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy - 4} className="fill-foreground text-xl font-bold">
                          {active ? active.count.toLocaleString() : total.toLocaleString()}
                        </tspan>
                        <tspan x={viewBox.cx} y={viewBox.cy + 16} className="fill-muted-foreground text-[10px] uppercase tracking-wider">
                          {active ? conf?.label : "Signals"}
                        </tspan>
                      </text>
                    );
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>

          <div className="mt-4 space-y-1.5">
            {chartData.map((c, index) => {
              const conf = CATEGORY_CONFIG[c.category];
              return (
                <div
                  key={c.category}
                  className="flex items-center justify-between gap-2 text-xs cursor-default rounded-md px-1 -mx-1 transition-colors data-[active=true]:bg-secondary/50"
                  data-active={activeIndex === index}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: conf.color }} />
                    <span className="truncate text-foreground">{conf.label}</span>
                  </span>
                  <span className="shrink-0 font-mono text-muted-foreground">
                    {c.count.toLocaleString()} · {c.percentage.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
