"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import * as THREE from 'three';
import {
  ArrowRight, Leaf, MapPin, Server, Database, Layers,
  Cloud, Cpu, BookOpen, Clock, Check, Users,
  Shield, BarChart3, Target, Satellite, Map, Sparkles, Zap, Globe,
  Info, ChevronDown, ChevronUp, Search, Filter, FileText,
  Sprout, Droplets, Trees, Mountain, Sun, ShieldCheck, Eye, Lock
} from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import ThreeBackground from "@/components/ui/ThreeBackground";
import FloatingOrbs from "@/components/ui/FloatingOrbs";
import DecorativeElements from "@/components/ui/DecorativeElements";
import GlassCard from "@/components/ui/GlassCard";
import MagneticButton from "@/components/ui/MagneticButton";

export default function Privacy() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState<{ email: string } | null>(null);

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
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        <motion.div
          className="text-center mb-16"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <ShieldCheck size={16} className="text-green-400" />
            <span className="text-green-300 font-medium">Privacy Policy</span>
          </motion.div>

          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-6">
            <motion.span
              className="bg-gradient-to-r from-white via-green-300 to-emerald-300 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Your Privacy Matters
            </motion.span>
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-emerald-400 mx-auto rounded-full"></div>
        </motion.div>

        <motion.div
          className="space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Introduction */}
          <motion.div variants={itemVariants}>
            <GlassCard className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500">
                  <Eye size={24} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Introduction</h2>
              </div>
              <div className="text-green-100 leading-relaxed space-y-4">
                <p>
                  At VanMitra, we are committed to protecting your privacy and ensuring the security of your personal information.
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our
                  Forest Rights & Asset Mapping Platform.
                </p>
                <p>
                  By using our platform, you agree to the collection and use of information in accordance with this policy.
                  We will not use or share your information with anyone except as described in this Privacy Policy.
                </p>
              </div>
            </GlassCard>
          </motion.div>

          {/* Information We Collect */}
          <motion.div variants={itemVariants}>
            <GlassCard className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500">
                  <Database size={24} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Information We Collect</h2>
              </div>
              <div className="text-green-100 leading-relaxed space-y-4">
                <h3 className="text-lg font-semibold text-green-300 mb-3">Personal Information</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Name and contact information</li>
                  <li>Email address and phone number</li>
                  <li>Professional affiliation and role</li>
                  <li>Geographic location data (for service delivery)</li>
                </ul>

                <h3 className="text-lg font-semibold text-green-300 mb-3 mt-6">Usage Data</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Platform usage patterns and preferences</li>
                  <li>Device information and browser type</li>
                  <li>IP address and location data</li>
                  <li>Session duration and feature usage</li>
                </ul>
              </div>
            </GlassCard>
          </motion.div>

          {/* How We Use Your Information */}
          <motion.div variants={itemVariants}>
            <GlassCard className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500">
                  <Target size={24} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">How We Use Your Information</h2>
              </div>
              <div className="text-green-100 leading-relaxed space-y-4">
                <p>We use the collected information for the following purposes:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Service Delivery:</strong> To provide and maintain our forest rights mapping platform</li>
                  <li><strong>Account Management:</strong> To create and manage user accounts</li>
                  <li><strong>Communication:</strong> To send important updates and respond to inquiries</li>
                  <li><strong>Platform Improvement:</strong> To analyze usage patterns and improve our services</li>
                  <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
                  <li><strong>Security:</strong> To detect and prevent unauthorized access and fraud</li>
                </ul>
              </div>
            </GlassCard>
          </motion.div>

          {/* Data Security */}
          <motion.div variants={itemVariants}>
            <GlassCard className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500">
                  <Lock size={24} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Data Security</h2>
              </div>
              <div className="text-green-100 leading-relaxed space-y-4">
                <p>
                  We implement appropriate technical and organizational security measures to protect your personal information
                  against unauthorized access, alteration, disclosure, or destruction. These measures include:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security audits and vulnerability assessments</li>
                  <li>Access controls and authentication mechanisms</li>
                  <li>Secure data backup and recovery procedures</li>
                  <li>Employee training on data protection practices</li>
                </ul>
              </div>
            </GlassCard>
          </motion.div>

          {/* Data Sharing */}
          <motion.div variants={itemVariants}>
            <GlassCard className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500">
                  <Users size={24} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Data Sharing and Disclosure</h2>
              </div>
              <div className="text-green-100 leading-relaxed space-y-4">
                <p>We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  <li><strong>Service Providers:</strong> With trusted third-party service providers who assist our operations</li>
                  <li><strong>Consent:</strong> With your explicit consent for specific purposes</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                </ul>
              </div>
            </GlassCard>
          </motion.div>

          {/* Your Rights */}
          <motion.div variants={itemVariants}>
            <GlassCard className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500">
                  <Shield size={24} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Your Rights</h2>
              </div>
              <div className="text-green-100 leading-relaxed space-y-4">
                <p>You have the following rights regarding your personal information:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Access:</strong> Request access to your personal data</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                  <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                  <li><strong>Objection:</strong> Object to processing of your personal information</li>
                  <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
                </ul>
              </div>
            </GlassCard>
          </motion.div>

          {/* Contact Us */}
          <motion.div variants={itemVariants}>
            <GlassCard className="p-8 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-400/30">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
                <p className="text-green-100 mb-6">
                  If you have any questions about this Privacy Policy or our data practices,
                  please contact us at:
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <MagneticButton variant="secondary">
                    privacy@vanmitra.org
                  </MagneticButton>
                  <MagneticButton variant="secondary">
                    Visit Contact Page
                  </MagneticButton>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
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