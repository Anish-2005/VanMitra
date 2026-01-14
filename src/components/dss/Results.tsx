"use client";

import React from "react";
import GlassCard from "@/components/ui/GlassCard";
import MagneticButton from "@/components/ui/MagneticButton";
import { AlertCircle, BookOpen } from "lucide-react";
import Link from "next/link";

type Props = { isLight: boolean; response: any | null; loading: boolean; onCopy: (text?: string) => void };

export default function Results({ isLight, response, loading, onCopy }: Props) {
  if (response === null && !loading) {
    return (
      <div className="text-center py-12">
        <BookOpen className={`mx-auto mb-4 ${isLight ? 'text-green-500' : 'text-green-300'}`} size={48} />
        <p className={isLight ? 'text-green-600' : 'text-green-300'}>Enter coordinates above to get scheme recommendations for that location</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className={`mx-auto mb-4 ${isLight ? 'text-green-500' : 'text-green-400'}`}>
          <svg className="animate-spin" width="48" height="48" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.2" /><path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /></svg>
        </div>
        <p className={isLight ? 'text-green-600' : 'text-green-300'}>Analyzing location and generating recommendations...</p>
      </div>
    );
  }

  if (!response) return null;

  return (
    <div className="space-y-4">
      {response.success ? (
        <div>
          <GlassCard className={`p-6 ${isLight ? 'bg-green-50 border border-green-200 text-slate-900' : 'bg-green-500/10 border-green-400/30 text-white'}`}>
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isLight ? 'bg-green-100' : 'bg-green-500/20'}`}>
                <BookOpen className={isLight ? 'text-green-600' : 'text-green-400'} size={16} />
              </div>
              <div className="flex-1">
                <h4 className={`font-semibold mb-2 ${isLight ? 'text-green-800' : 'text-green-300'}`}>Scheme Recommendation</h4>
                <div className={`rounded-md p-4 border ${isLight ? 'bg-slate-100 border-green-200 text-slate-800' : 'bg-slate-800/50 border-green-400/20 text-white'}`}>
                  <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">{response.data}</pre>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-3 justify-end">
              <button onClick={() => onCopy(response.data)} className={`px-3 py-2 rounded-md ${isLight ? 'bg-white border border-slate-200 text-green-700' : 'bg-white/6 text-white border border-white/10'}`}>Copy</button>
              <Link href="/atlas" className={isLight ? 'inline-block' : ''}>
                <MagneticButton as="a" className="flex items-center gap-2">Open Atlas</MagneticButton>
              </Link>
            </div>
          </GlassCard>
        </div>
      ) : (
        <GlassCard className={`p-6 ${isLight ? 'bg-red-50 border border-red-200 text-slate-900' : 'bg-red-500/10 border-red-400/30 text-white'}`}>
          <div className="flex items-start gap-3">
            <AlertCircle className={`flex-shrink-0 mt-0.5 ${isLight ? 'text-red-500' : 'text-red-400'}`} size={20} />
            <div>
              <h4 className={`font-semibold mb-2 ${isLight ? 'text-red-800' : 'text-red-300'}`}>Error</h4>
              <p className={isLight ? 'text-red-700' : 'text-red-200'}>{response.error}</p>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
