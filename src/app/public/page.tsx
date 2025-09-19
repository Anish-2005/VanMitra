"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, MapPin, Database, Layers } from "lucide-react";
import dynamic from 'next/dynamic';
import Link from "next/link";
import MapPreview from "../../components/MapPreview";
import GlassCard from "@/components/ui/GlassCard";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import Footer from "@/components/ui/Footer";
import { useTheme } from "@/components/ThemeProvider";
import ThemeToggle from "@/components/ui/ThemeToggle";

// Client-only components to prevent hydration mismatches
const ThreeBackground = dynamic(() => import('@/components/ui/ThreeBackground'), { ssr: false });
const FloatingOrbs = dynamic(() => import('@/components/ui/FloatingOrbs'), { ssr: false });
const DecorativeElements = dynamic(() => import('@/components/ui/DecorativeElements'), { ssr: false });

export default function PublicPage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const isLight = mounted && theme === 'light';
  const [boundarySelection, setBoundarySelection] = useState<"none"|"state"|"district"|"tehsil">("none");
  const layersBoundaries = (() => {
    switch (boundarySelection) {
      case 'state': return 'state';
      case 'district': return ['state','district'];
      case 'tehsil': return ['state','district','tehsil'];
      default: return false;
    }
  })();

  // dynamic claims stats
  const [claimsData, setClaimsData] = useState<any | null>(null);
  const [claimsLoading, setClaimsLoading] = useState(false);
  const [claimsError, setClaimsError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchClaims = async () => {
      setClaimsLoading(true);
      setClaimsError(null);
      try {
        const res = await fetch('/api/claims?status=all');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (mounted) setClaimsData(json);
      } catch (err: any) {
        if (mounted) setClaimsError(err?.message || 'Failed to load claims');
      } finally {
        if (mounted) setClaimsLoading(false);
      }
    };
    fetchClaims();
    return () => { mounted = false; };
  }, []);

  const totalClaims = claimsData?.features?.length ?? 0;
  const grantedCount = claimsData?.features?.filter((f: any) => f?.properties?.status === 'granted').length ?? 0;
  const uniqueVillages = claimsData?.features ? new Set(claimsData.features.map((f: any) => f?.properties?.village).filter(Boolean)).size : 0;
  
  return (
    <div className={`min-h-screen relative overflow-hidden ${
      isLight 
        ? 'bg-gradient-to-br from-white via-emerald-50 to-green-50 text-slate-900' 
        : 'bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900 text-white'
    }`}>
      <ThreeBackground />
      <DecorativeElements />
      <FloatingOrbs />

      {/* Mesh Gradient Overlay */}
      <div className={isLight 
        ? "fixed inset-0 bg-gradient-to-br from-white/40 via-transparent to-emerald-100/20 pointer-events-none z-1" 
        : "fixed inset-0 bg-gradient-to-br from-green-900/20 via-transparent to-emerald-900/20 pointer-events-none z-1"
      } />

      {/* Animated Grid */}
      <div className={isLight 
        ? "fixed inset-0 opacity-10 pointer-events-none z-1" 
        : "fixed inset-0 opacity-10 pointer-events-none z-1"
      }>
        <div className="absolute inset-0" style={{
          backgroundImage: isLight 
            ? `linear-gradient(rgba(16, 185, 129, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.05) 1px, transparent 1px)`
            : `linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>
      
      <header className="relative z-10 max-w-7xl mx-auto px-6 pt-8 flex items-center justify-between">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className={`h-12 w-12 rounded-2xl flex items-center justify-center border shadow-2xl ${
              isLight 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-200' 
                : 'bg-gradient-to-r from-green-500 to-emerald-500 border-white/20'
            }`}
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Users className="text-white" size={24} />
          </motion.div>
          <div>
            <h1 className={`text-2xl font-bold tracking-tight ${isLight ? 'text-slate-800' : 'text-white'}`}>Public VanMitra View</h1>
            <p className={`text-sm ${isLight ? 'text-green-700' : 'text-green-300'}`}>Public map (no PII)</p>
          </div>
        </motion.div>
        
        <motion.nav
          className="flex items-center gap-4"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Link href="/" className={`text-sm font-medium px-4 py-2 rounded-xl backdrop-blur-sm border transition-colors ${
            isLight 
              ? 'text-green-700 border-green-300 bg-green-50 hover:bg-green-100 hover:text-green-800' 
              : 'text-green-300 border-white/20 bg-white/10 hover:bg-white/20 hover:text-green-400'
          }`}>
            Home
          </Link>
          <ThemeToggle />
        </motion.nav>
      </header>

      <main className={`relative z-10 max-w-7xl mx-auto px-6 py-16 ${isLight ? 'text-slate-900' : 'text-white'}`}>
        <motion.div
          className={`rounded-3xl overflow-hidden shadow-2xl border p-8 ${
            isLight 
              ? 'bg-white/80 border-green-200/60 backdrop-blur-xl' 
              : 'bg-white/5 border-white/20 backdrop-blur-xl'
          }`}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className={`text-3xl font-bold mb-2 ${isLight ? 'text-slate-800' : 'text-white'}`}>Public FRA Progress Map</h2>
            <div className={isLight ? 'text-green-700' : 'text-green-300'}>Public map of FRA progress (aggregated)</div>
          </motion.div>

          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={isLight ? 'text-green-700 font-medium' : 'text-green-300 font-medium'}>Interactive Preview</div>
              <div className="flex items-center gap-3">
                <label className={isLight ? 'text-green-700 font-medium' : 'text-green-300 font-medium'}>Boundaries</label>
                <motion.select
                  value={boundarySelection}
                  onChange={(e) => setBoundarySelection(e.target.value as any)}
                  className={`rounded-2xl border backdrop-blur-sm px-4 py-2 focus:outline-none focus:ring-2 transition-all duration-300 cursor-pointer appearance-none ${
                    isLight
                      ? 'border-green-300 bg-white text-slate-900 placeholder-green-600 focus:ring-green-500 focus:border-green-500 hover:bg-green-50'
                      : 'border-emerald-700/50 bg-gradient-to-r from-emerald-900/20 to-green-900/20 text-white placeholder-green-300 focus:ring-emerald-400 focus:border-emerald-400 hover:bg-gradient-to-r hover:from-emerald-900/30 hover:to-green-900/30'
                  }`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='${
                      isLight ? '%23059669' : '%236ee7b7'
                    }' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <option value="none" className={isLight ? 'bg-white text-slate-900' : 'bg-emerald-900 text-white'}>None</option>
                  <option value="state" className={isLight ? 'bg-white text-slate-900' : 'bg-emerald-900 text-white'}>State</option>
                  <option value="district" className={isLight ? 'bg-white text-slate-900' : 'bg-emerald-900 text-white'}>District (state + district)</option>
                  <option value="tehsil" className={isLight ? 'bg-white text-slate-900' : 'bg-emerald-900 text-white'}>Tehsil (state + district + tehsil)</option>
                </motion.select>
              </div>
            </div>

            <div className={`h-[520px] rounded-2xl overflow-hidden border ${
              isLight ? 'border-green-200/60' : 'border-white/20'
            }`}>
              <MapPreview layers={{ boundaries: layersBoundaries }} />
            </div>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, staggerChildren: 0.2 }}
          >
            {[
              { icon: MapPin, title: "Claims processed", value: totalClaims, loading: claimsLoading, error: claimsError },
              { icon: Database, title: "Granted", value: grantedCount, loading: claimsLoading, error: claimsError },
              { icon: Layers, title: "Villages covered", value: uniqueVillages, loading: claimsLoading, error: claimsError }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + i * 0.2 }}
                whileHover={{ scale: 1.05 }}
              >
                <GlassCard className="p-6 text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500">
                      <stat.icon size={24} className="text-white" />
                    </div>
                  </div>
                  <div className={`text-sm font-medium mb-2 ${isLight ? 'text-green-700' : 'text-green-300'}`}>{stat.title}</div>
                  <div className={`text-3xl font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-white'}`}>
                    {stat.loading ? (
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className={isLight ? 'text-slate-600' : 'text-green-300'}
                      >
                        Loading…
                      </motion.div>
                    ) : stat.error ? (
                      <span className={isLight ? 'text-red-600' : 'text-red-400'}>—</span>
                    ) : (
                      <AnimatedCounter value={stat.value} />
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}