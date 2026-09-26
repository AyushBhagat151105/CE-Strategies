import Link from "next/link";
import { MapPin, ShieldAlert, Sparkles } from "lucide-react";
import { CommandCenter } from "@/components/dashboard/command-center";

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
            Crisis Response Command Center
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base leading-relaxed">
            Ingesting, triaging, and geolocating 8,026 disaster signals from the Alberta floods.
            Triage emergency calls, coordinate volunteer cleanups, and track infrastructure status in real time.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/triage"
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-500 transition-colors shadow-sm"
          >
            <ShieldAlert className="h-4 w-4" />
            Open Triage Queue
          </Link>
          <Link
            href="/map"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary/80 px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
          >
            <MapPin className="h-4 w-4 text-emerald-400" />
            View Flood Map
          </Link>
        </div>
      </div>

      {/* Main Interactive Crisis Operations Command Center */}
      <CommandCenter />
    </div>
  );
}
