import React from 'react';
import GlassCard from '@/components/ui/GlassCard';

export default function UserManagement({ isLight = true }: { isLight?: boolean }) {
  return (
    <GlassCard className="p-6">
      <h4 className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>User Management</h4>
      <div className={`mt-3 ${isLight ? 'text-emerald-700' : 'text-emerald-300'}`}>Manage admin users, reset passwords, and assign roles.</div>
      <div className="mt-4 grid grid-cols-1 gap-2">
        <button className={`inline-flex items-center gap-2 px-3 py-2 rounded-md ${isLight ? 'bg-emerald-700 text-white' : 'bg-emerald-600 text-white'}`}>Invite User</button>
        <button className={`inline-flex items-center gap-2 px-3 py-2 rounded-md ${isLight ? 'border border-emerald-200' : 'border border-white/10 text-white'}`}>Manage Roles</button>
      </div>
    </GlassCard>
  );
}
