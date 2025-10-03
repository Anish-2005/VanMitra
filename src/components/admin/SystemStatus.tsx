import React from 'react';
import GlassCard from '@/components/ui/GlassCard';

export default function SystemStatus({ isLight = true }: { isLight?: boolean }) {
  return (
    <GlassCard className="p-6">
      <h4 className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>System Status</h4>
      <div className={`mt-3 ${isLight ? 'text-emerald-700' : 'text-emerald-300'}`}>API: Online • Database: Healthy • OCR: Active • Map Services: Online</div>
      <div className={`mt-4 text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-300'}`}>Last maintenance: 2 hours ago</div>
    </GlassCard>
  );
}
