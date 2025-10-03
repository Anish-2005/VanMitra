import React from 'react';
import GlassCard from '@/components/ui/GlassCard';

export default function RecentUploads({ isLight = true }: { isLight?: boolean }) {
  return (
    <GlassCard className="p-6">
      <h4 className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Recent uploads</h4>
      <div className={`mt-3 ${isLight ? 'text-emerald-700' : 'text-emerald-300'}`}>No uploads yet — after uploading, documents will appear here for verification and manual correction.</div>
    </GlassCard>
  );
}
