import Link from "next/link";
import { AlertTriangle, Database, MapPin, ShieldAlert, Sparkles, Users } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="rounded-xl border border-border/80 bg-gradient-to-r from-blue-950/40 via-card to-card p-6 shadow-sm">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-800 bg-blue-950/60 px-3 py-1 text-xs text-blue-300">
            <Sparkles className="h-3.5 w-3.5" />
            2013 Calgary Flood Crisis Informatics
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Real-Time Crisis Response Command Center
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base leading-relaxed">
            Ingesting, categorizing, and geolocating 8,026 disaster signals from the Alberta floods.
            Triage emergency calls, coordinate volunteer cleanups, and track infrastructure status in real time.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/triage"
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-500 transition-colors"
          >
            <ShieldAlert className="h-4 w-4" />
            Open Triage Queue
          </Link>
          <Link
            href="/map"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary/80 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
          >
            <MapPin className="h-4 w-4" />
            View Flood Map
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-red-900/40 bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground text-xs uppercase tracking-wider">
            <span>Critical Rescues</span>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <div className="mt-2 text-3xl font-bold text-red-400">Ready</div>
          <p className="mt-1 text-xs text-muted-foreground">High priority life-safety signals</p>
        </div>

        <div className="rounded-lg border border-amber-900/40 bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground text-xs uppercase tracking-wider">
            <span>Infrastructure Alerts</span>
            <ShieldAlert className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-3xl font-bold text-amber-400">Ready</div>
          <p className="mt-1 text-xs text-muted-foreground">Power, bridges, road closures</p>
        </div>

        <div className="rounded-lg border border-emerald-900/40 bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground text-xs uppercase tracking-wider">
            <span>Volunteer Signals</span>
            <Users className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-3xl font-bold text-emerald-400">Ready</div>
          <p className="mt-1 text-xs text-muted-foreground">#yychelps cleanup coordination</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground text-xs uppercase tracking-wider">
            <span>Total Dataset</span>
            <Database className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-3xl font-bold text-white">8,026</div>
          <p className="mt-1 text-xs text-muted-foreground">Rows in main_contestant.csv</p>
        </div>
      </div>
    </div>
  );
}
