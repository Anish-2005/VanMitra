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

        <main className="relative z-10 max-w-7xl mx-auto px-6 py-16">
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

                <h2 className="text-5xl lg:text-5xl font-extrabold leading-tight mb-6">
                  <motion.span
                    className={isLight ? 'text-slate-900' : 'bg-gradient-to-r from-white via-green-300 to-emerald-300 bg-clip-text text-transparent'}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                  >
                    Intelligent
                  </motion.span>
                  <br />
                  <motion.span
                    className={isLight ? 'text-green-700' : 'bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent'}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                  >
                    Scheme Recommendations
                  </motion.span>
                  <br />
                  <motion.span
                    className={isLight ? 'text-slate-800' : 'text-white'}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                  >
                    for Tribal Communities
                  </motion.span>
                </h2>
              </motion.div>

              <motion.div
                className={`text-xl leading-relaxed max-w-2xl mb-8 ${isLight ? 'text-slate-700' : 'text-green-100'}`}
                variants={itemVariants}
              >
                Get personalized scheme recommendations based on geographical location and community needs.
                Our AI-powered system analyzes spatial data to suggest the most appropriate development interventions.
              </motion.div>

              <motion.div
                className="flex flex-wrap gap-3 mb-12 pr-1"
                variants={itemVariants}
              >
                <Link href="/dss">
                <MagneticButton 
                  
                  className={`group ${isLight
                    ? 'bg-green-600 hover:bg-green-700 text-white border-green-700'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white border-white/20'
                    }`}
                >
                  <div className="flex items-center">
                  <ArrowRight size={20} className="mr-2 group-hover:translate-x-1 transition-transform" />
                  Get Recommendations
                  </div>
                </MagneticButton>
                </Link>
                <Link href="/atlas">
                  <MagneticButton
                    as="a"
                    variant={isLight ? "outline" : "secondary"}
                    className={isLight
                      ? "border-green-600 text-green-700 hover:bg-green-50 hover:border-green-700 hover:text-green-800"
                      : ""
                    }
                  >
                     <div className="flex items-center">
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
                <GlassCard className={`p-8 ${isLight ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 text-slate-900' : 'bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-green-400/30 text-white'}`}>
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
                    <div>
                      <label htmlFor="latitude" className={`block text-sm font-medium mb-2 ${isLight ? 'text-green-700' : 'text-green-300'}`}>
                        Latitude
                      </label>
                      <motion.div whileFocus={{ scale: 1.02 }}>
                        <input
                          type="number"
                          id="latitude"
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

                    <MagneticButton 
                      type="submit" 
                      disabled={loading} 
                      className="w-full"
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

              {response === null && !loading && (
                <motion.div
                  className="text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <BookOpen className={`mx-auto mb-4 ${isLight ? 'text-green-500' : 'text-green-300'}`} size={48} />
                  <p className={isLight ? 'text-green-600' : 'text-green-300'}>
                    Enter coordinates above to get scheme recommendations for that location
                  </p>
                </motion.div>
              )}

              {loading && (
                <motion.div
                  className="text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Loader2 className={`mx-auto animate-spin mb-4 ${isLight ? 'text-green-500' : 'text-green-400'}`} size={48} />
                  <p className={isLight ? 'text-green-600' : 'text-green-300'}>Analyzing location and generating recommendations...</p>
                </motion.div>
              )}

              {response && !loading && (
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {response.success ? (
                    <GlassCard className={`p-6 ${isLight 
                      ? 'bg-green-50 border border-green-200 text-slate-900' 
                      : 'bg-green-500/10 border-green-400/30 text-white'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isLight 
                          ? 'bg-green-100' 
                          : 'bg-green-500/20'}`}
                        >
                          <BookOpen className={isLight ? 'text-green-600' : 'text-green-400'} size={16} />
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-semibold mb-2 ${isLight ? 'text-green-800' : 'text-green-300'}`}>Scheme Recommendation</h4>
                          <div className={`rounded-md p-4 border ${isLight 
                            ? 'bg-slate-100 border-green-200 text-slate-800' 
                            : 'bg-slate-800/50 border-green-400/20 text-white'}`}
                          >
                            <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">{response.data}</pre>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  ) : (
                    <GlassCard className={`p-6 ${isLight 
                      ? 'bg-red-50 border border-red-200 text-slate-900' 
                      : 'bg-red-500/10 border-red-400/30 text-white'}`}
                    >
                      <div className="flex items-start gap-3">
                        <AlertCircle className={`flex-shrink-0 mt-0.5 ${isLight ? 'text-red-500' : 'text-red-400'}`} size={20} />
                        <div>
                          <h4 className={`font-semibold mb-2 ${isLight ? 'text-red-800' : 'text-red-300'}`}>Error</h4>
                          <p className={isLight ? 'text-red-700' : 'text-red-200'}>{response.error}</p>
                        </div>
                      </div>
                    </GlassCard>
                  )}
                </motion.div>
              )}
            </GlassCard>
          </motion.section>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}