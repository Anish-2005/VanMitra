"use client";

import React from "react";
import { Users, MapPin } from "lucide-react";
import DecorativeBackground from "@/components/DecorativeBackground";
import Link from "next/link";
import MapPreview from "../../components/MapPreview";

export default function PublicPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-green-100 text-green-900 relative overflow-hidden">
      <DecorativeBackground count={5} />
      <header className="relative z-10 max-w-7xl mx-auto px-6 pt-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-green-600 flex items-center justify-center border border-green-700 shadow-md">
            <Users className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-green-900">Public VanMitra View</h1>
            <p className="text-xs text-green-700">Public map (no PII)</p>
          </div>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/" className="text-sm text-green-800 font-medium hover:text-green-600 transition-colors">Home</Link>
        </nav>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        <div className="rounded-2xl overflow-hidden shadow-2xl border border-green-300 bg-white p-6">
          <div className="text-sm text-green-700">Public map of FRA progress (aggregated)</div>
          <div className="mt-4 h-[520px]">
            <MapPreview />
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-xl shadow-md border border-green-100 text-center">
              <div className="text-sm text-green-700">Claims processed</div>
              <div className="text-2xl font-bold text-green-800">1,240</div>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-md border border-green-100 text-center">
              <div className="text-sm text-green-700">Granted</div>
              <div className="text-2xl font-bold text-green-800">380</div>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-md border border-green-100 text-center">
              <div className="text-sm text-green-700">Villages covered</div>
              <div className="text-2xl font-bold text-green-800">86</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
