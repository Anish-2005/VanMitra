"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import * as THREE from 'three';
import {
  ArrowRight, Leaf, MapPin, Server, Database, Layers,
  Cloud, Cpu, BookOpen, Clock, Check, Users,
  Shield, BarChart3, Target, Satellite, Map, Sparkles, Zap, Globe,
  Info, ChevronDown, ChevronUp, Search, Filter, FileText,
  Sprout, Droplets, Trees, Mountain, Sun, FileCheck, Scale, AlertTriangle
} from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import ThreeBackground from "@/components/ui/ThreeBackground";
import FloatingOrbs from "@/components/ui/FloatingOrbs";
import DecorativeElements from "@/components/ui/DecorativeElements";
import GlassCard from "@/components/ui/GlassCard";
import MagneticButton from "@/components/ui/MagneticButton";

export default function Terms() {
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
            <FileCheck size={16} className="text-green-400" />
            <span className="text-green-300 font-medium">Terms of Service</span>
          </motion.div>

          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-6">
            <motion.span
              className="bg-gradient-to-r from-white via-green-300 to-emerald-300 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Terms & Conditions
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
          {/* Last Updated */}
          <motion.div variants={itemVariants}>
            <GlassCard className="p-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-400/20">
              <div className="flex items-center gap-3 mb-4">
                <Clock size={20} className="text-blue-400" />
                <span className="text-blue-300 font-medium">Last Updated: September 17, 2025</span>
              </div>
              <p className="text-green-100">
                These terms and conditions outline the rules and regulations for the use of VanMitra's Forest Rights & Asset Mapping Platform.
              </p>
            </GlassCard>
          </motion.div>

          {/* Acceptance of Terms */}
          <motion.div variants={itemVariants}>
            <GlassCard className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500">
                  <Check size={24} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Acceptance of Terms</h2>
              </div>
              <div className="text-green-100 leading-relaxed space-y-4">
                <p>
                  By accessing and using VanMitra, you accept and agree to be bound by the terms and provision of this agreement.
                  If you do not agree to abide by the above, please do not use this service.
                </p>
                <p>
                  These terms apply to all users of the platform, including without limitation users who are browsers,
                  vendors, customers, merchants, and/or contributors of content.
                </p>
              </div>
            </GlassCard>
          </motion.div>

          {/* Use License */}
          <motion.div variants={itemVariants}>
            <GlassCard className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500">
                  <Scale size={24} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Use License</h2>
              </div>
              <div className="text-green-100 leading-relaxed space-y-4">
                <p>
                  Permission is granted to temporarily use VanMitra for personal, non-commercial transitory viewing only.
                  This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Modify or copy the platform materials</li>
                  <li>Use the materials for any commercial purpose or for any public display</li>
                  <li>Attempt to decompile or reverse engineer any software contained on the platform</li>
                  <li>Remove any copyright or other proprietary notations from the materials</li>
                </ul>
              </div>
            </GlassCard>
          </motion.div>

          {/* User Responsibilities */}
          <motion.div variants={itemVariants}>
            <GlassCard className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500">
                  <Users size={24} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">User Responsibilities</h2>
              </div>
              <div className="text-green-100 leading-relaxed space-y-4">
                <p>As a user of VanMitra, you agree to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide accurate and complete information when creating an account</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Use the platform in accordance with applicable laws and regulations</li>
                  <li>Respect the rights of other users and third parties</li>
                  <li>Not engage in any harmful, fraudulent, or illegal activities</li>
                  <li>Report any security vulnerabilities or misuse of the platform</li>
                </ul>
              </div>
            </GlassCard>
          </motion.div>

          {/* Data Usage and Privacy */}
          <motion.div variants={itemVariants}>
            <GlassCard className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500">
                  <Shield size={24} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Data Usage and Privacy</h2>
              </div>
              <div className="text-green-100 leading-relaxed space-y-4">
                <p>
                  Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the platform,
                  to understand our practices regarding the collection and use of your personal information.
                </p>
                <p>
                  By using VanMitra, you consent to the collection, use, and disclosure of your information as described
                  in our Privacy Policy. We are committed to protecting your data and ensuring compliance with
                  applicable data protection laws.
                </p>
              </div>
            </GlassCard>
          </motion.div>

          {/* Service Availability */}
          <motion.div variants={itemVariants}>
            <GlassCard className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500">
                  <Server size={24} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Service Availability</h2>
              </div>
              <div className="text-green-100 leading-relaxed space-y-4">
                <p>
                  While we strive to provide continuous access to VanMitra, we do not guarantee that the service will
                  be uninterrupted or error-free. We reserve the right to modify, suspend, or discontinue the service
                  at any time without notice.
                </p>
                <p>
                  We are not liable for any damages arising from the use or inability to use our platform,
                  including but not limited to direct, indirect, incidental, or consequential damages.
                </p>
              </div>
            </GlassCard>
          </motion.div>

          {/* Intellectual Property */}
          <motion.div variants={itemVariants}>
            <GlassCard className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500">
                  <FileText size={24} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Intellectual Property</h2>
              </div>
              <div className="text-green-100 leading-relaxed space-y-4">
                <p>
                  The platform and its original content, features, and functionality are and will remain the exclusive
                  property of VanMitra and its licensors. The service is protected by copyright, trademark, and other laws.
                </p>
                <p>
                  You may not duplicate, copy, or reuse any portion of the HTML/CSS, JavaScript, or visual design elements
                  without express written permission from VanMitra.
                </p>
              </div>
            </GlassCard>
          </motion.div>

          {/* Termination */}
          <motion.div variants={itemVariants}>
            <GlassCard className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500">
                  <AlertTriangle size={24} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Termination</h2>
              </div>
              <div className="text-green-100 leading-relaxed space-y-4">
                <p>
                  We may terminate or suspend your account and bar access to the service immediately, without prior notice
                  or liability, under our sole discretion, for any reason whatsoever and without limitation, including
                  but not limited to a breach of the Terms.
                </p>
                <p>
                  If you wish to terminate your account, you may simply discontinue using the service.
                </p>
              </div>
            </GlassCard>
          </motion.div>

          {/* Governing Law */}
          <motion.div variants={itemVariants}>
            <GlassCard className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500">
                  <Scale size={24} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Governing Law</h2>
              </div>
              <div className="text-green-100 leading-relaxed space-y-4">
                <p>
                  These Terms shall be interpreted and governed by the laws of India, without regard to its conflict
                  of law provisions. Our failure to enforce any right or provision of these Terms will not be considered
                  a waiver of those rights.
                </p>
                <p>
                  If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining
                  provisions of these Terms will remain in effect.
                </p>
              </div>
            </GlassCard>
          </motion.div>

          {/* Contact Information */}
          <motion.div variants={itemVariants}>
            <GlassCard className="p-8 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-400/30">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Questions About These Terms?</h2>
                <p className="text-green-100 mb-6">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <MagneticButton variant="secondary">
                    legal@vanmitra.org
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