// src/components/map/LayerPanel.tsx
'use client';

import React from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { useAtlasStore } from '@/stores/atlas-store';

interface LayerPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LayerPanel({ isOpen, onClose }: LayerPanelProps) {
  const { layers, activeLayers, toggleLayer } = useAtlasStore();

  if (!isOpen) return null;

  return (
    <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border p-4 min-w-64 max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">Map Layers</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0"
          aria-label="Close layer panel"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {layers.length === 0 ? (
        <p className="text-sm text-gray-500">No layers available</p>
      ) : (
        <div className="space-y-2">
          {layers.map((layer) => {
            const isActive = activeLayers.includes(layer.id);
            return (
              <div key={layer.id} className="flex items-center space-x-2">
                <Checkbox
                  id={layer.id}
                  checked={isActive}
                  onCheckedChange={() => toggleLayer(layer.id)}
                />
                <label
                  htmlFor={layer.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
                >
                  {layer.name}
                </label>
                {isActive ? (
                  <Eye className="h-4 w-4 text-green-600" />
                ) : (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}