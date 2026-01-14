import React from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { TrendingUp } from "lucide-react";

interface KPI {
  label: string;
  value: number | string;
  icon: React.ElementType;
  trend: string;
  color: string;
}

interface KPISectionProps {
  isLight: boolean;
  kpis: KPI[];
  timeSeries: number[] | null;
}

const Sparkline = ({ data, width = 160, height = 40 }: { data: number[]; width?: number; height?: number }) => {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((d - min) / (max - min || 1)) * height;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} aria-hidden>
      <polyline fill="none" stroke="#16a34a" strokeWidth={2} points={points} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const KPISection: React.FC<KPISectionProps> = ({ isLight, kpis, timeSeries }) => (
  <div className="mb-8">
    <motion.div
      initial={{ y: 8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <GlassCard
            key={index}
            className={`p-6 hover:shadow-lg transition-shadow ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>{kpi.label}</p>
                <p className={`text-2xl font-bold mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  <AnimatedCounter value={Number(kpi.value ?? 0)} />
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className={`h-4 w-4 mr-1 ${isLight ? 'text-emerald-600' : 'text-emerald-300'}`} />
                  <span className={`text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>{kpi.trend}</span>
                </div>
              </div>
              <div
                className={`h-12 w-12 rounded-xl flex items-center justify-center 
                  ${isLight ? 'bg-emerald-100 border border-emerald-200' : 'bg-white/5 border border-white/10'} backdrop-blur-sm`}
              >
                <kpi.icon
                  className={`h-6 w-6 
                    ${kpi.color === 'emerald' ? (isLight ? 'text-emerald-600' : 'text-emerald-400') :
                      kpi.color === 'blue' ? (isLight ? 'text-blue-600' : 'text-blue-400') :
                        kpi.color === 'purple' ? (isLight ? 'text-purple-600' : 'text-purple-400') :
                          kpi.color === 'orange' ? (isLight ? 'text-orange-600' : 'text-orange-400') :
                            isLight ? 'text-gray-600' : 'text-gray-400'
                  }`}
                />
              </div>
            </div>
            <div className="mt-4">
              {timeSeries && timeSeries.length >= 2 ? (
                <Sparkline data={timeSeries.slice(-7).map(Number)} />
              ) : (
                <div className={`h-10 flex items-center ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>
                  <span className="text-sm">No historical series</span>
                </div>
              )}
            </div>
          </GlassCard>
        ))}
      </div>
    </motion.div>
  </div>
);

export default KPISection;
