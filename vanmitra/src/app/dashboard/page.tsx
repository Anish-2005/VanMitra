"use client";

import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Database, Target, Satellite, ArrowRight } from "lucide-react";
import { Leaf, Trees, Sprout, Droplets } from "lucide-react";
import Link from "next/link";
import MapPreview from "../../components/MapPreview";

function Sparkline({ data, width = 160, height = 40 }: { data: number[]; width?: number; height?: number }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((d - min) / (max - min || 1)) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} aria-hidden>
      <polyline fill="none" stroke="#16a34a" strokeWidth={2} points={points} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Dashboard() {
  // deterministic pseudo-random generator used for decorative floating items
  const seeded = (i: number, salt = 1) => {
    return Math.abs(Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453) % 1;
  };

  const [stateFilter, setStateFilter] = useState<string>("West Bengal");
  const [districtFilter, setDistrictFilter] = useState<string>("East Sundarbans");
  const [villageQuery, setVillageQuery] = useState<string>("");

  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [kpiData, setKpiData] = useState<any | null>(null);
  const [timeSeries, setTimeSeries] = useState<number[]>([]);

  useEffect(() => {
    // fetch KPIs
    fetch("/api/dashboard/kpis")
      .then((r) => r.json())
      .then((d) => {
        setKpiData(d);
        if (d.timeSeries) setTimeSeries(d.timeSeries);
      })
      .catch(() => null);

    // fetch recommendations
    fetch("/api/dashboard/recommendations")
      .then((r) => r.json())
      .then((d) => setRecommendations(d))
      .catch(() => setRecommendations([]));
  }, []);

  const filtered = useMemo(() => {
    return recommendations.filter((r) => r.state === stateFilter && r.district === districtFilter && r.village.toLowerCase().includes(villageQuery.toLowerCase()));
  }, [recommendations, stateFilter, districtFilter, villageQuery]);

  const [selected, setSelected] = useState<any | null>(null);

  function downloadCSV(rows: any[]) {
    if (!rows || rows.length === 0) return;
    const keys = Object.keys(rows[0]);
    const csv = [keys.join(','), ...rows.map(r => keys.map(k => JSON.stringify(r[k] ?? '')).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recommendations.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  const kpis = useMemo(() => {
    const claims = kpiData?.claims ?? 0;
    const grants = kpiData?.grants ?? 0;
    const assets = kpiData?.assets ?? 0;
    const priorityVillages = filtered.length || 0;
    return [
      { label: "Claims processed", value: claims.toLocaleString(), icon: MapPin },
      { label: "Grants issued", value: grants.toLocaleString(), icon: Database },
      { label: "AI assets", value: assets.toLocaleString(), icon: Satellite },
      { label: "Priority villages", value: priorityVillages.toString(), icon: Target },
    ];
  }, [kpiData, filtered]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-green-100 text-green-900 relative overflow-hidden">
      {/* Decorative floating elements (background) */}
      {[...Array(8)].map((_, i) => {
        const r1 = seeded(i, 1);
        const r2 = seeded(i, 2);
        const top = `${(r2 * 80 + 10).toFixed(6)}%`;
        const left = `${(r1 * 90 + 5).toFixed(6)}%`;
        const size = 40 + Math.floor(r1 * 80);
        const icons = [Leaf, Trees, Sprout, Droplets];
        const Icon = icons[i % icons.length];

        return (
          <div key={i} className="pointer-events-none absolute opacity-20" style={{ top, left }}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.2, y: -10 }}
              transition={{ duration: 6 + r1 * 4, repeat: Infinity, repeatType: "reverse" }}
            >
              <div style={{ width: size, height: size }}>
                <Icon size={size} className="text-green-600" />
              </div>
            </motion.div>
          </div>
        );
      })}
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

                    <div className="flex-1 mt-4 bg-white rounded-md border border-green-100 shadow-inner flex flex-col p-4">
                      {/* Replace this section with a MapLibre/Map component later */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="text-sm text-green-700 mb-2">Map preview - interactive map goes here</div>
                          <div className="h-56 bg-green-50 rounded-md border border-dashed border-green-100 overflow-hidden">
                            <MapPreview />
                          </div>
                        </div>
                        <div className="w-44 flex flex-col items-end">
                          <div className="text-xs text-green-600">Claims over time</div>
                          <div className="mt-2">
                            <Sparkline data={timeSeries} width={140} height={48} />
                          </div>
                          <div className="text-sm text-green-700 mt-2">+12% month-over-month</div>
                        </div>
                      </div>
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
                {filtered.length === 0 && (
                  <div className="p-4 bg-white rounded-lg shadow-sm border border-green-100 text-green-700">No recommendations for the selected filters.</div>
                )}

                {filtered.map((r) => (
                  <div key={r.id} className="p-4 bg-white rounded-lg shadow-sm border border-green-100 flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className={`text-sm px-2 py-1 rounded-md font-medium ${r.score > 0.9 ? 'bg-emerald-100 text-emerald-800' : r.score > 0.8 ? 'bg-yellow-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                          {(r.score * 100).toFixed(0)}%
                        </div>
                        <div className="font-semibold text-green-900">{r.village}</div>
                      </div>
                      <div className="text-sm text-green-700 mt-1">Recommended: {r.scheme}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setSelected(r)} className="inline-flex items-center gap-2 bg-green-700 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600 transition-colors">View</button>
                      <button onClick={() => navigator.clipboard?.writeText(JSON.stringify(r))} className="inline-flex items-center gap-2 border border-green-200 px-3 py-1 rounded-md text-sm">Share</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="mt-4 flex gap-2">
              <button onClick={() => downloadCSV(filtered)} className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md">Download CSV</button>
              <button onClick={() => alert('Run prioritization (mock)') } className="inline-flex items-center gap-2 border border-green-200 px-4 py-2 rounded-md">Run Prioritization</button>
            </div>
          </section>

          <aside className="lg:col-span-5">
            <div className="p-6 bg-white rounded-xl shadow-md border border-green-100">
              <h4 className="font-semibold text-green-900">Filters</h4>
              <div className="mt-3 space-y-3 text-green-800">
                <div>
                  <label className="block text-sm text-green-700">State</label>
                  <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className="mt-1 w-full rounded-md border border-green-100 p-2 bg-green-50">
                    <option>West Bengal</option>
                    <option>Bihar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-green-700">District</label>
                  <select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)} className="mt-1 w-full rounded-md border border-green-100 p-2 bg-green-50">
                    <option>East Sundarbans</option>
                    <option>North 24 Parganas</option>
                    <option>Patna</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-green-700">Village</label>
                  <input value={villageQuery} onChange={(e) => setVillageQuery(e.target.value)} className="mt-1 w-full rounded-md border border-green-100 p-2 bg-white" placeholder="Search village" />
                </div>

                <div className="mt-2">
                  <button onClick={() => { setVillageQuery(""); setDistrictFilter("East Sundarbans"); setStateFilter("West Bengal"); }} className="w-full inline-flex items-center justify-center gap-2 bg-green-700 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-600 transition-colors">Reset Filters</button>
                </div>
              </div>
            </div>

            <div className="mt-6 p-6 bg-white rounded-xl shadow-md border border-green-100">
              <h4 className="font-semibold text-green-900">Quick Actions</h4>
              <div className="mt-3 grid grid-cols-1 gap-3">
                <Link href="/" className="inline-flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-md shadow-sm hover:bg-green-600 transition-colors">Open Atlas <ArrowRight size={14} /></Link>
                <button className="inline-flex items-center gap-2 border border-green-200 px-4 py-2 rounded-md">Upload Documents</button>
                <button className="inline-flex items-center gap-2 border border-green-200 px-4 py-2 rounded-md">Run Asset Mapping</button>
              </div>
            </div>

            <div className="mt-6 p-6 bg-white rounded-xl shadow-md border border-green-100">
              <h4 className="font-semibold text-green-900">Analytics</h4>
              <div className="mt-3 text-green-700">Simple trend charts and distribution widgets are rendered inline. Replace with Recharts/Plotly when adding the dependency.</div>
            </div>
          </aside>
        </div>
      </main>
      {/* Detail modal for recommendation */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-2xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-900">{selected.village}</h3>
                <div className="text-sm text-green-700">Recommended: {selected.scheme}</div>
              </div>
              <div>
                <button onClick={() => setSelected(null)} className="text-sm px-3 py-1 bg-slate-100 rounded-md">Close</button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-green-800">Priority score</h4>
                <div className="text-2xl font-bold text-green-900">{(selected.score * 100).toFixed(0)}%</div>
                <div className="mt-3 text-sm text-green-700">This recommendation is generated by combining rule-based eligibility and AI-derived indicators.</div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-green-800">Actions</h4>
                <div className="mt-2 flex flex-col gap-2">
                  <button className="inline-flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-md">Create Plan</button>
                  <button className="inline-flex items-center gap-2 border border-green-200 px-4 py-2 rounded-md">Assign to Officer</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
