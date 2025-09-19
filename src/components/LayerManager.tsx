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
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const isLight = mounted && theme === 'light';

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
    <GlassCard className="overflow-hidden mb-6">
      <div
        className="flex items-center justify-between p-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ borderRadius: '0.5rem', background: isLight ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.12)'}}
      >
        <div className="flex items-center gap-2">
          <Layers size={16} />
          <span className="font-medium" style={{ color: 'var(--foreground)' }}>Layer Manager</span>
          <span className="text-sm" style={{ color: 'var(--primary-300)' }}>({layers.length})</span>
        </div>
        <div className={`transform transition-transform ${isExpanded ? "rotate-180" : ""}`}>▼</div>
      </div>

      {isExpanded && (
        <AnimatePresence>
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: 0.4,
              ease: [0.4, 0.0, 0.2, 1],
              opacity: { duration: 0.2 }
            }}
            className="overflow-hidden max-h-96"
          >
            <div className="p-4 space-y-3 overflow-y-auto max-h-96" style={{ scrollbarWidth: 'thin' }}>
          {/* Layers Section */}
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--foreground)'}}>
              <Layers size={14} />
              Map Layers ({layers.length})
            </h4>
            <div className="space-y-2">
              {layers.map(layer => (
                <div key={layer.id} className="rounded-2xl p-3 transition-all duration-200" style={{ border: isLight ? '1px solid rgba(63,162,91,0.08)' : '1px solid rgba(16,185,129,0.12)', background: isLight ? 'rgba(255,255,255,0.6)' : 'rgba(16,185,129,0.04)'}}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          // toggle staged visibility locally
                          setStagedVisibility(prev => ({ ...prev, [layer.id]: !prev[layer.id] }));
                        }}
                        className={isLight ? 'text-green-600 hover:text-green-500' : 'text-green-400 hover:text-green-300'}
                      >
                        {stagedVisibility[layer.id] ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>

                        <span className="text-sm font-medium" style={{ color: 'var(--foreground)'}}>{layer.name}</span>
                      <span className="text-xs" style={{ color: 'var(--primary-300)'}}>{layer.type}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingLayer(editingLayer === layer.id ? null : layer.id)}
                        title="Settings"
                        style={{ color: 'var(--primary)'}}
                      >
                        <Settings size={14} />
                      </button>
                      <button
                        onClick={() => onLayerRemove(layer.id)}
                        style={{ color: 'var(--destructive)'}}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {editingLayer === layer.id && (
                    <div className="space-y-2 mt-2 pt-2" style={{ borderTop: isLight ? '1px solid rgba(63,162,91,0.08)' : '1px solid rgba(16,185,129,0.12)'}}>
                      <div>
                        <label className="block text-sm" style={{ color: 'var(--primary-300)'}}>Name</label>
                        <input
                          type="text"
                          value={layer.name}
                          onChange={(e) => onLayerUpdate(layer.id, { name: e.target.value })}
                          className="mt-1 w-full rounded-md p-2"
                          style={{ border: isLight ? '1px solid rgba(15,23,21,0.06)' : '1px solid rgba(16,185,129,0.12)', background: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.06)', color: 'var(--foreground)'}}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm" style={{ color: 'var(--primary-300)'}}>Fill Color</label>
                          <input
                            type="color"
                            value={layer.style.fillColor || '#3b82f6'}
                            onChange={(e) => handleStyleChange(layer.id, 'fillColor', e.target.value)}
                            className="mt-1 w-full h-8 border border-green-400/30 rounded"
                            style={{ border: isLight ? '1px solid rgba(15,23,21,0.06)' : '1px solid rgba(16,185,129,0.12)', background: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.06)'}}
                          />
                        </div>
                        <div>
                          <label className="block text-sm" style={{ color: 'var(--primary-300)'}}>Stroke Color</label>
                          <input
                            type="color"
                            value={layer.style.strokeColor || '#ffffff'}
                            onChange={(e) => handleStyleChange(layer.id, 'strokeColor', e.target.value)}
                            className="mt-1 w-full h-8 border border-green-400/30 rounded"
                            style={{ border: isLight ? '1px solid rgba(15,23,21,0.06)' : '1px solid rgba(16,185,129,0.12)', background: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.06)'}}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm" style={{ color: 'var(--primary-300)'}}>Stroke Width</label>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.5"
                            value={layer.style.strokeWidth || 2}
                            onChange={(e) => handleStyleChange(layer.id, 'strokeWidth', parseFloat(e.target.value))}
                            className="mt-1 w-full rounded-md p-2"
                            style={{ border: isLight ? '1px solid rgba(15,23,21,0.06)' : '1px solid rgba(16,185,129,0.12)', background: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.06)', color: 'var(--foreground)'}}
                          />
                        </div>
                        <div>
                          <label className="block text-sm" style={{ color: 'var(--primary-300)'}}>Opacity</label>
                          <input
                            type="number"
                            min="0"
                            max="1"
                            step="0.1"
                            value={layer.style.opacity || 0.8}
                            onChange={(e) => handleStyleChange(layer.id, 'opacity', parseFloat(e.target.value))}
                            className="mt-1 w-full rounded-md p-2"
                            style={{ border: isLight ? '1px solid rgba(15,23,21,0.06)' : '1px solid rgba(16,185,129,0.12)', background: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.06)', color: 'var(--foreground)'}}
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
                className="px-4 py-2 rounded-md shadow-md"
                style={{ background: 'var(--primary)', color: 'var(--card-foreground)'}}
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
                className="px-4 py-2 rounded-md"
                style={{ border: isLight ? '1px solid rgba(15,23,21,0.06)' : '1px solid rgba(16,185,129,0.12)', color: 'var(--primary)'}}
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
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--foreground)'}}>
                <MapPin size={14} />
                Map Markers ({markers.length})
              </h4>
              <div className="space-y-2">
                {markers.map((marker, idx) => (
                  <div key={`${marker.id ?? 'marker'}-${idx}`} className="border rounded-2xl p-3 transition-all duration-200" style={{ borderColor: isLight ? 'rgba(15,23,21,0.06)' : 'rgba(16,185,129,0.12)', background: isLight ? 'rgba(255,255,255,0.6)' : 'rgba(8,64,48,0.18)'}}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border-2 shadow-sm"
                          style={{ backgroundColor: marker.color || '#16a34a', borderColor: isLight ? 'rgba(15,23,21,0.08)' : '#fff' }}
                        ></div>
                        <span className="text-sm font-medium" style={{ color: 'var(--foreground)'}}>{marker.label || marker.id}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onMarkerGoto && onMarkerGoto(marker.lng, marker.lat)}
                          className={isLight ? 'text-green-600 hover:text-green-500' : 'text-green-400 hover:text-green-300'}
                          title="Go to marker"
                        >
                          <MapPin size={14} />
                        </button>
                        <button
                          onClick={() => setEditingMarker(editingMarker === marker.id ? null : marker.id)}
                          className={isLight ? 'text-green-600 hover:text-green-500' : 'text-green-400 hover:text-green-300'}
                        >
                          <Settings size={14} />
                        </button>
                      </div>
                    </div>

                    {editingMarker === marker.id && (
                      <div className="space-y-2 mt-2 pt-2" style={{ borderTop: isLight ? '1px solid rgba(15,23,21,0.06)' : '1px solid rgba(16,185,129,0.12)'}}>
                        <div>
                          <label className="block text-sm" style={{ color: 'var(--primary)'}}>Label</label>
                          <input
                            type="text"
                            value={marker.label || ''}
                            onChange={(e) => handleMarkerChange(marker.id, 'label', e.target.value)}
                            className="mt-1 w-full rounded-md border p-2"
                            placeholder="Marker label"
                            style={{ borderColor: isLight ? 'rgba(15,23,21,0.06)' : 'rgba(16,185,129,0.12)', background: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.06)', color: 'var(--foreground)'}}
                          />
                        </div>

                        <div>
                          <label className="block text-sm" style={{ color: 'var(--primary)'}}>Marker Color</label>
                          <input
                            type="color"
                            value={marker.color || '#16a34a'}
                            onChange={(e) => handleMarkerChange(marker.id, 'color', e.target.value)}
                            className="mt-1 w-full h-8 rounded"
                            style={{ border: isLight ? '1px solid rgba(15,23,21,0.06)' : '1px solid rgba(16,185,129,0.12)', background: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.06)'}}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-sm" style={{ color: 'var(--primary)'}}>Longitude</label>
                            <input
                              type="number"
                              step="0.000001"
                              value={marker.lng}
                              onChange={(e) => handleMarkerChange(marker.id, 'lng', e.target.value)}
                              className="mt-1 w-full rounded-md p-2"
                              style={{ border: isLight ? '1px solid rgba(15,23,21,0.06)' : '1px solid rgba(16,185,129,0.12)', background: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.06)', color: 'var(--foreground)'}}
                            />
                          </div>
                          <div>
                            <label className="block text-sm" style={{ color: 'var(--primary)'}}>Latitude</label>
                            <input
                              type="number"
                              step="0.000001"
                              value={marker.lat}
                              onChange={(e) => handleMarkerChange(marker.id, 'lat', e.target.value)}
                              className="mt-1 w-full rounded-md p-2"
                              style={{ border: isLight ? '1px solid rgba(15,23,21,0.06)' : '1px solid rgba(16,185,129,0.12)', background: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.06)', color: 'var(--foreground)'}}
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
        </motion.div>
        </AnimatePresence>
      )}
    </GlassCard>
  );
}
