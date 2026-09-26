"use client";

import "leaflet/dist/leaflet.css";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import L, { type Map as LeafletMap } from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  Circle,
  Polyline,
  useMap,
  type MapContainerProps,
  type TileLayerProps,
  type MarkerProps,
  type PopupProps,
  type TooltipProps,
} from "react-leaflet";
import { twMerge } from "tailwind-merge";
import { MapPin } from "@/components/icons";

export const Map = React.forwardRef<
  LeafletMap,
  Omit<MapContainerProps, "zoomControl"> & { className?: string }
>(function Map({ className, children, ...props }, ref) {
  return (
    <MapContainer
      zoomControl={false}
      className={twMerge("h-full w-full bg-background", className)}
      ref={ref}
      {...props}
    >
      {children}
    </MapContainer>
  );
});

interface MapTileLayerProps extends Partial<TileLayerProps> {}

export function MapTileLayer({
  url = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  attribution = "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics",
  ...props
}: MapTileLayerProps) {
  return <TileLayer url={url} attribution={attribution} {...props} />;
}

function createDivIcon(node: React.ReactNode, size: number) {
  const html = renderToStaticMarkup(<>{node}</>);
  return L.divIcon({
    html,
    className: "bg-transparent border-0",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

interface MapMarkerProps extends Omit<MarkerProps, "icon"> {
  icon?: React.ReactNode;
  size?: number;
}

export function MapMarker({ icon, size = 28, ...props }: MapMarkerProps) {
  const divIcon = React.useMemo(
    () => createDivIcon(icon ?? <MapPin className="drop-shadow" color="#f7f3ec" size={size} />, size),
    [icon, size]
  );
  return <Marker icon={divIcon} {...props} />;
}

export function MapPopup({
  className,
  children,
  ...props
}: Omit<PopupProps, "content"> & { className?: string }) {
  return (
    <Popup className={twMerge("map-popup", className)} {...props}>
      {children}
    </Popup>
  );
}

export function MapTooltip({
  className,
  children,
  ...props
}: TooltipProps & { className?: string }) {
  return (
    <Tooltip className={twMerge("map-tooltip", className)} {...props}>
      {children}
    </Tooltip>
  );
}

export function MapZoomControl({ className }: { className?: string }) {
  const map = useMap();
  return (
    <div
      className={twMerge(
        "absolute left-2 top-2 z-[1000] flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-md",
        className
      )}
    >
      <button
        type="button"
        onClick={() => map.zoomIn()}
        aria-label="Zoom in"
        className="flex h-8 w-8 items-center justify-center text-foreground hover:bg-secondary"
      >
        <span className="text-base leading-none">+</span>
      </button>
      <div className="h-px bg-border" />
      <button
        type="button"
        onClick={() => map.zoomOut()}
        aria-label="Zoom out"
        className="flex h-8 w-8 items-center justify-center text-foreground hover:bg-secondary"
      >
        <span className="text-base leading-none">−</span>
      </button>
    </div>
  );
}

export const MapCircle = Circle;
export const MapPolyline = Polyline;
