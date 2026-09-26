import React from "react";
import { AlertTriangle, Database, ShieldAlert, Users } from "@/components/icons";

export interface KpiStats {
  total: number;
  urgency: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    none: number;
  };
  geospatial?: {
    totalGeolocated: number;
    geolocatedPercentage: number;
  };
  kpis: {
    criticalRescues: number;
    infrastructureAlerts: number;
    volunteerSignals: number;
    evacuationAlerts: number;
  };
}

interface KpiRowProps {
  stats: KpiStats | null;
  loading: boolean;
  activeCategory?: string;
  onSelectCategory: (category: string) => void;
  onReset: () => void;
}

export function KpiRow({ stats, loading, activeCategory, onSelectCategory, onReset }: KpiRowProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Critical Rescues */}
      <button
        type="button"
        onClick={() => onSelectCategory("RESCUE")}
        className={`rounded-xl border bg-card/80 p-5 text-left transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-950/30 active:translate-y-0 active:scale-[0.98] ${
          activeCategory === "RESCUE" ? "border-red-500/80" : "border-transparent hover:border-red-900/60"
        }`}
      >
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-red-400/90">
          <span className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            Critical Rescues
          </span>
          <AlertTriangle className="h-4 w-4 text-red-400" />
        </div>

        <div className="mt-3">
          <span className="text-3xl font-extrabold text-red-400 sm:text-4xl">
            {loading ? (
              <span className="inline-block h-8 w-12 animate-pulse rounded bg-red-950/60" />
            ) : (
              (stats?.kpis.criticalRescues ?? stats?.urgency.critical ?? 0).toLocaleString()
            )}
          </span>
        </div>
      </button>

      {/* 2. Infrastructure Alerts */}
      <button
        type="button"
        onClick={() => onSelectCategory("INFRASTRUCTURE")}
        className={`rounded-xl border bg-card/80 p-5 text-left transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-950/30 active:translate-y-0 active:scale-[0.98] ${
          activeCategory === "INFRASTRUCTURE" ? "border-amber-500/80" : "border-transparent hover:border-amber-900/60"
        }`}
      >
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-amber-400/90">
          <span>Infrastructure Alerts</span>
          <ShieldAlert className="h-4 w-4 text-amber-400" />
        </div>

        <div className="mt-3">
          <span className="text-3xl font-extrabold text-amber-400 sm:text-4xl">
            {loading ? (
              <span className="inline-block h-8 w-12 animate-pulse rounded bg-amber-950/60" />
            ) : (
              (stats?.kpis.infrastructureAlerts ?? 0).toLocaleString()
            )}
          </span>
        </div>
      </button>

      {/* 3. Volunteer Mobilization */}
      <button
        type="button"
        onClick={() => onSelectCategory("VOLUNTEER")}
        className={`rounded-xl border bg-card/80 p-5 text-left transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-950/30 active:translate-y-0 active:scale-[0.98] ${
          activeCategory === "VOLUNTEER" ? "border-emerald-500/80" : "border-transparent hover:border-emerald-900/60"
        }`}
      >
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-emerald-400/90">
          <span>Volunteer Signals</span>
          <Users className="h-4 w-4 text-emerald-400" />
        </div>

        <div className="mt-3">
          <span className="text-3xl font-extrabold text-emerald-400 sm:text-4xl">
            {loading ? (
              <span className="inline-block h-8 w-12 animate-pulse rounded bg-emerald-950/60" />
            ) : (
              (stats?.kpis.volunteerSignals ?? 0).toLocaleString()
            )}
          </span>
        </div>
      </button>

      {/* 4. Total Stream */}
      <button
        type="button"
        onClick={onReset}
        className={`rounded-xl border bg-card/80 p-5 text-left transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 active:translate-y-0 active:scale-[0.98] ${
          !activeCategory ? "border-primary/60" : "border-transparent hover:border-border"
        }`}
      >
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Total Crisis Stream</span>
          <Database className="h-4 w-4 text-primary" />
        </div>

        <div className="mt-3">
          <span className="text-3xl font-extrabold text-foreground sm:text-4xl">
            {loading ? (
              <span className="inline-block h-8 w-16 animate-pulse rounded bg-slate-800" />
            ) : (
              (stats?.total ?? 0).toLocaleString()
            )}
          </span>
        </div>
      </button>
    </div>
  );
}
