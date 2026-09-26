"use client";

import { useMemo, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";
import {
  Map,
  MapTileLayer,
  MapMarker,
  MapPopup,
  MapTooltip,
  MapZoomControl,
  MapPolyline,
} from "@/components/ui/map";
import { CALGARY_FLOOD_ZONES } from "@/lib/calgary-gazetteer";
import { MapPin, RotateCcw } from "@/components/icons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface ZoneData {
  name: string;
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  dominantUrgency: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  dominantCategory?: string;
  latitude: number;
  longitude: number;
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
}

interface CalgaryMapProps {
  zoneStats?: Record<string, ZoneData>;
  selectedZone?: string | null;
  onSelectZone?: (zoneName: string | null) => void;
  className?: string;
}

const CORE_VIEW: [[number, number], number] = [[51.055, -114.08], 12];
const REGIONAL_VIEW: [[number, number], number] = [[50.85, -114.05], 10];

// Bow River — NW (Bowness) through downtown to SE, real coordinates
const BOW_RIVER_PATH: [number, number][] = [
  [51.105, -114.23],
  [51.089, -114.215],
  [51.072, -114.16],
  [51.062, -114.12],
  [51.056, -114.079],
  [51.052, -114.068],
  [51.047, -114.048],
  [51.042, -114.025],
  [51.025, -114.005],
];

// Elbow River — south (Glenmore) through Mission to the confluence
const ELBOW_RIVER_PATH: [number, number][] = [
  [51.012, -114.095],
  [51.022, -114.08],
  [51.027, -114.072],
  [51.035, -114.072],
  [51.037, -114.062],
  [51.038, -114.052],
  [51.047, -114.048],
];

function urgencyColor(urgency: ZoneData["dominantUrgency"] | undefined) {
  switch (urgency) {
    case "CRITICAL":
      return "#b91c1c";
    case "HIGH":
      return "#b45309";
    case "MEDIUM":
      return "#f7f3ec";
    default:
      return "#f7f3ec";
  }
}

export function CalgaryMap({ zoneStats = {}, selectedZone, onSelectZone, className = "" }: CalgaryMapProps) {
  const [viewMode, setViewMode] = useState<"CORE" | "REGIONAL">("CORE");
  const mapRef = useRef<LeafletMap | null>(null);

  const zones = useMemo(
    () =>
      CALGARY_FLOOD_ZONES.map((zone) => ({
        ...zone,
        stats: zoneStats[zone.name],
      })),
    [zoneStats]
  );

  const handleViewChange = (mode: "CORE" | "REGIONAL") => {
    setViewMode(mode);
    const [center, zoom] = mode === "CORE" ? CORE_VIEW : REGIONAL_VIEW;
    mapRef.current?.setView(center, zoom);
  };

  const handleReset = () => {
    const [center, zoom] = viewMode === "CORE" ? CORE_VIEW : REGIONAL_VIEW;
    mapRef.current?.setView(center, zoom);
  };

  return (
    <div className={`relative rounded-xl border border-border/80 overflow-hidden shadow-2xl ${className}`}>
      {/* Top Controls Toolbar */}
      <div className="absolute top-4 left-16 right-4 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="pointer-events-auto flex items-center rounded-lg bg-card/90 backdrop-blur border border-border/80 p-1 shadow-md">
          <button
            type="button"
            onClick={() => handleViewChange("CORE")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              viewMode === "CORE" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Calgary Urban Core
          </button>
          <button
            type="button"
            onClick={() => handleViewChange("REGIONAL")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              viewMode === "REGIONAL" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Regional Basin (High River)
          </button>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          <Select
            value={selectedZone ?? "ALL"}
            onValueChange={(v) => {
              if (v === "ALL") {
                onSelectZone?.(null);
                return;
              }
              onSelectZone?.(v);
              const zone = CALGARY_FLOOD_ZONES.find((z) => z.name === v);
              if (zone) mapRef.current?.setView([zone.coordinates.latitude, zone.coordinates.longitude], 14);
            }}
          >
            <SelectTrigger className="w-44 bg-card/90 backdrop-blur shadow-md">
              <SelectValue placeholder="Select zone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Zones</SelectItem>
              {CALGARY_FLOOD_ZONES.map((zone) => (
                <SelectItem key={zone.name} value={zone.name}>
                  {zone.name}
                  {zoneStats[zone.name]?.total ? ` (${zoneStats[zone.name].total})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <button
            type="button"
            onClick={handleReset}
            title="Reset View"
            className="flex items-center gap-1.5 rounded-lg bg-card/90 backdrop-blur border border-border/80 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground shadow-md"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>

      <div className="relative w-full h-[540px]">
        <Map
          center={CORE_VIEW[0]}
          zoom={CORE_VIEW[1]}
          ref={mapRef}
          scrollWheelZoom
          className="rounded-xl"
        >
          <MapTileLayer />
          <MapZoomControl />

          <MapPolyline
            positions={BOW_RIVER_PATH}
            pathOptions={{ color: "#0d9488", weight: 6, opacity: 0.85 }}
          />
          <MapPolyline
            positions={ELBOW_RIVER_PATH}
            pathOptions={{ color: "#059669", weight: 5, opacity: 0.85 }}
          />

          {zones.map((zone) => {
            const isSelected = selectedZone === zone.name;
            const color = urgencyColor(zone.stats?.dominantUrgency);
            return (
              <MapMarker
                key={zone.name}
                position={[zone.coordinates.latitude, zone.coordinates.longitude]}
                size={isSelected ? 36 : 28}
                icon={<MapPin color={color} size={isSelected ? 36 : 28} className="drop-shadow" />}
                eventHandlers={{
                  click: () => onSelectZone?.(isSelected ? null : zone.name),
                }}
              >
                <MapTooltip>{zone.name}</MapTooltip>
                <MapPopup>
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-sm">{zone.name}</p>
                    <p className="text-muted-foreground">{zone.zoneType} · {zone.riskLevel} risk</p>
                    {zone.stats && (
                      <p>
                        <span className="font-semibold">{zone.stats.total}</span> signals ·{" "}
                        <span className="font-semibold text-red-400">{zone.stats.critical}</span> critical
                      </p>
                    )}
                  </div>
                </MapPopup>
              </MapMarker>
            );
          })}
        </Map>

        {selectedZone && (
          <div className="absolute bottom-2 right-2 z-[1000] flex items-center gap-2 rounded-lg border border-border/80 bg-card/90 backdrop-blur px-3 py-1.5 text-xs shadow-md">
            <span className="text-muted-foreground">Focused:</span>
            <span className="rounded-md bg-primary/20 border border-primary/40 px-2 py-0.5 text-primary font-bold">
              {selectedZone}
            </span>
            <button
              type="button"
              onClick={() => onSelectZone?.(null)}
              className="text-[11px] text-muted-foreground hover:text-foreground underline ml-1"
            >
              Clear
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
