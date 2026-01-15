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
import GlassCard from "@/components/ui/GlassCard";
import MagneticButton from "@/components/ui/MagneticButton";
import Tooltip from "@/components/ui/Tooltip";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import Hero from "@/components/home/Hero";
import StatsGrid from "@/components/home/StatsGrid";
import RightSidebar from "@/components/home/RightSidebar";
import Sections from "@/components/home/Sections";
import LoginModal from "@/components/home/LoginModal";

// Dynamically import heavy components to reduce initial bundle size
const ThreeBackground = dynamic(() => import('@/components/ui/ThreeBackground'), {
  ssr: false,
  loading: () => null
});

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
      <main id="atlas" className={`relative z-10 w-full max-w-[1440px] 2xl:max-w-[1680px] mx-auto px-2 sm:px-4 md:px-8 lg:px-12 pt-16 py-16 ${isLight ? 'text-slate-900' : 'text-white'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-14 lg:gap-16 items-start">
          <motion.section className="lg:col-span-7">
            <Hero isLight={isLight} router={router} containerVariants={containerVariants} itemVariants={itemVariants} setLoginOpen={setLoginOpen} />

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
        <Sections isLight={isLight} containerVariants={containerVariants} itemVariants={itemVariants} />
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