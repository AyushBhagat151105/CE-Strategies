"use client";

import { useCallback, useEffect, useState } from "react";
import { WorldFloodMap, type WorldCountryStat } from "@/components/dashboard/world-flood-map";
import { MapPin, X, Clock, Loader2 } from "@/components/icons";

interface FloodSignalItem {
  id: string;
  rawText: string;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
}

export default function WorldFloodMapPage() {
  const [countries, setCountries] = useState<WorldCountryStat[]>([]);
  const [totalSignals, setTotalSignals] = useState(0);
  const [geolocatedPercentage, setGeolocatedPercentage] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [ingesting, setIngesting] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [signals, setSignals] = useState<FloodSignalItem[]>([]);
  const [loadingSignals, setLoadingSignals] = useState(false);
  const [totalCountrySignals, setTotalCountrySignals] = useState(0);

  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const res = await fetch("/api/world-flood/stats");
      if (!res.ok) throw new Error("Failed to load world flood stats");
      const data = await res.json();
      setCountries(data.countries ?? []);
      setTotalSignals(data.total ?? 0);
      setGeolocatedPercentage(data.geolocatedPercentage ?? 0);
      return data.total ?? 0;
    } catch (err) {
      console.error("Error loading world flood stats:", err);
      return 0;
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchSignals = useCallback(async (country: string) => {
    try {
      setLoadingSignals(true);
      const res = await fetch(`/api/world-flood/signals?country=${encodeURIComponent(country)}&limit=15`);
      if (!res.ok) throw new Error("Failed to load flood signals");
      const data = await res.json();
      setSignals(data.signals ?? []);
      setTotalCountrySignals(data.pagination?.total ?? 0);
    } catch (err) {
      console.error("Error loading flood signals:", err);
    } finally {
      setLoadingSignals(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const total = await fetchStats();
      if (total === 0) {
        setIngesting(true);
        try {
          await fetch("/api/world-flood/ingest", { method: "POST" });
          await fetchStats();
        } finally {
          setIngesting(false);
        }
      }
    })();
  }, [fetchStats]);

  useEffect(() => {
    if (selectedCountry) {
      fetchSignals(selectedCountry);
    } else {
      setSignals([]);
      setTotalCountrySignals(0);
    }
  }, [selectedCountry, fetchSignals]);

  const activeCountry = selectedCountry ? countries.find((c) => c.name === selectedCountry) : null;

  return (
    <div className="space-y-6">
      {/* Top bar: dataset summary */}
      <div className="rounded-xl border border-transparent bg-card p-4 shadow-sm transition-colors hover:border-border/80 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-sm font-semibold text-foreground">World Flood Signal Map</h1>
          <p className="text-xs text-muted-foreground">
            {ingesting || loadingStats
              ? "Loading global disaster dataset…"
              : `${totalSignals.toLocaleString()} flood-related signals across ${countries.length} countries — ${geolocatedPercentage}% geolocated`}
          </p>
        </div>
        {ingesting && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Classifying 61k worldwide disaster tweets for flood relevance…
          </span>
        )}
      </div>

      {/* Selected country header */}
      {activeCountry && (
        <div className="rounded-xl border border-transparent bg-card p-5 shadow-sm transition-colors hover:border-border/80 space-y-4">
          <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-3">
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <MapPin className="h-5 w-5 text-cyan-400" />
                {activeCountry.name}
              </h2>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                {activeCountry.latitude.toFixed(2)}° N, {Math.abs(activeCountry.longitude).toFixed(2)}° W
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedCountry(null)}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              title="Close Inspector"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="rounded-lg border border-transparent bg-cyan-950/20 p-2.5 text-center w-40 transition-colors hover:border-cyan-900/60">
            <div className="text-[10px] uppercase font-semibold text-cyan-400">Flood Signals</div>
            <div className="text-lg font-bold text-cyan-300 mt-0.5">{activeCountry.count}</div>
          </div>
        </div>
      )}

      {/* Map */}
      <WorldFloodMap countries={countries} selectedCountry={selectedCountry} onSelectCountry={setSelectedCountry} />

      {/* Filtered signal feed */}
      {selectedCountry && (
        <div className="rounded-xl border border-transparent bg-card p-5 shadow-sm transition-colors hover:border-border/80 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-foreground">
              Flood Signals in {selectedCountry} ({totalCountrySignals})
            </span>
          </div>

          <div className="space-y-2.5">
            {loadingSignals ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-lg border border-border/60 bg-secondary/30 p-3 space-y-2 animate-pulse">
                  <div className="h-3 w-full rounded bg-slate-800" />
                  <div className="h-3 w-3/4 rounded bg-slate-800" />
                </div>
              ))
            ) : signals.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                No flood signals currently recorded for {selectedCountry}.
              </div>
            ) : (
              signals.map((s) => (
                <div
                  key={s.id}
                  className="rounded-lg border border-transparent bg-secondary/20 p-3 text-xs space-y-1.5 transition-colors hover:border-border/60"
                >
                  <div className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground font-mono">
                    <Clock className="h-2.5 w-2.5" />
                    {new Date(s.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <p className="text-foreground/90 leading-relaxed">{s.rawText}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
