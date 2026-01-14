"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { BookOpen, MapPin, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import dynamic from 'next/dynamic';
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import GlassCard from "@/components/ui/GlassCard";
import MagneticButton from "@/components/ui/MagneticButton";
import Link from "next/link";
import Results from '@/components/dss/Results';
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Client-only components to prevent hydration mismatches
const ThreeBackground = dynamic(() => import('@/components/ui/ThreeBackground'), { ssr: false });
const DecorativeElements = dynamic(() => import('@/components/ui/DecorativeElements'), { ssr: false });

interface DSSResponse {
  success: boolean;
  data?: string;
  error?: string;
}

export default function DSSPage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const isLight = mounted && theme === 'light';
  
  const [coordinates, setCoordinates] = useState({
    latitude: "",
    longitude: ""
  });
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<DSSResponse | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const lat = parseFloat(coordinates.latitude);
    const lng = parseFloat(coordinates.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      setResponse({
        success: false,
        error: "Please enter valid latitude and longitude values"
      });
      return;
    }

    if (lat < -90 || lat > 90) {
      setResponse({
        success: false,
        error: "Latitude must be between -90 and 90"
      });
      return;
    }

    if (lng < -180 || lng > 180) {
      setResponse({
        success: false,
        error: "Longitude must be between -180 and 180"
      });
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch("/api/dss", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latitude: lat,
          longitude: lng
        }),
      });

      if (res.ok) {
        const data = await res.text();
        setResponse({
          success: true,
          data: data
        });
        // scroll to results on success
        setTimeout(() => {
          try { resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {}
        }, 120);
      } else if (res.status === 422) {
        const errorData = await res.json();
        setResponse({
          success: false,
          error: errorData.detail?.[0]?.msg || "Validation error occurred"
        });
      } else {
        // Handle other error statuses including 500
        const errorText = await res.text();
        setResponse({
          success: false,
          error: `Server error (${res.status}): ${errorText || 'Unknown server error'}`
        });
      }
    } catch (error) {
      setResponse({
        success: false,
        error: "Network error occurred. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: 'latitude' | 'longitude', value: string) => {
    setCoordinates(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear previous response when user starts typing
    if (response) {
      setResponse(null);
    }
  };

  const handleReset = () => {
    setCoordinates({ latitude: '', longitude: '' });
    setResponse(null);
  };

  const handleCopy = async (text?: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      // ignore
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <ProtectedRoute>
      <div className={
        `min-h-screen relative overflow-hidden ${isLight ?
          'bg-gradient-to-br from-emerald-50 via-green-100 to-teal-100 text-slate-900' :
          'bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900 text-white'}`
      }>
        <ThreeBackground />
        <DecorativeElements />

        {/* Mesh Gradient Overlay */}
        <div className={isLight ? "fixed inset-0 bg-gradient-to-br from-white/40 via-transparent to-emerald-100/20 pointer-events-none z-1" : "fixed inset-0 bg-gradient-to-br from-green-900/20 via-transparent to-emerald-900/20 pointer-events-none z-1"} />

        {/* Animated Grid */}
        <div className={isLight ? "fixed inset-0 opacity-10 pointer-events-none z-1" : "fixed inset-0 opacity-10 pointer-events-none z-1"}>
          <div className="absolute inset-0" style={{
            backgroundImage: isLight ? `linear-gradient(rgba(16, 185, 129, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.05) 1px, transparent 1px)` : `linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} />
        </div>

        <Navbar />

        <main className="relative z-10 w-full max-w-[1440px] 2xl:max-w-[1680px] mx-auto px-2 sm:px-4 md:px-8 lg:px-12 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            {/* Hero Section */}
            <motion.section
              className="lg:col-span-7"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants}>
                <motion.div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${isLight ? 'bg-green-100 border border-green-200 text-green-800' : 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 text-green-300'}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <BookOpen size={16} className={isLight ? 'text-green-600' : 'text-green-400'} />
                  <span className="font-medium">Decision Support System</span>
                </motion.div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4 sm:mb-6">
                  <motion.span
                    className={isLight ? 'text-slate-900' : 'bg-gradient-to-r from-white via-green-300 to-emerald-300 bg-clip-text text-transparent'}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.6 }}
                  >
                    Intelligent
                  </motion.span>
                  <br />
                  <motion.span
                    className={isLight ? 'text-green-700' : 'bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent'}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    Scheme Recommendations
                  </motion.span>
                  <br />
                  <motion.span
                    className={isLight ? 'text-slate-800' : 'text-white'}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.6 }}
                  >
                    for Tribal Communities
                  </motion.span>
                </h2>
              </motion.div>

              <motion.div
                className={`text-base sm:text-lg leading-relaxed max-w-full sm:max-w-2xl mb-6 sm:mb-8 ${isLight ? 'text-slate-700' : 'text-green-100'}`}
                variants={itemVariants}
              >
                Get personalized scheme recommendations based on geographical location and community needs. Our AI-powered system analyzes spatial data to suggest the most appropriate development interventions.
              </motion.div>

              <motion.div
                className="flex flex-col sm:flex-row gap-3 mb-8"
                variants={itemVariants}
              >
                <Link href="/dss" className="w-full sm:w-auto">
                  <MagneticButton
                    className={`group w-full sm:w-auto ${isLight
                      ? 'bg-green-600 hover:bg-green-700 text-white border-green-700'
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      <ArrowRight size={20} className="mr-2 group-hover:translate-x-1 transition-transform" />
                      Get Recommendations
                    </div>
                  </MagneticButton>
                </Link>

                <Link href="/atlas" className="w-full sm:w-auto">
                  <MagneticButton
                    as="a"
                    variant={isLight ? "outline" : "secondary"}
                    className={`w-full sm:w-auto ${isLight ? "border-green-600 text-green-700 hover:bg-green-50 hover:border-green-700 hover:text-green-800" : ""}`}
                  >
                    <div className="flex items-center justify-center">
                      <MapPin size={16} className="mr-2" />
                      View Atlas
                    </div>
                  </MagneticButton>
                </Link>
              </motion.div>
            </motion.section>

            {/* DSS Form Section */}
            <motion.aside
              className="lg:col-span-5"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <GlassCard className={`p-4 sm:p-6 lg:p-8 lg:sticky lg:top-28 ${isLight ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 text-slate-900' : 'bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-green-400/30 text-white'}`}>
                  <div className="flex items-center gap-3 mb-6">
                    <motion.div
                      className={`p-3 rounded-xl ${isLight ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'}`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <MapPin size={20} className="text-white" />
                    </motion.div>
                    <h3 className={`text-xl font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>Location Input</h3>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="latitude" className={`block text-sm font-medium mb-2 ${isLight ? 'text-green-700' : 'text-green-300'}`}>
                          Latitude
                        </label>
                          <motion.div whileFocus={{ scale: 1.02 }}>
                          <input
                            type="number"
                            id="latitude"
                              inputMode="decimal"
                            step="any"
                            value={coordinates.latitude}
                            onChange={(e) => handleInputChange('latitude', e.target.value)}
                            placeholder="e.g., 23.2599"
                            className={`w-full px-4 py-3 rounded-2xl backdrop-blur-sm focus:outline-none focus:ring-2 ${isLight 
                              ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-500 focus:ring-green-500' 
                              : 'bg-white/10 border border-white/20 text-white placeholder-green-300 focus:ring-green-400'}`}
                            required
                          />
                        </motion.div>
                        <p className={`text-xs mt-1 ${isLight ? 'text-green-600' : 'text-green-400'}`}>Range: -90 to 90</p>
                      </div>

                      <div>
                        <label htmlFor="longitude" className={`block text-sm font-medium mb-2 ${isLight ? 'text-green-700' : 'text-green-300'}`}>
                          Longitude
                        </label>
                          <motion.div whileFocus={{ scale: 1.02 }}>
                          <input
                            type="number"
                            id="longitude"
                              inputMode="decimal"
                            step="any"
                            value={coordinates.longitude}
                            onChange={(e) => handleInputChange('longitude', e.target.value)}
                            placeholder="e.g., 77.4126"
                            className={`w-full px-4 py-3 rounded-2xl backdrop-blur-sm focus:outline-none focus:ring-2 ${isLight 
                              ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-500 focus:ring-green-500' 
                              : 'bg-white/10 border border-white/20 text-white placeholder-green-300 focus:ring-green-400'}`}
                            required
                          />
                        </motion.div>
                        <p className={`text-xs mt-1 ${isLight ? 'text-green-600' : 'text-green-400'}`}>Range: -180 to 180</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <MagneticButton 
                        type="submit" 
                        disabled={loading} 
                        className="w-full sm:flex-1"
                        variant={isLight ? "primary" : "default"}
                      >
                        {loading ? (
                          <div className="flex items-center justify-center">
                            <Loader2 size={18} className="animate-spin mr-2" />
                            Getting Recommendations...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <BookOpen size={18} className="mr-2" />
                            Get Scheme Recommendations
                          </div>
                        )}
                      </MagneticButton>

                      <button type="button" onClick={handleReset} className={`w-full sm:w-auto px-4 py-3 rounded-2xl border ${isLight ? 'bg-white text-green-700 border-slate-200' : 'bg-white/5 text-white border-white/10'}`}>
                        Reset
                      </button>
                    </div>
                  </form>
                </GlassCard>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                className="mt-8 space-y-4"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <GlassCard className={`p-6 ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
                  <h4 className={`font-semibold mb-4 flex items-center gap-2 ${isLight ? 'text-slate-800' : 'text-white'}`}>
                    <BookOpen size={16} className={isLight ? 'text-green-600' : 'text-green-400'} />
                    Quick Actions
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    <Link href="/atlas">
                      <MagneticButton 
                        variant={isLight ? "outline" : "secondary"} 
                        className="flex items-center justify-center w-full"
                      >
                        <MapPin size={20} className="mr-2" />
                        Open Atlas
                      </MagneticButton>
                    </Link>
                    <Link href="/dashboard">
                      <MagneticButton 
                        variant={isLight ? "outline" : "secondary"} 
                        className="flex items-center justify-center w-full"
                      >
                        <BookOpen size={16} className="mr-2" />
                        View Dashboard
                      </MagneticButton>
                    </Link>
                  </div>
                </GlassCard>
              </motion.div>
            </motion.aside>
          </div>

          {/* Results Section */}
          <motion.section
            className="mt-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <GlassCard className={`p-8 ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
              <h3 className={`text-2xl font-semibold mb-6 flex items-center gap-3 ${isLight ? 'text-slate-800' : 'text-white'}`}>
                <BookOpen size={24} className={isLight ? 'text-green-600' : 'text-green-400'} />
                Recommendations
              </h3>

              <div ref={resultsRef}>
                <Results isLight={isLight} response={response} loading={loading} onCopy={handleCopy} />
              </div>
            </GlassCard>
          </motion.section>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}