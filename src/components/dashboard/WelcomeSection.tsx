import React from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";

interface WelcomeSectionProps {
  isLight: boolean;
  userName: string;
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ isLight, userName }) => (
  <div className="mb-8">
    <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
      <GlassCard className={`p-6 ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Welcome back, {userName}!</h2>
            <p className={`mt-1 ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>Here is what is happening with FRA claims and village development today.</p>
          </div>
          <div className="text-right">
            <div className={`text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>Last updated</div>
            <div className={`text-lg font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  </div>
);

export default WelcomeSection;
