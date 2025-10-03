import React from 'react';
import { Server } from 'lucide-react';
import Link from 'next/link';
import GlassCard from '@/components/ui/GlassCard';

export default function AdminHeader({ title = 'Admin Panel', subtitle = 'Administration & Operations', isLight = true }: { title?: string; subtitle?: string; isLight?: boolean }) {
  return (
    <header className="relative z-10 max-w-7xl mx-auto px-6 pt-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-2xl bg-emerald-600 flex items-center justify-center border border-emerald-700 shadow-md">
          <Server className="text-white" />
        </div>
        <div>
          <h1 className={`text-2xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>{title}</h1>
          <p className={`${isLight ? 'text-emerald-700' : 'text-emerald-300'} text-sm`}>{subtitle}</p>
        </div>
      </div>

      <nav className="flex items-center gap-4">
        <Link href="/dashboard" className={`text-sm font-medium px-4 py-2 rounded-xl backdrop-blur-sm border transition-colors ${isLight ? 'text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100' : 'text-emerald-300 border-white/20 bg-white/5 hover:bg-white/10'}`}>Dashboard</Link>
      </nav>
    </header>
  );
}
