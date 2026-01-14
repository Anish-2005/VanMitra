"use client";

import React from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { MapPin, Database, Layers } from "lucide-react";

type Props = {
  isLight: boolean;
  claimsTotal: number;
  claimsGranted: number;
  containerVariants?: any;
  itemVariants?: any;
};

export default function StatsGrid({ isLight, claimsTotal, claimsGranted, containerVariants, itemVariants }: Props) {
  const stats = [
    { icon: MapPin, title: "Claims", value: claimsTotal, subtitle: "legacy + recent uploads" },
    { icon: Database, title: "Grants issued", value: claimsGranted, subtitle: "verified & geo-referenced" },
    { icon: Layers, title: "AI assets", value: 12, subtitle: "ponds, farms, homesteads" }
  ];

  return (
    <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={containerVariants}>
      {stats.map((stat, i) => (
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
  );
}
