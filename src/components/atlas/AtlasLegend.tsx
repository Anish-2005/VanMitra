import React from "react";
import GlassCard from "../ui/GlassCard";
import { useTheme } from "../ThemeProvider";

interface AtlasLegendProps {
  claimTypeOptions: string[];
  layers: any[];
  claimTypeColors: Record<string, string>;
  handleLayerToggle: (layerId: string) => void;
}

const AtlasLegend: React.FC<AtlasLegendProps> = ({
  claimTypeOptions,
  layers,
  claimTypeColors,
  handleLayerToggle,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <GlassCard className={`mt-4 p-4 pb-6 ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
      <div className={`flex items-center gap-2 mb-3 p-3 rounded-lg ${isLight ? 'bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100' : 'bg-gradient-to-r from-emerald-900/20 to-green-900/20 border border-emerald-800/30'}`}>
        <h5 className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Legend</h5>
      </div>
    <div className="space-y-3">
      {claimTypeOptions.length ? (
        claimTypeOptions.map((ct) => {
          const layerId = `claims-${ct.toLowerCase()}`;
          const layer = layers.find((l) => l.id === layerId);
          const visible = layer ? !!layer.visible : true;
          const color = claimTypeColors[ct] ?? "#60a5fa";
          return (
            <div key={ct} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span style={{ width: 16, height: 12, background: color, display: "inline-block", borderRadius: 3, border: "1px solid rgba(255,255,255,0.1)" }} />
                  <span className={`text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>{ct} Areas</span>
                </div>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={visible}
                    onChange={() => handleLayerToggle(layerId)}
                    className={`rounded ${isLight ? 'border-slate-300 bg-white' : 'border-green-400/30 bg-slate-800/50'}`}
                  />
                  <span className={`text-sm ${isLight ? 'text-emerald-700' : 'text-green-300'}`}>{visible ? "Visible" : "Hidden"}</span>
                </label>
              </div>
            </div>
          );
        })
      ) : (
        <div className={`text-xs ${isLight ? 'text-emerald-600' : 'text-green-400'}`}>No claim types available</div>
      )}
      <div className="pt-2 border-t border-emerald-700/50">
        <div className={`text-xs ${isLight ? 'text-emerald-600' : 'text-green-400'}`}>
          <div className={`font-medium mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>Note:</div>
          <div>Symbols for claim centroids have been removed for a cleaner overview.</div>
          <div>Use the area layers and zoom controls to inspect claims.</div>
        </div>
      </div>
    </div>
  </GlassCard>
);

export default AtlasLegend;
