// src/stores/atlas-store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { AtlasLayer, AtlasMarker } from '@/types/api';

interface AtlasState {
  // Map configuration
  center: [number, number];
  zoom: number;
  bounds?: [[number, number], [number, number]];

  // Layers
  layers: AtlasLayer[];
  activeLayers: string[];

  // Markers
  markers: AtlasMarker[];

  // UI state
  isLoading: boolean;
  selectedFeature: string | null;
  measurementMode: boolean;

  // Actions
  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
  setBounds: (bounds: [[number, number], [number, number]]) => void;

  addLayer: (layer: AtlasLayer) => void;
  removeLayer: (layerId: string) => void;
  toggleLayer: (layerId: string) => void;
  updateLayer: (layerId: string, updates: Partial<AtlasLayer>) => void;

  addMarker: (marker: AtlasMarker) => void;
  removeMarker: (markerId: string) => void;
  updateMarker: (markerId: string, updates: Partial<AtlasMarker>) => void;

  setLoading: (loading: boolean) => void;
  setSelectedFeature: (featureId: string | null) => void;
  setMeasurementMode: (enabled: boolean) => void;

  reset: () => void;
}

const initialState = {
  center: [78.9629, 20.5937] as [number, number], // Center of India
  zoom: 5,
  bounds: undefined,
  layers: [],
  activeLayers: [],
  markers: [],
  isLoading: false,
  selectedFeature: null,
  measurementMode: false,
};

export const useAtlasStore = create<AtlasState>()(
  devtools(
    (set) => ({
      ...initialState,

      setCenter: (center) => set({ center }),
      setZoom: (zoom) => set({ zoom }),
      setBounds: (bounds) => set({ bounds }),

      addLayer: (layer) =>
        set((state) => ({
          layers: [...state.layers, layer],
          activeLayers: layer.visible ? [...state.activeLayers, layer.id] : state.activeLayers,
        })),

      removeLayer: (layerId) =>
        set((state) => ({
          layers: state.layers.filter((l) => l.id !== layerId),
          activeLayers: state.activeLayers.filter((id) => id !== layerId),
        })),

      toggleLayer: (layerId) =>
        set((state) => {
          const isActive = state.activeLayers.includes(layerId);
          return {
            activeLayers: isActive
              ? state.activeLayers.filter((id) => id !== layerId)
              : [...state.activeLayers, layerId],
          };
        }),

      updateLayer: (layerId, updates) =>
        set((state) => ({
          layers: state.layers.map((layer) =>
            layer.id === layerId ? { ...layer, ...updates } : layer
          ),
        })),

      addMarker: (marker) =>
        set((state) => ({
          markers: [...state.markers, marker],
        })),

      removeMarker: (markerId) =>
        set((state) => ({
          markers: state.markers.filter((m) => m.id !== markerId),
        })),

      updateMarker: (markerId, updates) =>
        set((state) => ({
          markers: state.markers.map((marker) =>
            marker.id === markerId ? { ...marker, ...updates } : marker
          ),
        })),

      setLoading: (isLoading) => set({ isLoading }),
      setSelectedFeature: (selectedFeature) => set({ selectedFeature }),
      setMeasurementMode: (measurementMode) => set({ measurementMode }),

      reset: () => set(initialState),
    }),
    { name: 'atlas-store' }
  )
);