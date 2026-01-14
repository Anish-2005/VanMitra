import React from "react";
import GlassCard from "@/components/ui/GlassCard";
import { motion } from "framer-motion";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

interface DataVisualizationSectionProps {
  isLight: boolean;
  timeSeries: number[] | null;
  totalClaims: number;
  kpiTrend: string;
  filteredLength: number;
}

const DataVisualizationSection: React.FC<DataVisualizationSectionProps> = ({ isLight, timeSeries, totalClaims, kpiTrend, filteredLength }) => (
  <div className="mb-8">
    <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className={`p-6 ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>Claims Processing Trend</h3>
          {timeSeries && timeSeries.length >= 2 ? (
            <>
              <div className="h-64 flex items-end justify-between gap-2">
                {timeSeries.slice(-12).map((value: number, index: number) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div
                      className={`rounded-t w-full transition-all hover:opacity-80 ${isLight ? 'bg-emerald-500' : 'bg-emerald-500'}`}
                      style={{ height: `${(Number(value) / Math.max(...timeSeries.map(Number))) * 200}px` }}
                    ></div>
                    <span className={`text-xs mt-2 ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>{index + 1}</span>
                  </div>
                ))}
              </div>
              <div className={`mt-4 flex justify-between text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>
                <span>Monthly claims processed</span>
                <span className="font-medium">{kpiTrend ?? '\u2014'} this month</span>
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>No historical series available</div>
                <div className={`text-2xl font-bold mt-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  <AnimatedCounter value={totalClaims} />
                </div>
                <div className={`text-sm mt-1 ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>{kpiTrend ?? '\u2014'}</div>
              </div>
            </div>
          )}
        </GlassCard>
        <GlassCard className={`p-6 ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>Priority Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-4 w-4 rounded ${isLight ? 'bg-red-500' : 'bg-red-500'}`}></div>
                <span className={`text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>High Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-24 h-2 rounded ${isLight ? 'bg-emerald-200' : 'bg-white/10'}`}>
                  <div className={`h-2 rounded ${isLight ? 'bg-red-500' : 'bg-red-500'}`} style={{ width: '35%' }}></div>
                </div>
                <span className={`text-sm font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>35%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-4 w-4 rounded ${isLight ? 'bg-yellow-500' : 'bg-yellow-500'}`}></div>
                <span className={`text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>Medium Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-24 h-2 rounded ${isLight ? 'bg-emerald-200' : 'bg-white/10'}`}>
                  <div className={`h-2 rounded ${isLight ? 'bg-yellow-500' : 'bg-yellow-500'}`} style={{ width: '45%' }}></div>
                </div>
                <span className={`text-sm font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>45%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-4 w-4 rounded ${isLight ? 'bg-green-500' : 'bg-green-500'}`}></div>
                <span className={`text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>Low Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-24 h-2 rounded ${isLight ? 'bg-emerald-200' : 'bg-white/10'}`}>
                  <div className={`h-2 rounded ${isLight ? 'bg-emerald-500' : 'bg-emerald-500'}`} style={{ width: '20%' }}></div>
                </div>
                <span className={`text-sm font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>20%</span>
              </div>
            </div>
          </div>
          <div className={`mt-6 pt-4 border-t ${isLight ? 'border-emerald-200' : 'border-white/10'}`}>
            <div className={`text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>
              Total villages monitored: <span className={`font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>{filteredLength}</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  </div>
);

export default DataVisualizationSection;
