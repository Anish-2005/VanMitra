import React from 'react';
import { useTheme } from '@/components/ThemeProvider';

export default function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: string; children?: React.ReactNode }) {
  if (!open) return null;
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative rounded-3xl shadow-2xl w-full max-w-lg p-6 z-10 backdrop-blur-sm border ${isLight ? 'bg-white/95 border-slate-200 text-slate-900' : 'bg-emerald-900/95 border-emerald-700/50 text-white'}`}>
        {title && (
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-2 h-2 rounded-full animate-pulse ${isLight ? 'bg-green-600' : 'bg-green-400'}`} />
            <h3 className={`text-lg font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{title}</h3>
          </div>
        )}
        <div className="mt-4">{children}</div>
        <div className="mt-6 text-right">
          <button onClick={onClose} className={`px-4 py-2 rounded-2xl border transition-all duration-200 text-sm font-medium ${isLight ? 'border-slate-300 text-slate-800 hover:bg-slate-100' : 'border-emerald-600 text-emerald-300 hover:bg-emerald-800/50'}`}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
