"use client";

import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/lib/i18n";

type Props = {
  latitude?: number | null;
  longitude?: number | null;
  onChange: (lat: number, lng: number) => void;
  dict: Dictionary["properties"]["form"]["locationPicker"];
  height?: number;
};

const DEFAULT_CENTER: [number, number] = [24.7136, 46.6753]; // Riyadh
const DEFAULT_ZOOM = 11;

export function LocationPicker({
  latitude,
  longitude,
  onChange,
  dict,
  height = 320,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(
    latitude != null && longitude != null ? { lat: latitude, lng: longitude } : null
  );

  useEffect(() => {
    if (!ref.current) return;
    let map: any;
    let marker: any;
    let cancelled = false;

    async function init() {
      await ensureLeafletCss();
      const L = (await import("leaflet")).default;
      if (cancelled || !ref.current) return;

      const initial = pos ? [pos.lat, pos.lng] : DEFAULT_CENTER;

      map = L.map(ref.current, {
        center: initial as [number, number],
        zoom: pos ? 15 : DEFAULT_ZOOM,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      if (pos) {
        marker = L.marker([pos.lat, pos.lng]).addTo(map);
      }

      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        if (marker) marker.setLatLng([lat, lng]);
        else marker = L.marker([lat, lng]).addTo(map);
        setPos({ lat, lng });
        onChange(lat, lng);
      });
    }
    init();
    return () => {
      cancelled = true;
      if (map) map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div
        ref={ref}
        style={{ height: `${height}px` }}
        className="rounded-xl overflow-hidden border border-slate-200 cursor-crosshair"
      />
      <div className="text-xs text-slate-500 mt-2">
        {pos
          ? `${dict.positionPrefix}: ${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`
          : dict.prompt}
      </div>
    </div>
  );
}

async function ensureLeafletCss() {
  if (typeof document === "undefined") return;
  const id = "leaflet-css";
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  document.head.appendChild(link);
}
