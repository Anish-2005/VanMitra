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
    <motion.div className={`rounded-3xl overflow-hidden shadow-2xl border p-8 ${isLight ? 'bg-white/80 border-green-200/60 backdrop-blur-xl' : 'bg-white/5 border-white/20 backdrop-blur-xl'}`} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}>
      <motion.div className="text-center mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        <h2 className={`text-2xl sm:text-3xl font-bold mb-2 ${isLight ? 'text-slate-800' : 'text-white'}`}>Public FRA Progress Map</h2>
        <div className={isLight ? 'text-green-700' : 'text-green-300'}>Public map of FRA progress (aggregated)</div>
      </motion.div>

      <motion.div className="mb-8" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
          <div className={isLight ? 'text-green-700 font-medium' : 'text-green-300 font-medium'}>Interactive Preview</div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            <label className={isLight ? 'text-green-700 font-medium' : 'text-green-300 font-medium'}>Boundaries</label>
            <motion.select value={boundarySelection} onChange={(e) => setBoundarySelection(e.target.value as any)} className={`w-full sm:w-auto rounded-2xl border backdrop-blur-sm px-4 py-2 focus:outline-none focus:ring-2 transition-all duration-300 cursor-pointer appearance-none ${isLight ? 'border-green-300 bg-white text-slate-900 placeholder-green-600 focus:ring-green-500 focus:border-green-500 hover:bg-green-50' : 'border-emerald-700/50 bg-gradient-to-r from-emerald-900/20 to-green-900/20 text-white placeholder-green-300 focus:ring-emerald-400 focus:border-emerald-400 hover:bg-gradient-to-r hover:from-emerald-900/30 hover:to-green-900/30'}`} whileHover={{ scale: 1.02 }} whileFocus={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
              <option value="none" className={isLight ? 'bg-white text-slate-900' : 'bg-emerald-900 text-white'}>None</option>
              <option value="state" className={isLight ? 'bg-white text-slate-900' : 'bg-emerald-900 text-white'}>State</option>
              <option value="district" className={isLight ? 'bg-white text-slate-900' : 'bg-emerald-900 text-white'}>District (state + district)</option>
              <option value="tehsil" className={isLight ? 'bg-white text-slate-900' : 'bg-emerald-900 text-white'}>Tehsil (state + district + tehsil)</option>
            </motion.select>
          </div>
        </div>

        <div className={`h-[320px] sm:h-[420px] md:h-[520px] rounded-2xl overflow-hidden border ${isLight ? 'border-green-200/60' : 'border-white/20'}`}>
          <MapPreview layers={{ boundaries: layersBoundaries }} />
        </div>
      </motion.div>
    </motion.div>
  );
}
