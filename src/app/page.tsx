"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import * as THREE from 'three';
import {
  ArrowRight, Leaf, MapPin, Server, Database, Layers,
  Cloud, Cpu, BookOpen, Clock, Check, Users,
  Shield, BarChart3, Target, Satellite, Map, Sparkles, Zap, Globe,
  Info, ChevronDown, ChevronUp, Search, Filter, FileText,
  Sprout, Droplets, Trees, Mountain, Sun
} from "lucide-react";
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import ThreeBackground from "@/components/ui/ThreeBackground";
import GlassCard from "@/components/ui/GlassCard";
import MagneticButton from "@/components/ui/MagneticButton";
import Tooltip from "@/components/ui/Tooltip";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

// Client-only components to prevent hydration mismatches
const DecorativeElements = dynamic(() => import('@/components/ui/DecorativeElements'), { ssr: false });

export default function Home() {
  const { theme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const isLight = mounted && theme === 'light';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState<{ email: string } | null>(null);

  // Mock data - replace with real API calls
  const [claimsSummaryLoading, setClaimsSummaryLoading] = useState(false);
  const [claimsTotal, setClaimsTotal] = useState(20);
  const [claimsGranted, setClaimsGranted] = useState(3);
  const [claimsError, setClaimsError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchClaims = async () => {
      setClaimsSummaryLoading(true);
      setClaimsError(null);
      try {
        const res = await fetch('/api/claims?status=all');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!mounted) return;
        const features = json?.features ?? [];
        setClaimsTotal(features.length);
        setClaimsGranted(features.filter((f: any) => f?.properties?.status === 'granted').length);
      } catch (err: any) {
        if (!mounted) return;
        setClaimsError(err?.message || 'Failed to load claims');
      } finally {
        if (mounted) setClaimsSummaryLoading(false);
      }
    };

    fetchClaims();
    return () => { mounted = false; };
  }, []);

  const { scrollYProgress } = useScroll();
  const scaleProgress = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const opacityProgress = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const handleLogin = async () => {
    try {
      // Mock authentication
      setUser({ email });
      setLoginOpen(false);
      setError("");
    } catch {
      setError("Invalid credentials");
    }
  };

  const handleLogout = async () => {
    setUser(null);
  };

  // Container variants for stagger animation
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

      {/* Header */}
      <Navbar />

      {/* Login Modal */}
      <AnimatePresence>
        {loginOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={isLight ? "absolute inset-0 bg-white/60 backdrop-blur-sm" : "absolute inset-0 bg-black/60 backdrop-blur-sm"}
              onClick={() => setLoginOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className={`relative rounded-3xl shadow-2xl p-8 w-full max-w-md mx-4 backdrop-blur-xl ${isLight ? 'bg-white border border-slate-200' : 'bg-gradient-to-br from-slate-800 to-green-800 border border-white/20'}`}
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <h3 className={`text-2xl font-bold mb-6 text-center ${isLight ? 'text-slate-900' : 'text-white'}`}>Welcome Back</h3>
              {error && (
                <motion.p
                  className="text-red-500 mb-4 text-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.p>
              )}

              <div className="space-y-4">
                <motion.input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 ${isLight ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-500 focus:ring-green-500' : 'bg-white/10 border border-white/20 text-white placeholder-green-300 focus:ring-green-400'}`}
                  whileFocus={{ scale: 1.02 }}
                />
                <motion.input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 ${isLight ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-500 focus:ring-green-500' : 'bg-white/10 border border-white/20 text-white placeholder-green-300 focus:ring-green-400'}`}
                  whileFocus={{ scale: 1.02 }}
                />
                <MagneticButton onClick={handleLogin} className="w-full">
                  Sign In
                </MagneticButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main id="atlas" className={`relative z-10 max-w-7xl mx-auto px-6 py-16 ${isLight ? 'text-slate-900' : 'text-white'}`}>
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
                <Sparkles size={16} className={isLight ? 'text-green-600' : 'text-green-400'} />
                <span className="font-medium">Next-Gen Forest Rights Platform</span>
              </motion.div>

              <h2 className="text-5xl lg:text-5xl font-extrabold leading-tight mb-6">
                <motion.span
                  className={isLight ? 'text-slate-900' : 'bg-gradient-to-r from-white via-green-300 to-emerald-300 bg-clip-text text-transparent'}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                >
                  Empowering
                </motion.span>
                <br />
                <motion.span
                  className={isLight ? 'text-green-700' : 'bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent'}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  Tribal Communities
                </motion.span>
                <br />
                <motion.span
                  className={isLight ? 'text-slate-800' : 'text-white'}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                >
                  Through Technology
                </motion.span>
              </h2>
            </motion.div>

            <motion.div
              className={`text-xl leading-relaxed max-w-2xl mb-8 ${isLight ? 'text-slate-700' : 'text-green-100'}`}
              variants={itemVariants}
            >
              A revolutionary{" "}
              <Tooltip content="Web-based Geographic Information System - A platform for displaying, analyzing, and managing spatial data through web browsers">
                <span className={`${isLight ? 'text-green-700 font-semibold underline decoration-dotted cursor-help' : 'text-green-300 font-semibold underline decoration-dotted cursor-help'}`}>WebGIS</span>
              </Tooltip>{" "}
              platform that transforms Forest Rights Act records, maps community assets with{" "}
              <Tooltip content="Artificial Intelligence algorithms that automatically detect and classify features from satellite images">
                <span className={`${isLight ? 'text-green-700 font-semibold underline decoration-dotted cursor-help' : 'text-green-300 font-semibold underline decoration-dotted cursor-help'}`}>AI-powered</span>
              </Tooltip>{" "}
              satellite imagery, and delivers intelligent decision support for targeted rural development.
            </motion.div>

            <motion.div
              className="flex flex-wrap gap-3 mb-12 pr-1"
              variants={itemVariants}
            >
              <MagneticButton
                onClick={() => router.push('/atlas')}
                className={`group ${isLight
                  ? 'bg-green-600 hover:bg-green-700 text-white border-green-700'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white border-white/20'
                  }`}
              >
                <div className="flex items-center">
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform mr-2" />
                Explore Atlas

                </div>
              </MagneticButton>

              <MagneticButton
              onClick={() => router.push('/contact')}
                variant={isLight ? "outline" : "secondary"}
                className={isLight
                  ? "border-green-600 text-green-700 hover:bg-green-50 hover:border-green-700 hover:text-green-800"
                  : ""
                }
              >
                <div className="flex items-center">
                  <Globe size={16} className="mr-2" />
                  Request Demo
                </div>
              </MagneticButton>

              <MagneticButton
               onClick={() => router.push('/dss')}
                variant={isLight ? "outline" : "secondary"}
                className={isLight
                  ? "border-green-600 text-green-700 hover:bg-green-50 hover:border-green-700 hover:text-green-800"
                  : ""
                }
              >
                <Zap size={16} className="mr-2" />
                DSS Features
              </MagneticButton>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              variants={containerVariants}
            >
              {[
                { icon: MapPin, title: "Claims", value: claimsTotal, subtitle: "legacy + recent uploads" },
                { icon: Database, title: "Grants issued", value: claimsGranted, subtitle: "verified & geo-referenced" },
                { icon: Layers, title: "AI assets", value: 12, subtitle: "ponds, farms, homesteads" }
              ].map((stat, i) => (
                <motion.div key={i} variants={itemVariants}>
                  <GlassCard className={`p-6 ${isLight ? 'bg-white/90 border border-slate-200 text-slate-900 shadow-md' : ''}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-xl ${isLight ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'bg-gradient-to-r from-green-500 to-emerald-500'}`}>
                        <stat.icon size={20} className="text-white" />
                      </div>
                      <h4 className={`font-semibold ${isLight ? 'text-slate-800' : 'text-green-100'}`}>{stat.title}</h4>
                    </div>
                    <div className={`text-3xl font-bold mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      <AnimatedCounter value={stat.value} />
                    </div>
                    <div className={`text-sm ${isLight ? 'text-green-700' : 'text-green-300'}`}>{stat.subtitle}</div>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>

            {/* Problem Section */}
            <motion.div
              className="mt-16"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <GlassCard className={`p-8 ${isLight ? 'bg-gradient-to-r from-amber-100 to-orange-100 border-amber-200 text-amber-900' : 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-400/20 text-green-100'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <Shield size={24} className={isLight ? 'text-amber-600' : 'text-amber-400'} />
                  <h3 className={`text-2xl font-semibold ${isLight ? 'text-amber-900' : 'text-white'}`}>Problem Background</h3>
                </div>
                <div className="leading-relaxed">
                  The Forest Rights Act (FRA), 2006 recognizes the rights of forest-dwelling communities
                  over land and forest resources. However, significant challenges persist with legacy
                  records being scattered, non-digitized, and difficult to verify, lacking centralized
                  visual repositories and integration with satellite-based asset mapping.
                </div>
              </GlassCard>
            </motion.div>
          </motion.section>

          {/* Right Sidebar */}
          <motion.aside
            className="lg:col-span-5"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <motion.div
              className="relative"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <GlassCard className={`p-8 ${isLight ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 text-slate-900' : 'bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-green-400/30 text-white'}`}>
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className={`absolute inset-0 ${isLight ? 'bg-gradient-to-r from-green-200/20 to-transparent' : 'bg-gradient-to-r from-green-400/20 to-transparent'} animate-pulse`} />
                </div>

                <div className="relative z-10 flex flex-col items-center space-y-6 px-4 md:px-0">
                  {/* Madhya Pradesh silhouette */}
                  <motion.div
                    className="mb-4 w-full flex justify-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                  >
                    <svg
                      viewBox="0 0 1000 1000"
                      className="w-56 h-36 rounded-3xl shadow-2xl"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M500,50 L550,150 L600,200 L650,250 L600,300 L550,350 L500,400 L450,350 L400,300 L450,250 L400,200 L450,150 Z"
                        fill="url(#mpGradient)"
                        stroke={isLight ? "#059669" : "white"}
                        strokeWidth="4"
                      />
                      <defs>
                        <linearGradient id="mpGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor={isLight ? "#34d399" : "#22c55e"} />
                          <stop offset="100%" stopColor={isLight ? "#10b981" : "#10b981"} />
                        </linearGradient>
                      </defs>
                    </svg>
                  </motion.div>

                  {/* Pilot & claims counter */}
                  <div className="text-center mb-4">
                    <div className={`text-sm font-medium mb-2 tracking-wide ${isLight ? 'text-green-700' : 'text-green-300'}`}>Pilot: Madhya Pradesh</div>
                    <div className={`text-4xl md:text-5xl font-extrabold flex justify-center items-center gap-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      <div className="flex items-center gap-1">
                        <AnimatedCounter value={claimsTotal} />
                        <span className={`text-lg md:text-xl font-semibold ${isLight ? 'text-green-700' : 'text-green-300'}`}>claims</span>
                      </div>
                      <span className={isLight ? 'text-green-600 font-bold' : 'text-green-500 font-bold'}>•</span>
                      <div className="flex items-center gap-1">
                        <AnimatedCounter value={claimsGranted} />
                        <span className={`text-lg md:text-xl font-semibold ${isLight ? 'text-green-700' : 'text-green-300'}`}>granted</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="w-full max-w-md flex flex-col gap-4">
                    <GlassCard className={`p-5 backdrop-blur-md rounded-2xl hover:scale-105 transition-transform duration-300 shadow-lg ${isLight ? 'bg-green-50/80 border border-green-200' : 'bg-white/10'}`}>
                      <div className="flex justify-between items-center">
                        <span className={isLight ? 'text-green-700 font-medium' : 'text-green-200 font-medium'}>AI-derived ponds:</span>
                        <span className={`font-bold text-lg ${isLight ? 'text-slate-900' : 'text-white'}`}>412</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className={isLight ? 'text-green-700 font-medium' : 'text-green-200 font-medium'}>Cropland area:</span>
                        <span className={`font-bold text-lg ${isLight ? 'text-slate-900' : 'text-white'}`}>3,120 ha</span>
                      </div>
                    </GlassCard>

                    <GlassCard className={`p-5 backdrop-blur-md rounded-2xl hover:scale-105 transition-transform duration-300 shadow-lg ${isLight ? 'bg-amber-50/80 border border-amber-200' : 'bg-white/10'}`}>
                      <div className="flex justify-between items-center">
                        <span className={isLight ? 'text-amber-700 font-medium' : 'text-green-200 font-medium'}>Water index:</span>
                        <span className={`font-bold text-lg ${isLight ? 'text-amber-600' : 'text-amber-300'}`}>Low</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className={isLight ? 'text-amber-700 font-medium' : 'text-green-200 font-medium'}>Vulnerability score:</span>
                        <span className={`font-bold text-lg ${isLight ? 'text-red-600' : 'text-red-300'}`}>High</span>
                      </div>
                    </GlassCard>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Tech Cards */}
            <motion.div
              className="mt-8 space-y-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                {
                  icon: Satellite,
                  title: "AI & Remote Sensing",
                  description: "Semantic segmentation (U-Net/DeepLab), NDVI/NDWI indices, STAC-managed imagery, and active learning to refine asset detection.",
                  tags: ["Computer Vision", "Satellite Imagery", "Land Classification"],
                  color: "blue",
                  tooltip: "Advanced AI techniques for analyzing satellite and aerial imagery to identify and classify land features, water bodies, and vegetation patterns."
                },
                {
                  icon: Server,
                  title: "Backend & Data Infrastructure",
                  description: "PostGIS for spatial joins, STAC + Titiler for imagery, GeoServer or vector-tile pipeline for map serving, and FastAPI for DSS microservices.",
                  tags: ["PostGIS", "STAC", "FastAPI"],
                  color: "indigo",
                  tooltip: "Robust server-side architecture for handling spatial data, imagery processing, and delivering map services efficiently."
                }
              ].map((tech, i) => (
                <motion.div key={i} variants={itemVariants}>
                  <GlassCard className={`p-6 ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <Tooltip content={tech.tooltip} position="top">
                        <div className={`p-3 rounded-xl bg-gradient-to-r from-${tech.color}-500 to-${tech.color}-600 cursor-help`}>
                          <tech.icon size={20} className="text-white" />
                        </div>
                      </Tooltip>
                      <h4 className={`font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>{tech.title}</h4>
                    </div>
                    <div className={`mb-4 leading-relaxed ${isLight ? 'text-slate-700' : 'text-green-100'}`}>{tech.description}</div>
                    <div className="flex flex-wrap gap-2">
                      {tech.tags.map((tag, j) => (
                        <motion.span
                          key={j}
                          className={`text-xs px-3 py-1 rounded-full border ${isLight ? `bg-${tech.color}-100 text-${tech.color}-800 border-${tech.color}-200` : `bg-${tech.color}-500/20 text-${tech.color}-300 border-${tech.color}-400/30`}`}
                          whileHover={{ scale: 1.05 }}
                        >
                          {tag}
                        </motion.span>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          </motion.aside>
        </div>

        {/* OCR Section */}
        <motion.section
          id="ocr"
          className="mt-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="text-center mb-16"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className={`text-4xl font-bold mb-4 flex items-center justify-center gap-3 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <FileText size={32} className={isLight ? 'text-green-600' : 'text-green-400'} />
              OCR & Document Processing
            </h3>
            <div className={`w-24 h-1 bg-gradient-to-r from-green-400 to-emerald-400 mx-auto rounded-full`}></div>
          </motion.div>

          <GlassCard className={`p-8 text-center ${isLight ? 'bg-white/80 border border-slate-200' : ''}`}>
            <div className={`text-lg leading-relaxed ${isLight ? 'text-slate-700' : 'text-green-100'}`}>
              Advanced Optical Character Recognition for digitizing Forest Rights Act documents,
              extracting key information, and enabling searchable archives.
            </div>
          </GlassCard>
        </motion.section>

        {/* Public Data Section */}
        <motion.section
          id="public-data"
          className="mt-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="text-center mb-16"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className={`text-4xl font-bold mb-4 flex items-center justify-center gap-3 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <Globe size={32} className={isLight ? 'text-green-600' : 'text-green-400'} />
              Public Data Portal
            </h3>
            <div className={`w-24 h-1 bg-gradient-to-r from-green-400 to-emerald-400 mx-auto rounded-full`}></div>
          </motion.div>

          <GlassCard className={`p-8 text-center ${isLight ? 'bg-white/80 border border-slate-200' : ''}`}>
            <div className={`text-lg leading-relaxed ${isLight ? 'text-slate-700' : 'text-green-100'}`}>
              Open access to geospatial data, satellite imagery, and community asset maps
              for research, planning, and development initiatives.
            </div>
          </GlassCard>
        </motion.section>

        {/* What We Provide Section */}
        <motion.section
          id="technology"
          className="mt-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="text-center mb-16"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className={`text-4xl font-bold mb-4 flex items-center justify-center gap-3 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <Cpu size={32} className={isLight ? 'text-green-600' : 'text-green-400'} />
              What We Provide
            </h3>
            <div className={`w-24 h-1 bg-gradient-to-r from-green-400 to-emerald-400 mx-auto rounded-full`}></div>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Database,
                title: "Storage & Database",
                description: (
                  <>
                    <Tooltip content="PostgreSQL extension for spatial data types and operations, enabling advanced geospatial queries and analysis">
                      <span className={`font-semibold underline decoration-dotted cursor-help ${isLight ? 'text-green-700' : 'text-green-300'}`}>PostgreSQL + PostGIS</span>
                    </Tooltip>
                    , S3/Blob storage for COGs, metadata in{" "}
                    <Tooltip content="Columnar file format optimized for analytics and big data processing">
                      <span className={`font-semibold underline decoration-dotted cursor-help ${isLight ? 'text-green-700' : 'text-green-300'}`}>Parquet/GeoParquet</span>
                    </Tooltip>
                    .
                  </>
                ),
                tags: ["PostGIS", "AWS S3", "GeoParquet"],
                gradient: "from-green-500 to-emerald-600"
              },
              {
                icon: Cloud,
                title: "Imagery & STAC",
                description: (
                  <>
                    <Tooltip content="SpatioTemporal Asset Catalog - a specification for organizing and discovering geospatial data">
                      <span className={`font-semibold underline decoration-dotted cursor-help ${isLight ? 'text-green-700' : 'text-green-300'}`}>STAC</span>
                    </Tooltip>{" "}
                    catalog,{" "}
                    <Tooltip content="Dynamic tile server for cloud-optimized geospatial data">
                      <span className={`font-semibold underline decoration-dotted cursor-help ${isLight ? 'text-green-700' : 'text-green-300'}`}>Titiler</span>
                    </Tooltip>{" "}
                    for dynamic tiles, use Sentinel/Resourcesat/Planet depending on budget.
                  </>
                ),
                tags: ["STAC", "Titiler", "Sentinel-2"],
                gradient: "from-blue-500 to-cyan-600"
              },
              {
                icon: BookOpen,
                title: "DSS & Rules Engine",
                description: (
                  <>
                    Rule engine + ML scoring (
                    <Tooltip content="Extreme Gradient Boosting - a scalable machine learning algorithm for classification and regression">
                      <span className={`font-semibold underline decoration-dotted cursor-help ${isLight ? 'text-green-700' : 'text-green-300'}`}>XGBoost</span>
                    </Tooltip>
                    ) with{" "}
                    <Tooltip content="SHapley Additive exPlanations - a method for explaining machine learning model predictions">
                      <span className={`font-semibold underline decoration-dotted cursor-help ${isLight ? 'text-green-700' : 'text-green-300'}`}>SHAP</span>
                    </Tooltip>{" "}
                    explanations for prioritisation.
                  </>
                ),
                tags: ["XGBoost", "SHAP", "Rule Engine"],
                gradient: "from-amber-500 to-orange-600"
              }
            ].map((service, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <GlassCard className={`p-8 h-full group ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
                  <motion.div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${service.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <service.icon size={24} className="text-white" />
                  </motion.div>

                  <h4 className={`text-xl font-semibold mb-4 ${isLight ? 'text-slate-800' : 'text-white'}`}>{service.title}</h4>
                  <div className={`mb-6 leading-relaxed ${isLight ? 'text-slate-700' : 'text-green-100'}`}>{service.description}</div>

                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag, j) => (
                      <motion.span
                        key={j}
                        className={`text-xs px-3 py-1 rounded-full border transition-all duration-300 ${isLight ? 'bg-slate-100 hover:bg-green-100 text-slate-800 border-slate-200 hover:border-green-300' : 'bg-white/10 hover:bg-green-500/20 text-green-300 border-white/20 hover:border-green-400/30'}`}
                        whileHover={{ scale: 1.1 }}
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Implementation Roadmap */}
        <motion.section
          id="roadmap"
          className="mt-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="text-center mb-16"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className={`text-4xl font-bold mb-4 flex items-center justify-center gap-3 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <BarChart3 size={32} className={isLight ? 'text-green-600' : 'text-green-400'} />
              Implementation Roadmap
            </h3>
            <div className={`w-24 h-1 bg-gradient-to-r from-green-400 to-emerald-400 mx-auto rounded-full`}></div>
          </motion.div>

          <motion.div
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Clock,
                phase: "Phase 1 — Digitize Archive",
                duration: "6–8 weeks",
                description: (
                  <>
                    <Tooltip content="Optical Character Recognition - technology to convert images of text into machine-readable text">
                      <span className={`font-semibold underline decoration-dotted cursor-help ${isLight ? 'text-green-700' : 'text-green-300'}`}>OCR</span>
                    </Tooltip>
                    ,{" "}
                    <Tooltip content="Named Entity Recognition - AI technique to identify and classify named entities in text">
                      <span className={`font-semibold underline decoration-dotted cursor-help ${isLight ? 'text-green-700' : 'text-green-300'}`}>NER</span>
                    </Tooltip>{" "}
                    extraction, human review flow, PostGIS ingestion with data validation and standardization.
                  </>
                ),
                tags: ["OCR", "NER", "Data Validation"],
                color: "green"
              },
              {
                icon: Map,
                phase: "Phase 2 — VanMitra MVP",
                duration: "4–6 weeks",
                description: (
                  <>
                    <Tooltip content="Pre-rendered map tiles that can be efficiently served and displayed at multiple zoom levels">
                      <span className={`font-semibold underline decoration-dotted cursor-help ${isLight ? 'text-green-700' : 'text-green-300'}`}>Vector tiles</span>
                    </Tooltip>
                    , STAC layers, filters and progress dashboards with{" "}
                    <Tooltip content="Web-based Geographic Information System - interactive maps and spatial data visualization in browsers">
                      <span className={`font-semibold underline decoration-dotted cursor-help ${isLight ? 'text-green-700' : 'text-green-300'}`}>WebGIS</span>
                    </Tooltip>{" "}
                    integration.
                  </>
                ),
                tags: ["Vector Tiles", "WebGIS", "Dashboard"],
                color: "blue"
              },
              {
                icon: Check,
                phase: "Phase 3 — AI Asset Mapping & DSS",
                duration: "8–12 weeks",
                description: (
                  <>
                    Train segmentation models, serve predictions, build rules + ML prioritiser with explainable AI.
                  </>
                ),
                tags: ["ML Models", "DSS", "Explainable AI"],
                color: "purple"
              }
            ].map((phase, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <GlassCard className={`p-8 flex items-start gap-6 group ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
                  <motion.div
                    className={`p-4 bg-gradient-to-r from-${phase.color}-500 to-${phase.color}-600 rounded-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <phase.icon size={24} className="text-white" />
                  </motion.div>

                  <div className="flex-1">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                      <h4 className={`text-xl font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>{phase.phase}</h4>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${isLight ? `bg-${phase.color}-100 text-${phase.color}-800` : `bg-${phase.color}-500/20 text-${phase.color}-300`}`}>
                        {phase.duration}
                      </span>
                    </div>

                    <div className={`mb-4 leading-relaxed ${isLight ? 'text-slate-700' : 'text-green-100'}`}>{phase.description}</div>

                    <div className="flex flex-wrap gap-2">
                      {phase.tags.map((tag, j) => (
                        <motion.span
                          key={j}
                          className={`text-xs px-3 py-1 rounded-full border ${isLight ? `bg-${phase.color}-100 text-${phase.color}-800 border-${phase.color}-200` : `bg-${phase.color}-500/20 text-${phase.color}-300 border-${phase.color}-400/30`}`}
                          whileHover={{ scale: 1.05 }}
                        >
                          {tag}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Decision Support System CTA */}
        <motion.section
          id="dss"
          className="mt-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <GlassCard className={`p-12 relative overflow-hidden ${isLight ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' : 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-400/30'}`}>
              {/* Animated background effects */}
              <div className="absolute inset-0 opacity-20">
                {[...Array(20)].map((_, i) => {
                  // Seeded randomness for consistent positioning
                  const seeded = (seed: number) =>
                    Math.abs(Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453) % 1;

                  return (
                    <motion.div
                      key={i}
                      className={`absolute w-2 h-2 rounded-full ${isLight ? 'bg-green-500' : 'bg-green-400'}`}
                      style={{
                        left: `${(seeded(1) * 100).toFixed(3)}%`,
                        top: `${(seeded(2) * 100).toFixed(3)}%`,
                      }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                      }}
                      transition={{
                        duration: Number((seeded(3) * 3 + 2).toFixed(2)),
                        repeat: Infinity,
                        delay: Number((seeded(4) * 2).toFixed(2)),
                      }}
                    />
                  );
                })}
              </div>

              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="flex-1 text-center lg:text-left">
                  <h3 className={`text-3xl font-bold mb-4 flex items-center justify-center lg:justify-start gap-3 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    <Target size={32} className={isLight ? 'text-green-600' : 'text-green-400'} />
                    Decision Support System
                  </h3>
                  <div className={`text-lg leading-relaxed mb-6 ${isLight ? 'text-slate-700' : 'text-green-100'}`}>
                    A rules + ML engine to layer CSS schemes and prioritize interventions like borewells,
                    livelihoods, and restoration actions with explainability for officers. Integrates with{" "}
                    <Tooltip content="Pradhan Mantri Kisan Samman Nidhi - Direct income support scheme for farmers">
                      <span className={`font-semibold underline decoration-dotted cursor-help ${isLight ? 'text-green-700' : 'text-green-300'}`}>PM-KISAN</span>
                    </Tooltip>
                    ,{" "}
                    <Tooltip content="National rural drinking water program to provide safe and adequate drinking water">
                      <span className={`font-semibold underline decoration-dotted cursor-help ${isLight ? 'text-green-700' : 'text-green-300'}`}>Jal Jeevan Mission</span>
                    </Tooltip>
                    ,{" "}
                    <Tooltip content="Mahatma Gandhi National Rural Employment Guarantee Act - Rural employment scheme">
                      <span className={`font-semibold underline decoration-dotted cursor-help ${isLight ? 'text-green-700' : 'text-green-300'}`}>MGNREGA</span>
                    </Tooltip>
                    , and{" "}
                    <Tooltip content="Digital Agriculture Mission for Unified Gujarat Agriculture - Agricultural development initiative">
                      <span className={`font-semibold underline decoration-dotted cursor-help ${isLight ? 'text-green-700' : 'text-green-300'}`}>DAJGUA</span>
                    </Tooltip>{" "}
                    schemes for targeted development.
                  </div>

                  <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8">
                    {["Scheme Integration", "Priority Ranking", "Explainable AI"].map((tag, i) => (
                      <motion.span
                        key={i}
                        className={`text-sm px-4 py-2 rounded-full border transition-all duration-300 ${isLight ? 'bg-green-100 hover:bg-green-200 text-green-800 border-green-200' : 'bg-green-500/20 hover:bg-green-500/30 text-green-300 border-green-400/30 hover:border-green-400/50'}`}
                        whileHover={{ scale: 1.05 }}
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <MagneticButton className="text-lg px-8 py-4">
                    See Recommendations
                    <ArrowRight size={20} className="ml-2" />
                  </MagneticButton>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </motion.section>

        {/* Target Users */}
        <motion.section
          id="dashboard"
          className="mt-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="text-center mb-16"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className={`text-4xl font-bold mb-4 flex items-center justify-center gap-3 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <Users size={32} className={isLight ? 'text-green-600' : 'text-green-400'} />
              For Official Usage
            </h3>
            <div className={`w-24 h-1 bg-gradient-to-r from-green-400 to-emerald-400 mx-auto rounded-full`}></div>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Users,
                title: "Ministry of Tribal Affairs",
                description: "Policy monitoring and evaluation",
                gradient: "from-green-500 to-emerald-600"
              },
              {
                icon: MapPin,
                title: "District Authorities",
                description: "Local implementation and management",
                gradient: "from-blue-500 to-cyan-600"
              },
              {
                icon: BarChart3,
                title: "Planning Departments",
                description: "Development planning and resource allocation",
                gradient: "from-purple-500 to-violet-600"
              },
              {
                icon: Shield,
                title: "NGOs & Communities",
                description: "Advocacy and community engagement",
                gradient: "from-amber-500 to-orange-600"
              }
            ].map((user, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -10, rotateY: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <GlassCard className={`p-8 text-center h-full group ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
                  <motion.div
                    className={`w-20 h-20 rounded-3xl bg-gradient-to-r ${user.gradient} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}
                  >
                    <user.icon size={28} className="text-white" />
                  </motion.div>

                  <h4 className={`text-lg font-semibold mb-3 ${isLight ? 'text-slate-800' : 'text-white'}`}>{user.title}</h4>
                  <div className={`leading-relaxed ${isLight ? 'text-slate-700' : 'text-green-100'}`}>{user.description}</div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-emerald-400 transform-gpu z-50"
        style={{ scaleX: scrollYProgress, transformOrigin: "0%" }}
      />
    </div>
  );
}