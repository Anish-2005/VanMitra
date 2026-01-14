"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import dynamic from 'next/dynamic';
import Header from "@/components/public/Header";
import MapPanel from "@/components/public/MapPanel";
import PublicStatsGrid from "@/components/public/PublicStatsGrid";
import Footer from "@/components/ui/Footer";
import { useTheme } from "@/components/ThemeProvider";

// Client-only components to prevent hydration mismatches
const ThreeBackground = dynamic(() => import('@/components/ui/ThreeBackground'), { ssr: false });
const DecorativeElements = dynamic(() => import('@/components/ui/DecorativeElements'), { ssr: false });

export default function PublicPage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const isLight = mounted && theme === 'light';
  

  // dynamic claims stats
  const [claimsData, setClaimsData] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchClaims = async () => {
      try {
        const res = await fetch('/api/claims?status=all');
        if (!res.ok) return;
        const json = await res.json();
        if (mounted) setClaimsData(json);
      } catch (err) {
        // fail silently for public page
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
      
      <Header isLight={isLight} />

      <main className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16 ${isLight ? 'text-slate-900' : 'text-white'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <MapPanel isLight={isLight} />
          </div>

          <div className="lg:col-span-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <PublicStatsGrid totalClaims={totalClaims} grantedCount={grantedCount} uniqueVillages={uniqueVillages} isLight={isLight} />
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}