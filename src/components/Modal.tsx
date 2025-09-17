import React from 'react';

export default function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: string; children?: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-emerald-900/95 border border-emerald-700/50 rounded-3xl shadow-2xl w-full max-w-lg p-6 z-10 backdrop-blur-sm">
        {title && (
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          </div>
        )}
        <div className="mt-4">{children}</div>
        <div className="mt-6 text-right">
          <button onClick={onClose} className="px-4 py-2 rounded-2xl border border-emerald-600 text-emerald-300 hover:bg-emerald-800/50 transition-all duration-200 text-sm font-medium">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
