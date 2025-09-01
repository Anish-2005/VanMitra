// src/components/LayerManager.tsx
'use client';

import React, { useState } from 'react';
import { Layers, Eye, EyeOff, Plus, Trash2, Settings } from 'lucide-react';
import { GISLayer } from './WebGIS';

interface LayerManagerProps {
  layers: GISLayer[];
  onLayerToggle: (layerId: string) => void;
  onLayerAdd: (layer: GISLayer) => void;
  onLayerRemove: (layerId: string) => void;
  onLayerUpdate: (layerId: string, updates: Partial<GISLayer>) => void;
}

export default function LayerManager({
  layers,
  onLayerToggle,
  onLayerAdd,
  onLayerRemove,
  onLayerUpdate
}: LayerManagerProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingLayer, setEditingLayer] = useState<string | null>(null);

  const handleAddLayer = () => {
    const newLayer: GISLayer = {
      id: `layer-${Date.now()}`,
      name: 'New Layer',
      type: 'geojson',
      visible: true,
      style: {
        fillColor: '#3b82f6',
        strokeColor: '#ffffff',
        strokeWidth: 2,
        opacity: 0.8
      }
    };
    onLayerAdd(newLayer);
  };

  const handleStyleChange = (layerId: string, styleKey: string, value: string | number) => {
    const updates: Partial<GISLayer> = {
      style: {
        ...layers.find(l => l.id === layerId)?.style,
        [styleKey]: value
      }
    };
    onLayerUpdate(layerId, updates);
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
        <div className="p-3 space-y-2 max-h-96 overflow-y-auto">
          {layers.map(layer => (
            <div key={layer.id} className="border rounded p-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onLayerToggle(layer.id)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
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

          <button
            onClick={handleAddLayer}
            className="w-full flex items-center justify-center gap-2 text-sm bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            <Plus size={14} />
            Add Layer
          </button>
        </div>
      )}
    </div>
  );
}
