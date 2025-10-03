import React from 'react';
import GlassCard from '@/components/ui/GlassCard';

export default function VerificationQueue({ isLight = true }: { isLight?: boolean }) {
  return (
    <GlassCard className="p-6">
      <h3 className={`text-lg font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Verification Queue</h3>
      <div className={`mt-4 ${isLight ? 'text-emerald-700' : 'text-emerald-300'}`}>No items in the queue.</div>
      <div className={`mt-4 text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-300'}`}>When documents are uploaded they will appear here for manual verification and correction.</div>
    </GlassCard>
  );
}
