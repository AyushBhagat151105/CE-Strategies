import React from "react";
import { MapPin, Navigation } from "lucide-react";

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
  selectedLocation?: string;
  onSelectLocation?: (location: string | undefined) => void;
}

export function ImpactedZones({
  locations,
  loading,
  selectedLocation,
  onSelectLocation,
}: ImpactedZonesProps) {
  return (
    <div className="rounded-xl border border-border/80 bg-card p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/60">
        <div>
          <h3 className="font-semibold text-white flex items-center gap-2 text-sm sm:text-base">
            <MapPin className="h-4 w-4 text-emerald-400" />
            Top Impacted Calgary Flood Zones
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Geospatially resolved hot spots from Bow & Elbow river flood basins
          </p>
        </div>

        {selectedLocation && (
          <button
            type="button"
            onClick={() => onSelectLocation?.(undefined)}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium self-start sm:self-auto"
          >
            Clear location filter ({selectedLocation})
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-8 w-28 animate-pulse rounded-lg bg-slate-800/80 border border-slate-700/40"
            />
          ))
        ) : locations.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">No location signals recorded yet.</p>
        ) : (
          locations.map((loc) => {
            const isSelected = selectedLocation?.toLowerCase() === loc.name.toLowerCase();
            return (
              <button
                key={loc.name}
                type="button"
                onClick={() =>
                  onSelectLocation?.(isSelected ? undefined : loc.name)
                }
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-950/60 text-emerald-300 ring-1 ring-emerald-500"
                    : "border-border/70 bg-secondary/40 text-foreground hover:border-emerald-700/60 hover:bg-secondary/80"
                }`}
              >
                <MapPin className={`h-3.5 w-3.5 ${isSelected ? "text-emerald-400" : "text-muted-foreground"}`} />
                <span className="font-semibold">{loc.name}</span>
                <span className="rounded bg-black/40 px-1.5 py-0.5 text-[10px] font-mono text-emerald-400">
                  {loc.count}
                </span>
                {loc.coordinates && (
                  <span className="hidden md:inline-block text-[10px] text-muted-foreground font-mono">
                    ({loc.coordinates.latitude.toFixed(2)}, {loc.coordinates.longitude.toFixed(2)})
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
