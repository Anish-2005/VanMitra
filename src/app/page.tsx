"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
// Framer-motion's JSX generics sometimes conflict with the project's TS setup.
// Create lightweight aliases cast to any so we can use className/onClick without type errors.
const MDiv: any = motion.div;
const MBackdrop: any = motion.div;
const MAside: any = motion.aside;
import DecorativeBackground from "@/components/DecorativeBackground";
import { 
  ArrowRight, Leaf, MapPin, Server, Database, Layers, 
  Cloud, Cpu, BookOpen, Clock, Check, Users, 
  Shield, BarChart3, Target, Satellite, Map, Menu, X 
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";

export default function Home() {
  // deterministic pseudo-random generator based on index + salt
  const seeded = (i: number, salt = 1) => {
    // produces a value in [0, 1) deterministically for a given i and salt
    return Math.abs(Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453) % 1;
  };

  const [mobileOpen, setMobileOpen] = useState(false);

  const [loginOpen, setLoginOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { user } = useAuth();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoginOpen(false);
      setError("");
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setLoginOpen(false);
      setError("");
    } catch (err) {
      setError("Google sign-in failed");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-green-100 text-green-900 relative overflow-hidden">
      <DecorativeBackground count={8} />

      {/* Floating leaves */}
      {[...Array(8)].map((_, i) => {
        const r1 = seeded(i, 1); // used for left / duration
        const r2 = seeded(i, 2); // used for top
        const duration = 5 + r1 * 5; // deterministic duration in [5,10)
        const top = `${(r2 * 80 + 10).toFixed(6)}%`; // 10% - 90%
        const left = `${(r1 * 90 + 5).toFixed(6)}%`; // 5% - 95%

        return (
          <motion.div
            key={i}
            animate={{
              y: [0, -20, 0],
              x: [0, 15, 0],
              rotate: [0, 10, 0],
            }}
            transition={{
              duration,
              repeat: Infinity,
            }}
            style={{
              position: "absolute",
              top,
              left,
            }}
            aria-hidden
          >
            <div className="absolute text-green-500 opacity-40">
              <Leaf size={24} />
            </div>
          </motion.div>
        );
      })}

      <header className="relative z-10 max-w-7xl mx-auto px-6 pt-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-green-600 flex items-center justify-center border border-green-700 shadow-md">
            <Leaf className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-green-900">VanMitra</h1>
            <p className="text-xs text-green-700">Forest Rights & Asset Mapping Platform</p>
          </div>
        </div>
        {/* desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/atlas" className="text-sm text-green-800 font-medium hover:text-green-600 transition-colors">Atlas</Link>
          <Link href="/dss" className="text-sm text-green-800 font-medium hover:text-green-600 transition-colors">DSS</Link>
          <Link href="/public" className="text-sm text-green-800 font-medium hover:text-green-600 transition-colors">Public Data</Link>
          <a className="text-sm text-green-800 font-medium hover:text-green-600 transition-colors" href="#tech">Technology</a>
          <a className="text-sm text-green-800 font-medium hover:text-green-600 transition-colors" href="#roadmap">Roadmap</a>
          <Link href="/dashboard" className="text-sm text-green-800 font-medium hover:text-green-600 transition-colors">Dashboard</Link>
          {user ? (
            <button onClick={handleLogout} className="ml-4 inline-flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-600 transition-colors">
              Sign out
            </button>
          ) : (
            <button onClick={() => setLoginOpen(true)} className="ml-4 inline-flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-600 transition-colors">
              Sign in
            </button>
          )}
        </nav>

        {/* mobile nav toggle */}
        <div className="md:hidden">
          <button onClick={() => setMobileOpen((s) => !s)} aria-label="Toggle menu" className="p-2 rounded-md bg-white/10">
            {mobileOpen ? <X className="text-green-800" /> : <Menu className="text-green-800" />}
          </button>
        </div>
      </header>

      {/* Mobile menu panel with animation */}
      <AnimatePresence>
        {mobileOpen && (
          <MDiv className="md:hidden fixed inset-0 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* backdrop */}
            <MBackdrop className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />

            {/* sliding panel */}
            <MAside
              className="absolute top-0 right-0 w-11/12 max-w-sm bg-white h-full shadow-xl p-6"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-md bg-green-600 flex items-center justify-center"><Leaf className="text-white" /></div>
                  <div>
                    <div className="font-semibold text-green-900">VanMitra</div>
                    <div className="text-xs text-green-700">Forest Rights Platform</div>
                  </div>
                </div>
                <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="p-2 rounded-md"><X /></button>
              </div>

              <nav className="flex flex-col gap-4 text-green-800">
                <Link href="/atlas" onClick={() => setMobileOpen(false)} className="font-medium">Atlas</Link>
                <Link href="/dss" onClick={() => setMobileOpen(false)} className="font-medium">DSS</Link>
                <Link href="/public" onClick={() => setMobileOpen(false)} className="font-medium">Public Data</Link>
                <a href="#tech" onClick={() => setMobileOpen(false)} className="font-medium">Technology</a>
                <a href="#roadmap" onClick={() => setMobileOpen(false)} className="font-medium">Roadmap</a>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="font-medium">Dashboard</Link>
                <div className="mt-4">
                  {user ? (
                    <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="w-full inline-flex items-center justify-center gap-2 bg-green-700 text-white px-4 py-2 rounded-md">Sign out</button>
                  ) : (
                    <button onClick={() => { setLoginOpen(true); setMobileOpen(false); }} className="w-full inline-flex items-center justify-center gap-2 bg-green-700 text-white px-4 py-2 rounded-md">Sign in</button>
                  )}
                </div>
              </nav>
            </MAside>
          </MDiv>
        )}
      </AnimatePresence>

      {/* Login modal */}
      <AnimatePresence>
        {loginOpen && (
          <MDiv className="fixed inset-0 z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <MBackdrop className="absolute inset-0 bg-black/50" onClick={() => setLoginOpen(false)} />
            <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-green-900 mb-4">Sign In</h3>
              {error && <p className="text-red-600 mb-4">{error}</p>}
              
              {/* Google Sign In Button */}
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-md hover:bg-gray-50 transition-colors mb-4"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
              
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <button
                  onClick={handleLogin}
                  className="w-full bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-600"
                >
                  Sign In
                </button>
              </div>
            </div>
          </MDiv>
        )}
      </AnimatePresence>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <section className="lg:col-span-7">
            <motion.div initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}>
              <h2 className="text-4xl md:text-5xl font-extrabold leading-tight text-green-900">
                Empowering Tribal Communities Through <span className="text-green-600">Technology & Data</span>
              </h2>
            </motion.div>

            <div className="mt-6 max-w-2xl">
              <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.08, duration: 0.6 }}>
                <p className="text-green-800 text-lg">
                  A comprehensive WebGIS platform that digitizes Forest Rights Act records, maps community assets using satellite imagery and AI, 
                  and provides decision support for targeted rural development through scheme integration.
                </p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <section className="mt-8 flex flex-wrap gap-4">
                <a href="#atlas" className="inline-flex items-center gap-2 bg-green-700 text-white px-5 py-3 rounded-lg shadow-md hover:bg-green-600 transition-colors">
                  Explore Atlas <ArrowRight size={16} />
                </a>
                <a href="#demo" className="inline-flex items-center gap-2 border border-green-600 text-green-700 px-4 py-3 rounded-lg hover:bg-green-50 transition">
                  Request Demo
                </a>
                <a href="#dss" className="inline-flex items-center gap-2 border border-green-600 text-green-700 px-4 py-3 rounded-lg hover:bg-green-50 transition">
                  DSS Features
                </a>
              </section>
            </motion.div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-xl shadow-md border border-green-100">
                <h4 className="text-sm font-semibold text-green-900 flex items-center gap-2"><MapPin size={16} className="text-green-600"/> Claims processed</h4>
                <div className="text-2xl font-bold text-green-800 mt-2">1,240</div>
                <div className="text-xs text-green-600 mt-1">legacy + recent uploads</div>
              </div>
              <div className="p-4 bg-white rounded-xl shadow-md border border-green-100">
                <h4 className="text-sm font-semibold text-green-900 flex items-center gap-2"><Database size={16} className="text-green-600"/> Grants issued</h4>
                <div className="text-2xl font-bold text-green-800 mt-2">380</div>
                <div className="text-xs text-green-600 mt-1">verified & geo-referenced</div>
              </div>
              <div className="p-4 bg-white rounded-xl shadow-md border border-green-100">
                <h4 className="text-sm font-semibold text-green-900 flex items-center gap-2"><Layers size={16} className="text-green-600"/> AI assets</h4>
                <div className="text-2xl font-bold text-green-800 mt-2">4,120</div>
                <div className="text-xs text-green-600 mt-1">ponds, farms, homesteads</div>
              </div>
            </div>

            <section id="problem" className="mt-12 p-6 bg-yellow-50 rounded-xl border border-yellow-200">
              <h3 className="text-xl font-semibold text-green-900 flex items-center gap-2"><Shield size={20} className="text-amber-600" /> Problem Background</h3>
              <p className="mt-4 text-green-800">
                The Forest Rights Act (FRA), 2006 recognizes the rights of forest-dwelling communities over land and forest resources. 
                However, significant challenges persist with legacy records being scattered, non-digitized, and difficult to verify, 
                lacking centralized visual repositories and integration with satellite-based asset mapping.
              </p>
            </section>

            <section id="objectives" className="mt-8">
              <h3 className="text-xl font-semibold text-green-900 flex items-center gap-2"><Target size={20} className="text-green-600" /> What We Do</h3>
              <ul className="mt-4 space-y-3 text-green-800">
                <li className="flex items-start gap-2"><div className="h-2 w-2 rounded-full bg-green-600 mt-2 flex-shrink-0"></div>Digitize and standardize legacy FRA data and integrate shapefiles</li>
                <li className="flex items-start gap-2"><div className="h-2 w-2 rounded-full bg-green-600 mt-2 flex-shrink-0"></div>Build VanMitra using AI + satellite imagery for potential and granted areas</li>
                <li className="flex items-start gap-2"><div className="h-2 w-2 rounded-full bg-green-600 mt-2 flex-shrink-0"></div>Provide web-based GIS tools to visualise and manage spatial & socio-economic data</li>
                <li className="flex items-start gap-2"><div className="h-2 w-2 rounded-full bg-green-600 mt-2 flex-shrink-0"></div>Map capital and social assets with remote sensing & ML and enable human-in-loop QA</li>
                <li className="flex items-start gap-2"><div className="h-2 w-2 rounded-full bg-green-600 mt-2 flex-shrink-0"></div>Deliver a DSS that layers CSS schemes to prioritise targeted interventions</li>
              </ul>
            </section>
          </section>

          <aside className="lg:col-span-5">
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <section className="rounded-2xl overflow-hidden shadow-2xl border border-green-300 bg-gradient-to-br from-green-600 to-emerald-700">
                <div className="w-full h-[420px] flex flex-col justify-end p-6 relative">
                  <div className="absolute inset-0 bg-green-800/20"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-green-100">Pilot: Sundarbans Block</div>
                        <div className="text-2xl font-semibold text-white">1,240 claims • 380 granted</div>
                      </div>
                      <div className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-md backdrop-blur-sm">
                        <MapPin className="text-white" />
                        <span className="text-sm text-white">Raster + Vector</span>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-3">
                      <div className="bg-white/20 rounded-md p-3 text-sm text-white border border-white/10 backdrop-blur-sm">
                        AI-derived ponds: <strong className="font-semibold">412</strong> • Cropland area: <strong className="font-semibold">3,120 ha</strong>
                      </div>
                      <div className="bg-white/10 rounded-md p-3 text-sm text-white border border-white/5 backdrop-blur-sm">
                        Water index: <strong className="font-semibold text-amber-300">Low</strong> • Vulnerability score: <strong className="font-semibold text-red-300">High</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </motion.div>

            <div className="mt-6 p-6 bg-white rounded-lg shadow-md border border-green-100">
              <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.08 }}>
                <h4 className="font-semibold flex items-center gap-2 text-green-900"><Satellite size={16} className="text-blue-500" /> AI & Remote Sensing</h4>
                <p className="text-green-800 mt-2">Semantic segmentation (U-Net/DeepLab), NDVI/NDWI indices, STAC-managed imagery, and active learning to refine asset detection.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">Computer Vision</span>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Satellite Imagery</span>
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">Land Classification</span>
                </div>
              </motion.div>
            </div>

            <motion.div 
              initial={{ y: 8, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ delay: 0.16 }}
            >
              <div className="mt-4 p-6 bg-white rounded-lg shadow-md border border-green-100">
                <h4 className="font-semibold flex items-center gap-2 text-green-900"><Server size={16} className="text-indigo-600" /> Backend & Data Infrastructure</h4>
                <p className="text-green-800 mt-2">PostGIS for spatial joins, STAC + Titiler for imagery, GeoServer or vector-tile pipeline for map serving, and FastAPI for DSS microservices.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full">PostGIS</span>
                  <span className="text-xs px-2 py-1 bg-teal-100 text-teal-800 rounded-full">STAC</span>
                  <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full">FastAPI</span>
                </div>
              </div>
            </motion.div>
          </aside>
        </div>

        <section id="tech" className="mt-16">
          <h3 className="text-2xl font-semibold text-green-900 flex items-center gap-2"><Cpu size={24} className="text-green-600" /> What We Provide</h3>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-xl shadow-md border border-green-100">
              <div className="flex items-center gap-3 text-green-900"><Database className="text-green-600" /> <span className="font-semibold">Storage & Database</span></div>
              <div className="text-green-800 mt-2">PostgreSQL + PostGIS, S3/Blob storage for COGs, metadata in Parquet/GeoParquet.</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">PostGIS</span>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">AWS S3</span>
                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">GeoParquet</span>
              </div>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-md border border-green-100">
              <div className="flex items-center gap-3 text-green-900"><Cloud className="text-blue-500" /> <span className="font-semibold">Imagery & STAC</span></div>
              <div className="text-green-800 mt-2">STAC catalog, Titiler for dynamic tiles, use Sentinel/Resourcesat/Planet depending on budget.</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">STAC</span>
                <span className="text-xs px-2 py-1 bg-teal-100 text-teal-800 rounded-full">Titiler</span>
                <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full">Sentinel-2</span>
              </div>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-md border border-green-100">
              <div className="flex items-center gap-3 text-green-900"><BookOpen className="text-amber-600" /> <span className="font-semibold">DSS & Rules Engine</span></div>
              <div className="text-green-800 mt-2">Rule engine + ML scoring (XGBoost) with SHAP explanations for prioritisation.</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full">XGBoost</span>
                <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">SHAP</span>
                <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full">Rule Engine</span>
              </div>
            </div>
          </div>
        </section>

        <section id="roadmap" className="mt-16">
          <h3 className="text-2xl font-semibold text-green-900 flex items-center gap-2"><BarChart3 size={24} className="text-green-600" /> Implementation Roadmap</h3>
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-white rounded-xl shadow-md border border-green-100 flex items-start gap-4">
              <div className="p-2 bg-green-600 text-white rounded-full flex-shrink-0"><Clock size={18} /></div>
              <div>
                <div className="font-semibold text-green-900">Phase 1 — Digitize Archive (6–8 weeks)</div>
                <div className="text-green-800 mt-1">OCR, NER extraction, human review flow, PostGIS ingestion with data validation and standardization.</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">OCR</span>
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">NER</span>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Data Validation</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl shadow-md border border-green-100 flex items-start gap-4">
              <div className="p-2 bg-green-600 text-white rounded-full flex-shrink-0"><Map size={18} /></div>
              <div>
                <div className="font-semibold text-green-900">Phase 2 — VanMitra MVP (4–6 weeks)</div>
                <div className="text-green-800 mt-1">Vector tiles, STAC layers, filters and progress dashboards with WebGIS integration.</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="text-xs px-2 py-1 bg-teal-100 text-teal-800 rounded-full">Vector Tiles</span>
                  <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full">WebGIS</span>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">Dashboard</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl shadow-md border border-green-100 flex items-start gap-4">
              <div className="p-2 bg-green-600 text-white rounded-full flex-shrink-0"><Check size={18} /></div>
              <div>
                <div className="font-semibold text-green-900">Phase 3 — AI Asset Mapping & DSS (8–12 weeks)</div>
                <div className="text-green-800 mt-1">Train segmentation models, serve predictions, build rules + ML prioritiser with explainable AI.</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">ML Models</span>
                  <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">DSS</span>
                  <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full">Explainable AI</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="dss" className="mt-16 bg-green-100 p-8 rounded-xl border border-green-200">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-2xl font-semibold text-green-900 flex items-center gap-2"><Target size={24} className="text-green-600" /> Decision Support System</h3>
              <p className="text-green-800 mt-2">
                A rules + ML engine to layer CSS schemes and prioritize interventions like borewells, livelihoods, 
                and restoration actions with explainability for officers. Integrates with PM-KISAN, Jal Jeevan Mission, 
                MGNREGA, and DAJGUA schemes for targeted development.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 bg-green-200 text-green-800 rounded-full">Scheme Integration</span>
                <span className="text-xs px-2 py-1 bg-blue-200 text-blue-800 rounded-full">Priority Ranking</span>
                <span className="text-xs px-2 py-1 bg-purple-200 text-purple-800 rounded-full">Explainable AI</span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <a href="#recommend" className="inline-flex items-center gap-2 bg-green-700 text-white px-5 py-3 rounded-lg shadow-md hover:bg-green-600 transition-colors">
                See Recommendations <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </section>

        <section id="users" className="mt-16">
          <h3 className="text-2xl font-semibold text-green-900 flex items-center gap-2"><Users size={24} className="text-green-600" /> For Official Usage For</h3>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-xl shadow-md border border-green-100 text-center">
              <Users className="mx-auto text-green-600" size={32} />
              <h4 className="font-semibold text-green-900 mt-2">Ministry of Tribal Affairs</h4>
              <p className="text-green-800 mt-1 text-sm">Policy monitoring and evaluation</p>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-md border border-green-100 text-center">
              <MapPin className="mx-auto text-green-600" size={32} />
              <h4 className="font-semibold text-green-900 mt-2">District Authorities</h4>
              <p className="text-green-800 mt-1 text-sm">Local implementation and management</p>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-md border border-green-100 text-center">
              <BarChart3 className="mx-auto text-green-600" size={32} />
              <h4 className="font-semibold text-green-900 mt-2">Planning Departments</h4>
              <p className="text-green-800 mt-1 text-sm">Development planning and resource allocation</p>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-md border border-green-100 text-center">
              <Shield className="mx-auto text-green-600" size={32} />
              <h4 className="font-semibold text-green-900 mt-2">NGOs & Communities</h4>
              <p className="text-green-800 mt-1 text-sm">Advocacy and community engagement</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-8 mt-12 border-t border-green-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-green-600 flex items-center justify-center border border-green-700">
              <Leaf className="text-white" size={16} />
            </div>
            <div className="text-sm text-green-700">© {new Date().getFullYear()} VanMitra — For tribal land rights</div>
          </div>
          <div className="flex items-center gap-4">
            <a className="text-green-700 hover:text-green-600 transition-colors text-sm" href="#privacy">Privacy</a>
            <a className="text-green-700 hover:text-green-600 transition-colors text-sm" href="#terms">Terms</a>
            <a className="text-green-700 hover:text-green-600 transition-colors text-sm" href="#contact">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

