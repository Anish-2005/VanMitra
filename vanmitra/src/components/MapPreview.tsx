"use client";

import React, { useEffect, useRef } from "react";

interface Marker { lng: number; lat: number; label?: string }

export default function MapPreview({ center = [88.8, 21.9], zoom = 8, markers = [], layers = { fra: false, boundaries: false, assets: false }, onFeatureClick, }: { center?: [number, number]; zoom?: number; markers?: Marker[]; layers?: { fra?: boolean; boundaries?: boolean; assets?: boolean }; onFeatureClick?: (info: any) => void; }) {
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
  const createdSources: string[] = [];
  const createdLayers: string[] = [];
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

      // load geojson sources/layers if requested
      async function loadGeojson(name: string, url: string, type: 'fill' | 'line' | 'circle') {
        try {
          const res = await fetch(url);
          const geojson = await res.json();
          const sourceId = `src-${name}`;
          if (!map.getSource(sourceId)) {
            map.addSource(sourceId, { type: 'geojson', data: geojson });
            createdSources.push(sourceId);
            const layerId = `layer-${name}`;
            const layerDef: any = { id: layerId, type, source: sourceId };
            if (type === 'fill') layerDef.paint = { 'fill-color': '#bbf7d0', 'fill-opacity': 0.4 };
            if (type === 'line') layerDef.paint = { 'line-color': '#16a34a', 'line-width': 2 };
            if (type === 'circle') layerDef.paint = { 'circle-radius': 6, 'circle-color': '#38bdf8' };
            map.addLayer(layerDef);
            createdLayers.push(layerId);

            // attach click and cursor handlers so the host page can respond to feature clicks
            try {
              map.on('click', layerId, (e: any) => {
                  if (e?.features && e.features.length) {
                    const feat = e.features[0];
                    const info = { layer: name, properties: feat.properties, geometry: feat.geometry, point: e.point, lngLat: e.lngLat };
                    if (onFeatureClick) onFeatureClick(info);

                    // highlight the clicked feature (create a dedicated source+layer)
                    try {
                      const hlSource = 'src-highlight';
                      const hlLayer = 'layer-highlight';
                      try { if (map.getLayer(hlLayer)) map.removeLayer(hlLayer); } catch (er) {}
                      try { if (map.getSource(hlSource)) map.removeSource(hlSource); } catch (er) {}

                      const geom = feat.geometry && Object.keys(feat.geometry).length ? feat.geometry : { type: 'Point', coordinates: [e.lngLat.lng, e.lngLat.lat] };
                      const highlightGeojson: any = { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: geom }] };
                      map.addSource(hlSource, { type: 'geojson', data: highlightGeojson });
                      createdSources.push(hlSource);

                      const hlType = geom.type === 'Point' ? 'circle' : (geom.type === 'Polygon' ? 'fill' : 'line');
                      const hlLayerDef: any = { id: hlLayer, type: hlType, source: hlSource };
                      if (hlType === 'circle') hlLayerDef.paint = { 'circle-radius': 10, 'circle-color': '#f97316', 'circle-opacity': 0.95, 'circle-stroke-color': '#fff', 'circle-stroke-width': 2 };
                      if (hlType === 'fill') hlLayerDef.paint = { 'fill-color': '#f97316', 'fill-opacity': 0.25, 'fill-outline-color': '#fb923c' };
                      if (hlType === 'line') hlLayerDef.paint = { 'line-color': '#f97316', 'line-width': 3 };
                      map.addLayer(hlLayerDef);
                      createdLayers.push(hlLayer);

                      // pan/zoom to feature for context
                      try {
                        if (e.lngLat && map.flyTo) {
                          map.flyTo({ center: e.lngLat, zoom: Math.max(map.getZoom ? map.getZoom() : 12, 12), essential: true });
                        }
                      } catch (err) {}
                    } catch (err) {
                      // ignore highlight errors
                    }

                    // also show a simple popup if maplibregl is available
                    try {
                      // @ts-ignore
                      const maplibregl = (window as any).maplibregl;
                      if (maplibregl) {
                        const popup = new maplibregl.Popup({ offset: 8 }).setLngLat(e.lngLat).setHTML(`<pre style="font-size:12px;margin:0">${JSON.stringify(feat.properties,null,2)}</pre>`).addTo(map);
                        // auto remove after a while
                        setTimeout(() => popup.remove && popup.remove(), 8000);
                      }
                    } catch (err) {}
                  }
                });

              map.on('mouseenter', layerId, () => { map.getCanvas().style.cursor = 'pointer'; });
              map.on('mouseleave', layerId, () => { map.getCanvas().style.cursor = ''; });
            } catch (e) {
              // ignore event attachment errors
            }
          }
        } catch (e) {
          // ignore
        }
      }

      if (layers.fra) loadGeojson('fra', '/api/atlas/fra', 'fill');
      if (layers.boundaries) loadGeojson('boundaries', '/api/atlas/boundaries', 'line');
      if (layers.assets) loadGeojson('assets', '/api/atlas/assets', 'circle');

  return { map, createdMarkers, createdSources, createdLayers };
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
          if (instance.createdLayers) {
            instance.createdLayers.forEach((id: string) => {
              try { if (instance.map.getLayer(id)) instance.map.removeLayer(id); } catch (e) {}
            });
          }
          if (instance.createdSources) {
            instance.createdSources.forEach((id: string) => {
              try { if (instance.map.getSource(id)) instance.map.removeSource(id); } catch (e) {}
            });
          }
          if (instance.map && instance.map.remove) instance.map.remove();
        } catch (e) {
          // ignore
        }
      }
      if (appended && script && script.parentNode) script.parentNode.removeChild(script);
    };
  }, [JSON.stringify(center), zoom, JSON.stringify(markers.map((m) => [m.lng, m.lat])), JSON.stringify(layers)]);

  return <div ref={ref} className="w-full h-full rounded-md overflow-hidden" />;
}
