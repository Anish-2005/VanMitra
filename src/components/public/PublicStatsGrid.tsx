"use client";

import React from "react";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

type Props = {
  totalClaims?: number;
  grantedCount?: number;
  uniqueVillages?: number;
  isLight?: boolean;
};

export default function PublicStatsGrid({ totalClaims = 0, grantedCount = 0, uniqueVillages = 0, isLight = true }: Props) {
  const cardClass = isLight ? 'bg-white/90 border-green-200/50 text-slate-900' : 'bg-white/5 border-white/10 text-white';
  const grantPct = totalClaims > 0 ? Math.round((grantedCount / totalClaims) * 100) : 0;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
      <div className={`p-4 sm:p-6 rounded-2xl border ${cardClass}`}> 
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Total Claims</div>
            <div className="text-2xl sm:text-3xl font-bold mt-2"><AnimatedCounter value={totalClaims} /></div>
            <div className="text-xs text-muted-foreground mt-2">Aggregated claims recorded in the public dataset</div>
          </div>
          <div className="ml-4 text-right">
            <div className="text-sm font-semibold">Granted</div>
            <div className="text-2xl font-bold mt-2"><AnimatedCounter value={grantedCount} /></div>
            <div className="text-xs text-muted-foreground mt-2">{grantPct}% of claims</div>
          </div>
        </div>

        <div className="mt-4">
          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
            <div className={`h-2 ${isLight ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-emerald-400 to-green-300'}`} style={{ width: `${grantPct}%` }} />
          </div>
        </div>
      </div>

      <div className={`p-4 sm:p-6 rounded-2xl border ${cardClass} grid grid-cols-1 gap-4`}> 
        <div>
          <div className="text-sm font-semibold">Villages Covered</div>
          <div className="text-2xl font-bold mt-2"><AnimatedCounter value={uniqueVillages} /></div>
          <div className="text-xs text-muted-foreground mt-2">Distinct villages represented in the dataset</div>
        </div>

        <div>
          <div className="text-sm font-semibold">Data Notes</div>
          <div className="text-xs mt-2 text-muted-foreground">This public view aggregates claims and removes any PII. For detailed analysis, contact the project team.</div>
        </div>
      </div>
    </div>
  );
}
