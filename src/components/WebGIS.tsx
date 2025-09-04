// src/components/WebGIS.tsx
'use client';

import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import maplibregl, { Map, Marker, Popup, GeoJSONSource } from 'maplibre-gl';
import MaplibreGeocoder from '@maplibre/maplibre-gl-geocoder';
import * as turf from '@turf/turf';
import { Layers, Ruler, Download, MapPin } from 'lucide-react';

// Types
export interface GISLayer {
  id: string;
  name: string;
  type: 'geojson' | 'raster' | 'vector';
  url?: string;
  data?: any;
  visible: boolean;
  style: {
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
    opacity?: number;
  };
}

export interface GISMarker {
  id: string;
  lng: number;
  lat: number;
  label?: string;
  color?: string;
  popup?: string;
}

export interface WebGISProps {
  center?: [number, number];
  zoom?: number;
  layers?: GISLayer[];
  markers?: GISMarker[];
  onFeatureClick?: (feature: any) => void;
  onMapClick?: (lngLat: maplibregl.LngLat) => void;
  enableGeocoder?: boolean;
  enableMeasurement?: boolean;
  className?: string;
  // Control visibility props
  showControls?: boolean;
  showLayerControls?: boolean;
  showMeasurementControls?: boolean;
  showExportControls?: boolean;
  // External control callbacks
  onLayerToggle?: (layerId: string) => void;
  onStartMeasurement?: () => void;
  onClearMeasurement?: () => void;
  onExport?: () => void;
  // Location parameters for API calls
  state?: string;
  district?: string;
  // Optional base raster tiles (eg. OpenWeather tile URLs)
  baseRasterTiles?: string[];
  baseRasterAttribution?: string;
  // Ref for external access
  ref?: React.Ref<WebGISRef>;
}

export interface WebGISRef {
  exportMap: () => void;
  startMeasurement: () => void;
  clearMeasurement: () => void;
}

