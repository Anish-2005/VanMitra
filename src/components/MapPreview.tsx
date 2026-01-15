"use client";

import React, { useEffect, useRef } from "react";
import * as turf from "@turf/turf";

interface Marker { lng: number; lat: number; label?: string; size?: number; color?: string; outline?: string; maxDiameterMeters?: number }

type Layers = { fra?: boolean; boundaries?: boolean | string | string[]; assets?: boolean };

const createMarkerElement = (m: any) => {
  const el = document.createElement("div");
  const size = m.size ?? 24; // default larger for SVG
  const outline = (m as any).outline || '#ecfccb';
  
  el.style.transform = 'translate(-50%, -100%)'; // pin should point to location
  el.style.zIndex = '9999';
  el.dataset.baseSize = String(size);
  el.dataset.outline = outline;
  return el;
};

export default function MapPreview({
  // Default center set to central Madhya Pradesh (approximate)
  center = [78.0, 23.3],
  zoom = 8,
  markers = [],
  layers = { fra: false, boundaries: false, assets: false },
  showCenterMarker = false,
  onFeatureClick,
}: {
  center?: [number, number];
  zoom?: number;
  markers?: Marker[];
  layers?: Layers;
  showCenterMarker?: boolean;
  onFeatureClick?: (info: any) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any | null>(null);
  const createdMarkers = useRef<any[]>([]);
  const createdSources = useRef<Record<string, boolean>>({});
  const createdLayers = useRef<Record<string, boolean>>({});
  const pointerMarkerRef = useRef<any | null>(null);
  const pointerPopupRef = useRef<any | null>(null);
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
        const allMarkers = [...markers];
        if (showCenterMarker) {
          allMarkers.push({
            lng: center[0],
            lat: center[1],
            label: 'Center',
            size: 32,
            color: '#ef4444', // red color for center marker
            outline: '#ffffff'
          });
        }
        allMarkers.forEach((m) => {
          const el = createMarkerElement(m);
          const marker = new maplibregl.Marker({ element: el }).setLngLat([m.lng, m.lat]).addTo(map);
          // attach marker metadata
          try { (marker as any).__markerData = { maxDiameterMeters: (m as any).maxDiameterMeters || 50000 }; } catch {}
          createdMarkers.current.push(marker);
        });
      } catch {
        // ignore marker errors
      }      // zoom-based dynamic sizing for preview markers
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
              const base = Number(el.dataset?.baseSize) || 24;
              const meta = (mk as any).__markerData || { maxDiameterMeters: 50000 };
              const pixelDiameter = Math.max(1, Math.round(meta.maxDiameterMeters / metersPerPixel));
              const pixelRadius = Math.max(3, Math.round(pixelDiameter / 2));
              const clampedSize = Math.max(Math.round(base * 0.6), Math.min(pixelRadius * 2, Math.round(base * 3)));
              const svg = el.querySelector('svg');
              if (svg) {
                svg.setAttribute('width', clampedSize.toString());
                svg.setAttribute('height', clampedSize.toString());
              }
            } catch {}
          });
        } catch {}
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
          // Special handling for boundaries: split into district vs state so we can style them differently
          if (name === 'boundaries' && type === 'line') {
            // Heuristic: single-feature collection -> state boundary, multi-feature -> districts
            const features = geojson && geojson.features ? geojson.features : [];
            const stateFeatures = features.filter((f: any) => f.properties?.level === 'state');
            const districtFeatures = features.filter((f: any) => f.properties?.level === 'district');
            const tehsilFeatures = features.filter((f: any) => f.properties?.level === 'tehsil');

            // If no explicit level props, use length heuristic (fallback)
            if (!stateFeatures.length && !districtFeatures.length && !tehsilFeatures.length) {
              if (features.length === 1) stateFeatures.push(features[0]);
              else if (features.length > 1) districtFeatures.push(...features);
            }

            // Add tehsil first (bottom-most, subtle styling)
            if (tehsilFeatures.length > 0) {
              const srcTehsil = `${sourceId}-tehsil`;
              const layerTehsil = `${layerId}-tehsil`;
              const tehsilGeo = { type: 'FeatureCollection', features: tehsilFeatures };
              if (!map.getSource(srcTehsil)) map.addSource(srcTehsil, { type: 'geojson', data: tehsilGeo });
              createdSources.current[srcTehsil] = true;
              if (!map.getLayer(layerTehsil)) {
                const layerDef: any = { id: layerTehsil, type: 'line', source: srcTehsil };
                layerDef.paint = {
                  'line-color': '#dc2626',
                  'line-width': 0.8,
                  'line-opacity': 0.6,
                };
                map.addLayer(layerDef);
                createdLayers.current[layerTehsil] = true;
              }
            }

            // Add district layer next (less prominent, dashed red)
            if (districtFeatures.length > 0) {
              const srcDistrict = `${sourceId}-district`;
              const layerDistrict = `${layerId}-district`;
              const districtGeo = { type: 'FeatureCollection', features: districtFeatures };
              if (!map.getSource(srcDistrict)) map.addSource(srcDistrict, { type: 'geojson', data: districtGeo });
              createdSources.current[srcDistrict] = true;
              if (!map.getLayer(layerDistrict)) {
                const layerDef: any = { id: layerDistrict, type: 'line', source: srcDistrict };
                layerDef.paint = {
                  'line-color': '#dc2626',
                  'line-width': 1,
                  'line-opacity': 0.7,
                  'line-dasharray': [2, 2]
                };
                map.addLayer(layerDef);
                createdLayers.current[layerDistrict] = true;
              }
            }

            // Add state layer on top (more prominent solid red)
            if (stateFeatures.length > 0) {
              const srcState = `${sourceId}-state`;
              const layerState = `${layerId}-state`;
              const stateGeo = { type: 'FeatureCollection', features: stateFeatures };
              if (!map.getSource(srcState)) map.addSource(srcState, { type: 'geojson', data: stateGeo });
              createdSources.current[srcState] = true;
              if (!map.getLayer(layerState)) {
                const layerDef: any = { id: layerState, type: 'line', source: srcState };
                layerDef.paint = {
                  'line-color': '#dc2626',
                  'line-width': 3,
                  'line-opacity': 1
                };
                map.addLayer(layerDef);
                createdLayers.current[layerState] = true;
              }
            }
          } else {
            map.addSource(sourceId, { type: 'geojson', data: geojson });
            createdSources.current[sourceId] = true;
            const layerDef: any = { id: layerId, type, source: sourceId };
            if (type === 'fill') layerDef.paint = { 'fill-color': '#bbf7d0', 'fill-opacity': 0.4 };
            if (type === 'line') layerDef.paint = { 'line-color': '#16a34a', 'line-width': 2 };
            if (type === 'circle') layerDef.paint = { 'circle-radius': 6, 'circle-color': '#38bdf8' };
            map.addLayer(layerDef);
            createdLayers.current[layerId] = true;
          }

          // attach events for feature interactions
          try {
            // decide clickable layer ids: for boundaries we create sub-layers (tehsil/district/state)
            const clickableLayerIds: string[] = [];
            if (name === 'boundaries' && type === 'line') {
              const layerTehsil = `${layerId}-tehsil`;
              const layerDistrict = `${layerId}-district`;
              const layerState = `${layerId}-state`;
              clickableLayerIds.push(layerTehsil, layerDistrict, layerState);
            } else {
              clickableLayerIds.push(layerId);
            }

            clickableLayerIds.forEach((lid) => {
              try {
                map.on('click', lid, async (e: any) => {
                  if (!(e?.features && e.features.length)) return;
                  const feat = e.features[0];
                  const info = { layer: name, properties: feat.properties, geometry: feat.geometry, point: e.point, lngLat: e.lngLat };
                  if (onFeatureClick) onFeatureClick(info);

                  // create highlight (reuse existing approach)
                  try {
                    const hlSource = 'src-highlight';
                    const hlLayer = 'layer-highlight';
                    try { if (map.getLayer(hlLayer)) map.removeLayer(hlLayer); } catch {}
                    try { if (map.getSource(hlSource)) map.removeSource(hlSource); } catch {}
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
                  } catch {}

                  // fly to feature
                  try { if (e.lngLat && map.flyTo) map.flyTo({ center: e.lngLat, zoom: Math.max(map.getZoom ? map.getZoom() : 12, 12), essential: true }); } catch {}

                  // If this is a tehsil (or tehsil sub-layer), show a popup with name, claim count and sample claims.
                  try {
                    const p = feat.properties || {};
                    const getBoundaryLabel = (p2: any) => {
                      if (!p2) return 'Boundary';
                      const keys = [
                        'name', 'NAME', 'NAME_1', 'NAME_2', 'NAME_0', 'ST_NM', 'STATE_NAME',
                        'state', 'district', 'DISTRICT', 'tehsil', 'TEHSIL', 'subdistrict', 'SUBDIST',
                        '_label', '_name', '_source', 'label'
                      ];
                      for (const k of keys) {
                        const v = p2?.[k];
                        if (v) return v;
                      }
                      // fallback: try to find a short string value in properties
                      for (const v of Object.values(p2 || {})) {
                        if (typeof v === 'string' && v.length > 0 && v.length < 60) return v;
                      }
                      return 'Boundary';
                    };

                    const label = getBoundaryLabel(p) || 'Boundary';
                    const level = (p?.level || lid || '').toString().toLowerCase();
                    const isTehsil = level.includes('tehsil') || String(lid).toLowerCase().includes('tehsil') || String(p?.TEHSIL || p?.tehsil).toLowerCase().includes('tehsil');

                    // remove existing pointer marker/popup
                    try { if (pointerMarkerRef.current) { pointerMarkerRef.current.remove(); pointerMarkerRef.current = null; } } catch  {}
                    try { if (pointerPopupRef.current) { pointerPopupRef.current.remove(); pointerPopupRef.current = null; } } catch  {}

                    // compute centroid for pointer (fallback to click location)
                    let centroid: any = null;
                    try { centroid = turf.centroid(feat); } catch  {}
                    const cenCoords = centroid && centroid.geometry && centroid.geometry.coordinates ? centroid.geometry.coordinates : [e.lngLat.lng, e.lngLat.lat];

                    // create a small pointer SVG (we will embed it into popup HTML so it's always visible)
                    

                    // add a map marker at centroid for visual cue (may be behind popup depending on z-index, so also embed the pin in popup)
                    try {
                      const el = document.createElement('div');
                      el.style.transform = 'translate(-50%, -100%)';
                      el.style.pointerEvents = 'none';
                      el.style.zIndex = '99999';
                      try { if (pointerMarkerRef.current) { pointerMarkerRef.current.remove(); pointerMarkerRef.current = null; } } catch  {}
                      pointerMarkerRef.current = new (window as any).maplibregl.Marker({ element: el, interactive: false }).setLngLat(cenCoords).addTo(map);
                    } catch  {}

                    // create popup at click location with counting placeholder and embedded pin so pointer is visible inside popup
                    const popupHtmlId = `claims-count-${Date.now()}`;
                    const popup = new (window as any).maplibregl.Popup({ offset: 28, maxWidth: '360px' })
                      .setLngLat(e.lngLat)
                      .setHTML(`<div style="min-width:200px;font-size:13px"><div style='display:flex;align-items:center'><strong style='line-height:1.1'>${label}</strong></div><div style="margin-top:6px;font-size:12px;color:#4b5563">${isTehsil ? 'Tehsil' : 'Boundary'}</div><div id='${popupHtmlId}' style='margin-top:8px;font-size:12px;color:#6b7280'>Counting claims…</div></div>`)
                      .addTo(map);
                    pointerPopupRef.current = popup;

                    if (isTehsil) {
                      (async () => {
                        try {
                          const st = p?.state || 'Madhya Pradesh';
                          const q = new URLSearchParams();
                          q.set('state', st);
                          q.set('limit', '10000');
                          const res = await fetch(`/api/claims?${q.toString()}`);
                          if (!res.ok) throw new Error(`HTTP ${res.status}`);
                          const data = await res.json();
                          // Normalize API response into an array of GeoJSON Features
                          let feats: any[] = [];
                          if (data && data.type === 'FeatureCollection' && Array.isArray(data.features)) {
                            feats = data.features
                          } else if (Array.isArray(data)) {
                            feats = data.map((item: any,) => {
                              // If it's already a Feature
                              if (item && item.type === 'Feature' && item.geometry) return item
                              // If it has geometry
                              if (item && item.geometry) return { type: 'Feature', properties: item.properties || item, geometry: item.geometry }
                              // If it has lat/lng fields
                              if (item && (item.lat !== undefined || item.lng !== undefined || item.latitude !== undefined || item.longitude !== undefined)) {
                                const lng = item.lng ?? item.longitude ?? (item.lon ?? item.long ?? null)
                                const lat = item.lat ?? item.latitude ?? null
                                if (lng !== null && lat !== null) return { type: 'Feature', properties: item, geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] } }
                              }
                              // fallback skip
                              return null
                            }).filter(Boolean)
                          } else if (data && data.id) {
                            const item = data
                            if (item.geometry) feats = [{ type: 'Feature', properties: item.properties || item, geometry: item.geometry }]
                            else if (item.lat !== undefined && item.lng !== undefined) feats = [{ type: 'Feature', properties: item, geometry: { type: 'Point', coordinates: [Number(item.lng), Number(item.lat)] } }]
                            else feats = []
                          }

                          // Ensure we have a polygon/multipolygon to test against. If the clicked feature is a LineString (outline), try to fetch the original tehsil polygons and match by properties
                          let polyFeature: any = null;
                          try {
                            if (feat.type === 'Feature' && (feat.geometry?.type === 'Polygon' || feat.geometry?.type === 'MultiPolygon')) {
                              polyFeature = feat;
                            } else if (feat.geometry && (feat.geometry.type === 'Polygon' || feat.geometry.type === 'MultiPolygon')) {
                              polyFeature = { type: 'Feature', properties: feat.properties || {}, geometry: feat.geometry };
                            } else {
                              // try to fetch original tehsil features and match by name/props
                              try {
                                const bres = await fetch(`/api/atlas/boundaries?level=tehsil&state=${encodeURIComponent(st)}`);
                                if (bres.ok) {
                                  const bdata = await bres.json();
                                  const bfeatures: any[] = bdata && bdata.type === 'FeatureCollection' ? bdata.features || [] : [];
                                  const getLabel = (p2: any) => {
                                    if (!p2) return undefined;
                                    return p2.name || p2.NAME || p2.TEHSIL || p2.tehsil || p2._label || p2._name || p2.district || p2.state || undefined;
                                  };
                                  const targetLabel = getLabel(feat.properties) || getLabel(p) || null;
                                      if (targetLabel) {
                                        // try exact or case-insensitive equality first
                                        polyFeature = bfeatures.find((bf) => {
                                          const lbl = getLabel(bf.properties) || '';
                                          if (!lbl) return false;
                                          const a = String(lbl).toLowerCase().trim();
                                          const b = String(targetLabel).toLowerCase().trim();
                                          return a === b || a.includes(b) || b.includes(a);
                                        });
                                      }
                                      // If still not found, try spatial containment using centroid
                                      if (!polyFeature) {
                                        try {
                                          const centroidTest = turf.centroid(feat.geometry && feat.geometry.type ? (feat.type === 'Feature' ? feat : { type: 'Feature', properties: feat.properties || {}, geometry: feat.geometry }) : { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [e.lngLat.lng, e.lngLat.lat] } });
                                          const foundBySpatial = bfeatures.find((bf) => {
                                            try {
                                              if (!bf || !bf.geometry) return false;
                                              return turf.booleanPointInPolygon(centroidTest, bf);
                                            } catch { return false; }
                                          });
                                          if (foundBySpatial) polyFeature = foundBySpatial;
                                        } catch {
                                          // ignore spatial errors
                                        }
                                      }
                                }
                              } catch {
                                // ignore fetch errors, fallback below
                              }
                              // fallback: use clicked geometry as feature (may be a LineString) — boolean checks will likely return false but avoid throwing
                              if (!polyFeature) polyFeature = feat.type === 'Feature' ? feat : { type: 'Feature', properties: feat.properties || {}, geometry: feat.geometry || { type: 'Point', coordinates: [e.lngLat.lng, e.lngLat.lat] } };
                            }
                          } catch {
                            polyFeature = feat.type === 'Feature' ? feat : { type: 'Feature', properties: feat.properties || {}, geometry: feat.geometry || { type: 'Point', coordinates: [e.lngLat.lng, e.lngLat.lat] } };
                          }

                          const matches: any[] = [];
                          for (const f of feats) {
                            try {
                              if (!f || !f.geometry) continue;
                              const gtype = (f.geometry.type || '').toLowerCase();
                              if (gtype === 'point' || gtype === 'multipoint') {
                                const coords = gtype === 'point' ? f.geometry.coordinates : (f.geometry.coordinates && f.geometry.coordinates[0]);
                                if (!coords) continue;
                                const pt = turf.point(coords);
                                try {
                                  if (polyFeature && (polyFeature.geometry?.type === 'Polygon' || polyFeature.geometry?.type === 'MultiPolygon')) {
                                    if (turf.booleanPointInPolygon(pt, polyFeature)) matches.push(f);
                                  } else if (polyFeature) {
                                    // if polyFeature is a linestring or unknown, use a small buffer around the linestring and test intersects
                                    try {
                                      const buf = turf.buffer(polyFeature as any, 0.001, { units: 'kilometers' });
                                      if (buf && turf.booleanPointInPolygon(pt, buf as any)) matches.push(f);
                                    } catch  {
                                      // buffer failed -> skip
                                    }
                                  }
                                } catch {}
                              } else {
                                const featB = f.type === 'Feature' ? f : { type: 'Feature', properties: f.properties || {}, geometry: f.geometry };
                                try {
                                    if (polyFeature && (polyFeature.geometry?.type === 'Polygon' || polyFeature.geometry?.type === 'MultiPolygon')) {
                                      if (turf.booleanIntersects(featB, polyFeature)) matches.push(f);
                                    } else if (polyFeature) {
                                      try {
                                        const buf = turf.buffer(polyFeature as any, 0.001, { units: 'kilometers' });
                                        if (buf && turf.booleanIntersects(featB, buf as any)) matches.push(f);
                                      } catch  {
                                        // buffer failed -> skip
                                      }
                                    }
                                } catch {}
                              }
                            } catch {}
                          }

                          // build html list (limit to 10)
                          const count = matches.length;
                          const items = matches.slice(0, 10).map((m) => {
                            const pid = m.properties?.claim_id ?? m.properties?.id ?? '';
                            const vill = m.properties?.village ?? '';
                            return `<div style='font-size:12px;padding:4px 0;border-bottom:1px dashed #eee'><a href='/atlas/${encodeURIComponent(pid)}' style='color:#0b78ff;text-decoration:none;font-weight:600'>${pid}</a><div style='font-size:11px;color:#6b7280'>${vill}</div></div>`;
                          }).join('');

                          const more = count > 10 ? `<div style='font-size:12px;margin-top:6px;color:#6b7280'>Showing 10 of ${count} claims</div>` : '';
                          const empty = count === 0 ? `<div style='font-size:12px;color:#6b7280'>No claims found inside this tehsil</div>` : '';

                          const html = `<div style="min-width:220px;font-size:13px"><div style='display:flex;align-items:center'><strong style='line-height:1.1'>${label}</strong></div><div style="margin-top:6px;font-size:12px;color:#4b5563">${count} claim${count===1?'':'s'} inside</div><div style='margin-top:8px'>${empty}${items}${more}<div style='margin-top:8px'><a href='/atlas?state=${encodeURIComponent(st)}' style='color:#0b78ff;text-decoration:none'>Open atlas</a></div></div></div>`;

                          try {
                            // update popup content (targeting the generated popup id to avoid race conditions)
                            try {
                              if (pointerPopupRef.current) pointerPopupRef.current.setHTML(html);
                              else {
                                const el = document.getElementById(popupHtmlId);
                                if (el) el.outerHTML = html;
                              }
                            } catch {}
                          } catch {}
                        } catch {
                          try { if (pointerPopupRef.current) pointerPopupRef.current.setHTML(`<div style="min-width:200px;font-size:13px"><strong>${label}</strong><div style='margin-top:8px;font-size:12px;color:#6b7280'>Failed to load claims</div></div>`); } catch {}
                        }
                      })();
                    }
                  } catch  {
                    /* ignore popup errors */
                  }
                });
                map.on('mouseenter', lid, () => { map.getCanvas().style.cursor = 'pointer'; });
                map.on('mouseleave', lid, () => { map.getCanvas().style.cursor = ''; });
              } catch  {}
            });
          } catch  {}
        } catch  {
          // ignore
        }
      };

      // add initial layers per prop
      if (layers.fra) addGeoJSON('fra', '/api/atlas/fra', 'fill');
      if (layers.boundaries) {
        // support boolean (all), string (single level) or array of levels
        if (Array.isArray(layers.boundaries)) {
          layers.boundaries.forEach((lvl) => {
            const url = `/api/atlas/boundaries?level=${encodeURIComponent(lvl)}&state=Madhya Pradesh`;
            addGeoJSON(`boundaries-${lvl}`, url, 'line');
          });
        } else if (typeof layers.boundaries === 'string') {
          const url = `/api/atlas/boundaries?level=${encodeURIComponent(layers.boundaries)}&state=Madhya Pradesh`;
          addGeoJSON(`boundaries-${layers.boundaries}`, url, 'line');
        } else {
          addGeoJSON('boundaries', '/api/atlas/boundaries', 'line');
        }
      }
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
            try { if (map.getLayer(id)) map.removeLayer(id); } catch {}
          });
          Object.keys(createdSources.current).forEach((id) => {
            try { if (map.getSource(id)) map.removeSource(id); } catch {}
          });
          try { if (map.remove) map.remove(); } catch {}
        }
      } catch {}
      if (appended && script && script.parentNode) script.parentNode.removeChild(script);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(center), zoom, JSON.stringify(markers), showCenterMarker]);

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
              // Special case: boundaries line layer -> split into district/state for styling
                if (name === 'boundaries' && type === 'line') {
                const features = geojson && geojson.features ? geojson.features : [];
                const stateFeatures = features.filter((f: any) => f.properties?.level === 'state');
                const districtFeatures = features.filter((f: any) => f.properties?.level === 'district');
                const tehsilFeatures = features.filter((f: any) => f.properties?.level === 'tehsil');
                if (!stateFeatures.length && !districtFeatures.length && !tehsilFeatures.length) {
                  if (features.length === 1) stateFeatures.push(features[0]);
                  else if (features.length > 1) districtFeatures.push(...features);
                }

                if (tehsilFeatures.length > 0) {
                  const srcTehsil = `${sourceId}-tehsil`;
                  const layerTehsil = `${layerId}-tehsil`;
                  const tehsilGeo = { type: 'FeatureCollection', features: tehsilFeatures };
                  if (!map.getSource(srcTehsil)) map.addSource(srcTehsil, { type: 'geojson', data: tehsilGeo });
                  createdSources.current[srcTehsil] = true;
                  if (!map.getLayer(layerTehsil)) {
                    const layerDef: any = { id: layerTehsil, type: 'line', source: srcTehsil };
                    layerDef.paint = { 'line-color': '#dc2626', 'line-width': 0.8, 'line-opacity': 0.6 };
                    map.addLayer(layerDef);
                    createdLayers.current[layerTehsil] = true;
                  }
                }

                if (districtFeatures.length > 0) {
                  const srcDistrict = `${sourceId}-district`;
                  const layerDistrict = `${layerId}-district`;
                  const districtGeo = { type: 'FeatureCollection', features: districtFeatures };
                  if (!map.getSource(srcDistrict)) map.addSource(srcDistrict, { type: 'geojson', data: districtGeo });
                  createdSources.current[srcDistrict] = true;
                  if (!map.getLayer(layerDistrict)) {
                    const layerDef: any = { id: layerDistrict, type: 'line', source: srcDistrict };
                    layerDef.paint = { 'line-color': '#dc2626', 'line-width': 1, 'line-opacity': 0.7, 'line-dasharray': [2,2] };
                    map.addLayer(layerDef);
                    createdLayers.current[layerDistrict] = true;
                  }
                }

                if (stateFeatures.length > 0) {
                  const srcState = `${sourceId}-state`;
                  const layerState = `${layerId}-state`;
                  const stateGeo = { type: 'FeatureCollection', features: stateFeatures };
                  if (!map.getSource(srcState)) map.addSource(srcState, { type: 'geojson', data: stateGeo });
                  createdSources.current[srcState] = true;
                  if (!map.getLayer(layerState)) {
                    const layerDef: any = { id: layerState, type: 'line', source: srcState };
                    layerDef.paint = { 'line-color': '#dc2626', 'line-width': 3, 'line-opacity': 1 };
                    map.addLayer(layerDef);
                    createdLayers.current[layerState] = true;
                  }
                }
              } else {
                const layerDef: any = { id: layerId, type, source: sourceId };
                if (type === 'fill') layerDef.paint = { 'fill-color': '#bbf7d0', 'fill-opacity': 0.4 };
                if (type === 'line') layerDef.paint = { 'line-color': '#16a34a', 'line-width': 2 };
                if (type === 'circle') layerDef.paint = { 'circle-radius': 6, 'circle-color': '#38bdf8' };
                map.addLayer(layerDef);
                createdLayers.current[layerId] = true;
              }
            }
          } catch {}
        }).catch(() => {});
      }
    };

    const removeLayer = (name: string) => {
      const sourceId = `src-${name}`;
      const layerId = `layer-${name}`;
  try { if (map.getLayer(layerId)) map.removeLayer(layerId); } catch {}
  try { if (map.getSource(sourceId)) map.removeSource(sourceId); } catch {}
  // Also remove tehsil/district/state sub-layers/sources for boundaries
  try { if (map.getLayer(`${layerId}-tehsil`)) map.removeLayer(`${layerId}-tehsil`); } catch {}
  try { if (map.getLayer(`${layerId}-district`)) map.removeLayer(`${layerId}-district`); } catch {}
  try { if (map.getLayer(`${layerId}-state`)) map.removeLayer(`${layerId}-state`); } catch {}
  try { if (map.getSource(`${sourceId}-tehsil`)) map.removeSource(`${sourceId}-tehsil`); } catch {}
  try { if (map.getSource(`${sourceId}-district`)) map.removeSource(`${sourceId}-district`); } catch {}
  try { if (map.getSource(`${sourceId}-state`)) map.removeSource(`${sourceId}-state`); } catch {}
      delete createdLayers.current[layerId];
      delete createdSources.current[sourceId];
      try { if (map.getLayer('layer-highlight')) map.removeLayer('layer-highlight'); } catch {}
      try { if (map.getSource('src-highlight')) map.removeSource('src-highlight'); } catch {}
      delete createdLayers.current['layer-highlight'];
      delete createdSources.current['src-highlight'];
    };

    if (prev.fra !== want.fra) { if (want.fra) ensureAdded('fra', '/api/atlas/fra', 'fill'); else removeLayer('fra'); }

    // boundaries: support boolean/string/array
    const prevBound = prev.boundaries;
    const wantBound = want.boundaries;
    const normalize = (b: any) => {
      if (!b) return [] as string[];
      if (Array.isArray(b)) return b as string[];
      if (typeof b === 'string') return [b];
      return ['all'];
    };
    const prevList = normalize(prevBound);
    const wantList = normalize(wantBound);
    // remove boundary layers not in wantList
    prevList.forEach((lvl) => {
      const name = lvl === 'all' ? 'boundaries' : `boundaries-${lvl}`;
      if (!wantList.includes(lvl)) removeLayer(name);
    });
    // add boundary layers in wantList that were not present
    wantList.forEach((lvl) => {
      const name = lvl === 'all' ? 'boundaries' : `boundaries-${lvl}`;
      if (!prevList.includes(lvl)) {
        if (lvl === 'all') ensureAdded('boundaries', '/api/atlas/boundaries', 'line');
        else ensureAdded(name, `/api/atlas/boundaries?level=${encodeURIComponent(lvl)}&state=Madhya Pradesh`, 'line');
      }
    });

    if (prev.assets !== want.assets) { if (want.assets) ensureAdded('assets', '/api/atlas/assets', 'circle'); else removeLayer('assets'); }

    prevLayers.current = { ...want };
  }, [JSON.stringify(layers)]);

  // center/zoom/markers reactive
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    try { map.setCenter(center); } catch {}
    try { map.setZoom && map.setZoom(zoom as any); } catch {}
    try {
      createdMarkers.current.forEach((m) => m.remove && m.remove());
      createdMarkers.current = [];
      const maplibregl = (window as any).maplibregl;
      const allMarkers = [...markers];
      if (showCenterMarker) {
        allMarkers.push({
          lng: center[0],
          lat: center[1],
          label: 'Center',
          size: 32,
          color: '#ef4444', // red color for center marker
          outline: '#ffffff'
        });
      }
      allMarkers.forEach((m: any) => {
        try {
            const el = createMarkerElement(m);
            const marker = new maplibregl.Marker({ element: el }).setLngLat([m.lng, m.lat]).addTo(map);
            createdMarkers.current.push(marker);
          } catch  {}
      });
    } catch {}
  }, [JSON.stringify(center), zoom, JSON.stringify(markers.map((m: any) => [m.lng, m.lat])), showCenterMarker]);

  return <div ref={ref} className="w-full h-full rounded-3xl overflow-hidden bg-emerald-900/95 border border-emerald-700/50 backdrop-blur-sm shadow-2xl" />;
}
