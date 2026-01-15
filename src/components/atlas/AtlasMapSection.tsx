import React from "react";
import WebGIS, { type WebGISRef as WebGISRefType } from "../WebGIS";
import GlassCard from "../ui/GlassCard";
import { motion } from "framer-motion";
import { useTheme } from "../ThemeProvider";

interface AtlasMapSectionProps {
  mapKey: number;
  mapCenter: [number, number] | null;
  stateCenter: [number, number];
  mapZoom: number;
  searchResultsLayer: any;
  boundaryLayers: any[];
  layers: any[];
  markers: any[];
  webGISRef: React.RefObject<WebGISRefType>;
  handleFeatureClick: (featureInfo: any) => void;
  handleMapClick: (lngLat: { lng: number; lat: number }) => void;
  stateFilter: string;
  districtFilter: string;
  handleLayerToggle: (layerId: string) => void;
}

const AtlasMapSection: React.FC<AtlasMapSectionProps> = ({
  mapKey,
  mapCenter,
  stateCenter,
  mapZoom,
  searchResultsLayer,
  boundaryLayers,
  layers,
  markers,
  webGISRef,
  handleFeatureClick,
  handleMapClick,
  stateFilter,
  districtFilter,
  handleLayerToggle,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
  <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
    <GlassCard className={`p-0 overflow-hidden ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
      <div className="w-full h-[560px] relative rounded-2xl">
        {/* subtle tint overlay */}
        <div className={`absolute inset-0 rounded-2xl pointer-events-none ${isLight ? 'bg-emerald-100/20' : 'bg-green-900/10'}`} />
        <div className="relative z-10 h-full">
          <WebGIS
            key={mapKey}
            ref={webGISRef}
            center={(mapCenter ?? stateCenter) as [number, number]}
            zoom={mapZoom}
            layers={
              searchResultsLayer
                ? [searchResultsLayer, ...boundaryLayers, ...layers]
                : [...boundaryLayers, ...layers]
            }
            markers={markers}
            onFeatureClick={handleFeatureClick}
            onMapClick={handleMapClick}
            enableGeocoder={true}
            enableMeasurement={true}
            className="w-full h-full"
            showControls={false}
            state={stateFilter}
            district={districtFilter}
            onLayerToggle={handleLayerToggle}
          />
        </div>
      </div>
    </GlassCard>
  </motion.div>
);
};
export default AtlasMapSection;
