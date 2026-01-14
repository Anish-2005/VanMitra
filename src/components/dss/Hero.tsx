"use client";

import React from "react";
import Link from "next/link";
import MagneticButton from "@/components/ui/MagneticButton";
import { ArrowRight } from "lucide-react";
import { MapPin } from "lucide-react";

type Props = { isLight: boolean };

export default function Hero({ isLight }: Props) {
  return (
    <div>
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4 sm:mb-6">
        <span className={isLight ? 'text-slate-900' : 'bg-gradient-to-r from-white via-green-300 to-emerald-300 bg-clip-text text-transparent'}>Intelligent</span>
        <br />
        <span className={isLight ? 'text-green-700' : 'bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent'}>Scheme Recommendations</span>
        <br />
        <span className={isLight ? 'text-slate-800' : 'text-white'}>for Tribal Communities</span>
      </h2>

      <p className={`text-base sm:text-lg leading-relaxed max-w-full sm:max-w-2xl mb-6 sm:mb-8 ${isLight ? 'text-slate-700' : 'text-green-100'}`}>
        Get personalized scheme recommendations based on geographical location and community needs. Our AI-powered system analyzes spatial data to suggest the most appropriate development interventions.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <Link href="#dss-form" className="w-full sm:w-auto">
          <MagneticButton className={`group w-full sm:w-auto ${isLight ? 'bg-green-600 hover:bg-green-700 text-white border-green-700' : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white border-white/20'}`}>
            <div className="flex items-center justify-center">
              <ArrowRight size={20} className="mr-2 group-hover:translate-x-1 transition-transform" />
              Get Recommendations
            </div>
          </MagneticButton>
        </Link>

        <Link href="/atlas" className="w-full sm:w-auto">
          <MagneticButton as="a" variant={isLight ? "outline" : "secondary"} className={`w-full sm:w-auto ${isLight ? "border-green-600 text-green-700 hover:bg-green-50 hover:border-green-700 hover:text-green-800" : ""}`}>
            <div className="flex items-center justify-center">
              <MapPin size={16} className="mr-2" />
              View Atlas
            </div>
          </MagneticButton>
        </Link>
      </div>
    </div>
  );
}
