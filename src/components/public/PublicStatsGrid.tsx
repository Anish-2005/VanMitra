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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className={`p-6 rounded-2xl border ${cardClass}`}>
        <div className="text-sm font-semibold">Total Claims</div>
        <div className="text-3xl font-bold mt-2"><AnimatedCounter value={totalClaims} /></div>
        <div className="text-xs text-muted-foreground mt-2">Aggregated claims recorded in the public dataset</div>
      </div>

      <div className={`p-6 rounded-2xl border ${cardClass}`}>
        <div className="text-sm font-semibold">Grants</div>
        <div className="text-3xl font-bold mt-2"><AnimatedCounter value={grantedCount} /></div>
        <div className="text-xs text-muted-foreground mt-2">Verified and granted claims</div>
      </div>

      <div className={`p-6 rounded-2xl border ${cardClass}`}>
        <div className="text-sm font-semibold">Unique Villages</div>
        <div className="text-3xl font-bold mt-2"><AnimatedCounter value={uniqueVillages} /></div>
        <div className="text-xs text-muted-foreground mt-2">Distinct villages represented in the dataset</div>
      </div>
    </div>
  );
}
