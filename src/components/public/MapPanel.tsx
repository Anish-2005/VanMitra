"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import MapPreview from "@/components/MapPreview";

type Props = { isLight: boolean };

export default function MapPanel({ isLight }: Props) {
  const [boundarySelection, setBoundarySelection] = useState<"none"|"state"|"district"|"tehsil">("none");

  const layersBoundaries = (() => {
    switch (boundarySelection) {
      case 'state': return 'state';
      case 'district': return ['state','district'];
      case 'tehsil': return ['state','district','tehsil'];
      default: return false;
    }
  })();

  return (
    <motion.div
      className={`rounded-3xl overflow-hidden shadow-2xl border ${isLight ? 'bg-white/80 border-green-200/60 backdrop-blur-xl' : 'bg-white/5 border-white/20 backdrop-blur-xl'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className={`text-lg sm:text-2xl font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>Public FRA Progress Map</h2>
            <p className={`text-sm mt-1 ${isLight ? 'text-green-700' : 'text-green-300'}`}>Interactive, aggregated view of FRA implementation.</p>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${isLight ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-white/6 text-green-300 border border-white/8'}`}>Public Data</div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${isLight ? 'bg-white text-slate-900 border border-green-200' : 'bg-white/4 text-white border border-white/6'}`}>No PII</div>
          </div>
        </div>

        <div className="relative rounded-2xl overflow-hidden border" style={{ minHeight: 320 }}>
          {/* Controls overlay */}
          <div className={`absolute top-4 left-4 z-20 w-[calc(100%-2rem)] sm:w-auto sm:left-6 sm:right-auto flex flex-col sm:flex-row gap-2 items-start sm:items-center`}> 
            <div className={`flex items-center gap-2 p-2 rounded-2xl border ${isLight ? 'bg-white/90 border-green-200/60' : 'bg-black/40 border-white/10'}`}>
              <input aria-label="Search location" placeholder="Search state or village" className={`px-3 py-1 rounded-md w-44 sm:w-60 text-sm ${isLight ? 'bg-white text-slate-900 placeholder-green-600' : 'bg-transparent text-white placeholder-green-300'}`} />
            </div>

            <div className={`flex items-center gap-2 p-2 rounded-2xl border ${isLight ? 'bg-white/90 border-green-200/60' : 'bg-black/40 border-white/10'}`}>
              <label className={`text-sm font-medium ${isLight ? 'text-green-700' : 'text-green-300'}`}>Boundaries</label>
              <div>
                <select
                  aria-label="Select boundaries"
                  value={boundarySelection}
                  onChange={(e) => setBoundarySelection(e.target.value as any)}
                  className={`public-boundary-select ml-2 rounded-xl border px-3 py-1 text-sm appearance-none ${isLight ? 'text-slate-900 border-green-300' : 'text-white border-white/12'}`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='${isLight ? '%23059669' : '%236ee7b7'}' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.25em 1.25em',
                    paddingRight: '2.25rem',
                    backgroundColor: isLight ? 'rgba(255,255,255,1)' : 'rgba(15,23,42,0.6)'
                  }}
                >
                  <option value="none">None</option>
                  <option value="state">State</option>
                  <option value="district">District</option>
                  <option value="tehsil">Tehsil</option>
                </select>

                <style>{`
                  .public-boundary-select option { background-color: ${isLight ? '#ffffff' : '#0f172a'}; color: ${isLight ? '#0f172a' : '#ffffff'};
                  }
                  .public-boundary-select::-ms-expand { display: none; }
                `}</style>
              </div>
            </div>
          </div>

          {/* Map preview */}
          <div className={`h-[320px] sm:h-[420px] md:h-[520px] w-full`}>
            <MapPreview layers={{ boundaries: layersBoundaries }} />
          </div>

          {/* Legend */}
          <div className={`absolute left-4 bottom-4 z-20 p-3 rounded-xl border ${isLight ? 'bg-white/90 border-green-200/60' : 'bg-black/40 border-white/10'}`}>
            <div className="text-xs font-semibold mb-2">Legend</div>
            <div className="flex items-center gap-3 text-xs">
              <div className="w-5 h-3 rounded-sm bg-gradient-to-r from-green-500 to-emerald-500 border" />
              <div>Granted</div>
              <div className="w-5 h-3 rounded-sm bg-yellow-400 border ml-3" />
              <div>Under Review</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