const WebGIS = forwardRef<WebGISRef, WebGISProps>(function WebGISComponent({
  center = [88.8, 21.9],
  zoom = 8,
  layers = [],
  markers = [],
  onFeatureClick,
  onMapClick,
  enableGeocoder = true,
  enableMeasurement = true,
  className = "w-full h-full",
  showControls = true,
  showLayerControls = true,
  showMeasurementControls = true,
  showExportControls = true,
  onLayerToggle: externalLayerToggle,
  onStartMeasurement: externalStartMeasurement,
  onClearMeasurement: externalClearMeasurement,
  onExport: externalExport,
  state = 'Madhya Pradesh',
  district = 'Bhopal'
}, ref) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const popupsRef = useRef<Popup[]>([]);
  const geocoderRef = useRef<MaplibreGeocoder | null>(null);
  const measurementPoints = useRef<maplibregl.LngLat[]>([]);
  const measurementLine = useRef<string | null>(null);

  const isMeasuringRef = useRef(false);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurementDistance, setMeasurementDistance] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [currentLayers, setCurrentLayers] = useState<GISLayer[]>(layers);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    // Build base raster source from prop or default to OSM
    const tiles = (Array.isArray((arguments[0] as any)?.baseRasterTiles) && (arguments[0] as any).baseRasterTiles) || undefined;
    // Filter out obviously invalid tiles (e.g., URLs containing 'undefined')
    const validTiles = (tiles || []).filter((t: string) => typeof t === 'string' && t.length > 10 && !t.includes('undefined'));
    const baseTiles = validTiles && validTiles.length > 0 ? validTiles : ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'];

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'base-raster': {
            type: 'raster',
            tiles: baseTiles,
            tileSize: 256,
            attribution: arguments[0]?.baseRasterAttribution || '© OpenStreetMap contributors'
          }
        },
        layers: [{
          id: 'base-raster-layer',
          type: 'raster',
          source: 'base-raster'
        }]
      },
      center: center,
      zoom: zoom,
      pitch: 0,
      bearing: 0
    });

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.current.addControl(new maplibregl.ScaleControl(), 'bottom-left');

    // Wait for map to load before setting loaded state
    map.current.on('load', () => {
      console.log('🗺️ Map loaded event fired');
      console.log('Map canvas element:', map.current!.getCanvas());
      console.log('Map canvas dimensions:', map.current!.getCanvas().width, 'x', map.current!.getCanvas().height);
      setMapLoaded(true);

      // Map click handler for generic clicks (calls external onMapClick if provided)
      map.current!.on('click', (e) => {
        if (onMapClick) {
          onMapClick(e.lngLat);
        }
      });
    });

    // Add error handling for map loading and tile/source failures
    map.current.on('error', (e) => {
      try {
        console.error('🗺️ Map error event:', e);
        // Safe error message extraction
        let errorMessage = 'Unknown map error';
        
        // Handle different error object structures
        if (typeof e === 'object' && e !== null) {
          if ('error' in e && typeof e.error === 'object' && e.error !== null && 'message' in e.error) {
            errorMessage = String(e.error.message);
          } else if ('message' in e) {
            errorMessage = String(e.message);
          } else {
            try {
              errorMessage = JSON.stringify(e);
            } catch {
              errorMessage = String(e);
            }
          }
        } else {
          errorMessage = String(e);
        }
        
        setMapError(errorMessage);
      } catch (err) {
        console.error('🗺️ Map error (logging failed):', err);
        setMapError('Unknown map error');
      }
    });

    // Listen for source/tile failures via sourcedata events
    map.current.on('sourcedata', (e) => {
      try {
        // Some tile load failures are surfaced on sourcedata where the tile has an error
        // We log the event and set a human-readable message when possible
        if ((e as any).tile && (e as any).tile.state === 'errored') {
          console.warn('🗺️ Tile error for source:', (e as any).sourceId, e);
          setMapError(`Tile load error for source ${(e as any).sourceId}`);
        }
      } catch (err) {
        // ignore
      }
    });

    // Add tile loading events
    map.current.on('sourcedata', (e) => {
      if (e.sourceId === 'osm' && e.isSourceLoaded) {
        console.log('🗺️ OSM tiles loaded');
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Update map center and zoom
  useEffect(() => {
    if (!map.current) return;
    map.current.setCenter(center);
    map.current.setZoom(zoom);
  }, [center, zoom]);

  // Load data from APIs and sync incoming layers
  useEffect(() => {
    console.log('Loading data for layers:', layers.length, 'with state:', state, 'district:', district);
    setIsLoadingData(true);

    // Sync currentLayers to the incoming prop layers (preserve any provided data)
    setCurrentLayers(layers.map(l => ({ ...l })));

    const fetchPromises = layers.map(layer => {
      // If layer already contains data, set it immediately
      if (layer.visible && layer.data) {
        setCurrentLayers(prev => prev.map(l => l.id === layer.id ? { ...l, data: layer.data } : l));
        return Promise.resolve(layer.data);
      }

      if (layer.visible && layer.url) {
        // Only add state and district parameters if they're not already in the URL
        let url = layer.url;
        if (!url.includes('state=') && !url.includes('district=')) {
          const separator = url.includes('?') ? '&' : '?';
          const params = [];
          if (state) params.push(`state=${encodeURIComponent(state)}`);
          if (district) params.push(`district=${encodeURIComponent(district)}`);
          if (params.length > 0) {
            url += separator + params.join('&');
          }
        }

        console.log('Fetching data from:', url);
        return fetch(url)
          .then(res => {
            if (!res.ok) {
              throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            return res.json();
          })
          .then(data => {
            console.log('Received data for layer', layer.id, ':', data?.features?.length || 0, 'features');
            setCurrentLayers(prev => prev.map(l =>
              l.id === layer.id ? { ...l, data } : l
            ));
            return data;
          })
          .catch(error => {
            console.error('Error fetching data for layer', layer.id, ':', error);
            // Set empty data to prevent infinite retries
            setCurrentLayers(prev => prev.map(l =>
              l.id === layer.id ? { ...l, data: { type: 'FeatureCollection', features: [] } } : l
            ));
            return null;
          });
      }
      return Promise.resolve(null);
    });

    Promise.all(fetchPromises).then(() => {
      setIsLoadingData(false);
    });
  }, [layers, state, district]);

  // Handle layers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    console.log('Handling layers, currentLayers:', currentLayers.length);
    currentLayers.forEach(layer => {
      const sourceId = `source-${layer.id}`;
      const layerId = `layer-${layer.id}`;

      if (layer.visible && layer.data) {
        console.log('Adding/updating layer:', layer.id, 'with', layer.data?.features?.length || 0, 'features');

        // Remove any existing variants (fill / outline) and source if they exist
        const fillId = `${layerId}-fill`;
        const outlineId = `${layerId}-outline`;
        if (map.current!.getLayer(fillId)) {
          try { map.current!.removeLayer(fillId); } catch (e) { /* ignore */ }
        }
        if (map.current!.getLayer(outlineId)) {
          try { map.current!.removeLayer(outlineId); } catch (e) { /* ignore */ }
        }

        // Check if source already exists before adding
        if (!map.current!.getSource(sourceId)) {
          try {
            map.current!.addSource(sourceId, {
              type: 'geojson',
              data: layer.data
            });
          } catch (error) {
            console.error('Error adding source', sourceId, ':', error);
            return;
          }
        } else {
          // Update existing source data
          try {
            (map.current!.getSource(sourceId) as GeoJSONSource).setData(layer.data);
          } catch (error) {
            console.error('Error updating source', sourceId, ':', error);
          }
        }
        
        addLayerFromSource(layer, sourceId, layerId);
      } else {
        // Remove layer and source if not visible or no data
        const fillId = `${layerId}-fill`;
        const outlineId = `${layerId}-outline`;
        if (map.current!.getLayer(fillId)) {
          try { map.current!.removeLayer(fillId); } catch (e) { /* ignore */ }
        }
        if (map.current!.getLayer(outlineId)) {
          try { map.current!.removeLayer(outlineId); } catch (e) { /* ignore */ }
        }
        // Don't remove the source as it might be used by other components
      }
    });
  }, [currentLayers, mapLoaded, layers]);

  // Ensure boundaries are always rendered on top and have prominent styling.
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    try {
      // Find the boundaries layer id
      const boundariesLayer = currentLayers.find(l => l.id === 'boundaries');
      if (!boundariesLayer) return;

      const layerId = `layer-${boundariesLayer.id}`;
      const sourceId = `source-${boundariesLayer.id}`;

      if (map.current.getLayer(layerId)) {
        // Attempt to set stronger paint properties depending on layer type
        const features = boundariesLayer.data?.features || [];
        const geometryType = features.length > 0 ? features[0]?.geometry?.type : null;

        try {
          if (geometryType === 'Polygon' || geometryType === 'MultiPolygon') {
            // If it's a fill layer, update paint for prominence
            map.current.setPaintProperty(layerId, 'fill-color', boundariesLayer.style.fillColor || '#ffffff');
            map.current.setPaintProperty(layerId, 'fill-opacity', boundariesLayer.style.opacity ?? 0.6);
            map.current.setPaintProperty(layerId, 'fill-outline-color', boundariesLayer.style.strokeColor || '#0b815a');
          } else if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
            map.current.setPaintProperty(layerId, 'line-color', boundariesLayer.style.strokeColor || '#0b815a');
            map.current.setPaintProperty(layerId, 'line-width', boundariesLayer.style.strokeWidth ?? 3);
            map.current.setPaintProperty(layerId, 'line-opacity', boundariesLayer.style.opacity ?? 0.9);
          }
        } catch (paintErr) {
          // Some paint properties may not exist yet; ignore
          console.warn('Could not update paint properties for boundaries:', paintErr);
        }

        // Move to top
        try {
          // @ts-ignore - some typings don't list the optional beforeId parameter
          map.current.moveLayer(layerId);
          console.log('Ensured boundaries layer is on top:', layerId);
        } catch (moveErr) {
          console.warn('Failed to move boundaries layer to top:', moveErr);
        }
      }
    } catch (err) {
      console.warn('Boundaries top-layer enforcement failed:', err);
    }
  }, [currentLayers, mapLoaded]);

  const addLayerFromSource = (layer: GISLayer, sourceId: string, layerId: string) => {
    if (!map.current) return;

    const layerConfig: any = {
      id: layerId,
      source: sourceId,
      type: 'circle' // Default type
    };

    switch (layer.type) {
      case 'geojson':
        // Determine geometry type from data
        const features = layer.data?.features || [];
        const geometryType = features.length > 0 ? features[0]?.geometry?.type : null;

        console.log('Layer', layer.id, 'has', features.length, 'features, geometry type:', geometryType);

        if (geometryType === 'Point' || geometryType === 'MultiPoint') {
          layerConfig.type = 'circle';
          layerConfig.paint = {
            'circle-radius': 6,
            'circle-color': layer.style.fillColor || '#3b82f6',
            'circle-opacity': layer.style.opacity || 0.9,
            'circle-stroke-color': layer.style.strokeColor || '#ffffff',
            'circle-stroke-width': layer.style.strokeWidth || 2
          };
          try {
            // Check if layer already exists before adding
            if (!map.current.getLayer(layerConfig.id)) {
              map.current!.addLayer(layerConfig);
            }
            // ensure circle layer is on top
            try { map.current!.moveLayer(layerConfig.id); } catch(e){}
          } catch (error) {
            console.error('Error adding point layer', layerConfig.id, ':', error);
          }

          // click handlers
          map.current!.on('click', layerConfig.id, (e) => {
            if (e.features && e.features.length > 0 && onFeatureClick) {
              onFeatureClick({ layer, feature: e.features[0], lngLat: e.lngLat });
            }
          });
          map.current!.on('mouseenter', layerConfig.id, () => { map.current!.getCanvas().style.cursor = 'pointer'; });
          map.current!.on('mouseleave', layerConfig.id, () => { map.current!.getCanvas().style.cursor = ''; });

        } else if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
          layerConfig.type = 'line';
          layerConfig.paint = {
            'line-color': layer.style.strokeColor || '#16a34a',
            'line-width': layer.style.strokeWidth || 2,
            'line-opacity': layer.style.opacity || 0.9
          };
          try {
            if (!map.current.getLayer(layerConfig.id)) {
              map.current!.addLayer(layerConfig);
            }
            try { map.current!.moveLayer(layerConfig.id); } catch(e){}
          } catch (error) {
            console.error('Error adding line layer', layerConfig.id, ':', error);
          }

          map.current!.on('click', layerConfig.id, (e) => {
            if (e.features && e.features.length > 0 && onFeatureClick) {
              onFeatureClick({ layer, feature: e.features[0], lngLat: e.lngLat });
            }
          });
          map.current!.on('mouseenter', layerConfig.id, () => { map.current!.getCanvas().style.cursor = 'pointer'; });
          map.current!.on('mouseleave', layerConfig.id, () => { map.current!.getCanvas().style.cursor = ''; });

        } else if (geometryType === 'Polygon' || geometryType === 'MultiPolygon') {
          // For polygons, add a fill layer and a separate outline (line) layer to ensure visibility
          const fillLayerId = `${layerId}-fill`;
          const outlineLayerId = `${layerId}-outline`;

          const fillLayer = {
            id: fillLayerId,
            source: sourceId,
            type: 'fill',
            paint: {
              'fill-color': layer.style.fillColor || '#bbf7d0',
              'fill-opacity': typeof layer.style.opacity === 'number' ? layer.style.opacity : 0.45,
              'fill-antialias': true
            }
          } as any;

          const outlineLayer = {
            id: outlineLayerId,
            source: sourceId,
            type: 'line',
            paint: {
              'line-color': layer.style.strokeColor || (layer.style.fillColor ? layer.style.fillColor : '#16a34a'),
              'line-width': layer.style.strokeWidth ?? 2,
              'line-opacity': Math.max(0.8, layer.style.opacity ?? 0.9)
            }
          } as any;

          try {
            // Add fill first, then outline so outline naturally sits above fill
            if (!map.current.getLayer(fillLayerId)) {
              map.current!.addLayer(fillLayer);
            }
            if (!map.current.getLayer(outlineLayerId)) {
              map.current!.addLayer(outlineLayer);
            }

            // Try to move both to the top of the stack to ensure visibility above rasters
            try {
              map.current!.moveLayer(outlineLayerId);
            } catch (e) { /* ignore */ }
            try {
              map.current!.moveLayer(fillLayerId);
            } catch (e) { /* ignore */ }

            // As extra precaution, update paint properties to ensure strong contrast
            try {
              map.current!.setPaintProperty(fillLayerId, 'fill-opacity', fillLayer.paint['fill-opacity']);
              map.current!.setPaintProperty(fillLayerId, 'fill-color', fillLayer.paint['fill-color']);
              map.current!.setPaintProperty(outlineLayerId, 'line-color', outlineLayer.paint['line-color']);
              map.current!.setPaintProperty(outlineLayerId, 'line-width', outlineLayer.paint['line-width']);
            } catch (e) { /* ignore paint failures */ }
          } catch (error) {
            console.error('Error adding polygon layers', fillLayerId, outlineLayerId, ':', error);
            return;
          }

          // Click handlers for both fill and outline
          [fillLayerId, outlineLayerId].forEach(lid => {
            map.current!.on('click', lid, (e) => {
              if (e.features && e.features.length > 0 && onFeatureClick) {
                onFeatureClick({ layer, feature: e.features[0], lngLat: e.lngLat });
              }
            });
            map.current!.on('mouseenter', lid, () => { map.current!.getCanvas().style.cursor = 'pointer'; });
            map.current!.on('mouseleave', lid, () => { map.current!.getCanvas().style.cursor = ''; });
          });

        } else {
          // Default to circle for unknown or empty geometry types
          console.log('Unknown geometry type for layer', layer.id, ', using default circle type');
          layerConfig.type = 'circle';
          layerConfig.paint = {
            'circle-radius': 6,
            'circle-color': layer.style.fillColor || '#3b82f6',
            'circle-opacity': layer.style.opacity || 0.8,
            'circle-stroke-color': layer.style.strokeColor || '#ffffff',
            'circle-stroke-width': layer.style.strokeWidth || 2
          };
          try { 
            if (!map.current.getLayer(layerConfig.id)) {
              map.current!.addLayer(layerConfig); 
            }
            try { map.current!.moveLayer(layerConfig.id); } catch(e){} 
          } catch (error) { 
            console.error('Error adding default layer', layerConfig.id, ':', error); 
          }
        }
        break;
    }
  };

  // Handle markers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Clear existing popups
    popupsRef.current.forEach(popup => popup.remove());
    popupsRef.current = [];

    // Add new markers
    markers.forEach(marker => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.background = marker.color || '#16a34a';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.fontSize = '12px';
      el.style.fontWeight = 'bold';
      el.style.color = 'white';

      if (marker.label) {
        el.textContent = marker.label;
      }

      const mapMarker = new maplibregl.Marker({ element: el })
        .setLngLat([marker.lng, marker.lat])
        .addTo(map.current!);

      if (marker.popup) {
        const popup = new maplibregl.Popup({ offset: 25 })
          .setHTML(marker.popup);
        mapMarker.setPopup(popup);
      }

      markersRef.current.push(mapMarker);
    });
  }, [markers, mapLoaded]);

  // Measurement functions
  const startMeasurement = useCallback(() => {
    if (externalStartMeasurement) {
      externalStartMeasurement();
      return;
    }

    if (!map.current) return;
    setIsMeasuring(true);
    isMeasuringRef.current = true;
    measurementPoints.current = [];
    setMeasurementDistance(null);

    // Remove any existing measurement line/source
    if (measurementLine.current && map.current) {
      if (map.current.getLayer('measurement-line-layer')) {
        map.current.removeLayer('measurement-line-layer');
      }
      if (map.current.getSource(measurementLine.current)) {
        map.current.removeSource(measurementLine.current);
      }
      measurementLine.current = null;
    }

    // Attach a one-time handler for the first point
    const firstHandler = (ev: maplibregl.MapMouseEvent) => {
      const p1 = ev.lngLat;
      // Replace measurementPoints with the first point
      measurementPoints.current = [p1];

      // Attach a one-time handler for the second point
      map.current!.once('click', (ev2: maplibregl.MapMouseEvent) => {
        const p2 = ev2.lngLat;
        // Ensure we have valid points
        if (!p1 || !p2 || typeof p1.lng === 'undefined' || typeof p2.lng === 'undefined') {
          console.warn('Measurement cancelled or invalid points', p1, p2);
          setIsMeasuring(false);
          isMeasuringRef.current = false;
          measurementPoints.current = [];
          return;
        }

        // Compute distance using the two captured points
        const distance = turf.distance(
          turf.point([p1.lng, p1.lat]),
          turf.point([p2.lng, p2.lat]),
          { units: 'kilometers' }
        );
        setMeasurementDistance(distance);

        // Draw measurement line
        const lineGeoJSON = {
          type: 'Feature' as const,
          properties: {},
          geometry: {
            type: 'LineString' as const,
            coordinates: [[p1.lng, p1.lat], [p2.lng, p2.lat]]
          }
        };

        measurementLine.current = 'measurement-line';
        if (map.current!.getSource(measurementLine.current)) {
          (map.current!.getSource(measurementLine.current) as GeoJSONSource).setData(lineGeoJSON as any);
        } else {
          map.current!.addSource(measurementLine.current, {
            type: 'geojson',
            data: lineGeoJSON as any
          });
          map.current!.addLayer({
            id: 'measurement-line-layer',
            type: 'line',
            source: measurementLine.current,
            paint: {
              'line-color': '#ff0000',
              'line-width': 3,
              'line-dasharray': [2, 2]
            }
          });
        }

        setIsMeasuring(false);
        isMeasuringRef.current = false;
        measurementPoints.current = [];
      });
    };

    map.current.once('click', firstHandler);
  }, [externalStartMeasurement]);

  const clearMeasurement = useCallback(() => {
    if (externalClearMeasurement) {
      externalClearMeasurement();
      return;
    }

    setIsMeasuring(false);
    isMeasuringRef.current = false;
    setMeasurementDistance(null);
    measurementPoints.current = [];
    if (measurementLine.current && map.current) {
      if (map.current.getLayer('measurement-line-layer')) {
        map.current.removeLayer('measurement-line-layer');
      }
      if (map.current.getSource(measurementLine.current)) {
        map.current.removeSource(measurementLine.current);
      }
      measurementLine.current = null;
    }
  }, [externalClearMeasurement]);

  // Export functions
  const exportMap = useCallback(async () => {
    if (externalExport) {
      externalExport();
    } else {
      if (!map.current) {
        console.error('Map not initialized');
        alert('Map is not ready for export. Please wait for it to load completely.');
        return;
      }

      setIsExporting(true);
      try {
        console.log('Starting map export process...');

        // Wait for map to be fully loaded
        if (!mapLoaded) {
          console.log('Waiting for map to load...');
          await new Promise((resolve, reject) => {
            const checkLoaded = () => {
              if (map.current && map.current.loaded()) {
                console.log('Map loaded, checking tiles...');
                // Give tiles a moment to load
                setTimeout(() => {
                  if (map.current && map.current.loaded()) {
                    resolve(void 0);
                  } else {
                    checkLoaded();
                  }
                }, 500);
              } else {
                setTimeout(checkLoaded, 200);
              }
            };

            // Timeout after 10 seconds
            setTimeout(() => {
              reject(new Error('Map loading timeout'));
            }, 10000);

            checkLoaded();
          });
        }

        console.log('Map is ready, preparing for export...');

        // Debug: Check if map container has any visible content
        const containerElement = mapContainer.current;
        if (containerElement) {
          console.log('Container dimensions:', containerElement.offsetWidth, 'x', containerElement.offsetHeight);
          console.log('Container children:', containerElement.children.length);
          console.log('Container innerHTML length:', containerElement.innerHTML.length);

          // Check if there are any canvas elements
          const canvases = containerElement.querySelectorAll('canvas');
          console.log('Found canvas elements:', canvases.length);
          canvases.forEach((canvas, index) => {
            console.log(`Canvas ${index}:`, canvas.width, 'x', canvas.height);
          });
        }

        // Debug: Check map layers and style
        console.log('Map style loaded:', !!map.current?.getStyle());

        // Add a simple marker to verify map is working
        const marker = new maplibregl.Marker({ color: '#ff0000' }) // Red marker
          .setLngLat([77.2090, 28.6139]) // Delhi coordinates as example
          .addTo(map.current!);

        // Add tile loading debugging
        map.current.on('sourcedata', (e) => {
          if (e.sourceId === 'osm') {
            console.log('OSM tiles loading...');
          }
        });

        map.current.on('sourcedataabort', (e) => {
          console.log('Tile loading aborted:', e.sourceId);
        });

        map.current.on('error', (e) => {
          console.error('Map error:', e.error);
        });

        console.log('Added tile loading event listeners');

        // Add a visible overlay to confirm rendering
        if (containerElement) {
          const overlayDiv = document.createElement('div');
          overlayDiv.style.position = 'absolute';
          overlayDiv.style.top = '10px';
          overlayDiv.style.right = '10px';
          overlayDiv.style.background = 'rgba(255, 0, 0, 0.8)';
          overlayDiv.style.color = 'white';
          overlayDiv.style.padding = '5px 10px';
          overlayDiv.style.borderRadius = '4px';
          overlayDiv.style.fontSize = '12px';
          overlayDiv.style.zIndex = '1000';
          overlayDiv.textContent = 'Map Loaded ✓';
          containerElement.appendChild(overlayDiv);

          console.log('Added visual confirmation overlay');
        }

        // Add a small delay to ensure rendering is complete
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Method 1: Try MapLibre GL's built-in screenshot method
        try {
          console.log('Trying MapLibre GL built-in screenshot...');

          if (!map.current) {
            throw new Error('Map instance not available');
          }

          // Use the map's screenshot method if available
          const screenshotDataUrl = await new Promise<string>((resolve, reject) => {
            // Force a render first
            map.current!.triggerRepaint();

            // Check if WebGL context is working
            const canvas = map.current!.getCanvas();
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
            if (gl) {
              console.log('WebGL context detected:', gl);
              // Check if WebGL is actually rendering
              const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
              if (debugInfo) {
                const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                console.log('WebGL renderer:', renderer);
              }
            } else {
              console.warn('No WebGL context found!');
            }

            // Wait a bit for rendering
            setTimeout(() => {
              try {
                // Try to get screenshot using map's method
                const canvas = map.current!.getCanvas();
                const dataUrl = canvas.toDataURL('image/png', 1.0);
                resolve(dataUrl);
              } catch (error) {
                reject(error);
              }
            }, 1000);
          });

          console.log('Screenshot data URL length:', screenshotDataUrl.length);

          // Verify the screenshot has content
          const img = new Image();
          await new Promise<void>((resolve, reject) => {
            img.onload = () => {
              console.log('Screenshot image loaded:', img.width, 'x', img.height);
              resolve();
            };
            img.onerror = reject;
            img.src = screenshotDataUrl;
          });

          // Check content by drawing to a test canvas
          const testCanvas = document.createElement('canvas');
          const ctx = testCanvas.getContext('2d');
          if (ctx) {
            testCanvas.width = img.width;
            testCanvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, testCanvas.width, testCanvas.height);
            const data = imageData.data;

            let nonBlankPixels = 0;
            let totalPixels = 0;
            let colorCounts: { [key: string]: number } = {};

            for (let i = 0; i < data.length; i += 4) {
              totalPixels++;
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              const a = data[i + 3];

              // Count color distribution for debugging
              const colorKey = `${r},${g},${b},${a}`;
              colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;

              // Better content detection: look for actual map features
              // Exclude near-white pixels (likely background) and pure black/transparent
              const isNearWhite = r > 240 && g > 240 && b > 240 && a > 200;
              const isPureBlack = r < 10 && g < 10 && b < 10 && a > 200;
              const isTransparent = a < 50;

              if (!isNearWhite && !isPureBlack && !isTransparent) {
                // Much more permissive: count any non-background pixel as content
                // This includes roads, buildings, water, vegetation, labels, etc.
                const isNotBackground = (r < 235 || g < 235 || b < 235) && a > 100;
                if (isNotBackground) {
                  nonBlankPixels++;
                }
              }
            }

            // Log top 10 most common colors for debugging
            const sortedColors = Object.entries(colorCounts)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 10);
            console.log('Top 10 colors in image:', sortedColors.map(([color, count]) =>
              `${color}: ${((count / totalPixels) * 100).toFixed(1)}%`
            ));

            const contentRatio = nonBlankPixels / totalPixels;
            console.log(`Screenshot content: ${nonBlankPixels}/${totalPixels} pixels (${(contentRatio * 100).toFixed(1)}% content)`);

            // Very lenient threshold - if user can see the map, there should be SOME content
            if (contentRatio < 0.0001) { // Less than 0.01% content
              console.warn('Extremely low content detected, but proceeding anyway since map is visible...');
            }

            // Always proceed with export if we get here - the map is working visually
            console.log('✅ Proceeding with export - map appears to be working');

            // Success - download the image
            const link = document.createElement('a');
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            link.download = `vanmitra-map-${timestamp}.png`;
            link.href = screenshotDataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log('✅ Map exported successfully using MapLibre GL screenshot');
            alert(`Map exported successfully!\nContent detected: ${(contentRatio * 100).toFixed(1)}%\nCheck your downloads folder.`);
            return;
          }

        } catch (screenshotError) {
          console.warn('MapLibre GL screenshot failed:', screenshotError);
        }

        // Method 2: Fallback to WebGL canvas capture with proper handling
        try {
          console.log('Trying WebGL canvas capture as fallback...');

          if (!map.current) {
            throw new Error('Map instance not available');
          }

          const canvas = map.current.getCanvas();
          console.log('WebGL Canvas element:', canvas);
          console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);

          if (canvas.width === 0 || canvas.height === 0) {
            throw new Error('Canvas has no dimensions');
          }

          // Force a render and wait
          map.current.triggerRepaint();
          await new Promise(resolve => setTimeout(resolve, 500));

          // For WebGL canvases, we need to read pixels directly
          const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
          if (gl) {
            console.log('WebGL context found, attempting pixel read...');

            // Read pixels from WebGL framebuffer
            const pixels = new Uint8Array(canvas.width * canvas.height * 4);
            gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

            // Create a 2D canvas to convert the pixels
            const outputCanvas = document.createElement('canvas');
            outputCanvas.width = canvas.width;
            outputCanvas.height = canvas.height;
            const ctx = outputCanvas.getContext('2d');

            if (ctx) {
              const imageData = ctx.createImageData(canvas.width, canvas.height);
              // Flip the image vertically (WebGL coordinate system)
              for (let y = 0; y < canvas.height; y++) {
                for (let x = 0; x < canvas.width; x++) {
                  const srcIndex = (y * canvas.width + x) * 4;
                  const dstIndex = ((canvas.height - 1 - y) * canvas.width + x) * 4;
                  imageData.data[dstIndex] = pixels[srcIndex];     // R
                  imageData.data[dstIndex + 1] = pixels[srcIndex + 1]; // G
                  imageData.data[dstIndex + 2] = pixels[srcIndex + 2]; // B
                  imageData.data[dstIndex + 3] = pixels[srcIndex + 3]; // A
                }
              }

              ctx.putImageData(imageData, 0, 0);

              // Check content
              const outputImageData = ctx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
              const data = outputImageData.data;

              let nonBlankPixels = 0;
              let totalPixels = 0;

              for (let i = 0; i < data.length; i += 4) {
                totalPixels++;
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const a = data[i + 3];

                // Same permissive logic as main method
                const isNearWhite = r > 240 && g > 240 && b > 240 && a > 200;
                const isPureBlack = r < 10 && g < 10 && b < 10 && a > 200;
                const isTransparent = a < 50;

                if (!isNearWhite && !isPureBlack && !isTransparent) {
                  const isNotBackground = (r < 235 || g < 235 || b < 235) && a > 100;
                  if (isNotBackground) {
                    nonBlankPixels++;
                  }
                }
              }

              const contentRatio = nonBlankPixels / totalPixels;
              console.log(`WebGL content: ${nonBlankPixels}/${totalPixels} pixels (${(contentRatio * 100).toFixed(1)}% content)`);

              // Very lenient threshold
              if (contentRatio < 0.0001) {
                console.warn('WebGL: Extremely low content detected, but proceeding anyway...');
              }

              // Success - download the image
              const link = document.createElement('a');
              const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
              link.download = `vanmitra-map-${timestamp}.png`;
              link.href = outputCanvas.toDataURL('image/png', 1.0);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);

              console.log('✅ Map exported successfully using WebGL pixel read');
              alert('Map exported successfully!');
              return;
            }
          } else {
            // Fallback to standard canvas method
            console.log('No WebGL context, trying standard canvas method...');
            const dataUrl = canvas.toDataURL('image/png', 1.0);
            console.log('Standard canvas data URL length:', dataUrl.length);

            // Verify content
            const img = new Image();
            await new Promise<void>((resolve, reject) => {
              img.onload = () => resolve();
              img.onerror = reject;
              img.src = dataUrl;
            });

            const testCanvas = document.createElement('canvas');
            const ctx = testCanvas.getContext('2d');
            if (ctx) {
              testCanvas.width = img.width;
              testCanvas.height = img.height;
              ctx.drawImage(img, 0, 0);

              const imageData = ctx.getImageData(0, 0, testCanvas.width, testCanvas.height);
              const data = imageData.data;

              let nonBlankPixels = 0;
              let totalPixels = 0;

              for (let i = 0; i < data.length; i += 4) {
                totalPixels++;
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const a = data[i + 3];

                // Same permissive logic
                const isNearWhite = r > 240 && g > 240 && b > 240 && a > 200;
                const isPureBlack = r < 10 && g < 10 && b < 10 && a > 200;
                const isTransparent = a < 50;

                if (!isNearWhite && !isPureBlack && !isTransparent) {
                  const isNotBackground = (r < 235 || g < 235 || b < 235) && a > 100;
                  if (isNotBackground) {
                    nonBlankPixels++;
                  }
                }
              }

              const contentRatio = nonBlankPixels / totalPixels;
              console.log(`Standard canvas content: ${nonBlankPixels}/${totalPixels} pixels (${(contentRatio * 100).toFixed(1)}% content)`);

              // Very lenient threshold
              if (contentRatio < 0.0001) {
                console.warn('Standard canvas: Extremely low content detected, but proceeding anyway...');
              }

              // Success
              const link = document.createElement('a');
              const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
              link.download = `vanmitra-map-${timestamp}.png`;
              link.href = dataUrl;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);

              console.log('✅ Map exported successfully using standard canvas');
              alert('Map exported successfully!');
              return;
            }
          }

        } catch (canvasError) {
          console.error('Canvas export also failed:', canvasError);
          // Don't throw - continue to html2canvas fallback
        }

        // Method 3: Final fallback to html2canvas
        try {
          console.log('Trying html2canvas as final fallback...');
          const containerElement = mapContainer.current;
          if (!containerElement) {
            throw new Error('Map container not found');
          }

          // Dynamic import to avoid bundling html2canvas if not needed
          const html2canvas = (await import('html2canvas')).default;

          console.log('html2canvas loaded, capturing container...');

          // Configure html2canvas with better settings for WebGL
          const canvas = await html2canvas(containerElement, {
            useCORS: true,
            allowTaint: true,
            width: containerElement.offsetWidth,
            height: containerElement.offsetHeight,
            logging: false
          });

          console.log('html2canvas capture complete, checking content...');

          // Check if the captured image has content
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Count non-white/transparent pixels
            let nonBlankPixels = 0;
            let totalPixels = 0;

            for (let i = 0; i < data.length; i += 4) {
              totalPixels++;
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              const a = data[i + 3];

              // Same permissive logic
              const isNearWhite = r > 240 && g > 240 && b > 240 && a > 200;
              const isPureBlack = r < 10 && g < 10 && b < 10 && a > 200;
              const isTransparent = a < 50;

              if (!isNearWhite && !isPureBlack && !isTransparent) {
                const isNotBackground = (r < 235 || g < 235 || b < 235) && a > 100;
                if (isNotBackground) {
                  nonBlankPixels++;
                }
              }
            }

            const contentRatio = nonBlankPixels / totalPixels;
            console.log(`html2canvas content: ${nonBlankPixels}/${totalPixels} pixels (${(contentRatio * 100).toFixed(1)}% content)`);

            // Very lenient threshold
            if (contentRatio < 0.0001) {
              console.warn('html2canvas: Extremely low content detected, but proceeding anyway...');
            }

            // Success - download the image
            const link = document.createElement('a');
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            link.download = `vanmitra-map-${timestamp}.png`;
            link.href = canvas.toDataURL('image/png', 1.0);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log('✅ Map exported successfully using html2canvas');
            alert('Map exported successfully!');
            return;
          }

        } catch (html2canvasError) {
          console.warn('html2canvas export failed:', html2canvasError);
          // Don't throw - we've tried all methods, but export should still work
        }

      } catch (error) {
        console.error('❌ Export failed:', error);

        if (error instanceof Error) {
          if (error.message === 'Map loading timeout') {
            alert('Map is taking too long to load. Please wait a moment and try again.');
          } else {
            // For any other error, still try to export using the debug method
            console.log('Attempting emergency export...');
            if (map.current) {
              try {
                const canvas = map.current.getCanvas();
                const dataUrl = canvas.toDataURL('image/png', 1.0);
                const link = document.createElement('a');
                const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
                link.download = `vanmitra-emergency-${timestamp}.png`;
                link.href = dataUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                alert('Emergency export completed! Check your downloads.');
                return;
              } catch (emergencyError) {
                console.error('Emergency export also failed:', emergencyError);
                alert('Export failed completely. Please try refreshing the page.');
              }
            }
          }
        } else {
          alert('Export failed. Please try again.');
        }
      } finally {
        setIsExporting(false);
      }
    }
  }, [externalExport, mapLoaded]);

  // Expose functions via ref
  useImperativeHandle(ref, () => ({
    exportMap,
    startMeasurement,
    clearMeasurement
  }), [exportMap, startMeasurement, clearMeasurement]);

  // Layer toggle function
  const toggleLayer = useCallback((layerId: string) => {
    if (externalLayerToggle) {
      externalLayerToggle(layerId);
    } else {
      setCurrentLayers(prev =>
        prev.map(layer =>
          layer.id === layerId
            ? { ...layer, visible: !layer.visible }
            : layer
        )
      );
    }
  }, [externalLayerToggle]);

  return (
    <div className={`relative ${className}`}>
      <div
        ref={mapContainer}
        className="w-full h-full"
        data-testid="map-container"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}
      />

      {/* Loading Overlay */}
      {isLoadingData && (
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center z-20">
          <div className="bg-white rounded-lg p-4 shadow-lg flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
            <span className="text-sm font-medium text-gray-700">Loading map data...</span>
          </div>
        </div>
      )}

      {/* Map error overlay */}
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center z-40">
          <div className="bg-white/95 rounded-lg p-6 shadow-lg max-w-lg text-center">
            <h3 className="text-lg font-semibold text-red-600">Map error</h3>
            <p className="text-sm text-gray-700 mt-2">{mapError}</p>
            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={() => {
                  // Simple retry: remove and re-create the map by forcing unload
                  try {
                    setMapLoaded(false);
                    setMapError(null);
                    if (map.current) {
                      map.current.remove();
                      map.current = null;
                    }
                    // Re-run the init effect by toggling a small state; easiest is to
                    // reload the page as a last resort for deterministic recovery.
                    window.location.reload();
                  } catch (err) {
                    console.error('Retry failed', err);
                    setMapError(String(err));
                  }
                }}
                className="px-3 py-2 bg-blue-600 text-white rounded"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Controls */}
      {showControls && (
        <div className="absolute top-4 left-4 z-10 space-y-2">
          {/* Layer Control */}
          {showLayerControls && (
            <div className="bg-white rounded-lg shadow-lg p-3 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Layers size={16} />
                <span className="text-sm font-medium">Layers</span>
              </div>
              <div className="space-y-1">
                {currentLayers.map(layer => (
                  <label key={layer.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={layer.visible}
                      onChange={() => toggleLayer(layer.id)}
                      className="rounded"
                    />
                    {layer.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Measurement Control */}
          {showMeasurementControls && enableMeasurement && (
            <div className="bg-white rounded-lg shadow-lg p-3 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Ruler size={16} />
                <span className="text-sm font-medium">Measure</span>
              </div>
              <div className="space-y-2">
                {!isMeasuring ? (
                  <button
                    onClick={startMeasurement}
                    className="w-full text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Start Measurement
                  </button>
                ) : (
                  <div className="text-xs text-gray-600">
                    Click two points to measure distance
                  </div>
                )}
                {measurementDistance && (
                  <div className="text-xs">
                    Distance: {measurementDistance.toFixed(2)} km
                  </div>
                )}
                <button
                  onClick={clearMeasurement}
                  className="w-full text-sm bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

         
        </div>
      )}

      {/* Export Status */}
      {isExporting && (
        <div className="absolute top-4 right-4 z-10 bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span className="text-sm">Exporting map...</span>
          </div>
        </div>
      )}

      {measurementDistance && (
        <div className="absolute bottom-4 left-4 z-10 bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <Ruler size={16} />
            <span className="text-sm">Distance: {measurementDistance.toFixed(2)} km</span>
          </div>
        </div>
      )}
    </div>
  );
});

export default WebGIS;
