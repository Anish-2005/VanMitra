"use client";

import React from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import MagneticButton from "@/components/ui/MagneticButton";
import { Shield, Satellite, Server } from "lucide-react";

type Props = {
  isLight: boolean;
  claimsTotal: number;
  claimsGranted: number;
  containerVariants?: any;
  itemVariants?: any;
};

export default function RightSidebar({ isLight, claimsTotal, claimsGranted, containerVariants, itemVariants }: Props) {
  return (
    <motion.aside className="lg:col-span-5" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, duration: 0.8 }}>
      <motion.div className="relative" whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 200 }}>
        <GlassCard className={`p-8 ${isLight ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 text-slate-900' : 'bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-green-400/30 text-white'}`}>
          <div className="absolute inset-0 opacity-10">
            <div className={`absolute inset-0 ${isLight ? 'bg-gradient-to-r from-green-200/20 to-transparent' : 'bg-gradient-to-r from-green-400/20 to-transparent'} animate-pulse`} />
          </div>

          <div className="relative z-10 flex flex-col items-center space-y-6 px-4 md:px-0">
            <motion.div className="mb-4 w-full flex justify-center" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8, duration: 0.6 }}>
              <svg viewBox="0 0 1000 1000" className="w-56 h-36 rounded-3xl shadow-2xl" xmlns="http://www.w3.org/2000/svg">
                <path d="M500,50 L550,150 L600,200 L650,250 L600,300 L550,350 L500,400 L450,350 L400,300 L450,250 L400,200 L450,150 Z" fill="url(#mpGradient)" stroke={isLight ? "#059669" : "white"} strokeWidth="4" />
                <defs>
                  <linearGradient id="mpGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={isLight ? "#34d399" : "#22c55e"} />
                    <stop offset="100%" stopColor={isLight ? "#10b981" : "#10b981"} />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>

            <div className="text-center mb-4">
              <div className={`text-sm font-medium mb-2 tracking-wide ${isLight ? 'text-green-700' : 'text-green-300'}`}>Pilot: Madhya Pradesh</div>
              <div className={`text-4xl md:text-5xl font-extrabold flex justify-center items-center gap-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <div className="flex items-center gap-1"><AnimatedCounter value={claimsTotal} /><span className={`text-lg md:text-xl font-semibold ${isLight ? 'text-green-700' : 'text-green-300'}`}>claims</span></div>
                <span className={isLight ? 'text-green-600 font-bold' : 'text-green-500 font-bold'}>•</span>
                <div className="flex items-center gap-1"><AnimatedCounter value={claimsGranted} /><span className={`text-lg md:text-xl font-semibold ${isLight ? 'text-green-700' : 'text-green-300'}`}>granted</span></div>
              </div>
            </div>

            <div className="w-full max-w-md flex flex-col gap-4">
              <GlassCard className={`p-5 backdrop-blur-md rounded-2xl hover:scale-105 transition-transform duration-300 shadow-lg ${isLight ? 'bg-green-50/80 border border-green-200' : 'bg-white/10'}`}>
                <div className="flex justify-between items-center"><span className={isLight ? 'text-green-700 font-medium' : 'text-green-200 font-medium'}>AI-derived ponds:</span><span className={`font-bold text-lg ${isLight ? 'text-slate-900' : 'text-white'}`}>412</span></div>
                <div className="flex justify-between items-center mt-2"><span className={isLight ? 'text-green-700 font-medium' : 'text-green-200 font-medium'}>Cropland area:</span><span className={`font-bold text-lg ${isLight ? 'text-slate-900' : 'text-white'}`}>3,120 ha</span></div>
              </GlassCard>

              <GlassCard className={`p-5 backdrop-blur-md rounded-2xl hover:scale-105 transition-transform duration-300 shadow-lg ${isLight ? 'bg-amber-50/80 border border-amber-200' : 'bg-white/10'}`}>
                <div className="flex justify-between items-center"><span className={isLight ? 'text-amber-700 font-medium' : 'text-green-200 font-medium'}>Water index:</span><span className={`font-bold text-lg ${isLight ? 'text-amber-600' : 'text-amber-300'}`}>Low</span></div>
                <div className="flex justify-between items-center mt-2"><span className={isLight ? 'text-amber-700 font-medium' : 'text-green-200 font-medium'}>Vulnerability score:</span><span className={`font-bold text-lg ${isLight ? 'text-red-600' : 'text-red-300'}`}>High</span></div>
              </GlassCard>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Tech Cards area (small list) */}
      <motion.div className="mt-8 space-y-6" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        {[{ icon: Satellite, title: "AI & Remote Sensing", description: "Semantic segmentation (U-Net/DeepLab), NDVI/NDWI indices, STAC-managed imagery.", tags: ["Computer Vision","Satellite Imagery"] }, { icon: Server, title: "Backend & Data Infrastructure", description: "PostGIS, STAC + Titiler, and microservices for DSS.", tags: ["PostGIS","STAC"] }].map((tech, i) => (
          <motion.div key={i} variants={itemVariants}>
            <GlassCard className={`p-6 ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600`}><tech.icon size={20} className="text-white" /></div>
                <h4 className={`font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>{tech.title}</h4>
              </div>
              <div className={`mb-4 leading-relaxed ${isLight ? 'text-slate-700' : 'text-green-100'}`}>{tech.description}</div>
              <div className="flex flex-wrap gap-2">{tech.tags.map((tag, j) => (<span key={j} className={`text-xs px-3 py-1 rounded-full border ${isLight ? 'bg-green-100 text-green-800 border-green-200' : 'bg-green-500/20 text-green-300 border-white/20'}`}>{tag}</span>))}</div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>
    </motion.aside>
  );
}
