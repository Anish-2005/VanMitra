"use client";

import React from "react";
import { Server, UploadCloud, Check } from "lucide-react";
import Link from "next/link";
import DecorativeBackground from "@/components/DecorativeBackground";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-green-100 text-green-900 relative overflow-hidden">
      <DecorativeBackground count={5} />
      <header className="relative z-10 max-w-7xl mx-auto px-6 pt-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-green-600 flex items-center justify-center border border-green-700 shadow-md">
            <Server className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-green-900">Admin Panel</h1>
            <p className="text-xs text-green-700">Upload & Verification Tools</p>
          </div>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-green-800 font-medium hover:text-green-600 transition-colors">Dashboard</Link>
        </nav>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <section className="lg:col-span-8">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-green-300 bg-white p-6">
              <h3 className="text-lg font-semibold text-green-900">Upload scanned FRA documents</h3>
              <div className="mt-4">
                <label className="block text-sm text-green-700">Select file</label>
                <input type="file" className="mt-2" />
                <div className="mt-4 text-sm text-green-700">Accepted: PDF, TIFF. OCR and NER will run after upload.</div>
              </div>

              <div className="mt-6">
                <button className="inline-flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-md">Upload <UploadCloud size={16} /></button>
                <button className="ml-3 inline-flex items-center gap-2 border border-green-200 px-4 py-2 rounded-md">Verify <Check size={16} /></button>
              </div>
            </div>

            <div className="mt-6 p-6 bg-white rounded-xl shadow-md border border-green-100">
              <h4 className="font-semibold text-green-900">Recent uploads</h4>
              <div className="mt-3 text-green-700">No uploads yet — after uploading, documents will appear here for verification and manual correction.</div>
            </div>
          </section>

          <aside className="lg:col-span-4">
            <div className="p-6 bg-white rounded-xl shadow-md border border-green-100">
              <h4 className="font-semibold text-green-900">Admin Actions</h4>
              <div className="mt-3 grid grid-cols-1 gap-3">
                <button className="inline-flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-md">Open Verification Queue</button>
                <button className="inline-flex items-center gap-2 border border-green-200 px-4 py-2 rounded-md">Export Audit Log</button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
    </ProtectedRoute>
  );
}
