import React from "react";
import GlassCard from "@/components/ui/GlassCard";
import { Ruler, Download } from "lucide-react";

interface AtlasToolsSectionProps {
  isLight: boolean;
  isMeasuring: boolean;
  measurementDistance: number | null;
  webGISRef: any;
  handleExportGeoJSON: () => void;
  handleExportMap: () => void;
}

const AtlasToolsSection: React.FC<AtlasToolsSectionProps> = ({
  isLight,
  isMeasuring,
  measurementDistance,
  webGISRef,
  handleExportGeoJSON,
  handleExportMap,
}) => (
  <>
    <GlassCard className={`mt-4 p-4 pb-6 ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
      <div className="flex items-center gap-2 mb-3">
        <Ruler size={16} className={isLight ? 'text-emerald-600' : 'text-emerald-400'} />
        <h4 className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Measurement Tools</h4>
      </div>
      <div className="space-y-3">
        {!isMeasuring ? (
          <button
            onClick={() => webGISRef.current?.startMeasurement?.()}
            className={`w-full px-4 py-2 rounded-md transition duration-200 ${isLight ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
          >
            Start Measurement
          </button>
        ) : (
          <div className={`text-sm p-3 rounded-md border ${isLight ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 'bg-yellow-500/20 text-yellow-200 border-yellow-400/30'}`}>
            Click two points on the map to measure distance
          </div>
        )}
        {measurementDistance && (
          <div className={`text-sm p-3 rounded-md border ${isLight ? 'bg-green-100 text-green-800 border-green-300' : 'bg-green-500/20 text-green-200 border-green-400/30'}`}>
            <strong>Distance:</strong> {measurementDistance.toFixed(2)} km
          </div>
        )}
        <button
          onClick={() => webGISRef.current?.clearMeasurement?.()}
          className={`w-full px-4 py-2 rounded-md transition duration-200 ${isLight ? 'bg-gray-500 hover:bg-gray-600 text-white' : 'bg-gray-500 hover:bg-gray-600 text-white'}`}
        >
          Clear Measurement
        </button>
      </div>
    </GlassCard>
    <GlassCard className={`mt-4 p-4 pb-6 ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
      <div className="flex items-center gap-2 mb-3">
        <Download size={16} className={isLight ? 'text-emerald-600' : 'text-emerald-400'} />
        <h4 className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Export Tools</h4>
      </div>
      <div className="space-y-3">
        <button
          onClick={handleExportGeoJSON}
          className={`w-full px-4 py-2 rounded-md transition duration-200 ${isLight ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
        >
          Export GeoJSON
        </button>
        <button
          onClick={handleExportMap}
          className={`w-full px-4 py-2 rounded-md transition duration-200 ${isLight ? 'border border-emerald-300 text-emerald-700 hover:bg-emerald-50' : 'border border-emerald-600/50 text-emerald-300 hover:bg-emerald-500/20'}`}
        >
          Export Map Image
        </button>
      </div>
    </GlassCard>
  </>
);

export default AtlasToolsSection;
