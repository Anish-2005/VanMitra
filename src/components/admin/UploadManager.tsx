import React from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { UploadCloud } from 'lucide-react';

export default function UploadManager({ isLight = true }: { isLight?: boolean }) {
  return (
    <GlassCard className="p-6">
      <h3 className={`text-lg font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Upload scanned FRA documents</h3>
      <div className="mt-4">
        <label className={`${isLight ? 'text-emerald-700' : 'text-emerald-300'} block text-sm`}>Select file</label>
        <input type="file" className="mt-2 w-full" />
        <div className={`mt-4 text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-300'}`}>Accepted: PDF, TIFF. OCR and NER will run after upload.</div>
      </div>

      <div className="mt-6">
        <button className={`inline-flex items-center gap-2 px-4 py-2 rounded-md ${isLight ? 'bg-emerald-700 text-white' : 'bg-emerald-600 text-white'}`}>Upload <UploadCloud size={16} /></button>
      </div>
    </GlassCard>
  );
}
