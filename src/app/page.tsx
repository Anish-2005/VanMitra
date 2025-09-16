"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import * as THREE from 'three';
import {
  ArrowRight, Leaf, MapPin, Server, Database, Layers,
  Cloud, Cpu, BookOpen, Clock, Check, Users,
  Shield, BarChart3, Target, Satellite, Map, Sparkles, Zap, Globe,
  Info, ChevronDown, ChevronUp, Search, Filter, FileText,
  Sprout, Droplets, Trees, Mountain, Sun
} from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import ThreeBackground from "@/components/ui/ThreeBackground";
import FloatingOrbs from "@/components/ui/FloatingOrbs";
import DecorativeElements from "@/components/ui/DecorativeElements";
import GlassCard from "@/components/ui/GlassCard";
import MagneticButton from "@/components/ui/MagneticButton";
import Tooltip from "@/components/ui/Tooltip";
import AnimatedCounter from "@/components/ui/AnimatedCounter";



export default function Home() {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900 text-white relative overflow-hidden">
      <ThreeBackground />
      <DecorativeElements />
      <FloatingOrbs />

      {/* Mesh Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-green-900/20 via-transparent to-emerald-900/20 pointer-events-none z-1" />

      {/* Animated Grid */}
      <div className="fixed inset-0 opacity-10 pointer-events-none z-1">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Header */}
      <Navbar
        user={user}
        onLogin={() => setLoginOpen(true)}
        onLogout={handleLogout}
        onMobileMenuToggle={() => setMobileOpen(!mobileOpen)}
        mobileOpen={mobileOpen}
      />



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
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setLoginOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="relative bg-gradient-to-br from-slate-800 to-green-800 rounded-3xl shadow-2xl p-8 w-full max-w-md mx-4 border border-white/20 backdrop-blur-xl"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Welcome Back</h3>
              {error && (
                <motion.p
                  className="text-red-400 mb-4 text-center"
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
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-green-300 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  whileFocus={{ scale: 1.02 }}
                />
                <motion.input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-green-300 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-400"
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
      <main id="atlas" className="relative z-10 max-w-7xl mx-auto px-6 py-16">
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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <Sparkles size={16} className="text-green-400" />
                <span className="text-green-300 font-medium">Next-Gen Forest Rights Platform</span>
              </motion.div>

              <h2 className="text-5xl lg:text-5xl font-extrabold leading-tight mb-6">
                <motion.span
                  className="bg-gradient-to-r from-white via-green-300 to-emerald-300 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                >
                  Empowering
                </motion.span>
                <br />
                <motion.span
                  className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  Tribal Communities
                </motion.span>
                <br />
                <motion.span
                  className="text-white"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                >
                  Through Technology
                </motion.span>
              </h2>
            </motion.div>

            <motion.div
              className="text-xl text-green-100 leading-relaxed max-w-2xl mb-8"
              variants={itemVariants}
            >
              A revolutionary{" "}
              <Tooltip content="Web-based Geographic Information System - A platform for displaying, analyzing, and managing spatial data through web browsers">
                <span className="text-green-300 font-semibold underline decoration-dotted cursor-help">WebGIS</span>
              </Tooltip>{" "}
              platform that transforms Forest Rights Act records, maps community assets with{" "}
              <Tooltip content="Artificial Intelligence algorithms that automatically detect and classify features from satellite images">
                <span className="text-green-300 font-semibold underline decoration-dotted cursor-help">AI-powered</span>
              </Tooltip>{" "}
              satellite imagery, and delivers intelligent decision support for targeted rural development.
            </motion.div>            <motion.div
              className="flex flex-wrap gap-3 mb-12 pr-1"
              variants={itemVariants}
            >
              <MagneticButton className="group">

                <ArrowRight size={20} className=" group-hover:translate-x-1 transition-transform" />
                Explore Atlas
              </MagneticButton>
              <MagneticButton variant="secondary">
                <Globe size={16} className="mr-2" />
                Request Demo
              </MagneticButton>
              <MagneticButton variant="secondary">
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
                  <GlassCard className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500">
                        <stat.icon size={20} className="text-white" />
                      </div>
                      <h4 className="font-semibold text-green-100">{stat.title}</h4>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                      <AnimatedCounter value={stat.value} />
                    </div>
                    <div className="text-sm text-green-300">{stat.subtitle}</div>
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
              <GlassCard className="p-8 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-400/20">
                <div className="flex items-center gap-3 mb-4">
                  <Shield size={24} className="text-amber-400" />
                  <h3 className="text-2xl font-semibold text-white">Problem Background</h3>
                </div>
                <div className="text-green-100 leading-relaxed">
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
              <GlassCard className="p-8 bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-green-400/30 relative overflow-hidden">
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-transparent animate-pulse" />
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
                        stroke="white"
                        strokeWidth="4"
                      />
                      <defs>
                        <linearGradient id="mpGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#22c55e" />
                          <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </motion.div>


                  {/* Pilot & claims counter */}
                  <div className="text-center mb-4">
                    <div className="text-sm text-green-300 font-medium mb-2 tracking-wide">Pilot: Madhya Pradesh</div>
                    <div className="text-4xl md:text-5xl font-extrabold text-white flex justify-center items-center gap-4">
                      <div className="flex items-center gap-1">
                        <AnimatedCounter value={claimsTotal} />
                        <span className="text-lg md:text-xl font-semibold text-green-300">claims</span>
                      </div>
                      <span className="text-green-500 font-bold">•</span>
                      <div className="flex items-center gap-1">
                        <AnimatedCounter value={claimsGranted} />
                        <span className="text-lg md:text-xl font-semibold text-green-300">granted</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="w-full max-w-md flex flex-col gap-4">
                    <GlassCard className="p-5 bg-white/10 backdrop-blur-md rounded-2xl hover:scale-105 transition-transform duration-300 shadow-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-green-200 font-medium">AI-derived ponds:</span>
                        <span className="font-bold text-white text-lg">412</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-green-200 font-medium">Cropland area:</span>
                        <span className="font-bold text-white text-lg">3,120 ha</span>
                      </div>
                    </GlassCard>

                    <GlassCard className="p-5 bg-white/10 backdrop-blur-md rounded-2xl hover:scale-105 transition-transform duration-300 shadow-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-green-200 font-medium">Water index:</span>
                        <span className="font-bold text-amber-300 text-lg">Low</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-green-200 font-medium">Vulnerability score:</span>
                        <span className="font-bold text-red-300 text-lg">High</span>
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
                  <GlassCard className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Tooltip content={tech.tooltip} position="top">
                        <div className={`p-3 rounded-xl bg-gradient-to-r from-${tech.color}-500 to-${tech.color}-600 cursor-help`}>
                          <tech.icon size={20} className="text-white" />
                        </div>
                      </Tooltip>
                      <h4 className="font-semibold text-white">{tech.title}</h4>
                    </div>
                    <div className="text-green-100 mb-4 leading-relaxed">{tech.description}</div>
                    <div className="flex flex-wrap gap-2">
                      {tech.tags.map((tag, j) => (
                        <motion.span
                          key={j}
                          className={`text-xs px-3 py-1 bg-${tech.color}-500/20 text-${tech.color}-300 rounded-full border border-${tech.color}-400/30`}
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
            <h3 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <FileText size={32} className="text-green-400" />
              OCR & Document Processing
            </h3>
            <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-emerald-400 mx-auto rounded-full"></div>
          </motion.div>

          <GlassCard className="p-8 text-center">
            <div className="text-green-100 text-lg leading-relaxed">
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
            <h3 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <Globe size={32} className="text-green-400" />
              Public Data Portal
            </h3>
            <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-emerald-400 mx-auto rounded-full"></div>
          </motion.div>

          <GlassCard className="p-8 text-center">
            <div className="text-green-100 text-lg leading-relaxed">
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
            <h3 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <Cpu size={32} className="text-green-400" />
              What We Provide
            </h3>
            <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-emerald-400 mx-auto rounded-full"></div>
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
                      <span className="text-green-300 font-semibold underline decoration-dotted cursor-help">PostgreSQL + PostGIS</span>
                    </Tooltip>
                    , S3/Blob storage for COGs, metadata in{" "}
                    <Tooltip content="Columnar file format optimized for analytics and big data processing">
                      <span className="text-green-300 font-semibold underline decoration-dotted cursor-help">Parquet/GeoParquet</span>
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
                      <span className="text-green-300 font-semibold underline decoration-dotted cursor-help">STAC</span>
                    </Tooltip>{" "}
                    catalog,{" "}
                    <Tooltip content="Dynamic tile server for cloud-optimized geospatial data">
                      <span className="text-green-300 font-semibold underline decoration-dotted cursor-help">Titiler</span>
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
                      <span className="text-green-300 font-semibold underline decoration-dotted cursor-help">XGBoost</span>
                    </Tooltip>
                    ) with{" "}
                    <Tooltip content="SHapley Additive exPlanations - a method for explaining machine learning model predictions">
                      <span className="text-green-300 font-semibold underline decoration-dotted cursor-help">SHAP</span>
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
                <GlassCard className="p-8 h-full group">
                  <motion.div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${service.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <service.icon size={24} className="text-white" />
                  </motion.div>

                  <h4 className="text-xl font-semibold text-white mb-4">{service.title}</h4>
                  <div className="text-green-100 mb-6 leading-relaxed">{service.description}</div>

                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag, j) => (
                      <motion.span
                        key={j}
                        className="text-xs px-3 py-1 bg-white/10 hover:bg-green-500/20 text-green-300 rounded-full border border-white/20 hover:border-green-400/30 transition-all duration-300"
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
            <h3 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <BarChart3 size={32} className="text-green-400" />
              Implementation Roadmap
            </h3>
            <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-emerald-400 mx-auto rounded-full"></div>
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
                      <span className="text-green-300 font-semibold underline decoration-dotted cursor-help">OCR</span>
                    </Tooltip>
                    ,{" "}
                    <Tooltip content="Named Entity Recognition - AI technique to identify and classify named entities in text">
                      <span className="text-green-300 font-semibold underline decoration-dotted cursor-help">NER</span>
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
                      <span className="text-green-300 font-semibold underline decoration-dotted cursor-help">Vector tiles</span>
                    </Tooltip>
                    , STAC layers, filters and progress dashboards with{" "}
                    <Tooltip content="Web-based Geographic Information System - interactive maps and spatial data visualization in browsers">
                      <span className="text-green-300 font-semibold underline decoration-dotted cursor-help">WebGIS</span>
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
                <GlassCard className="p-8 flex items-start gap-6 group">
                  <motion.div
                    className={`p-4 bg-gradient-to-r from-${phase.color}-500 to-${phase.color}-600 rounded-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <phase.icon size={24} className="text-white" />
                  </motion.div>

                  <div className="flex-1">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                      <h4 className="text-xl font-semibold text-white">{phase.phase}</h4>
                      <span className={`text-${phase.color}-300 font-medium px-3 py-1 bg-${phase.color}-500/20 rounded-full text-sm`}>
                        {phase.duration}
                      </span>
                    </div>

                    <div className="text-green-100 mb-4 leading-relaxed">{phase.description}</div>

                    <div className="flex flex-wrap gap-2">
                      {phase.tags.map((tag, j) => (
                        <motion.span
                          key={j}
                          className={`text-xs px-3 py-1 bg-${phase.color}-500/20 text-${phase.color}-300 rounded-full border border-${phase.color}-400/30`}
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
            <GlassCard className="p-12 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-400/30 relative overflow-hidden">
              {/* Animated background effects */}
              <div className="absolute inset-0 opacity-20">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-green-400 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: Math.random() * 3 + 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
              </div>

              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="flex-1 text-center lg:text-left">
                  <h3 className="text-3xl font-bold text-white mb-4 flex items-center justify-center lg:justify-start gap-3">
                    <Target size={32} className="text-green-400" />
                    Decision Support System
                  </h3>
                  <div className="text-green-100 text-lg leading-relaxed mb-6">
                    A rules + ML engine to layer CSS schemes and prioritize interventions like borewells,
                    livelihoods, and restoration actions with explainability for officers. Integrates with{" "}
                    <Tooltip content="Pradhan Mantri Kisan Samman Nidhi - Direct income support scheme for farmers">
                      <span className="text-green-300 font-semibold underline decoration-dotted cursor-help">PM-KISAN</span>
                    </Tooltip>
                    ,{" "}
                    <Tooltip content="National rural drinking water program to provide safe and adequate drinking water">
                      <span className="text-green-300 font-semibold underline decoration-dotted cursor-help">Jal Jeevan Mission</span>
                    </Tooltip>
                    ,{" "}
                    <Tooltip content="Mahatma Gandhi National Rural Employment Guarantee Act - Rural employment scheme">
                      <span className="text-green-300 font-semibold underline decoration-dotted cursor-help">MGNREGA</span>
                    </Tooltip>
                    , and{" "}
                    <Tooltip content="Digital Agriculture Mission for Unified Gujarat Agriculture - Agricultural development initiative">
                      <span className="text-green-300 font-semibold underline decoration-dotted cursor-help">DAJGUA</span>
                    </Tooltip>{" "}
                    schemes for targeted development.
                  </div>

                  <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8">
                    {["Scheme Integration", "Priority Ranking", "Explainable AI"].map((tag, i) => (
                      <motion.span
                        key={i}
                        className="text-sm px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-full border border-green-400/30 hover:border-green-400/50 transition-all duration-300"
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
            <h3 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <Users size={32} className="text-green-400" />
              For Official Usage
            </h3>
            <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-emerald-400 mx-auto rounded-full"></div>
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
                <GlassCard className="p-8 text-center h-full group">
                  <motion.div
                    className={`w-20 h-20 rounded-3xl bg-gradient-to-r ${user.gradient} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}
                  >
                    <user.icon size={28} className="text-white" />
                  </motion.div>

                  <h4 className="text-lg font-semibold text-white mb-3">{user.title}</h4>
                  <div className="text-green-100 leading-relaxed">{user.description}</div>
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