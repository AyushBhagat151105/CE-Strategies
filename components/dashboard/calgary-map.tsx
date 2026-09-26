"use client";

import React, { useState, useMemo } from "react";
import { CALGARY_FLOOD_ZONES, type CalgaryZone } from "@/lib/calgary-gazetteer";
import {
  MapPin,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  Compass,
  Flame,
  ShieldAlert,
  Users,
  Info,
} from "lucide-react";

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

export function CalgaryMap({
  zoneStats = {},
  selectedZone,
  onSelectZone,
  className = "",
}: CalgaryMapProps) {
  // View mode: "CORE" (Calgary Metropolitan Core) vs "REGIONAL" (Includes High River)
  const [viewMode, setViewMode] = useState<"CORE" | "REGIONAL">("CORE");
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  // Geographic bounds based on viewMode
  const bounds = useMemo(() => {
    if (viewMode === "CORE") {
      return {
        minLat: 51.015,
        maxLat: 51.105,
        minLng: -114.235,
        maxLng: -114.015,
      };
    }
    return {
      minLat: 50.52,
      maxLat: 51.12,
      minLng: -114.25,
      maxLng: -113.78,
    };
  }, [viewMode]);

  const mapWidth = 900;
  const mapHeight = 620;

  // Coordinate projection from (lat, lng) to (x, y)
  const project = (lat: number, lng: number) => {
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * mapWidth;
    const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * mapHeight;
    return { x, y };
  };

  // Precomputed flood zones with projected positions
  const projectedZones = useMemo(() => {
    return CALGARY_FLOOD_ZONES.map((zone) => {
      const stats = zoneStats[zone.name] || {
        total: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        dominantUrgency: "LOW",
      };

      const coords = project(zone.coordinates.latitude, zone.coordinates.longitude);
      const isVisible =
        zone.coordinates.latitude >= bounds.minLat &&
        zone.coordinates.latitude <= bounds.maxLat &&
        zone.coordinates.longitude >= bounds.minLng &&
        zone.coordinates.longitude <= bounds.maxLng;

      // Determine dominant urgency styling
      let urgencyColor = "text-emerald-400 bg-emerald-500 border-emerald-400";
      let urgencyGlow = "rgba(16, 185, 129, 0.4)";
      let urgencyType: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" = "LOW";

      if (stats.critical > 0) {
        urgencyColor = "text-red-400 bg-red-500 border-red-400";
        urgencyGlow = "rgba(239, 68, 68, 0.6)";
        urgencyType = "CRITICAL";
      } else if (stats.high > 0 || zone.name === "Downtown" || zone.name === "Saddledome" || zone.name === "High River") {
        urgencyColor = "text-amber-400 bg-amber-500 border-amber-400";
        urgencyGlow = "rgba(245, 158, 11, 0.5)";
        urgencyType = "HIGH";
      } else if (stats.medium > 0 || zone.name === "Inglewood") {
        urgencyColor = "text-emerald-400 bg-emerald-500 border-emerald-400";
        urgencyGlow = "rgba(16, 185, 129, 0.4)";
        urgencyType = "MEDIUM";
      }

      // Marker radius proportional to signal volume
      const radius = Math.min(26, Math.max(12, Math.sqrt(stats.total || 1) * 2.2));

      return {
        ...zone,
        x: coords.x,
        y: coords.y,
        isVisible,
        stats: {
          ...stats,
          dominantUrgency: urgencyType,
        },
        urgencyColor,
        urgencyGlow,
        radius,
      };
    });
  }, [bounds, zoneStats]);

  // River water corridors projected into SVG path points
  const bowRiverPath = useMemo(() => {
    // Bow River coordinates from NW (Bearspaw/Bowness) through Calgary downtown to SE
    const bowPoints = [
      { lat: 51.105, lng: -114.23 },
      { lat: 51.089, lng: -114.215 }, // Bowness
      { lat: 51.072, lng: -114.16 },  // Shouldice
      { lat: 51.062, lng: -114.12 },  // Edworthy
      { lat: 51.056, lng: -114.079 }, // Sunnyside / Kensington
      { lat: 51.052, lng: -114.068 }, // Prince's Island / Downtown
      { lat: 51.047, lng: -114.048 }, // Confluence at Fort Calgary
      { lat: 51.042, lng: -114.025 }, // Inglewood / Pearce Estate
      { lat: 51.025, lng: -114.005 }, // South Calgary Bow bend
    ];

    return bowPoints
      .map((p, i) => {
        const { x, y } = project(p.lat, p.lng);
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
  }, [bounds]);

  const elbowRiverPath = useMemo(() => {
    // Elbow River coordinates flowing from South (Glenmore) through Rideau/Mission to Confluence
    const elbowPoints = [
      { lat: 51.012, lng: -114.095 }, // Glenmore Dam outlet
      { lat: 51.022, lng: -114.08 },  // Sandy Beach
      { lat: 51.027, lng: -114.072 }, // Rideau / Roxboro
      { lat: 51.035, lng: -114.072 }, // Mission / 4th St
      { lat: 51.037, lng: -114.062 }, // Lindsay Park
      { lat: 51.038, lng: -114.052 }, // Saddledome / Stampede
      { lat: 51.047, lng: -114.048 }, // Fort Calgary Confluence into Bow River
    ];

    return elbowPoints
      .map((p, i) => {
        const { x, y } = project(p.lat, p.lng);
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
  }, [bounds]);

  return (
    <div className={`relative rounded-xl border border-border/80 bg-slate-950 overflow-hidden shadow-2xl ${className}`}>
      {/* Top Controls Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* View mode toggle */}
        <div className="pointer-events-auto flex items-center rounded-lg bg-card/90 backdrop-blur border border-border/80 p-1 shadow-md">
          <button
            type="button"
            onClick={() => {
              setViewMode("CORE");
              setZoomLevel(1);
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              viewMode === "CORE"
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Calgary Urban Core
          </button>
          <button
            type="button"
            onClick={() => {
              setViewMode("REGIONAL");
              setZoomLevel(1);
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              viewMode === "REGIONAL"
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Regional Basin (High River)
          </button>
        </div>

        {/* Zoom & View Controls */}
        <div className="pointer-events-auto flex items-center gap-1.5 rounded-lg bg-card/90 backdrop-blur border border-border/80 p-1 shadow-md">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.0))}
            className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <span className="text-[11px] font-mono px-1.5 text-muted-foreground">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
            className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel(1)}
            className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors ml-1"
            title="Reset View"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* SVG Map Container */}
      <div className="relative w-full h-[540px] overflow-hidden bg-gradient-to-b from-[#060c18] via-[#091322] to-[#040811] cursor-grab active:cursor-grabbing">
        <svg
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          className="w-full h-full transition-transform duration-300 origin-center"
          style={{
            transform: `scale(${zoomLevel})`,
          }}
        >
          <defs>
            {/* River gradient */}
            <linearGradient id="riverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.8" />
            </linearGradient>

            {/* Grid pattern for high-tech geospatial map aesthetic */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeOpacity="0.4" />
            </pattern>

            {/* Glowing filter for critical rescue pins */}
            <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-amber" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Coordinate grid overlay */}
          <rect width={mapWidth} height={mapHeight} fill="url(#grid)" />

          {/* Urban Basin Landmass Silhouettes (Calgary Downtown Boundary Area) */}
          <path
            d="M 220 40 Q 420 20 620 40 Q 680 180 620 320 Q 420 380 220 320 Q 180 180 220 40 Z"
            fill="#0f172a"
            fillOpacity="0.3"
            stroke="#1e293b"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Waterways: Bow River & Elbow River Corridors */}
          <g id="rivers">
            {/* Bow River Flood Basin buffer */}
            <path
              d={bowRiverPath}
              fill="none"
              stroke="#0284c7"
              strokeWidth="24"
              strokeOpacity="0.12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Bow River main channel */}
            <path
              d={bowRiverPath}
              fill="none"
              stroke="url(#riverGradient)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Elbow River Flood Basin buffer */}
            <path
              d={elbowRiverPath}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="18"
              strokeOpacity="0.12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Elbow River main channel */}
            <path
              d={elbowRiverPath}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Confluence marker at Fort Calgary */}
            {viewMode === "CORE" && (
              <text
                x="440"
                y="180"
                fill="#38bdf8"
                fontSize="9"
                fontFamily="monospace"
                fontWeight="600"
                opacity="0.75"
              >
                ← Bow / Elbow Confluence
              </text>
            )}

            {/* River labels */}
            {viewMode === "CORE" && (
              <>
                <text
                  x="140"
                  y="70"
                  fill="#0284c7"
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                  opacity="0.8"
                >
                  Bow River
                </text>
                <text
                  x="480"
                  y="480"
                  fill="#06b6d4"
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                  opacity="0.8"
                >
                  Elbow River
                </text>
              </>
            )}
          </g>

          {/* Recognized Flood Communities & Markers */}
          <g id="markers">
            {projectedZones.map((zone) => {
              if (!zone.isVisible) return null;
              const isSelected = selectedZone === zone.name;
              const isHovered = hoveredZone === zone.name;
              const isCritical = zone.stats.dominantUrgency === "CRITICAL";

              return (
                <g
                  key={zone.name}
                  transform={`translate(${zone.x}, ${zone.y})`}
                  className="cursor-pointer transition-transform duration-200"
                  onClick={() => onSelectZone?.(isSelected ? null : zone.name)}
                  onMouseEnter={() => setHoveredZone(zone.name)}
                  onMouseLeave={() => setHoveredZone(null)}
                >
                  {/* Outer pulse animation for critical / rescue zones */}
                  {isCritical && (
                    <circle
                      r={zone.radius + 12}
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="2"
                      opacity="0.75"
                      className="animate-ping origin-center"
                    />
                  )}

                  {/* Halo ring for selected or hovered state */}
                  {(isSelected || isHovered) && (
                    <circle
                      r={zone.radius + 6}
                      fill="none"
                      stroke={isSelected ? "#ffffff" : "#38bdf8"}
                      strokeWidth="2.5"
                      strokeDasharray={isSelected ? "none" : "3 3"}
                    />
                  )}

                  {/* Main Marker Circle */}
                  <circle
                    r={zone.radius}
                    fill={
                      zone.stats.dominantUrgency === "CRITICAL"
                        ? "#dc2626"
                        : zone.stats.dominantUrgency === "HIGH"
                        ? "#d97706"
                        : "#059669"
                    }
                    stroke="#ffffff"
                    strokeWidth={isSelected ? "3" : "1.5"}
                    filter={isCritical ? "url(#glow-red)" : "url(#glow-amber)"}
                    className="transition-all duration-200 hover:scale-110"
                  />

                  {/* Marker Center Count or Icon */}
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#ffffff"
                    fontSize={zone.radius >= 18 ? "11" : "9"}
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {zone.stats.total || ""}
                  </text>

                  {/* Text Label Below Marker */}
                  <text
                    y={zone.radius + 14}
                    textAnchor="middle"
                    fill={isSelected ? "#ffffff" : "#cbd5e1"}
                    fontSize="11"
                    fontWeight={isSelected ? "800" : "600"}
                    className="pointer-events-none drop-shadow-md select-none"
                  >
                    {zone.name}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Active Hover / Inspection Tooltip */}
        {hoveredZone && (
          <div className="absolute bottom-4 right-4 z-20 pointer-events-none rounded-xl border border-border bg-card/95 backdrop-blur p-3.5 shadow-xl max-w-xs animate-in fade-in duration-150">
            {(() => {
              const zone = projectedZones.find((z) => z.name === hoveredZone);
              if (!zone) return null;
              return (
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-1.5">
                    <span className="font-bold text-white text-sm flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      {zone.name}
                    </span>
                    <span className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-mono text-emerald-400">
                      {zone.stats.total} signals
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-muted-foreground pt-1">
                    <div>Risk Profile:</div>
                    <div className="font-semibold text-red-400">{zone.riskLevel} FLOOD</div>
                    <div>Critical Rescues:</div>
                    <div className="font-semibold text-red-400">{zone.stats.critical}</div>
                    <div>Infrastructure:</div>
                    <div className="font-semibold text-amber-400">{zone.stats.high}</div>
                    <div>Volunteer/Aid:</div>
                    <div className="font-semibold text-emerald-400">{zone.stats.medium}</div>
                  </div>

                  <p className="text-[10px] text-muted-foreground pt-1 italic">
                    Click to filter live crisis intelligence feed
                  </p>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Map Legend Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-card/80 border-t border-border/60 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">
            Urgency Key:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="text-red-300 font-medium">Critical / Rescue (P1)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span className="text-amber-300 font-medium">Infrastructure Outage & Evac</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-emerald-300 font-medium">Volunteer Aid (#yychelps)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2 w-5 rounded bg-sky-500/80" />
            <span className="text-sky-300 font-medium">Bow / Elbow River Basins</span>
          </div>
        </div>

        {selectedZone && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Focused:</span>
            <span className="rounded-md bg-primary/20 border border-primary/40 px-2 py-0.5 text-primary font-bold">
              {selectedZone}
            </span>
            <button
              type="button"
              onClick={() => onSelectZone?.(null)}
              className="text-[11px] text-muted-foreground hover:text-white underline ml-1"
            >
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
