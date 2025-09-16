"use client";

import React, { useEffect, useState } from "react";
import { Users} from "lucide-react";
import DecorativeBackground from "@/components/ui/DecorativeBackground";
import Link from "next/link";
import MapPreview from "../../components/MapPreview";

export default function PublicPage() {
  const [boundarySelection, setBoundarySelection] = useState<"none"|"state"|"district"|"tehsil">("none");
  const layersBoundaries = (() => {
    switch (boundarySelection) {
      case 'state': return 'state';
      case 'district': return ['state','district'];
      case 'tehsil': return ['state','district','tehsil'];
      default: return false;
    }
  })();

  // dynamic claims stats
  const [claimsData, setClaimsData] = useState<any | null>(null);
  const [claimsLoading, setClaimsLoading] = useState(false);
  const [claimsError, setClaimsError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchClaims = async () => {
      setClaimsLoading(true);
      setClaimsError(null);
      try {
  const res = await fetch('/api/claims?status=all');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (mounted) setClaimsData(json);
      } catch (err: any) {
        if (mounted) setClaimsError(err?.message || 'Failed to load claims');
      } finally {
        if (mounted) setClaimsLoading(false);
      }
    };
    fetchClaims();
    return () => { mounted = false; };
  }, []);

  const totalClaims = claimsData?.features?.length ?? 0;
  const grantedCount = claimsData?.features?.filter((f: any) => f?.properties?.status === 'granted').length ?? 0;
  const uniqueVillages = claimsData?.features ? new Set(claimsData.features.map((f: any) => f?.properties?.village).filter(Boolean)).size : 0;
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
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-green-700">Preview</div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-green-700">Boundaries</label>
                <select
                  value={boundarySelection}
                  onChange={(e) => setBoundarySelection(e.target.value as any)}
                  className="rounded border border-green-200 bg-white px-2 py-1 text-green-800"
                >
                  <option value="none">None</option>
                  <option value="state">State</option>
                  <option value="district">District (state + district)</option>
                  <option value="tehsil">Tehsil (state + district + tehsil)</option>
                </select>
              </div>
            </div>

            <div className="mt-2 h-[520px]">
              <MapPreview layers={{ boundaries: layersBoundaries }} />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-xl shadow-md border border-green-100 text-center">
              <div className="text-sm text-green-700">Claims processed</div>
              <div className="text-2xl font-bold text-green-800">
                {claimsLoading ? 'Loading…' : (claimsError ? '—' : totalClaims.toLocaleString())}
              </div>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-md border border-green-100 text-center">
              <div className="text-sm text-green-700">Granted</div>
              <div className="text-2xl font-bold text-green-800">
                {claimsLoading ? 'Loading…' : (claimsError ? '—' : grantedCount.toLocaleString())}
              </div>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-md border border-green-100 text-center">
              <div className="text-sm text-green-700">Villages covered</div>
              <div className="text-2xl font-bold text-green-800">
                {claimsLoading ? 'Loading…' : (claimsError ? '—' : uniqueVillages.toLocaleString())}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
