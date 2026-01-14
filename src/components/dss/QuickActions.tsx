"use client";

import React from "react";
import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import MagneticButton from "@/components/ui/MagneticButton";
import { BookOpen, MapPin } from "lucide-react";

type Props = { isLight: boolean };

export default function QuickActions({ isLight }: Props) {
  return (
    <div className="mt-8 space-y-4">
      <GlassCard className={`p-6 ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
        <h4 className={`font-semibold mb-4 flex items-center gap-2 ${isLight ? 'text-slate-800' : 'text-white'}`}>
          <BookOpen size={16} className={isLight ? 'text-green-600' : 'text-green-400'} />
          Quick Actions
        </h4>
        <div className="grid grid-cols-1 gap-3">
          <Link href="/atlas">
            <MagneticButton variant={isLight ? "outline" : "secondary"} className="flex items-center justify-center w-full">
              <MapPin size={20} className="mr-2" />
              Open Atlas
            </MagneticButton>
          </Link>
          <Link href="/dashboard">
            <MagneticButton variant={isLight ? "outline" : "secondary"} className="flex items-center justify-center w-full">
              <BookOpen size={16} className="mr-2" />
              View Dashboard
            </MagneticButton>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
