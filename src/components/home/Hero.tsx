"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Globe, Zap, Sparkles } from "lucide-react";
import MagneticButton from "@/components/ui/MagneticButton";
import Tooltip from "@/components/ui/Tooltip";

type Props = {
  isLight: boolean;
  router: any;
  containerVariants: any;
  itemVariants: any;
  setLoginOpen?: (v: boolean) => void;
};

export default function Hero({ isLight, router, containerVariants, itemVariants }: Props) {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
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
          <motion.span className={isLight ? 'text-slate-900' : 'bg-gradient-to-r from-white via-green-300 to-emerald-300 bg-clip-text text-transparent'} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}>Empowering</motion.span>
          <br />
          <motion.span className={isLight ? 'text-green-700' : 'bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent'} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }}>Tribal Communities</motion.span>
          <br />
          <motion.span className={isLight ? 'text-slate-800' : 'text-white'} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }}>Through Technology</motion.span>
        </h2>
      </motion.div>

      <motion.div className={`text-xl leading-relaxed max-w-2xl mb-8 ${isLight ? 'text-slate-700' : 'text-green-100'}`} variants={itemVariants}>
        A revolutionary <Tooltip content="Web-based Geographic Information System - A platform for displaying, analyzing, and managing spatial data through web browsers"><span className={`${isLight ? 'text-green-700 font-semibold underline decoration-dotted cursor-help' : 'text-green-300 font-semibold underline decoration-dotted cursor-help'}`}>WebGIS</span></Tooltip> platform that transforms Forest Rights Act records, maps community assets with <Tooltip content="Artificial Intelligence algorithms that automatically detect and classify features from satellite images"><span className={`${isLight ? 'text-green-700 font-semibold underline decoration-dotted cursor-help' : 'text-green-300 font-semibold underline decoration-dotted cursor-help'}`}>AI-powered</span></Tooltip> satellite imagery, and delivers intelligent decision support for targeted rural development.
      </motion.div>

      <motion.div className="flex flex-wrap gap-3 mb-12 pr-1" variants={itemVariants}>
        <MagneticButton onClick={() => router.push('/atlas')} className={`group ${isLight ? 'bg-green-600 hover:bg-green-700 text-white border-green-700' : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white border-white/20'}`}>
          <div className="flex items-center"><ArrowRight size={20} className="group-hover:translate-x-1 transition-transform mr-2" />Explore Atlas</div>
        </MagneticButton>

        <MagneticButton onClick={() => router.push('/contact')} variant={isLight ? "outline" : "secondary"} className={isLight ? "border-green-600 text-green-700 hover:bg-green-50 hover:border-green-700 hover:text-green-800" : ""}>
          <div className="flex items-center"><Globe size={16} className="mr-2" />Request Demo</div>
        </MagneticButton>

        <MagneticButton onClick={() => router.push('/dss')} variant={isLight ? "outline" : "secondary"} className={isLight ? "border-green-600 text-green-700 hover:bg-green-50 hover:border-green-700 hover:text-green-800" : ""}>
          <div className="flex items-center"><Zap size={16} className="mr-2" />DSS Features</div>
        </MagneticButton>
      </motion.div>
    </motion.div>
  );
}
