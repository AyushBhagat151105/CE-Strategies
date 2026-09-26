"use client";

import { useMemo, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";
import { Map, MapTileLayer, MapMarker, MapPopup, MapTooltip, MapZoomControl } from "@/components/ui/map";
import { MapPin, RotateCcw } from "@/components/icons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface WorldCountryStat {
  name: string;
  count: number;
  latitude: number;
  longitude: number;
}

interface WorldFloodMapProps {
  countries: WorldCountryStat[];
  selectedCountry?: string | null;
  onSelectCountry?: (country: string | null) => void;
  className?: string;
}

const WORLD_VIEW: [[number, number], number] = [[15, 30], 2];

function markerSize(count: number, maxCount: number) {
  if (maxCount <= 0) return 24;
  const ratio = count / maxCount;
  return Math.round(22 + ratio * 22); // 22px .. 44px
}

export function WorldFloodMap({ countries, selectedCountry, onSelectCountry, className = "" }: WorldFloodMapProps) {
  const mapRef = useRef<LeafletMap | null>(null);
  const maxCount = useMemo(() => Math.max(0, ...countries.map((c) => c.count)), [countries]);

  const handleReset = () => {
    mapRef.current?.setView(WORLD_VIEW[0], WORLD_VIEW[1]);
  };

  return (
    <div className={`relative rounded-xl border border-border/80 overflow-hidden shadow-2xl ${className}`}>
      <div className="absolute top-4 left-16 right-4 z-[1000] flex flex-wrap items-center justify-end gap-2 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2">
          <Select
            value={selectedCountry ?? "ALL"}
            onValueChange={(v) => {
              if (v === "ALL") {
                onSelectCountry?.(null);
                return;
              }
              onSelectCountry?.(v);
              const country = countries.find((c) => c.name === v);
              if (country) mapRef.current?.setView([country.latitude, country.longitude], 5);
            }}
          >
            <SelectTrigger className="w-44 bg-card/90 backdrop-blur shadow-md">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Countries</SelectItem>
              {countries.map((country) => (
                <SelectItem key={country.name} value={country.name}>
                  {country.name} ({country.count})
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
        <Map center={WORLD_VIEW[0]} zoom={WORLD_VIEW[1]} ref={mapRef} scrollWheelZoom className="rounded-xl">
          <MapTileLayer />
          <MapZoomControl />

          {countries.map((country) => {
            const isSelected = selectedCountry === country.name;
            const size = isSelected ? markerSize(country.count, maxCount) + 8 : markerSize(country.count, maxCount);
            return (
              <MapMarker
                key={country.name}
                position={[country.latitude, country.longitude]}
                size={size}
                icon={<MapPin color={isSelected ? "#f7f3ec" : "#0891b2"} size={size} className="drop-shadow" />}
                eventHandlers={{
                  click: () => onSelectCountry?.(isSelected ? null : country.name),
                }}
              >
                <MapTooltip>
                  {country.name} · {country.count} signals
                </MapTooltip>
                <MapPopup>
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-sm">{country.name}</p>
                    <p>
                      <span className="font-semibold">{country.count}</span> flood-related signals
                    </p>
                  </div>
                </MapPopup>
              </MapMarker>
            );
          })}
        </Map>
      </div>
    </div>
  );
}
