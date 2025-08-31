"use client";

import React, { useMemo, useState } from "react";
import { STATES, DEFAULT_STATE, DEFAULT_DISTRICT } from '../../lib/regions';
import { motion } from "framer-motion";
import { MapPin, Layers, Globe, ArrowRight } from "lucide-react";
import Link from "next/link";
import MapPreview from "../../components/MapPreview";
import Modal from "../../components/Modal";
import { useRouter } from 'next/navigation';

export default function AtlasPage() {
  const seeded = (i: number, salt = 1) => Math.abs(Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453) % 1;
  const [layers, setLayers] = useState({ fra: true, boundaries: true, assets: true, satellite: false });
  const [stateFilter, setStateFilter] = useState(DEFAULT_STATE);
  const [districtFilter, setDistrictFilter] = useState(DEFAULT_DISTRICT);

  const markers = useMemo(() => {
    return [
      { lng: 88.8, lat: 21.9 },
      { lng: 88.6, lat: 21.7 },
    ];
  }, []);

  const stateCenter = STATES.find(s => s.name === stateFilter)?.center ?? [88.8, 21.9];

  const [selectedFeature, setSelectedFeature] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-green-100 text-green-900 relative overflow-hidden">
      {/* background decor */}
      {[...Array(6)].map((_, i) => {
        const r1 = seeded(i, 1);
        const r2 = seeded(i, 2);
        const top = `${(r2 * 80 + 10).toFixed(6)}%`;
        const left = `${(r1 * 90 + 5).toFixed(6)}%`;
        const size = 32 + Math.floor(r1 * 60);
        return (
          <div key={i} className="pointer-events-none absolute opacity-12" style={{ top, left }}>
            <motion.div initial={{ y: 6 }} animate={{ y: -6 }} transition={{ duration: 8 + r1 * 4, repeat: Infinity, repeatType: "reverse" }}>
              <div style={{ width: size, height: size }}>
                <MapPin size={size} className="text-green-600" />
              </div>
            </motion.div>
          </div>
        );
      })}

      <header className="relative z-10 max-w-7xl mx-auto px-6 pt-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-green-600 flex items-center justify-center border border-green-700 shadow-md">
            <Layers className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-green-900">FRA Atlas</h1>
            <p className="text-xs text-green-700">Interactive Map & Layers</p>
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
            <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-green-300 bg-white">
                <div className="w-full h-[560px] p-6 relative">
                  <div className="absolute inset-0 bg-green-800/6 pointer-events-none"></div>
                  <div className="relative z-10 h-full">
                    <MapPreview center={stateCenter as [number, number]} zoom={7.5} markers={markers} layers={layers} onFeatureClick={(info) => { setSelectedFeature(info); setModalOpen(true); }} />
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          <aside className="lg:col-span-4">
            <div className="p-6 bg-white rounded-xl shadow-md border border-green-100">
              <h4 className="font-semibold text-green-900">Layers</h4>
              <div className="mt-3 space-y-2 text-green-800">
                <label className="flex items-center gap-2"><input type="checkbox" checked={layers.fra} onChange={() => setLayers(s => ({...s, fra: !s.fra}))} /> FRA claims (IFR/CR/CFR)</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={layers.boundaries} onChange={() => setLayers(s => ({...s, boundaries: !s.boundaries}))} /> Village boundaries</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={layers.assets} onChange={() => setLayers(s => ({...s, assets: !s.assets}))} /> Asset maps</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={layers.satellite} onChange={() => setLayers(s => ({...s, satellite: !s.satellite}))} /> Satellite base</label>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold text-green-900">Filters</h4>
                <div className="mt-3">
                  <label className="block text-sm text-green-700">State</label>
                  <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className="mt-1 w-full rounded-md border border-green-100 p-2 bg-green-50">
                    {STATES.map(s => <option key={s.code} value={s.name}>{s.name}</option>)}
                  </select>
                </div>

                <div className="mt-3">
                  <label className="block text-sm text-green-700">District</label>
                  <select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)} className="mt-1 w-full rounded-md border border-green-100 p-2 bg-green-50">
                    {(STATES.find(s => s.name === stateFilter)?.districts || []).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="mt-4">
                  <button className="w-full inline-flex items-center justify-center gap-2 bg-green-700 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-600 transition-colors">Apply</button>
                </div>
              </div>
            </div>

            <div className="mt-6 p-6 bg-white rounded-xl shadow-md border border-green-100">
              <h4 className="font-semibold text-green-900">Quick Actions</h4>
              <div className="mt-3 grid grid-cols-1 gap-3">
                <Link href="/dashboard" className="inline-flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-md">Open Dashboard <ArrowRight size={14} /></Link>
                <button className="inline-flex items-center gap-2 border border-green-200 px-4 py-2 rounded-md">Export GeoJSON</button>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setSelectedFeature(null); }} title={selectedFeature ? `Feature — ${selectedFeature.layer}` : undefined}>
        {selectedFeature ? (
          <div>
            <div className="text-sm text-green-700">Properties</div>
            <div className="mt-2 text-xs text-gray-700" style={{ maxHeight: 260, overflow: 'auto' }}>
              <pre className="whitespace-pre-wrap">{JSON.stringify(selectedFeature.properties, null, 2)}</pre>
            </div>

            <div className="mt-4 flex gap-2">
              <button className="px-3 py-1 bg-green-700 text-white rounded-md text-sm">Edit</button>
              <button className="px-3 py-1 border rounded-md text-sm">Report</button>
              <button className="px-3 py-1 border rounded-md text-sm" onClick={() => { /* toggled verify */ }}>Verify</button>
              <button className="ml-auto px-3 py-1 text-sm text-green-700" onClick={() => { setModalOpen(false); router.push(`/atlas/${encodeURIComponent(selectedFeature.properties?.id ?? 'unknown')}`); }}>Open detail</button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
