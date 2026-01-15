import React from 'react';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { FileText } from 'lucide-react';

export default function AdminMetrics({ metrics, isLight = true }: { metrics: Array<{ label: string; value: number | string; trend?: string; icon?: any; color?: string }>; isLight?: boolean }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((m, i) => (
        <GlassCard key={i} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isLight ? 'text-emerald-700' : 'text-emerald-300'}`}>{m.label}</p>
              <p className={`text-2xl font-bold mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {typeof m.value === 'number' ? (
                  <AnimatedCounter value={m.value} />
                ) : (
                  <span className={isLight ? 'text-slate-900' : 'text-white'}>{String(m.value)}</span>
                )}
              </p>
              <div className="flex items-center mt-2">
                <span className={`text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-300'}`}>{m.trend ?? '\u2014'}</span>
              </div>
            </div>
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${isLight ? 'bg-emerald-100 border border-emerald-200' : 'bg-white/5 border border-white/10'}`}>
              {m.icon ? <m.icon className={`h-6 w-6 ${isLight ? 'text-emerald-600' : 'text-emerald-300'}`} /> : <FileText className={`h-6 w-6 ${isLight ? 'text-emerald-600' : 'text-emerald-300'}`} />}
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
