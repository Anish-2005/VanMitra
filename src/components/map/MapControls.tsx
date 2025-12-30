// src/components/map/MapControls.tsx
'use client';

import React from 'react';
import { Layers, Ruler, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAtlasStore } from '@/stores/atlas-store';

interface MapControlsProps {
  onLayerToggle?: () => void;
  onMeasurementToggle?: () => void;
}

export function MapControls({ onLayerToggle, onMeasurementToggle }: MapControlsProps) {
  const {
    zoom,
    setZoom,
    center,
    setCenter,
    measurementMode,
    setMeasurementMode,
    reset,
  } = useAtlasStore();

  const handleZoomIn = () => setZoom(Math.min(zoom + 1, 20));
  const handleZoomOut = () => setZoom(Math.max(zoom - 1, 0));
  const handleReset = () => {
    setCenter([78.9629, 20.5937]); // Center of India
    setZoom(5);
    reset();
  };

  const handleMeasurementToggle = () => {
    setMeasurementMode(!measurementMode);
    onMeasurementToggle?.();
  };

  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
      {/* Zoom Controls */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border p-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomIn}
          className="h-8 w-8 p-0"
          aria-label="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <div className="h-px bg-gray-200 my-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomOut}
          className="h-8 w-8 p-0"
          aria-label="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
      </div>

      {/* Action Controls */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border p-1 flex flex-col gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onLayerToggle}
          className="h-8 w-8 p-0"
          aria-label="Toggle layers panel"
        >
          <Layers className="h-4 w-4" />
        </Button>

        <Button
          variant={measurementMode ? "default" : "ghost"}
          size="sm"
          onClick={handleMeasurementToggle}
          className="h-8 w-8 p-0"
          aria-label="Toggle measurement mode"
        >
          <Ruler className="h-4 w-4" />
        </Button>

        <div className="h-px bg-gray-200 my-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="h-8 w-8 p-0"
          aria-label="Reset map view"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}