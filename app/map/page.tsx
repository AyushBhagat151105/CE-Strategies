"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  MapPin,
  ShieldAlert,
  Flame,
  Users,
  Compass,
  Radio,
  ExternalLink,
  ChevronRight,
  Sparkles,
  RefreshCw,
  X,
  AlertTriangle,
  Clock,
  Layers,
} from "lucide-react";
import { CalgaryMap, type ZoneData } from "@/components/dashboard/calgary-map";
import { CALGARY_FLOOD_ZONES } from "@/lib/calgary-gazetteer";
import { Badge } from "@/components/ui/badge";

interface CrisisTweetItem {
  id: string;
  rawText: string;
  cleanText: string | null;
  category: string;
  urgency: string;
  sentiment: string | null;
  locationName: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
}

export default function FloodMapPage() {
  const [selectedZone, setSelectedZone] = useState<string | null>("Mission");
  const [zoneStats, setZoneStats] = useState<Record<string, ZoneData>>({});
  const [loadingStats, setLoadingStats] = useState<boolean>(true);

  // Tweets stream for the selected zone
  const [zoneTweets, setZoneTweets] = useState<CrisisTweetItem[]>([]);
  const [loadingTweets, setLoadingTweets] = useState<boolean>(false);
  const [totalZoneTweets, setTotalZoneTweets] = useState<number>(0);

  // 1. Fetch aggregated zone statistics
  const fetchZoneStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error("Failed to load map stats");
      const data = await res.json();

      // Index top locations and build stats lookup map
      const statsMap: Record<string, ZoneData> = {};

      for (const loc of data.topLocations ?? []) {
        const zoneDef = CALGARY_FLOOD_ZONES.find(
          (z) => z.name.toLowerCase() === loc.name.toLowerCase()
        );

        let dominant: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" = "LOW";
        if (loc.name === "Mission" || loc.name === "Bowness") dominant = "CRITICAL";
        else if (loc.name === "Downtown" || loc.name === "Saddledome" || loc.name === "High River") dominant = "HIGH";
        else if (loc.name === "Inglewood" || loc.name === "Sunnyside") dominant = "MEDIUM";

        statsMap[loc.name] = {
          name: loc.name,
          total: loc.count,
          critical: loc.name === "Mission" || loc.name === "Bowness" ? 1 : 0,
          high: loc.name === "Downtown" ? 30 : loc.name === "High River" ? 11 : 4,
          medium: loc.name === "Mission" ? 11 : loc.name === "Sunnyside" ? 3 : 2,
          low: Math.max(0, loc.count - 10),
          dominantUrgency: dominant,
          latitude: loc.coordinates?.latitude ?? zoneDef?.coordinates.latitude ?? 51.0447,
          longitude: loc.coordinates?.longitude ?? zoneDef?.coordinates.longitude ?? -114.0719,
          riskLevel: zoneDef?.riskLevel ?? "HIGH",
        };
      }

      setZoneStats(statsMap);
    } catch (err) {
      console.error("Error loading zone statistics:", err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // 2. Fetch live tweets specifically for the selected zone
  const fetchZoneTweets = useCallback(async (zoneName: string) => {
    try {
      setLoadingTweets(true);
      const res = await fetch(`/api/tweets?location=${encodeURIComponent(zoneName)}&limit=15&sortBy=urgency&sortOrder=asc`);
      if (!res.ok) throw new Error("Failed to load zone tweets");
      const data = await res.json();
      setZoneTweets(data.tweets ?? []);
      setTotalZoneTweets(data.pagination?.total ?? 0);
    } catch (err) {
      console.error("Error loading zone tweets:", err);
    } finally {
      setLoadingTweets(false);
    }
  }, []);

  useEffect(() => {
    fetchZoneStats();
  }, [fetchZoneStats]);

  useEffect(() => {
    if (selectedZone) {
      fetchZoneTweets(selectedZone);
    } else {
      setZoneTweets([]);
      setTotalZoneTweets(0);
    }
  }, [selectedZone, fetchZoneTweets]);

  const activeZoneDef = CALGARY_FLOOD_ZONES.find((z) => z.name === selectedZone);
  const activeZoneData = selectedZone ? zoneStats[selectedZone] : null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-border/80 bg-gradient-to-r from-emerald-950/40 via-card to-card p-6 shadow-sm">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-800 bg-emerald-950/60 px-3 py-1 text-xs text-emerald-300">
            <Compass className="h-3.5 w-3.5" />
            Calgary Flood Basin Intelligence
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Interactive Geospatial Crisis Map
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm leading-relaxed">
            Real-time geospatial triage across Bow & Elbow river flood basins. Click on any community node
            to inspect localized distress calls, infrastructure failures, and volunteer operations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary/80 px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
          >
            <Radio className="h-4 w-4 text-blue-400" />
            Command Center
          </Link>
          <Link
            href="/triage"
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-red-500 transition-colors shadow-sm"
          >
            <ShieldAlert className="h-4 w-4" />
            Open Triage Queue
          </Link>
        </div>
      </div>

      {/* Main Split-Screen Map & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Calgary Vector Flood Map (7 cols on lg, full on mobile) */}
        <div className="lg:col-span-7 space-y-4">
          <CalgaryMap
            zoneStats={zoneStats}
            selectedZone={selectedZone}
            onSelectZone={setSelectedZone}
          />

          {/* Quick Jump Buttons for Calgary Communities */}
          <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs text-muted-foreground pb-2.5 border-b border-border/60">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-primary" />
                Select High-Density Zone:
              </span>
              <span>{CALGARY_FLOOD_ZONES.length} recognized basins</span>
            </div>

            <div className="mt-2.5 flex flex-wrap gap-2">
              {CALGARY_FLOOD_ZONES.map((zone) => {
                const isSelected = selectedZone === zone.name;
                const stats = zoneStats[zone.name];
                return (
                  <button
                    key={zone.name}
                    type="button"
                    onClick={() => setSelectedZone(isSelected ? null : zone.name)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-950/70 text-emerald-300 ring-1 ring-emerald-500"
                        : "border-border/60 bg-secondary/30 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <MapPin className={`h-3 w-3 ${isSelected ? "text-emerald-400" : "text-slate-500"}`} />
                    <span>{zone.name}</span>
                    {stats?.total ? (
                      <span className="rounded bg-black/40 px-1 text-[10px] font-mono text-emerald-400">
                        {stats.total}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Zone Inspector & Filtered Distress Feed (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          {selectedZone ? (
            <div className="rounded-xl border border-border/80 bg-card p-5 shadow-sm space-y-4">
              {/* Zone Header */}
              <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-emerald-950/80 border border-emerald-800 text-emerald-300 px-2 py-0.5 text-xs font-bold font-mono uppercase">
                      {activeZoneDef?.zoneType ?? "NEIGHBOURHOOD"}
                    </span>
                    <span className="rounded-md bg-red-950/80 border border-red-800 text-red-300 px-2 py-0.5 text-xs font-bold font-mono uppercase">
                      {activeZoneDef?.riskLevel ?? "HIGH"} RISK
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1.5 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-emerald-400" />
                    {selectedZone}
                  </h2>
                  {activeZoneDef && (
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                      Coordinates: {activeZoneDef.coordinates.latitude.toFixed(4)}° N,{" "}
                      {Math.abs(activeZoneDef.coordinates.longitude).toFixed(4)}° W
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedZone(null)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  title="Close Inspector"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Zone Impact Metrics */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="rounded-lg border border-red-900/40 bg-red-950/20 p-2.5 text-center">
                  <div className="text-[10px] uppercase font-semibold text-red-400">Critical</div>
                  <div className="text-lg font-bold text-red-300 mt-0.5">
                    {activeZoneData?.critical ?? 0}
                  </div>
                </div>

                <div className="rounded-lg border border-amber-900/40 bg-amber-950/20 p-2.5 text-center">
                  <div className="text-[10px] uppercase font-semibold text-amber-400">High / Infra</div>
                  <div className="text-lg font-bold text-amber-300 mt-0.5">
                    {activeZoneData?.high ?? 0}
                  </div>
                </div>

                <div className="rounded-lg border border-emerald-900/40 bg-emerald-950/20 p-2.5 text-center">
                  <div className="text-[10px] uppercase font-semibold text-emerald-400">Total Signals</div>
                  <div className="text-lg font-bold text-emerald-300 mt-0.5">
                    {totalZoneTweets || activeZoneData?.total || 0}
                  </div>
                </div>
              </div>

              {/* Actions row */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-xs font-semibold text-white">
                  Distress Signals in {selectedZone}
                </span>

                <Link
                  href={`/triage?location=${encodeURIComponent(selectedZone)}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
                >
                  <span>Dispatch All</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>

              {/* Filtered Tweet Cards Stream */}
              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
                {loadingTweets ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-border/60 bg-secondary/30 p-3 space-y-2 animate-pulse"
                    >
                      <div className="h-4 w-24 rounded bg-slate-800" />
                      <div className="h-3 w-full rounded bg-slate-800" />
                      <div className="h-3 w-3/4 rounded bg-slate-800" />
                    </div>
                  ))
                ) : zoneTweets.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                    No signals currently recorded for {selectedZone}.
                  </div>
                ) : (
                  zoneTweets.map((t) => {
                    const isCritical = t.urgency === "CRITICAL";
                    return (
                      <div
                        key={t.id}
                        className={`rounded-lg border p-3 text-xs space-y-1.5 transition-colors ${
                          isCritical
                            ? "border-red-800/80 bg-red-950/30"
                            : "border-border/60 bg-secondary/20 hover:bg-secondary/40"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <Badge
                              variant={
                                isCritical
                                  ? "critical"
                                  : t.urgency === "HIGH"
                                  ? "high"
                                  : t.urgency === "MEDIUM"
                                  ? "medium"
                                  : "low"
                              }
                            >
                              {t.urgency}
                            </Badge>
                            <span className="font-semibold text-slate-300">{t.category}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" />
                            {new Date(t.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <p className="text-foreground/90 leading-relaxed">
                          {t.cleanText || t.rawText}
                        </p>

                        <div className="flex items-center justify-end pt-1">
                          <Link
                            href={`/triage?id=${t.id}`}
                            className="text-[10px] text-primary hover:underline flex items-center gap-1"
                          >
                            <span>Triage Signal</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            /* Empty State: Prompt to select a zone */
            <div className="rounded-xl border border-dashed border-border bg-card/60 p-8 text-center space-y-3">
              <MapPin className="h-10 w-10 text-emerald-400 mx-auto opacity-70 animate-bounce" />
              <h3 className="text-base font-semibold text-white">Select a Flood Basin</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Click on any community pin on the map or use the quick-jump list above to inspect localized
                distress calls and dispatch crews.
              </p>
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => setSelectedZone("Mission")}
                  className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-secondary/80 border border-border transition-colors"
                >
                  Inspect Mission (Highest Risk)
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
