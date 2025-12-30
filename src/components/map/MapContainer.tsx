// src/components/map/MapContainer.tsx
'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import maplibregl, { Map as MapLibreMap, Marker, Popup } from 'maplibre-gl';
import { useAtlasStore } from '@/stores/atlas-store';
import { MapControls } from './MapControls';
import { LayerPanel } from './LayerPanel';

interface MapContainerProps {
  className?: string;
  onFeatureClick?: (feature: any) => void;
  onMapClick?: (lngLat: maplibregl.LngLat) => void;
}

export function MapContainer({
  className = "w-full h-full",
  onFeatureClick,
  onMapClick
}: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<MapLibreMap | null>(null);
  const [layerPanelOpen, setLayerPanelOpen] = useState(false);

  const {
    center,
    zoom,
    layers,
    activeLayers,
    markers,
    setCenter,
    setZoom,
    setBounds,
  } = useAtlasStore();

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = new MapLibreMap({
      container: mapRef.current,
      style: 'https://demotiles.maplibre.org/style.json', // Default style
      center,
      zoom,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    // Add navigation control
    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Handle map events
    map.on('moveend', () => {
      const newCenter = map.getCenter();
      const newZoom = map.getZoom();
      setCenter([newCenter.lng, newCenter.lat]);
      setZoom(newZoom);
    });

    map.on('zoomend', () => {
      setZoom(map.getZoom());
    });

    map.on('moveend', () => {
      const bounds = map.getBounds();
      setBounds([
        [bounds.getWest(), bounds.getSouth()],
        [bounds.getEast(), bounds.getNorth()],
      ]);
    });

    // Handle clicks
    map.on('click', (e) => {
      onMapClick?.(e.lngLat);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [center, zoom, setCenter, setZoom, setBounds, onMapClick]);

  // Update map view when center/zoom changes externally
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    if (map.getCenter().lng !== center[0] || map.getCenter().lat !== center[1]) {
      map.setCenter(center);
    }
    if (map.getZoom() !== zoom) {
      map.setZoom(zoom);
    }
  }, [center, zoom]);

  // Handle layers
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    layers.forEach((layer) => {
      const isActive = activeLayers.includes(layer.id);

      if (isActive && !map.getSource(layer.id)) {
        // Add source and layer
        if (layer.data) {
          map.addSource(layer.id, {
            type: 'geojson',
            data: layer.data,
          });
        }

        map.addLayer({
          id: layer.id,
          type: 'fill',
          source: layer.id,
          paint: {
            'fill-color': layer.style.fillColor || '#3388ff',
            'fill-opacity': layer.style.opacity || 0.5,
          },
        });
      } else if (!isActive && map.getSource(layer.id)) {
        // Remove layer and source
        if (map.getLayer(layer.id)) {
          map.removeLayer(layer.id);
        }
        if (map.getSource(layer.id)) {
          map.removeSource(layer.id);
        }
      }
    });
  }, [layers, activeLayers]);

  // Handle markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Clear existing markers (simplified - in real app, track them)
    // For now, we'll skip marker management to keep this simple

  }, [markers]);

  const handleLayerToggle = useCallback(() => {
    setLayerPanelOpen(!layerPanelOpen);
  }, [layerPanelOpen]);

  const handleMeasurementToggle = useCallback(() => {
    // Measurement logic would go here
    console.log('Measurement mode toggled');
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-full" />
      <MapControls
        onLayerToggle={handleLayerToggle}
        onMeasurementToggle={handleMeasurementToggle}
      />
      <LayerPanel
        isOpen={layerPanelOpen}
        onClose={() => setLayerPanelOpen(false)}
      />
    </div>
  );
}