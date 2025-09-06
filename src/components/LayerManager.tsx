// src/components/LayerManager.tsx
'use client';

import React, { useState } from 'react';
import { Layers, Eye, EyeOff, Trash2, Settings, MapPin } from 'lucide-react';
import { GISLayer, GISMarker } from './WebGIS';

interface LayerManagerProps {
  layers: GISLayer[];
  markers?: GISMarker[];
  onLayerToggle: (layerId: string) => void;
  onLayerAdd?: (layer: GISLayer) => void;
  onLayerRemove: (layerId: string) => void;
  onLayerUpdate: (layerId: string, updates: Partial<GISLayer>) => void;
  onMarkerUpdate?: (markerId: string, updates: Partial<GISMarker>) => void;
  onMarkerGoto?: (lng: number, lat: number) => void;
}

export default function LayerManager({
  layers,
  markers = [],
  onLayerToggle,
  onLayerRemove,
  onLayerUpdate,
  onMarkerUpdate,
  onMarkerGoto
}: LayerManagerProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingLayer, setEditingLayer] = useState<string | null>(null);
  const [editingMarker, setEditingMarker] = useState<string | null>(null);
  // stagedVisibility holds local toggles until user presses Apply
  const [stagedVisibility, setStagedVisibility] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    layers.forEach(l => { initial[l.id] = !!l.visible });
    return initial;
  });

  // sync staged when layers prop changes (e.g., external updates)
  React.useEffect(() => {
    const next: Record<string, boolean> = {};
    layers.forEach(l => { next[l.id] = !!l.visible });
    setStagedVisibility(next);
  }, [JSON.stringify(layers.map(l => ({ id: l.id, v: l.visible })))]);

  const handleStyleChange = (layerId: string, styleKey: string, value: string | number) => {
    const updates: Partial<GISLayer> = {
      style: {
        ...layers.find(l => l.id === layerId)?.style,
        [styleKey]: value
      }
    };
    onLayerUpdate(layerId, updates);
  };

  const handleMarkerChange = (markerId: string, key: string, value: string) => {
    if (onMarkerUpdate) {
      const updates: Partial<GISMarker> = { [key]: value };
      onMarkerUpdate(markerId, updates);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div
        className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Layers size={16} />
          <span className="font-medium">Layer Manager</span>
          <span className="text-sm text-gray-500">({layers.length})</span>
        </div>
        <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 space-y-4 max-h-96 overflow-y-auto">
          {/* Layers Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Layers size={14} />
              Map Layers ({layers.length})
            </h4>
            <div className="space-y-2">
              {layers.map(layer => (
                <div key={layer.id} className="border rounded p-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          // toggle staged visibility locally
                          setStagedVisibility(prev => ({ ...prev, [layer.id]: !prev[layer.id] }));
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {stagedVisibility[layer.id] ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
+
                      <span className="text-sm font-medium">{layer.name}</span>
                      <span className="text-xs text-gray-500 uppercase">{layer.type}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingLayer(editingLayer === layer.id ? null : layer.id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Settings size={14} />
                      </button>
                      <button
                        onClick={() => onLayerRemove(layer.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {editingLayer === layer.id && (
                    <div className="space-y-2 mt-2 pt-2 border-t">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Name</label>
                        <input
                          type="text"
                          value={layer.name}
                          onChange={(e) => onLayerUpdate(layer.id, { name: e.target.value })}
                          className="w-full text-sm border rounded px-2 py-1"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Fill Color</label>
                          <input
                            type="color"
                            value={layer.style.fillColor || '#3b82f6'}
                            onChange={(e) => handleStyleChange(layer.id, 'fillColor', e.target.value)}
                            className="w-full h-8 border rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Stroke Color</label>
                          <input
                            type="color"
                            value={layer.style.strokeColor || '#ffffff'}
                            onChange={(e) => handleStyleChange(layer.id, 'strokeColor', e.target.value)}
                            className="w-full h-8 border rounded"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Stroke Width</label>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.5"
                            value={layer.style.strokeWidth || 2}
                            onChange={(e) => handleStyleChange(layer.id, 'strokeWidth', parseFloat(e.target.value))}
                            className="w-full text-sm border rounded px-2 py-1"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Opacity</label>
                          <input
                            type="number"
                            min="0"
                            max="1"
                            step="0.1"
                            value={layer.style.opacity || 0.8}
                            onChange={(e) => handleStyleChange(layer.id, 'opacity', parseFloat(e.target.value))}
                            className="w-full text-sm border rounded px-2 py-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* Apply / Reset controls for staged visibility */}
            <div className="mt-3 flex items-center gap-2">
              <button
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                onClick={() => {
                  // compute diffs and call onLayerToggle for each layer that changed
                  layers.forEach(l => {
                    const staged = !!stagedVisibility[l.id];
                    const current = !!l.visible;
                    if (staged !== current) {
                      onLayerToggle(l.id);
                    }
                  });
                }}
              >Apply</button>
              <button
                className="px-3 py-1 bg-gray-100 text-sm rounded"
                onClick={() => {
                  // reset staged visibility to current props
                  const reset: Record<string, boolean> = {};
                  layers.forEach(l => { reset[l.id] = !!l.visible });
                  setStagedVisibility(reset);
                }}
              >Reset</button>
            </div>
          </div>

          {/* Markers Section */}
          {markers.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <MapPin size={14} />
                Map Markers ({markers.length})
              </h4>
              <div className="space-y-2">
                {markers.map((marker, idx) => (
                  <div key={`${marker.id ?? 'marker'}-${idx}`} className="border rounded p-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: marker.color || '#16a34a' }}
                        ></div>
                        <span className="text-sm font-medium">{marker.label || marker.id}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onMarkerGoto && onMarkerGoto(marker.lng, marker.lat)}
                          className="text-green-600 hover:text-green-800"
                          title="Go to marker"
                        >
                          <MapPin size={14} />
                        </button>
                        <button
                          onClick={() => setEditingMarker(editingMarker === marker.id ? null : marker.id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <Settings size={14} />
                        </button>
                      </div>
                    </div>

                    {editingMarker === marker.id && (
                      <div className="space-y-2 mt-2 pt-2 border-t">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Label</label>
                          <input
                            type="text"
                            value={marker.label || ''}
                            onChange={(e) => handleMarkerChange(marker.id, 'label', e.target.value)}
                            className="w-full text-sm border rounded px-2 py-1"
                            placeholder="Marker label"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Marker Color</label>
                          <input
                            type="color"
                            value={marker.color || '#16a34a'}
                            onChange={(e) => handleMarkerChange(marker.id, 'color', e.target.value)}
                            className="w-full h-8 border rounded"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Longitude</label>
                            <input
                              type="number"
                              step="0.000001"
                              value={marker.lng}
                              onChange={(e) => handleMarkerChange(marker.id, 'lng', e.target.value)}
                              className="w-full text-sm border rounded px-2 py-1"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Latitude</label>
                            <input
                              type="number"
                              step="0.000001"
                              value={marker.lat}
                              onChange={(e) => handleMarkerChange(marker.id, 'lat', e.target.value)}
                              className="w-full text-sm border rounded px-2 py-1"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
