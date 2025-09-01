import React from 'react';

export default function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: string; children?: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg p-6 z-10">
        {title && <h3 className="text-lg font-semibold text-green-900">{title}</h3>}
        <div className="mt-4">{children}</div>
        <div className="mt-4 text-right">
          <button onClick={onClose} className="px-3 py-1 rounded-md border text-sm">Close</button>
        </div>
      </div>
    </div>
  );
}
