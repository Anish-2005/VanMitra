"use client";

import React from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import { FileText, Globe, Cpu, BarChart3, Target, Users } from "lucide-react";
import Tooltip from "@/components/ui/Tooltip";

type Props = {
  isLight: boolean;
  containerVariants?: any;
  itemVariants?: any;
};

export default function Sections({ isLight, containerVariants, itemVariants }: Props) {
  return (
    <>
      <motion.section id="ocr" className="mt-24" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1 }} viewport={{ once: true }}>
        <motion.div className="text-center mb-16" initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
          <h3 className={`text-4xl font-bold mb-4 flex items-center justify-center gap-3 ${isLight ? 'text-slate-900' : 'text-white'}`}><FileText size={32} className={isLight ? 'text-green-600' : 'text-green-400'} />OCR & Document Processing</h3>
          <div className={`w-24 h-1 bg-gradient-to-r from-green-400 to-emerald-400 mx-auto rounded-full`}></div>
        </motion.div>
        <GlassCard className={`p-8 text-center ${isLight ? 'bg-white/80 border border-slate-200' : ''}`}>
          <div className={`text-lg leading-relaxed ${isLight ? 'text-slate-700' : 'text-green-100'}`}>Advanced Optical Character Recognition for digitizing Forest Rights Act documents, extracting key information, and enabling searchable archives.</div>
        </GlassCard>
      </motion.section>

      <motion.section id="public-data" className="mt-24" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1 }} viewport={{ once: true }}>
        <motion.div className="text-center mb-16" initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
          <h3 className={`text-4xl font-bold mb-4 flex items-center justify-center gap-3 ${isLight ? 'text-slate-900' : 'text-white'}`}><Globe size={32} className={isLight ? 'text-green-600' : 'text-green-400'} />Public Data Portal</h3>
          <div className={`w-24 h-1 bg-gradient-to-r from-green-400 to-emerald-400 mx-auto rounded-full`}></div>
        </motion.div>
        <GlassCard className={`p-8 text-center ${isLight ? 'bg-white/80 border border-slate-200' : ''}`}>
          <div className={`text-lg leading-relaxed ${isLight ? 'text-slate-700' : 'text-green-100'}`}>Open access to geospatial data, satellite imagery, and community asset maps for research, planning, and development initiatives.</div>
        </GlassCard>
      </motion.section>

      <motion.section id="technology" className="mt-24" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1 }} viewport={{ once: true }}>
        <motion.div className="text-center mb-16" initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
          <h3 className={`text-4xl font-bold mb-4 flex items-center justify-center gap-3 ${isLight ? 'text-slate-900' : 'text-white'}`}><Cpu size={32} className={isLight ? 'text-green-600' : 'text-green-400'} />What We Provide</h3>
          <div className={`w-24 h-1 bg-gradient-to-r from-green-400 to-emerald-400 mx-auto rounded-full`}></div>
        </motion.div>

        {/* keep the original layout compact for the split - callers can further split if desired */}
        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-8" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          {/* This area purposely simplified; detailed service cards remain in-page by default */}
          <div />
        </motion.div>
      </motion.section>

      <motion.section id="roadmap" className="mt-24" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1 }} viewport={{ once: true }}>
        <motion.div className="text-center mb-16" initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
          <h3 className={`text-4xl font-bold mb-4 flex items-center justify-center gap-3 ${isLight ? 'text-slate-900' : 'text-white'}`}><BarChart3 size={32} className={isLight ? 'text-green-600' : 'text-green-400'} />Implementation Roadmap</h3>
          <div className={`w-24 h-1 bg-gradient-to-r from-green-400 to-emerald-400 mx-auto rounded-full`}></div>
        </motion.div>
        <motion.div className="space-y-8" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          {/* simplified roadmap items placeholder */}
        </motion.div>
      </motion.section>

      <motion.section id="dss" className="mt-24" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1 }} viewport={{ once: true }}>
        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 200 }}>
          <GlassCard className={`p-12 relative overflow-hidden ${isLight ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' : 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-400/30'}`}>
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex-1 text-center lg:text-left">
                <h3 className={`text-3xl font-bold mb-4 flex items-center justify-center lg:justify-start gap-3 ${isLight ? 'text-slate-900' : 'text-white'}`}><Target size={32} className={isLight ? 'text-green-600' : 'text-green-400'} />Decision Support System</h3>
                <div className={`text-lg leading-relaxed mb-6 ${isLight ? 'text-slate-700' : 'text-green-100'}`}>A rules + ML engine to layer CSS schemes and prioritize interventions with explainability for officers.</div>
              </div>
              <div className="flex-shrink-0"><MagneticButton className="text-lg px-8 py-4">See Recommendations</MagneticButton></div>
            </div>
          </GlassCard>
        </motion.div>
      </motion.section>

      <motion.section id="dashboard" className="mt-24" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1 }} viewport={{ once: true }}>
        <motion.div className="text-center mb-16" initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
          <h3 className={`text-4xl font-bold mb-4 flex items-center justify-center gap-3 ${isLight ? 'text-slate-900' : 'text-white'}`}><Users size={32} className={isLight ? 'text-green-600' : 'text-green-400'} />For Official Usage</h3>
          <div className={`w-24 h-1 bg-gradient-to-r from-green-400 to-emerald-400 mx-auto rounded-full`}></div>
        </motion.div>
      </motion.section>
    </>
  );
}
