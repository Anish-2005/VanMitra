"use client";

import React, { useEffect, useRef } from "react";

interface Marker { lng: number; lat: number; label?: string }

type Layers = { fra?: boolean; boundaries?: boolean; assets?: boolean };

export default function MapPreview({
  center = [88.8, 21.9],
  zoom = 8,
  markers = [],
  layers = { fra: false, boundaries: false, assets: false },
  onFeatureClick,
}: {
  center?: [number, number];
  zoom?: number;
  markers?: Marker[];
  layers?: Layers;
  onFeatureClick?: (info: any) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any | null>(null);
  const createdMarkers = useRef<any[]>([]);
  const createdSources = useRef<Record<string, boolean>>({});
  const createdLayers = useRef<Record<string, boolean>>({});
  const prevLayers = useRef<any>({ ...layers });

  // initialize map and load maplibre once
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

    const init = () => {
      // @ts-ignore
      const maplibregl = (window as any).maplibregl;
      if (!maplibregl || !ref.current) return;

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

      mapRef.current = map;

  // add initial markers
      try {
        markers.forEach((m) => {
          const el = document.createElement("div");
          const size = typeof (m as any).size === 'number' ? (m as any).size : 12;
          el.dataset.baseSize = String(size);
          el.dataset.outline = (m as any).outline || '#ecfccb';
          el.style.width = `${size}px`;
          el.style.height = `${size}px`;
          el.style.borderRadius = "50%";
          el.style.background = (m as any).color || "#16a34a";
          const outline = (m as any).outline || '#ecfccb';
          const borderThickness = Math.max(1, Math.round(size * 0.12));
          el.style.border = `${borderThickness}px solid ${outline}`;
          el.style.zIndex = '9999';
          el.style.transform = 'translate(-50%, -50%)';
          const marker = new maplibregl.Marker({ element: el }).setLngLat([m.lng, m.lat]).addTo(map);
          // attach marker metadata
          try { (marker as any).__markerData = { maxDiameterMeters: (m as any).maxDiameterMeters || 50000 }; } catch (e) {}
          createdMarkers.current.push(marker);
        });
      } catch (e) {
        // ignore marker errors
      }

      // zoom-based dynamic sizing for preview markers
      const metersPerPixelAt = (lat: number, zoomLevel: number) => {
        return 156543.03392 * Math.cos(lat * Math.PI / 180) / Math.pow(2, zoomLevel);
      };

      const updatePreviewMarkerSizes = () => {
        try {
          const zoom = map.getZoom();
          const center = map.getCenter();
          const metersPerPixel = metersPerPixelAt(center.lat, zoom);
          createdMarkers.current.forEach((mk: any) => {
            try {
              const el = mk.getElement && mk.getElement();
              if (!el) return;
              const base = Number(el.dataset?.baseSize) || parseInt(el.style.width || '12', 10) || 12;
              const outline = el.dataset?.outline || '#ecfccb';
              const meta = (mk as any).__markerData || { maxDiameterMeters: 50000 };
              const pixelDiameter = Math.max(1, Math.round(meta.maxDiameterMeters / metersPerPixel));
              const pixelRadius = Math.max(3, Math.round(pixelDiameter / 2));
              const clampedSize = Math.max(Math.round(base * 0.6), Math.min(pixelRadius * 2, Math.round(base * 3)));
              el.style.width = `${clampedSize}px`;
              el.style.height = `${clampedSize}px`;
              const borderThickness = Math.max(1, Math.round(clampedSize * 0.12));
              el.style.border = `${borderThickness}px solid ${outline}`;
            } catch (err) {}
          });
        } catch (err) {}
      };

      map.on('zoom', updatePreviewMarkerSizes);
      // initialize sizes
      updatePreviewMarkerSizes();

      const addGeoJSON = async (name: string, url: string, type: 'fill' | 'line' | 'circle') => {
        try {
          const sourceId = `src-${name}`;
          const layerId = `layer-${name}`;
          if (createdSources.current[sourceId]) return;
          const res = await fetch(url);
          const geojson = await res.json();
          map.addSource(sourceId, { type: 'geojson', data: geojson });
          createdSources.current[sourceId] = true;
          const layerDef: any = { id: layerId, type, source: sourceId };
          if (type === 'fill') layerDef.paint = { 'fill-color': '#bbf7d0', 'fill-opacity': 0.4 };
          if (type === 'line') layerDef.paint = { 'line-color': '#16a34a', 'line-width': 2 };
          if (type === 'circle') layerDef.paint = { 'circle-radius': 6, 'circle-color': '#38bdf8' };
          map.addLayer(layerDef);
          createdLayers.current[layerId] = true;

          // attach events for feature interactions
          try {
            map.on('click', layerId, (e: any) => {
              if (e?.features && e.features.length) {
                const feat = e.features[0];
                const info = { layer: name, properties: feat.properties, geometry: feat.geometry, point: e.point, lngLat: e.lngLat };
                if (onFeatureClick) onFeatureClick(info);

                // create highlight
                try {
                  const hlSource = 'src-highlight';
                  const hlLayer = 'layer-highlight';
                  try { if (map.getLayer(hlLayer)) map.removeLayer(hlLayer); } catch (er) {}
                  try { if (map.getSource(hlSource)) map.removeSource(hlSource); } catch (er) {}
                  const geom = feat.geometry && Object.keys(feat.geometry).length ? feat.geometry : { type: 'Point', coordinates: [e.lngLat.lng, e.lngLat.lat] };
                  const highlightGeojson: any = { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: geom }] };
                  map.addSource(hlSource, { type: 'geojson', data: highlightGeojson });
                  createdSources.current[hlSource] = true;
                  const hlType = geom.type === 'Point' ? 'circle' : (geom.type === 'Polygon' ? 'fill' : 'line');
                  const hlLayerDef: any = { id: hlLayer, type: hlType, source: hlSource };
                  if (hlType === 'circle') hlLayerDef.paint = { 'circle-radius': 10, 'circle-color': '#f97316', 'circle-opacity': 0.95, 'circle-stroke-color': '#fff', 'circle-stroke-width': 2 };
                  if (hlType === 'fill') hlLayerDef.paint = { 'fill-color': '#f97316', 'fill-opacity': 0.25, 'fill-outline-color': '#fb923c' };
                  if (hlType === 'line') hlLayerDef.paint = { 'line-color': '#f97316', 'line-width': 3 };
                  map.addLayer(hlLayerDef);
                  createdLayers.current[hlLayer] = true;
                } catch (err) {}

                // fly to feature
                try { if (e.lngLat && map.flyTo) map.flyTo({ center: e.lngLat, zoom: Math.max(map.getZoom ? map.getZoom() : 12, 12), essential: true }); } catch (err) {}
              }
            });
            map.on('mouseenter', layerId, () => { map.getCanvas().style.cursor = 'pointer'; });
            map.on('mouseleave', layerId, () => { map.getCanvas().style.cursor = ''; });
          } catch (err) {}
        } catch (e) {
          // ignore
        }
      };

      // add initial layers per prop
      if (layers.fra) addGeoJSON('fra', '/api/atlas/fra', 'fill');
      if (layers.boundaries) addGeoJSON('boundaries', '/api/atlas/boundaries', 'line');
      if (layers.assets) addGeoJSON('assets', '/api/atlas/assets', 'circle');
    };

    if ((window as any).maplibregl) init();
    else if (script) script.addEventListener('load', init);

    return () => {
      try {
        // remove markers
        createdMarkers.current.forEach((m) => m.remove && m.remove());
        createdMarkers.current = [];
        // remove any created layers and sources and destroy map
        const map = mapRef.current;
        if (map) {
          Object.keys(createdLayers.current).forEach((id) => {
            try { if (map.getLayer(id)) map.removeLayer(id); } catch (e) {}
          });
          Object.keys(createdSources.current).forEach((id) => {
            try { if (map.getSource(id)) map.removeSource(id); } catch (e) {}
          });
          try { if (map.remove) map.remove(); } catch (e) {}
        }
      } catch (e) {}
      if (appended && script && script.parentNode) script.parentNode.removeChild(script);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // dynamic layer diff
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const prev = prevLayers.current || {};
    const want = layers || {};

    const ensureAdded = (name: string, url: string, type: 'fill'|'line'|'circle') => {
      const sourceId = `src-${name}`;
      const layerId = `layer-${name}`;
      if (!createdSources.current[sourceId]) {
        fetch(url).then(r => r.json()).then((geojson) => {
          try {
            if (!map.getSource(sourceId)) map.addSource(sourceId, { type: 'geojson', data: geojson });
            createdSources.current[sourceId] = true;
            if (!map.getLayer(layerId)) {
              const layerDef: any = { id: layerId, type, source: sourceId };
              if (type === 'fill') layerDef.paint = { 'fill-color': '#bbf7d0', 'fill-opacity': 0.4 };
              if (type === 'line') layerDef.paint = { 'line-color': '#16a34a', 'line-width': 2 };
              if (type === 'circle') layerDef.paint = { 'circle-radius': 6, 'circle-color': '#38bdf8' };
              map.addLayer(layerDef);
              createdLayers.current[layerId] = true;
            }
          } catch (err) {}
        }).catch(() => {});
      }
    };

    const removeLayer = (name: string) => {
      const sourceId = `src-${name}`;
      const layerId = `layer-${name}`;
      try { if (map.getLayer(layerId)) map.removeLayer(layerId); } catch (e) {}
      try { if (map.getSource(sourceId)) map.removeSource(sourceId); } catch (e) {}
      delete createdLayers.current[layerId];
      delete createdSources.current[sourceId];
      try { if (map.getLayer('layer-highlight')) map.removeLayer('layer-highlight'); } catch (e) {}
      try { if (map.getSource('src-highlight')) map.removeSource('src-highlight'); } catch (e) {}
      delete createdLayers.current['layer-highlight'];
      delete createdSources.current['src-highlight'];
    };

    if (prev.fra !== want.fra) { if (want.fra) ensureAdded('fra', '/api/atlas/fra', 'fill'); else removeLayer('fra'); }
    if (prev.boundaries !== want.boundaries) { if (want.boundaries) ensureAdded('boundaries', '/api/atlas/boundaries', 'line'); else removeLayer('boundaries'); }
    if (prev.assets !== want.assets) { if (want.assets) ensureAdded('assets', '/api/atlas/assets', 'circle'); else removeLayer('assets'); }

    prevLayers.current = { ...want };
  }, [JSON.stringify(layers)]);

  // center/zoom/markers reactive
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    try { map.setCenter(center); } catch (e) {}
    try { map.setZoom && map.setZoom(zoom as any); } catch (e) {}
    try {
      createdMarkers.current.forEach((m) => m.remove && m.remove());
      createdMarkers.current = [];
      // @ts-ignore
      const maplibregl = (window as any).maplibregl;
      markers.forEach((m: any) => {
        try {
            const el = document.createElement("div");
            const size = typeof (m as any).size === 'number' ? (m as any).size : 12;
            el.style.width = `${size}px`;
            el.style.height = `${size}px`;
            el.style.borderRadius = "50%";
            el.style.background = (m as any).color || "#16a34a";
            const outline = (m as any).outline || '#ecfccb';
            const borderThickness = Math.max(1, Math.round(size * 0.12));
            el.style.border = `${borderThickness}px solid ${outline}`;
            const marker = new maplibregl.Marker({ element: el }).setLngLat([m.lng, m.lat]).addTo(map);
            createdMarkers.current.push(marker);
          } catch (err) {}
      });
    } catch (e) {}
  }, [JSON.stringify(center), zoom, JSON.stringify(markers.map((m: any) => [m.lng, m.lat]))]);

  return <div ref={ref} className="w-full h-full rounded-md overflow-hidden" />;
}
