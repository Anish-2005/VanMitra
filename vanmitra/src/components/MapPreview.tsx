"use client";

import React, { useEffect, useRef } from "react";

interface Marker { lng: number; lat: number; label?: string }

export default function MapPreview({ center = [88.8, 21.9], zoom = 8, markers = [] }: { center?: [number, number]; zoom?: number; markers?: Marker[] }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const cssId = "maplibre-css";
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/maplibre-gl@2.4.0/dist/maplibre-gl.css";
      document.head.appendChild(link);
    }

    const scriptId = "maplibre-js";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    let appended = false;
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://unpkg.com/maplibre-gl@2.4.0/dist/maplibre-gl.js";
      script.async = true;
      document.body.appendChild(script);
      appended = true;
    }

    function init() {
      // @ts-ignore
      const maplibregl = (window as any).maplibregl;
      if (!maplibregl || !ref.current) return null;

      const map = new maplibregl.Map({
        container: ref.current,
        style: {
          version: 8,
          sources: {
            osm: {
              type: "raster",
              tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
            },
          },
          layers: [{ id: "osm", type: "raster", source: "osm" }],
        },
        center,
        zoom,
      });

      const createdMarkers: any[] = [];
      markers.forEach((m) => {
        try {
          const el = document.createElement("div");
          el.style.width = "12px";
          el.style.height = "12px";
          el.style.borderRadius = "50%";
          el.style.background = "#16a34a";
          el.style.border = "2px solid #ecfccb";
          const marker = new maplibregl.Marker({ element: el }).setLngLat([m.lng, m.lat]).addTo(map);
          createdMarkers.push(marker);
        } catch (e) {
          // ignore marker errors
        }
      });

      return { map, createdMarkers };
    }

    let instance: any = null;

    const tryInit = () => {
      if ((window as any).maplibregl) {
        instance = init();
      } else if (script) {
        script.addEventListener("load", () => {
          instance = init();
        });
      }
    };

    tryInit();

    return () => {
      if (instance) {
        try {
          if (instance.createdMarkers) {
            instance.createdMarkers.forEach((m: any) => m.remove && m.remove());
          }
          if (instance.map && instance.map.remove) instance.map.remove();
        } catch (e) {
          // ignore
        }
      }
      if (appended && script && script.parentNode) script.parentNode.removeChild(script);
    };
  }, [JSON.stringify(center), zoom, JSON.stringify(markers.map((m) => [m.lng, m.lat]))]);

  return <div ref={ref} className="w-full h-full rounded-md overflow-hidden" />;
}
