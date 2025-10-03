import React from 'react';
import GlassCard from '@/components/ui/GlassCard';

export default function AuditLogPanel({ isLight = true }: { isLight?: boolean }) {
  return (
    <GlassCard className="p-6">
      <h4 className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Audit Log</h4>
      <div className={`mt-3 ${isLight ? 'text-emerald-700' : 'text-emerald-300'}`}>No audit entries yet. Exports and actions will be logged here for compliance.</div>
    </GlassCard>
  );
}
