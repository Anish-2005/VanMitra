import React from "react";
import GlassCard from "@/components/ui/GlassCard";
import WebGIS, { GISLayer, GISMarker, WebGISRef } from "../../components/WebGIS";
import { motion } from "framer-motion";
import { Filter, Download, MapPin } from "lucide-react";

interface MapSectionProps {
  isLight: boolean;
  filtersCollapsed: boolean;
  setFiltersCollapsed: (v: boolean) => void;
  stateFilter: string;
  setStateFilter: (v: string) => void;
  districtFilter: string;
  setDistrictFilter: (v: string) => void;
  villageQuery: string;
  setVillageQuery: (v: string) => void;
  STATES: any[];
  webGISRef: React.RefObject<WebGISRef>;
  stateCenter: number[];
  layers: GISLayer[];
  markers: GISMarker[];
  handleLayerToggle: (layerId: string) => void;
  handleFeatureClick: (featureInfo: any) => void;
  handleMapClick: (lngLat: any) => void;
  handleExportMap: () => void;
}

const MapSection: React.FC<MapSectionProps> = ({
  isLight, filtersCollapsed, setFiltersCollapsed, stateFilter, setStateFilter, districtFilter, setDistrictFilter, villageQuery, setVillageQuery, STATES, webGISRef, stateCenter, layers, markers, handleLayerToggle, handleFeatureClick, handleMapClick, handleExportMap
}) => (
  <div className="mb-8">
    <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.25 }}>
      <GlassCard className={`p-6 ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-lg font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Interactive Map Preview</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFiltersCollapsed(!filtersCollapsed)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm \
                ${isLight ? 'bg-emerald-100 border border-emerald-200 hover:bg-emerald-200 text-emerald-800' : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white'}`}
            >
              <Filter className={`h-4 w-4 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
              <span>Filters</span>
            </button>
            <button
              onClick={handleExportMap}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm \
                ${isLight ? 'bg-emerald-100 border border-emerald-200 hover:bg-emerald-200 text-emerald-800' : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white'}`}
            >
              <Download className={`h-4 w-4 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
              <span>Export</span>
            </button>
          </div>
        </div>
        {!filtersCollapsed && (
          <motion.div
            className={`mb-6 p-6 rounded-3xl ${isLight ? 'bg-emerald-50 border border-emerald-200' : 'border border-emerald-700/50 bg-gradient-to-r from-emerald-900/20 to-green-900/20 backdrop-blur-xl shadow-2xl'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>State</label>
                <motion.select
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className={`w-full px-4 py-2 rounded-2xl focus:outline-none focus:ring-2 ${isLight
                    ? 'bg-white border border-emerald-300 text-slate-900 placeholder-slate-500 focus:ring-emerald-500 focus:border-emerald-500'
                    : 'border border-emerald-700/50 bg-gradient-to-r from-emerald-900/20 to-green-900/20 backdrop-blur-sm text-white placeholder-green-300 focus:ring-emerald-400 focus:border-emerald-400'}`}
                  whileHover={{ scale: 1.02 }}
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {STATES.map(state => (
                    <option key={state.name} value={state.name} className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}>{state.name}</option>
                  ))}
                </motion.select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>District</label>
                <motion.select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className={`w-full px-4 py-2 rounded-2xl focus:outline-none focus:ring-2 ${isLight
                    ? 'bg-white border border-emerald-300 text-slate-900 placeholder-slate-500 focus:ring-emerald-500 focus:border-emerald-500'
                    : 'border border-emerald-700/50 bg-gradient-to-r from-emerald-900/20 to-green-900/20 backdrop-blur-sm text-white placeholder-green-300 focus:ring-emerald-400 focus:border-emerald-400'}`}
                  whileHover={{ scale: 1.02 }}
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <option value="All" className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}>All Districts</option>
                  <option value="Raipur" className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}>Raipur</option>
                  <option value="Bilaspur" className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}>Bilaspur</option>
                  <option value="Durg" className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}>Durg</option>
                </motion.select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>Search Village</label>
                <motion.input
                  type="text"
                  value={villageQuery}
                  onChange={(e) => setVillageQuery(e.target.value)}
                  placeholder="Enter village name..."
                  className={`w-full px-4 py-2 rounded-2xl focus:outline-none focus:ring-2 ${isLight
                    ? 'bg-white border border-emerald-300 text-slate-900 placeholder-slate-500 focus:ring-emerald-500 focus:border-emerald-500'
                    : 'border border-emerald-700/50 bg-gradient-to-r from-emerald-900/20 to-green-900/20 backdrop-blur-sm text-white placeholder-green-300 focus:ring-emerald-400 focus:border-emerald-400'}`}
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
              </div>
            </div>
          </motion.div>
        )}
        <div className="relative h-96 rounded-lg overflow-hidden">
          <WebGIS
            ref={webGISRef}
            center={[stateCenter[0], stateCenter[1]]}
            zoom={8}
            layers={layers}
            markers={markers}
            onLayerToggle={handleLayerToggle}
            onFeatureClick={handleFeatureClick}
            onMapClick={handleMapClick}
          />
          <div className="absolute top-4 left-4">
            <GlassCard className={`p-2 ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
              <div className={`flex items-center gap-2 text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-600'}`}>
                <MapPin className="h-4 w-4" />
                <span className={isLight ? 'text-slate-900' : 'text-white'}>{stateFilter}, {districtFilter}</span>
              </div>
            </GlassCard>
          </div>
          <div className="absolute bottom-4 right-4">
            <GlassCard className={`p-2 ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
              <div className={`text-xs ${isLight ? 'text-emerald-600' : 'text-emerald-600'}`}>
                <span className={isLight ? 'text-slate-900' : 'text-white'}>Zoom: 8x</span>
                <span className={`mx-2 ${isLight ? 'text-emerald-600' : 'text-emerald-600'}`}>•</span>
                <span className={isLight ? 'text-slate-900' : 'text-white'}>Layers: {layers.filter(l => l.visible).length}/{layers.length}</span>
              </div>
            </GlassCard>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-4">
          {layers.map(layer => (
            <div key={layer.id} className="flex items-center gap-2">
              <div
                className="h-4 w-4 rounded border-2 border-white shadow-sm"
                style={{ backgroundColor: layer.style.fillColor }}
              ></div>
              <span className={`text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>{layer.name}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  </div>
);

export default MapSection;
