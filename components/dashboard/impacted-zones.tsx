import React from "react";
import { MapPin } from "@/components/icons";

export interface LocationMetric {
  name: string;
  count: number;
  percentage?: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface ImpactedZonesProps {
  locations: LocationMetric[];
  loading: boolean;
  activeLocation?: string;
  onSelectLocation: (name: string) => void;
}

export function ImpactedZones({ locations, loading, activeLocation, onSelectLocation }: ImpactedZonesProps) {
  const maxCount = Math.max(1, ...locations.map((l) => l.count));

  return (
    <div className="rounded-xl border border-transparent bg-card p-4 transition-colors hover:border-border/80">
      <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
        <MapPin className="h-4 w-4 text-emerald-400" />
        Most Impacted Zones
      </h3>

      <div className="mt-3 space-y-2">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-6 w-full animate-pulse rounded bg-slate-800/60" />
          ))
        ) : locations.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">No location signals recorded yet.</p>
        ) : (
          locations.map((loc) => {
            const isActive = activeLocation === loc.name;
            return (
              <button
                key={loc.name}
                type="button"
                onClick={() => onSelectLocation(loc.name)}
                className={`relative block w-full overflow-hidden rounded-md bg-secondary/30 text-left transition-colors ${
                  isActive ? "ring-1 ring-emerald-500" : "hover:bg-secondary/50"
                }`}
              >
                <div
                  className="absolute inset-y-0 left-0 bg-emerald-900/40"
                  style={{ width: `${Math.max(6, (loc.count / maxCount) * 100)}%` }}
                />
                <div className="relative flex items-center justify-between px-2.5 py-1.5 text-xs">
                  <span className="font-medium text-foreground truncate">{loc.name}</span>
                  <span className="shrink-0 font-mono text-emerald-400">{loc.count}</span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
