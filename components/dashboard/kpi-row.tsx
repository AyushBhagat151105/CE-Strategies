import React from "react";
import { AlertTriangle, Database, ShieldAlert, Users, ArrowUpRight } from "lucide-react";

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
  onSelectFilter?: (filter: { category?: string; urgency?: string }) => void;
  activeCategory?: string;
  activeUrgency?: string;
}

export function KpiRow({
  stats,
  loading,
  onSelectFilter,
  activeCategory,
  activeUrgency,
}: KpiRowProps) {
  const isRescueActive = activeCategory === "RESCUE" || activeUrgency === "CRITICAL";
  const isInfraActive = activeCategory === "INFRASTRUCTURE";
  const isVolunteerActive = activeCategory === "VOLUNTEER";
  const isTotalActive = !activeCategory && !activeUrgency;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Critical Rescues */}
      <button
        type="button"
        onClick={() => onSelectFilter?.({ category: "RESCUE", urgency: "CRITICAL" })}
        className={`group relative rounded-xl border text-left p-5 transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 ${
          isRescueActive
            ? "border-red-500 bg-red-950/40 shadow-red-950/20 shadow-md ring-1 ring-red-500/50"
            : "border-red-900/40 bg-card/80 hover:border-red-700/60 hover:bg-card"
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
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100 text-red-400" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-red-400 sm:text-4xl">
            {loading ? (
              <span className="inline-block h-8 w-12 animate-pulse rounded bg-red-950/60" />
            ) : (
              (stats?.kpis.criticalRescues ?? stats?.urgency.critical ?? 0).toLocaleString()
            )}
          </span>
          <span className="text-xs font-medium text-red-300/70">P1 Urgent</span>
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          Life-safety, trapped persons & boat requests
        </p>
      </button>

      {/* 2. Infrastructure Alerts */}
      <button
        type="button"
        onClick={() => onSelectFilter?.({ category: "INFRASTRUCTURE", urgency: "HIGH" })}
        className={`group relative rounded-xl border text-left p-5 transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
          isInfraActive
            ? "border-amber-500 bg-amber-950/40 shadow-amber-950/20 shadow-md ring-1 ring-amber-500/50"
            : "border-amber-900/40 bg-card/80 hover:border-amber-700/60 hover:bg-card"
        }`}
      >
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-amber-400/90">
          <span>Infrastructure Alerts</span>
          <div className="flex items-center gap-1">
            <ShieldAlert className="h-4 w-4 text-amber-400" />
            <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100 text-amber-400" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-amber-400 sm:text-4xl">
            {loading ? (
              <span className="inline-block h-8 w-12 animate-pulse rounded bg-amber-950/60" />
            ) : (
              (stats?.kpis.infrastructureAlerts ?? 0).toLocaleString()
            )}
          </span>
          <span className="text-xs font-medium text-amber-300/70">Grid & Transit</span>
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          Power outages, ENMAX grid, bridges & road closures
        </p>
      </button>

      {/* 3. Volunteer Mobilization */}
      <button
        type="button"
        onClick={() => onSelectFilter?.({ category: "VOLUNTEER" })}
        className={`group relative rounded-xl border text-left p-5 transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
          isVolunteerActive
            ? "border-emerald-500 bg-emerald-950/40 shadow-emerald-950/20 shadow-md ring-1 ring-emerald-500/50"
            : "border-emerald-900/40 bg-card/80 hover:border-emerald-700/60 hover:bg-card"
        }`}
      >
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-emerald-400/90">
          <span>Volunteer Signals</span>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-emerald-400" />
            <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100 text-emerald-400" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-emerald-400 sm:text-4xl">
            {loading ? (
              <span className="inline-block h-8 w-12 animate-pulse rounded bg-emerald-950/60" />
            ) : (
              (stats?.kpis.volunteerSignals ?? 0).toLocaleString()
            )}
          </span>
          <span className="text-xs font-medium text-emerald-300/70">#yychelps</span>
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          Cleanup crews, mudding out, shovels & sump pumps
        </p>
      </button>

      {/* 4. Total Stream */}
      <button
        type="button"
        onClick={() => onSelectFilter?.({})}
        className={`group relative rounded-xl border text-left p-5 transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
          isTotalActive
            ? "border-blue-500 bg-blue-950/30 shadow-blue-950/20 shadow-md ring-1 ring-blue-500/50"
            : "border-border bg-card/80 hover:border-blue-700/60 hover:bg-card"
        }`}
      >
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Total Crisis Stream</span>
          <div className="flex items-center gap-1">
            <Database className="h-4 w-4 text-primary" />
            <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100 text-primary" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white sm:text-4xl">
            {loading ? (
              <span className="inline-block h-8 w-16 animate-pulse rounded bg-slate-800" />
            ) : (
              (stats?.total ?? 0).toLocaleString()
            )}
          </span>
          <span className="text-xs font-medium text-blue-300/80">
            {stats?.geospatial?.totalGeolocated ?? 0} mapped
          </span>
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          {stats?.geospatial ? `${stats.geospatial.geolocatedPercentage}% geolocated to flood zones` : "Ingested flood records"}
        </p>
      </button>
    </div>
  );
}
