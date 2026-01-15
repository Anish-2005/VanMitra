// src/components/LayerManager.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Layers, Trash2, Settings, MapPin } from 'lucide-react';
import { GISLayer, GISMarker } from './WebGIS';
import GlassCard from '@/components/ui/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './ThemeProvider';

interface LayerManagerProps {
  layers: GISLayer[];
  markers?: GISMarker[];
  onLayerToggle: (layerId: string) => void;
  onLayerRemove: (layerId: string) => void;
  onLayerUpdate: (layerId: string, updates: Partial<GISLayer>) => void;

  onMarkerUpdate?: (markerId: string, updates: Partial<GISMarker>) => void;
  onMarkerRemove?: (markerId: string) => void;
  onMarkerGoto?: (lng: number, lat: number) => void;

  initiallyCollapsed?: boolean;
}

export default function LayerManager({
  layers,
  markers = [],
  onLayerToggle,
  onLayerRemove,
  onLayerUpdate,
  onMarkerUpdate,
  onMarkerRemove,
  onMarkerGoto,
  initiallyCollapsed = false
}: LayerManagerProps) {
  const [isExpanded, setIsExpanded] = useState(!initiallyCollapsed);
  const [editingLayer, setEditingLayer] = useState<string | null>(null);
  const [editingMarker, setEditingMarker] = useState<string | null>(null);

  const [stagedVisibility, setStagedVisibility] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(layers.map(l => [l.id, !!l.visible]))
  );

  const { theme } = useTheme();
  const isLight = theme === 'light';

  /** Sync staged visibility when layers change */
  useEffect(() => {
    const id = setTimeout(() => {
      setStagedVisibility(
        Object.fromEntries(layers.map(l => [l.id, !!l.visible]))
      );
    }, 0);
    return () => clearTimeout(id);
  }, [layers]);

  const handleStyleChange = (
    layerId: string,
    key: string,
    value: string | number
  ) => {
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;

    onLayerUpdate(layerId, {
      style: {
        ...layer.style,
        [key]: value
      }
    });
  };

  const handleMarkerChange = <K extends keyof GISMarker>(
    markerId: string,
    key: K,
    value: GISMarker[K]
  ) => {
    onMarkerUpdate?.(markerId, { [key]: value });
  };

  return (
    <GlassCard
      className={`overflow-hidden mb-6 ${
        isLight ? 'bg-white/95 border border-slate-200 shadow-lg' : ''
      }`}
    >
      {/* Header */}
      <div
        onClick={() => setIsExpanded(v => !v)}
        className={`flex items-center justify-between p-4 cursor-pointer ${
          isLight
            ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100'
            : 'bg-slate-800/50'
        }`}
      >
        <div className="flex items-center gap-3">
          <Layers size={18} className="text-emerald-500" />
          <div>
            <span className="font-semibold text-base">Layer Manager</span>
            <span className="block text-xs text-emerald-600">
              {layers.length} layers
            </span>
          </div>
        </div>
        <span className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-5 space-y-6 max-h-96 overflow-y-auto">
              {/* Layers */}
              {layers.map(layer => (
                <div
                  key={layer.id}
                  className={`rounded-xl p-4 border ${
                    isLight
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-slate-800/30 border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={stagedVisibility[layer.id]}
                        onChange={() =>
                          setStagedVisibility(v => ({
                            ...v,
                            [layer.id]: !v[layer.id]
                          }))
                        }
                      />
                      <div>
                        <div className="font-medium">{layer.name}</div>
                        <div className="text-xs opacity-70">{layer.type}</div>
                      </div>
                    </label>

                    <div className="flex gap-2">
                      <button onClick={() => setEditingLayer(layer.id)}>
                        <Settings size={14} />
                      </button>
                      <button onClick={() => onLayerRemove(layer.id)}>
                        <Trash2 size={14} className="text-red-500" />
                      </button>
                    </div>
                  </div>

                  {editingLayer === layer.id && (
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <input
                        type="color"
                        value={layer.style.fillColor ?? '#3b82f6'}
                        onChange={e =>
                          handleStyleChange(
                            layer.id,
                            'fillColor',
                            e.target.value
                          )
                        }
                      />
                      <input
                        type="number"
                        step={0.1}
                        min={0}
                        max={1}
                        value={layer.style.opacity ?? 0.8}
                        onChange={e =>
                          handleStyleChange(
                            layer.id,
                            'opacity',
                            Number(e.target.value)
                          )
                        }
                      />
                    </div>
                  )}
                </div>
              ))}

              {/* Apply / Reset */}
              <div className="flex gap-3">
                <button
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg"
                  onClick={() =>
                    layers.forEach(l => {
                      if (!!l.visible !== stagedVisibility[l.id]) {
                        onLayerToggle(l.id);
                      }
                    })
                  }
                >
                  Apply
                </button>

                <button
                  className="px-4 py-2 border rounded-lg"
                  onClick={() =>
                    setStagedVisibility(
                      Object.fromEntries(
                        layers.map(l => [l.id, !!l.visible])
                      )
                    )
                  }
                >
                  Reset
                </button>
              </div>

              {/* Markers */}
              {markers.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-2 font-semibold">
                    <MapPin size={16} /> Markers ({markers.length})
                  </h4>

                  {markers.map(marker => (
                    <div
                      key={marker.id}
                      className="mt-3 p-4 rounded-xl border"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">
                            {marker.label ?? marker.id}
                          </div>
                          <div className="text-xs opacity-70">
                            {marker.lat}, {marker.lng}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              onMarkerGoto?.(marker.lng, marker.lat)
                            }
                          >
                            <MapPin size={14} />
                          </button>
                          <button
                            onClick={() => setEditingMarker(marker.id)}
                          >
                            <Settings size={14} />
                          </button>
                          {onMarkerRemove && (
                            <button
                              onClick={() => onMarkerRemove(marker.id)}
                            >
                              <Trash2
                                size={14}
                                className="text-red-500"
                              />
                            </button>
                          )}
                        </div>
                      </div>

                      {editingMarker === marker.id && (
                        <div className="mt-3 grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={marker.label ?? ''}
                            onChange={e =>
                              handleMarkerChange(
                                marker.id,
                                'label',
                                e.target.value
                              )
                            }
                          />
                          <input
                            type="color"
                            value={marker.color ?? '#16a34a'}
                            onChange={e =>
                              handleMarkerChange(
                                marker.id,
                                'color',
                                e.target.value
                              )
                            }
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
