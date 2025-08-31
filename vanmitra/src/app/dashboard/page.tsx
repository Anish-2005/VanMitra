"use client";

import { motion } from "framer-motion";
import { MapPin, Database, BarChart3, Target, Satellite, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const kpis = [
    { label: "Claims processed", value: "1,240", icon: MapPin },
    { label: "Grants issued", value: "380", icon: Database },
    { label: "AI assets", value: "4,120", icon: Satellite },
    { label: "Priority villages", value: "86", icon: Target },
  ];

  const recommendations = [
    { id: 1, village: "Sundarbans Block A", scheme: "Jal Shakti - Borewell", score: 0.92 },
    { id: 2, village: "Sundarbans Block B", scheme: "MGNREGA - Water Harvesting", score: 0.87 },
    { id: 3, village: "Block C", scheme: "PM-KISAN - Support", score: 0.81 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-green-100 text-green-900 relative overflow-hidden">
      <header className="relative z-10 max-w-7xl mx-auto px-6 pt-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-green-600 flex items-center justify-center border border-green-700 shadow-md">
            <MapPin className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-green-900">FRA Atlas — Dashboard</h1>
            <p className="text-xs text-green-700">Overview & Recommendations</p>
          </div>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/" className="text-sm text-green-800 font-medium hover:text-green-600 transition-colors">Home</Link>
          <button className="inline-flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-600 transition-colors">Sign out</button>
        </nav>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <section className="lg:col-span-7">
            <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-green-300 bg-white">
                <div className="w-full h-[420px] bg-gradient-to-br from-green-50 to-emerald-100 p-6 relative">
                  <div className="absolute inset-0 bg-green-800/6 pointer-events-none"></div>
                  <div className="relative z-10 h-full flex flex-col">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-green-600">Map Preview</div>
                        <div className="text-lg font-semibold text-green-900">Sundarbans — Pilot</div>
                      </div>
                      <div className="text-sm text-green-700">Last updated: Aug 2025</div>
                    </div>

                    <div className="flex-1 mt-4 bg-white rounded-md border border-green-100 shadow-inner flex items-center justify-center text-green-400">
                      {/* Placeholder for Map component (MapLibre) */}
                      <div>Map preview (replace with MapLibre component)</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {kpis.map((k) => (
                <div key={k.label} className="p-4 bg-white rounded-xl shadow-md border border-green-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-md text-green-700">
                      <k.icon />
                    </div>
                    <div>
                      <div className="text-xs text-green-600">{k.label}</div>
                      <div className="text-2xl font-bold text-green-800">{k.value}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <section className="mt-8">
              <h3 className="text-xl font-semibold text-green-900">Recent Recommendations</h3>
              <div className="mt-3 space-y-3">
                {recommendations.map((r) => (
                  <div key={r.id} className="p-4 bg-white rounded-lg shadow-sm border border-green-100 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-green-900">{r.village}</div>
                      <div className="text-sm text-green-700">Recommended: {r.scheme}</div>
                    </div>
                    <div className="text-sm text-green-800">Priority: {(r.score * 100).toFixed(0)}%</div>
                  </div>
                ))}
              </div>
            </section>
          </section>

          <aside className="lg:col-span-5">
            <div className="p-6 bg-white rounded-xl shadow-md border border-green-100">
              <h4 className="font-semibold text-green-900">Filters</h4>
              <div className="mt-3 space-y-3 text-green-800">
                <div>
                  <label className="block text-sm text-green-700">State</label>
                  <select className="mt-1 w-full rounded-md border border-green-100 p-2 bg-green-50">
                    <option>West Bengal</option>
                    <option>Bihar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-green-700">District</label>
                  <select className="mt-1 w-full rounded-md border border-green-100 p-2 bg-green-50">
                    <option>East Sundarbans</option>
                    <option>North 24 Parganas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-green-700">Village</label>
                  <input className="mt-1 w-full rounded-md border border-green-100 p-2 bg-white" placeholder="Search village" />
                </div>

                <div className="mt-2">
                  <button className="w-full inline-flex items-center justify-center gap-2 bg-green-700 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-600 transition-colors">Apply Filters</button>
                </div>
              </div>
            </div>

            <div className="mt-6 p-6 bg-white rounded-xl shadow-md border border-green-100">
              <h4 className="font-semibold text-green-900">Quick Actions</h4>
              <div className="mt-3 grid grid-cols-1 gap-3">
                <button className="inline-flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-md shadow-sm hover:bg-green-600 transition-colors">Open Atlas <ArrowRight size={14} /></button>
                <button className="inline-flex items-center gap-2 border border-green-200 px-4 py-2 rounded-md">Upload Documents</button>
                <button className="inline-flex items-center gap-2 border border-green-200 px-4 py-2 rounded-md">Run Asset Mapping</button>
              </div>
            </div>

            <div className="mt-6 p-6 bg-white rounded-xl shadow-md border border-green-100">
              <h4 className="font-semibold text-green-900">Analytics</h4>
              <div className="mt-3 text-green-700">Simple trend charts and distribution widgets can be placed here (Recharts/Plotly).</div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
