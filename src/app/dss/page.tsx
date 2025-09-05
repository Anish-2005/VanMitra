"use client";

import React, { useState, useMemo } from "react";
import { STATES, DEFAULT_STATE, DEFAULT_DISTRICT } from '../../lib/regions';
import {  BookOpen, ArrowRight } from "lucide-react";
import DecorativeBackground from "@/components/DecorativeBackground";
import Link from "next/link";
import MapPreview from "../../components/MapPreview";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function DSSPage() {
  const [filters, setFilters] = useState({ state: DEFAULT_STATE, district: DEFAULT_DISTRICT });

  const recommendations = useMemo(() => [
    { id: 1, village: "Sundarbans Block A", scheme: "Jal Shakti - Borewell", score: 0.92 },
    { id: 2, village: "Sundarbans Block B", scheme: "MGNREGA - Water Harvesting", score: 0.87 },
    { id: 3, village: "Block C", scheme: "PM-KISAN - Support", score: 0.81 },
  ], []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-green-100 text-green-900 relative overflow-hidden">
      <DecorativeBackground count={6} />

      <header className="relative z-10 max-w-7xl mx-auto px-6 pt-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-green-600 flex items-center justify-center border border-green-700 shadow-md">
            <BookOpen className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-green-900">Decision Support System</h1>
            <p className="text-xs text-green-700">Recommendations & Prioritization</p>
          </div>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/" className="text-sm text-green-800 font-medium hover:text-green-600 transition-colors">Home</Link>
          <Link href="/dashboard" className="text-sm text-green-800 font-medium hover:text-green-600 transition-colors">Dashboard</Link>
        </nav>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <section className="lg:col-span-8">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-green-300 bg-white p-6">
              <div className="text-sm text-green-700">Map & Overlays</div>
              <div className="mt-4 h-[520px]">
                <MapPreview center={STATES.find(s => s.name === filters.state)?.center as [number, number] || [88.8,21.9]} zoom={7} />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
              {recommendations.map(r => (
                <div key={r.id} className="p-4 bg-white rounded-lg border border-green-100 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-green-900">{r.village}</div>
                    <div className="text-sm text-green-700">{r.scheme}</div>
                  </div>
                  <div className="text-green-800">{(r.score * 100).toFixed(0)}%</div>
                </div>
              ))}
            </div>
          </section>

          <aside className="lg:col-span-4">
            <div className="p-6 bg-white rounded-xl shadow-md border border-green-100">
              <h4 className="font-semibold text-green-900">DSS Filters</h4>
              <div className="mt-3">
                <label className="block text-sm text-green-700">State</label>
                <select value={filters.state} onChange={(e) => setFilters(s => ({...s, state: e.target.value}))} className="mt-1 w-full rounded-md border border-green-100 p-2 bg-green-50">
                  {STATES.map(s => <option key={s.code} value={s.name}>{s.name}</option>)}
                </select>
              </div>

              <div className="mt-3">
                <label className="block text-sm text-green-700">District</label>
                <select value={filters.district} onChange={(e) => setFilters(s => ({...s, district: e.target.value}))} className="mt-1 w-full rounded-md border border-green-100 p-2 bg-green-50">
                  {(STATES.find(s => s.name === filters.state)?.districts || []).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="mt-4">
                <button className="w-full inline-flex items-center justify-center gap-2 bg-green-700 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-600 transition-colors">Run DSS</button>
              </div>
            </div>

            <div className="mt-6 p-6 bg-white rounded-xl shadow-md border border-green-100">
              <h4 className="font-semibold text-green-900">Quick Actions</h4>
              <div className="mt-3 grid grid-cols-1 gap-3">
                <Link href="/dashboard" className="inline-flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-md">Open Dashboard <ArrowRight size={14} /></Link>
                <button className="inline-flex items-center gap-2 border border-green-200 px-4 py-2 rounded-md">Export Recommendations</button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
    </ProtectedRoute>
  );
}
