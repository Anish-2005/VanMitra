// src/components/LayerManager.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Layers, Eye, EyeOff, Trash2, Settings, MapPin } from 'lucide-react';
import { GISLayer, GISMarker } from './WebGIS';
import GlassCard from './ui/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './ThemeProvider';

interface LayerManagerProps {
  layers: GISLayer[];
  markers?: GISMarker[];
  onLayerToggle: (layerId: string) => void;
  onLayerAdd?: (layer: GISLayer) => void;
  onLayerRemove: (layerId: string) => void;
  onLayerUpdate: (layerId: string, updates: Partial<GISLayer>) => void;
  onMarkerUpdate?: (markerId: string, updates: Partial<GISMarker>) => void;
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
  onMarkerGoto,
  initiallyCollapsed = false
}: LayerManagerProps) {
  const [isExpanded, setIsExpanded] = useState(!initiallyCollapsed);
  const [editingLayer, setEditingLayer] = useState<string | null>(null);
  const [editingMarker, setEditingMarker] = useState<string | null>(null);
  // stagedVisibility holds local toggles until user presses Apply
  const [stagedVisibility, setStagedVisibility] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    layers.forEach(l => { initial[l.id] = !!l.visible });
    return initial;
  });

  const { theme } = useTheme();
  const isLight = theme === 'light';

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
    <GlassCard className={`overflow-hidden mb-6 ${isLight ? 'bg-white/95 border border-slate-200 shadow-lg' : ''}`}>
      <div
        className={`flex items-center justify-between p-4 cursor-pointer ${isLight ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100' : 'bg-slate-800/50'}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <Layers size={18} className={isLight ? 'text-emerald-600' : 'text-emerald-400'} />
          <div>
            <span className={`font-semibold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>Layer Manager</span>
            <span className={`block text-xs font-medium ${isLight ? 'text-emerald-600' : 'text-green-300'}`}>{layers.length} layers</span>
          </div>
        </div>
        <div className={`transform transition-transform duration-200 ${isExpanded ? "rotate-180" : ""} ${isLight ? 'text-slate-600' : 'text-white'}`}>▼</div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: 0.4,
              ease: "easeInOut",
              opacity: { duration: 0.2 }
            }}
            className="overflow-hidden"
          >
            <div className={`p-5 space-y-4 overflow-y-auto max-h-96 custom-scroll ${isLight ? 'bg-white' : ''}`}>
              {/* Layers Section */}
              <div>
                <h4 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isLight ? 'text-slate-800' : 'text-white'}`}>
                  <Layers size={16} className={isLight ? 'text-emerald-600' : 'text-emerald-400'} />
                  Map Layers ({layers.length})
                </h4>
                <div className="space-y-3">
                  {layers.map(layer => (
                    <div key={layer.id} className={`rounded-xl p-4 transition-all duration-200 border ${isLight ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : 'bg-slate-800/30 border-slate-700/50'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={stagedVisibility[layer.id] || false}
                              onChange={() => {
                                setStagedVisibility(prev => ({ ...prev, [layer.id]: !prev[layer.id] }));
                              }}
                              className="sr-only peer"
                            />
                            <div className={`w-10 h-6 rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 ${isLight ? 'bg-gray-200 peer-checked:bg-emerald-500' : 'bg-gray-700 peer-checked:bg-emerald-500'} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                          </label>
                          <div>
                            <span className={`text-sm font-medium block ${isLight ? 'text-slate-900' : 'text-white'}`}>{layer.name}</span>
                            <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{layer.type}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingLayer(editingLayer === layer.id ? null : layer.id)}
                            title="Settings"
                            className={`p-1 rounded-md transition-colors ${isLight ? 'text-slate-600 hover:bg-slate-200' : 'text-slate-400 hover:bg-slate-700'}`}
                          >
                            <Settings size={14} />
                          </button>
                          <button
                            onClick={() => onLayerRemove(layer.id)}
                            title="Remove"
                            className={`p-1 rounded-md transition-colors ${isLight ? 'text-red-600 hover:bg-red-50' : 'text-red-400 hover:bg-red-900/30'}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {editingLayer === layer.id && (
                        <div className={`space-y-3 mt-3 pt-3 border-t ${isLight ? 'border-slate-200' : 'border-slate-600'}`}>
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Name</label>
                            <input
                              type="text"
                              value={layer.name}
                              onChange={(e) => onLayerUpdate(layer.id, { name: e.target.value })}
                              className={`w-full rounded-lg px-3 py-2 text-sm transition-colors ${isLight
                                ? 'border border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
                                : 'border border-slate-600 bg-slate-800/50 text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'}`}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className={`block text-sm font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Fill Color</label>
                              <input
                                type="color"
                                value={layer.style.fillColor || '#3b82f6'}
                                onChange={(e) => handleStyleChange(layer.id, 'fillColor', e.target.value)}
                                className="w-full h-9 rounded-lg border border-slate-300 cursor-pointer"
                              />
                            </div>
                            <div>
                              <label className={`block text-sm font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Stroke Color</label>
                              <input
                                type="color"
                                value={layer.style.strokeColor || '#ffffff'}
                                onChange={(e) => handleStyleChange(layer.id, 'strokeColor', e.target.value)}
                                className="w-full h-9 rounded-lg border border-slate-300 cursor-pointer"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className={`block text-sm font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Stroke Width</label>
                              <input
                                type="number"
                                min="0"
                                max="10"
                                step="0.5"
                                value={layer.style.strokeWidth || 2}
                                onChange={(e) => handleStyleChange(layer.id, 'strokeWidth', parseFloat(e.target.value))}
                                className={`w-full rounded-lg px-3 py-2 text-sm transition-colors ${isLight
                                  ? 'border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
                                  : 'border border-slate-600 bg-slate-800/50 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'}`}
                              />
                            </div>
                            <div>
                              <label className={`block text-sm font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Opacity</label>
                              <input
                                type="number"
                                min="0"
                                max="1"
                                step="0.1"
                                value={layer.style.opacity || 0.8}
                                onChange={(e) => handleStyleChange(layer.id, 'opacity', parseFloat(e.target.value))}
                                className={`w-full rounded-lg px-3 py-2 text-sm transition-colors ${isLight
                                  ? 'border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
                                  : 'border border-slate-600 bg-slate-800/50 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'}`}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
              {/* Apply / Reset controls for staged visibility */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm ${isLight ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200' : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-green-900/30'}`}
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
                >
                  Apply Changes
                </button>
                <button
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isLight ? 'bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 shadow-sm' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'}`}
                  onClick={() => {
                    // reset staged visibility to current props
                    const reset: Record<string, boolean> = {};
                    layers.forEach(l => { reset[l.id] = !!l.visible });
                    setStagedVisibility(reset);
                  }}
                >
                  Reset
                </button>
              </div>

              {/* Markers Section */}
              {markers.length > 0 && (
                <div>
                  <h4 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isLight ? 'text-slate-800' : 'text-white'}`}>
                    <MapPin size={16} className={isLight ? 'text-emerald-600' : 'text-emerald-400'} />
                    Map Markers ({markers.length})
                  </h4>
              <div className="space-y-3">
                {markers.map((marker, idx) => (
                  <div key={`${marker.id ?? 'marker'}-${idx}`} className={`rounded-xl p-4 transition-all duration-200 border ${isLight ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : 'bg-slate-800/30 border-slate-700/50'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full border-2 shadow-sm"
                              style={{ backgroundColor: marker.color || '#16a34a', borderColor: isLight ? 'rgba(15,23,21,0.08)' : '#fff' }}
                            ></div>
                            <div>
                              <span className={`text-sm font-medium block ${isLight ? 'text-slate-900' : 'text-white'}`}>{marker.label || marker.id}</span>
                              <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{marker.lat.toFixed(6)}, {marker.lng.toFixed(6)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onMarkerGoto && onMarkerGoto(marker.lng, marker.lat)}
                              title="Go to marker"
                              className={`p-1 rounded-md transition-colors ${isLight ? 'text-slate-600 hover:bg-slate-200' : 'text-slate-400 hover:bg-slate-700'}`}
                            >
                              <MapPin size={14} />
                            </button>
                            <button
                              onClick={() => setEditingMarker(editingMarker === marker.id ? null : marker.id)}
                              title="Settings"
                              className={`p-1 rounded-md transition-colors ${isLight ? 'text-slate-600 hover:bg-slate-200' : 'text-slate-400 hover:bg-slate-700'}`}
                            >
                              <Settings size={14} />
                            </button>
                            {onMarkerRemove && (
                              <button
                                onClick={() => onMarkerRemove(marker.id)}
                                title="Remove"
                                className={`p-1 rounded-md transition-colors ${isLight ? 'text-red-600 hover:bg-red-50' : 'text-red-400 hover:bg-red-900/30'}`}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                      </div>
                    </div>

                    {editingMarker === marker.id && (
                      <div className={`space-y-3 mt-3 pt-3 border-t ${isLight ? 'border-slate-200' : 'border-slate-600'}`}>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Label</label>
                          <input
                            type="text"
                            value={marker.label || ''}
                            onChange={(e) => handleMarkerChange(marker.id, 'label', e.target.value)}
                            placeholder="Marker label"
                            className={`w-full rounded-lg px-3 py-2 text-sm transition-colors ${isLight
                              ? 'border border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
                              : 'border border-slate-600 bg-slate-800/50 text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'}`}
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Marker Color</label>
                          <input
                            type="color"
                            value={marker.color || '#16a34a'}
                            onChange={(e) => handleMarkerChange(marker.id, 'color', e.target.value)}
                            className="w-full h-9 rounded-lg border border-slate-300 cursor-pointer"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Longitude</label>
                            <input
                              type="number"
                              step="0.000001"
                              value={marker.lng}
                              onChange={(e) => handleMarkerChange(marker.id, 'lng', e.target.value)}
                              className={`w-full rounded-lg px-3 py-2 text-sm transition-colors ${isLight
                                ? 'border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
                                : 'border border-slate-600 bg-slate-800/50 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'}`}
                            />
                          </div>
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Latitude</label>
                            <input
                              type="number"
                              step="0.000001"
                              value={marker.lat}
                              onChange={(e) => handleMarkerChange(marker.id, 'lat', e.target.value)}
                              className={`w-full rounded-lg px-3 py-2 text-sm transition-colors ${isLight
                                ? 'border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
                                : 'border border-slate-600 bg-slate-800/50 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'}`}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
        </motion.div>
      )}
        </AnimatePresence>
    </GlassCard>
  );
}
