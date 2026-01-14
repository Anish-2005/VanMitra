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
import Hero from "@/components/home/Hero";
import StatsGrid from "@/components/home/StatsGrid";
import RightSidebar from "@/components/home/RightSidebar";
import Sections from "@/components/home/Sections";
import LoginModal from "@/components/home/LoginModal";

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
      <LoginModal
        loginOpen={loginOpen}
        setLoginOpen={setLoginOpen}
        isLight={isLight}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        error={error}
        handleLogin={handleLogin}
      />

      {/* Main Content */}
      <main id="atlas" className={`relative z-10 max-w-7xl mx-auto px-6 py-16 ${isLight ? 'text-slate-900' : 'text-white'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <Hero isLight={isLight} router={router} containerVariants={containerVariants} itemVariants={itemVariants} setLoginOpen={setLoginOpen} />

          <motion.section className="lg:col-span-7">
            <StatsGrid isLight={isLight} claimsTotal={claimsTotal} claimsGranted={claimsGranted} containerVariants={containerVariants} itemVariants={itemVariants} />

            {/* Problem Section */}
            <motion.div className="mt-16" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
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

          <RightSidebar isLight={isLight} claimsTotal={claimsTotal} claimsGranted={claimsGranted} containerVariants={containerVariants} itemVariants={itemVariants} />
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
                    <div className="flex items-center">
                    See Recommendations
                    <ArrowRight size={20} className="ml-2" />
                    </div>
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