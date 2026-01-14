"use client";

import React from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import { FileText, Globe, Cpu, BarChart3, Target, Users } from "lucide-react";
import Tooltip from "@/components/ui/Tooltip";
import MagneticButton from "../ui/MagneticButton";

type Props = {
  isLight: boolean;
  containerVariants?: any;
  itemVariants?: any;
};

export default function Sections({ isLight, containerVariants, itemVariants }: Props) {
  return (
    <>
      {/* OCR Section */}
      <motion.section id="ocr" className="mt-24" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1 }} viewport={{ once: true }}>
        <motion.div className="text-center mb-16" initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
          <h3 className={`text-4xl font-bold mb-4 flex items-center justify-center gap-3 ${isLight ? 'text-slate-900' : 'text-white'}`}><FileText size={32} className={isLight ? 'text-green-600' : 'text-green-400'} />OCR & Document Processing</h3>
          <div className={`w-24 h-1 bg-gradient-to-r from-green-400 to-emerald-400 mx-auto rounded-full`}></div>
        </motion.div>
        <GlassCard className={`p-8 text-center ${isLight ? 'bg-white/80 border border-slate-200' : ''}`}>
          <div className={`text-lg leading-relaxed ${isLight ? 'text-slate-700' : 'text-green-100'}`}>Advanced Optical Character Recognition for digitizing Forest Rights Act documents, extracting key information, and enabling searchable archives.</div>
        </GlassCard>
      </motion.section>

      {/* Public Data Section */}
      <motion.section id="public-data" className="mt-24" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1 }} viewport={{ once: true }}>
        <motion.div className="text-center mb-16" initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
          <h3 className={`text-4xl font-bold mb-4 flex items-center justify-center gap-3 ${isLight ? 'text-slate-900' : 'text-white'}`}><Globe size={32} className={isLight ? 'text-green-600' : 'text-green-400'} />Public Data Portal</h3>
          <div className={`w-24 h-1 bg-gradient-to-r from-green-400 to-emerald-400 mx-auto rounded-full`}></div>
        </motion.div>
        <GlassCard className={`p-8 text-center ${isLight ? 'bg-white/80 border border-slate-200' : ''}`}>
          <div className={`text-lg leading-relaxed ${isLight ? 'text-slate-700' : 'text-green-100'}`}>Open access to geospatial data, satellite imagery, and community asset maps for research, planning, and development initiatives.</div>
        </GlassCard>
      </motion.section>

      {/* What We Provide Section */}
      <motion.section id="technology" className="mt-24" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1 }} viewport={{ once: true }}>
        <motion.div className="text-center mb-16" initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
          <h3 className={`text-4xl font-bold mb-4 flex items-center justify-center gap-3 ${isLight ? 'text-slate-900' : 'text-white'}`}><Cpu size={32} className={isLight ? 'text-green-600' : 'text-green-400'} />What We Provide</h3>
          <div className={`w-24 h-1 bg-gradient-to-r from-green-400 to-emerald-400 mx-auto rounded-full`}></div>
        </motion.div>
        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-8" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          {/* Storage & Database */}
          <GlassCard className={`p-8 h-full group ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
              <Cpu size={24} className="text-white" />
            </div>
            <h4 className={`text-xl font-semibold mb-4 ${isLight ? 'text-slate-800' : 'text-white'}`}>Storage & Database</h4>
            <div className={`mb-6 leading-relaxed ${isLight ? 'text-slate-700' : 'text-green-100'}`}>PostgreSQL + PostGIS, S3/Blob storage for COGs, metadata in Parquet/GeoParquet.</div>
            <div className="flex flex-wrap gap-2">
              {["PostGIS", "AWS S3", "GeoParquet"].map((tag, j) => (
                <span key={j} className={`text-xs px-3 py-1 rounded-full border ${isLight ? 'bg-slate-100 text-slate-800 border-slate-200' : 'bg-white/10 text-green-300 border-white/20'}`}>{tag}</span>
              ))}
            </div>
          </GlassCard>
          {/* Imagery & STAC */}
          <GlassCard className={`p-8 h-full group ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
              <Globe size={24} className="text-white" />
            </div>
            <h4 className={`text-xl font-semibold mb-4 ${isLight ? 'text-slate-800' : 'text-white'}`}>Imagery & STAC</h4>
            <div className={`mb-6 leading-relaxed ${isLight ? 'text-slate-700' : 'text-green-100'}`}>STAC catalog, Titiler for dynamic tiles, use Sentinel/Resourcesat/Planet depending on budget.</div>
            <div className="flex flex-wrap gap-2">
              {["STAC", "Titiler", "Sentinel-2"].map((tag, j) => (
                <span key={j} className={`text-xs px-3 py-1 rounded-full border ${isLight ? 'bg-slate-100 text-slate-800 border-slate-200' : 'bg-white/10 text-green-300 border-white/20'}`}>{tag}</span>
              ))}
            </div>
          </GlassCard>
          {/* DSS & Rules Engine */}
          <GlassCard className={`p-8 h-full group ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
              <BarChart3 size={24} className="text-white" />
            </div>
            <h4 className={`text-xl font-semibold mb-4 ${isLight ? 'text-slate-800' : 'text-white'}`}>DSS & Rules Engine</h4>
            <div className={`mb-6 leading-relaxed ${isLight ? 'text-slate-700' : 'text-green-100'}`}>Rule engine + ML scoring (XGBoost) with SHAP explanations for prioritisation.</div>
            <div className="flex flex-wrap gap-2">
              {["XGBoost", "SHAP", "Rule Engine"].map((tag, j) => (
                <span key={j} className={`text-xs px-3 py-1 rounded-full border ${isLight ? 'bg-slate-100 text-slate-800 border-slate-200' : 'bg-white/10 text-green-300 border-white/20'}`}>{tag}</span>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </motion.section>

      {/* Implementation Roadmap */}
      <motion.section id="roadmap" className="mt-24" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1 }} viewport={{ once: true }}>
        <motion.div className="text-center mb-16" initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
          <h3 className={`text-4xl font-bold mb-4 flex items-center justify-center gap-3 ${isLight ? 'text-slate-900' : 'text-white'}`}><BarChart3 size={32} className={isLight ? 'text-green-600' : 'text-green-400'} />Implementation Roadmap</h3>
          <div className={`w-24 h-1 bg-gradient-to-r from-green-400 to-emerald-400 mx-auto rounded-full`}></div>
        </motion.div>
        <motion.div className="space-y-8" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          {/* Phase 1 */}
          <GlassCard className={`p-8 flex items-start gap-6 group ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
            <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <BarChart3 size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                <h4 className={`text-xl font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>Phase 1 — Digitize Archive</h4>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${isLight ? 'bg-green-100 text-green-800' : 'bg-green-500/20 text-green-300'}`}>6–8 weeks</span>
              </div>
              <div className={`mb-4 leading-relaxed ${isLight ? 'text-slate-700' : 'text-green-100'}`}>OCR, NER extraction, human review flow, PostGIS ingestion with data validation and standardization.</div>
              <div className="flex flex-wrap gap-2">
                {["OCR", "NER", "Data Validation"].map((tag, j) => (
                  <span key={j} className={`text-xs px-3 py-1 rounded-full border ${isLight ? 'bg-green-100 text-green-800 border-green-200' : 'bg-green-500/20 text-green-300 border-green-400/30'}`}>{tag}</span>
                ))}
              </div>
            </div>
          </GlassCard>
          {/* Phase 2 */}
          <GlassCard className={`p-8 flex items-start gap-6 group ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
            <div className="p-4 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <BarChart3 size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                <h4 className={`text-xl font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>Phase 2 — VanMitra MVP</h4>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${isLight ? 'bg-blue-100 text-blue-800' : 'bg-blue-500/20 text-blue-300'}`}>4–6 weeks</span>
              </div>
              <div className={`mb-4 leading-relaxed ${isLight ? 'text-slate-700' : 'text-green-100'}`}>Vector tiles, STAC layers, filters and progress dashboards with WebGIS integration.</div>
              <div className="flex flex-wrap gap-2">
                {["Vector Tiles", "WebGIS", "Dashboard"].map((tag, j) => (
                  <span key={j} className={`text-xs px-3 py-1 rounded-full border ${isLight ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-blue-500/20 text-blue-300 border-blue-400/30'}`}>{tag}</span>
                ))}
              </div>
            </div>
          </GlassCard>
          {/* Phase 3 */}
          <GlassCard className={`p-8 flex items-start gap-6 group ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
            <div className="p-4 bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <BarChart3 size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                <h4 className={`text-xl font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>Phase 3 — AI Asset Mapping & DSS</h4>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${isLight ? 'bg-purple-100 text-purple-800' : 'bg-purple-500/20 text-purple-300'}`}>8–12 weeks</span>
              </div>
              <div className={`mb-4 leading-relaxed ${isLight ? 'text-slate-700' : 'text-green-100'}`}>Train segmentation models, serve predictions, build rules + ML prioritiser with explainable AI.</div>
              <div className="flex flex-wrap gap-2">
                {["ML Models", "DSS", "Explainable AI"].map((tag, j) => (
                  <span key={j} className={`text-xs px-3 py-1 rounded-full border ${isLight ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-purple-500/20 text-purple-300 border-purple-400/30'}`}>{tag}</span>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </motion.section>

      {/* Decision Support System CTA */}
      <motion.section id="dss" className="mt-24" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1 }} viewport={{ once: true }}>
        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 200 }}>
          <GlassCard className={`p-12 relative overflow-hidden ${isLight ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' : 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-400/30'}`}>
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex-1 text-center lg:text-left">
                <h3 className={`text-3xl font-bold mb-4 flex items-center justify-center lg:justify-start gap-3 ${isLight ? 'text-slate-900' : 'text-white'}`}><Target size={32} className={isLight ? 'text-green-600' : 'text-green-400'} />Decision Support System</h3>
                <div className={`text-lg leading-relaxed mb-6 ${isLight ? 'text-slate-700' : 'text-green-100'}`}>A rules + ML engine to layer CSS schemes and prioritize interventions with explainability for officers.</div>
                <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8">
                  {["Scheme Integration", "Priority Ranking", "Explainable AI"].map((tag, i) => (
                    <span key={i} className={`text-sm px-4 py-2 rounded-full border ${isLight ? 'bg-green-100 text-green-800 border-green-200' : 'bg-green-500/20 text-green-300 border-green-400/30'}`}>{tag}</span>
                  ))}
                </div>
              </div>
              <div className="flex-shrink-0">
                <MagneticButton className="text-lg px-8 py-4">See Recommendations</MagneticButton>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </motion.section>

      {/* Target Users / For Official Usage */}
      <motion.section id="dashboard" className="mt-24" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1 }} viewport={{ once: true }}>
        <motion.div className="text-center mb-16" initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
          <h3 className={`text-4xl font-bold mb-4 flex items-center justify-center gap-3 ${isLight ? 'text-slate-900' : 'text-white'}`}><Users size={32} className={isLight ? 'text-green-600' : 'text-green-400'} />For Official Usage</h3>
          <div className={`w-24 h-1 bg-gradient-to-r from-green-400 to-emerald-400 mx-auto rounded-full`}></div>
        </motion.div>
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          {/* Ministry of Tribal Affairs */}
          <GlassCard className={`p-8 text-center h-full group ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
              <Users size={28} className="text-white" />
            </div>
            <h4 className={`text-lg font-semibold mb-3 ${isLight ? 'text-slate-800' : 'text-white'}`}>Ministry of Tribal Affairs</h4>
            <div className={`leading-relaxed ${isLight ? 'text-slate-700' : 'text-green-100'}`}>Policy monitoring and evaluation</div>
          </GlassCard>
          {/* District Authorities */}
          <GlassCard className={`p-8 text-center h-full group ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
              <BarChart3 size={28} className="text-white" />
            </div>
            <h4 className={`text-lg font-semibold mb-3 ${isLight ? 'text-slate-800' : 'text-white'}`}>District Authorities</h4>
            <div className={`leading-relaxed ${isLight ? 'text-slate-700' : 'text-green-100'}`}>Local implementation and management</div>
          </GlassCard>
          {/* Planning Departments */}
          <GlassCard className={`p-8 text-center h-full group ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-r from-purple-500 to-violet-600 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
              <Cpu size={28} className="text-white" />
            </div>
            <h4 className={`text-lg font-semibold mb-3 ${isLight ? 'text-slate-800' : 'text-white'}`}>Planning Departments</h4>
            <div className={`leading-relaxed ${isLight ? 'text-slate-700' : 'text-green-100'}`}>Development planning and resource allocation</div>
          </GlassCard>
          {/* NGOs & Communities */}
          <GlassCard className={`p-8 text-center h-full group ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
              <Target size={28} className="text-white" />
            </div>
            <h4 className={`text-lg font-semibold mb-3 ${isLight ? 'text-slate-800' : 'text-white'}`}>NGOs & Communities</h4>
            <div className={`leading-relaxed ${isLight ? 'text-slate-700' : 'text-green-100'}`}>Advocacy and community engagement</div>
          </GlassCard>
        </motion.div>
      </motion.section>
    </>
  );
}
