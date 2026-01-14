"use client";

import React from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import MagneticButton from "@/components/ui/MagneticButton";
import { Loader2, BookOpen } from "lucide-react";

type Props = {
  isLight: boolean;
  coordinates: { latitude: string; longitude: string };
  onChange: (field: 'latitude'|'longitude', value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  loading: boolean;
};

export default function DSSForm({ isLight, coordinates, onChange, onSubmit, onReset, loading }: Props) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 200 }}>
      <GlassCard className={`p-4 sm:p-6 lg:p-8 lg:sticky lg:top-28 ${isLight ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 text-slate-900' : 'bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-green-400/30 text-white'}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500`}>
            <BookOpen size={20} className="text-white" />
          </div>
          <h3 className={`text-xl font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>Location Input</h3>
        </div>

        <form onSubmit={onSubmit} className="space-y-6" id="dss-form">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="latitude" className={`block text-sm font-medium mb-2 ${isLight ? 'text-green-700' : 'text-green-300'}`}>Latitude</label>
              <motion.div whileFocus={{ scale: 1.02 }}>
                <input inputMode="decimal" type="number" id="latitude" step="any" value={coordinates.latitude} onChange={(e) => onChange('latitude', e.target.value)} placeholder="e.g., 23.2599" className={`w-full px-4 py-3 rounded-2xl backdrop-blur-sm focus:outline-none focus:ring-2 ${isLight ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-500 focus:ring-green-500' : 'bg-white/10 border border-white/20 text-white placeholder-green-300 focus:ring-green-400'}`} required />
              </motion.div>
              <p className={`text-xs mt-1 ${isLight ? 'text-green-600' : 'text-green-400'}`}>Range: -90 to 90</p>
            </div>

            <div>
              <label htmlFor="longitude" className={`block text-sm font-medium mb-2 ${isLight ? 'text-green-700' : 'text-green-300'}`}>Longitude</label>
              <motion.div whileFocus={{ scale: 1.02 }}>
                <input inputMode="decimal" type="number" id="longitude" step="any" value={coordinates.longitude} onChange={(e) => onChange('longitude', e.target.value)} placeholder="e.g., 77.4126" className={`w-full px-4 py-3 rounded-2xl backdrop-blur-sm focus:outline-none focus:ring-2 ${isLight ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-500 focus:ring-green-500' : 'bg-white/10 border border-white/20 text-white placeholder-green-300 focus:ring-green-400'}`} required />
              </motion.div>
              <p className={`text-xs mt-1 ${isLight ? 'text-green-600' : 'text-green-400'}`}>Range: -180 to 180</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <MagneticButton type="submit" disabled={loading} className="w-full sm:flex-1" variant={isLight ? "primary" : "default"}>
              {loading ? (
                <div className="flex items-center justify-center"><Loader2 size={18} className="animate-spin mr-2" />Getting Recommendations...</div>
              ) : (
                <div className="flex items-center justify-center"><BookOpen size={18} className="mr-2" />Get Scheme Recommendations</div>
              )}
            </MagneticButton>

            <button type="button" onClick={onReset} className={`w-full sm:w-auto px-4 py-3 rounded-2xl border ${isLight ? 'bg-white text-green-700 border-slate-200' : 'bg-white/5 text-white border-white/10'}`}>Reset</button>
          </div>
        </form>
      </GlassCard>
    </motion.div>
  );
}
