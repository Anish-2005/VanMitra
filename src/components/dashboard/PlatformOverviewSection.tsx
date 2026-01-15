import React from "react";
import GlassCard from "@/components/ui/GlassCard";
import { motion } from "framer-motion";
import { Layers, Globe, Upload, Shield, Users, BookOpen, BarChart3, ArrowRight } from "lucide-react";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import Link from "next/link";

interface PlatformOverviewSectionProps {
  isLight: boolean;
  totalClaims: number;
  grantedCount: number;
  uniqueVillages: number;
  claimsLoading: boolean;
  claimsError: string | null;
  strongBtnClasses: Record<string, string>;
}

const PlatformOverviewSection: React.FC<PlatformOverviewSectionProps> = ({
  isLight, totalClaims, grantedCount, uniqueVillages, claimsLoading, claimsError, strongBtnClasses
}) => (
  <section className="relative mt-20">
    <div className={`absolute inset-0 rounded-3xl blur-3xl ${isLight ? 'bg-emerald-100/20' : 'bg-emerald-900/20'}`} />

    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative"
    >
      {/* Section header */}
      <div className="text-center mb-14">
        <span className={`px-3 py-1 text-xs font-medium uppercase tracking-wider rounded-full ${isLight ? 'text-emerald-700 bg-emerald-100' : 'text-emerald-300 bg-emerald-800/30'}`}>
          Features
        </span>
        <h2 className={`text-4xl md:text-5xl font-extrabold mt-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>
          Explore VanMitra Platform
        </h2>
        <p className={`mt-3 max-w-2xl mx-auto ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>
          Discover powerful tools for forest rights management and empower
          communities with data-driven insights.
        </p>
        <div className={`mt-5 h-1 w-28 mx-auto rounded-full shadow-lg ${isLight ? 'bg-gradient-to-r from-emerald-500 to-green-600' : 'bg-gradient-to-r from-emerald-400 to-green-600'}`} />
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {[
          {
            title: "Interactive Atlas",
            desc: "Map-based visualization of claims & layers",
            icon: Layers,
            color: "emerald",
            href: "/atlas",
            strong: true, // highlight
            preview: (
              <div className={`h-28 flex items-center justify-center rounded-lg ${isLight ? 'bg-emerald-100' : 'bg-emerald-500/5'}`}>
                <Globe className={`h-10 w-10 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
              </div>
            ),
          },
          {
            title: "Public Portal",
            desc: "Community transparency & FRA status",
            icon: Globe,
            color: "teal",
            href: "/public",
            strong: true, // highlight
            preview: (
              <div className={`h-28 grid grid-cols-3 text-center rounded-lg ${isLight ? 'bg-teal-100' : 'bg-teal-500/5'}`}>
                {[
                  { label: 'Claims', value: totalClaims, loading: claimsLoading, error: claimsError },
                  { label: 'Granted', value: grantedCount, loading: claimsLoading, error: claimsError },
                  { label: 'Villages', value: uniqueVillages, loading: claimsLoading, error: claimsError }
                ].map((s, si) => (
                  <div key={si}>
                    <p className={`text-lg font-bold ${isLight ? 'text-teal-700' : 'text-teal-300'}`}>
                      {s.loading ? (
                        <span className={isLight ? 'text-slate-600' : 'text-teal-300'}>Loading…</span>
                      ) : s.error ? (
                        <span className={isLight ? 'text-red-600' : 'text-red-400'}>—</span>
                      ) : (
                        <AnimatedCounter value={s.value} />
                      )}
                    </p>
                    <p className={`text-xs ${isLight ? 'text-teal-700' : 'text-teal-200'}`}>{s.label}</p>
                  </div>
                ))}
              </div>
            ),
          },

          {
            title: "OCR Processing",
            desc: "Digitize & extract data from documents",
            icon: Upload,
            color: "purple",
            href: "/ocr",
            strong: true, // highlight
            preview: (
              <div className={`h-28 border-2 border-dashed rounded-lg flex items-center justify-center ${isLight ? 'border-purple-400 bg-purple-100' : 'border-purple-400/40 bg-purple-500/5'}`}>
                <Upload className={`h-8 w-8 ${isLight ? 'text-purple-600' : 'text-purple-400'}`} />
                <span className={`text-xs ml-2 ${isLight ? 'text-purple-700' : 'text-purple-200'}`}>Drop file</span>
              </div>
            ),
          },
          {
            title: "Admin Dashboard",
            desc: "Manage claims, users & FRA documents",
            icon: Shield,
            color: "red",
            href: "/admin",
            preview: (
              <div className={`h-28 flex flex-col justify-center items-center rounded-lg ${isLight ? 'bg-red-100' : 'bg-red-500/5'}`}>
                <Users className={`h-8 w-8 mb-2 ${isLight ? 'text-red-600' : 'text-red-400'}`} />
                <span className={`text-xs ${isLight ? 'text-red-700' : 'text-red-200'}`}>Role: Super Admin</span>
              </div>
            ),
          },
          {
            title: "Decision Support",
            desc: "Smart scheme recommendations for your location",
            icon: BookOpen,
            color: "blue",
            href: "/dss",
            preview: (
              <div className={`h-28 flex flex-col justify-center items-center gap-2 rounded-lg ${isLight ? 'bg-blue-100' : 'bg-blue-500/5'}`}>
                <input
                  type="text"
                  placeholder="Latitude"
                  className={`w-32 px-2 py-1 text-xs rounded ${isLight ? 'bg-blue-50 border border-blue-300 text-blue-900' : 'bg-blue-950/20 border border-blue-400/30 text-blue-200'}`}
                  readOnly
                />
                <input
                  type="text"
                  placeholder="Longitude"
                  className={`w-32 px-2 py-1 text-xs rounded ${isLight ? 'bg-blue-50 border border-blue-300 text-blue-900' : 'bg-blue-950/20 border border-blue-400/30 text-blue-200'}`}
                  readOnly
                />
              </div>
            ),
          },
          {
            title: "Analytics Hub",
            desc: "Advanced reports & visual insights",
            icon: BarChart3,
            color: "indigo",
            href: "/analytics",
            preview: (
              <div className={`h-28 flex flex-col gap-2 justify-center px-4 rounded-lg ${isLight ? 'bg-indigo-100' : 'bg-indigo-500/5'}`}>
                <div className={`h-2 w-3/4 rounded ${isLight ? 'bg-indigo-400' : 'bg-indigo-400/60'}`}></div>
                <div className={`h-2 w-1/2 rounded ${isLight ? 'bg-indigo-400' : 'bg-indigo-400/60'}`}></div>
                <div className={`h-2 w-5/6 rounded ${isLight ? 'bg-indigo-400' : 'bg-indigo-400/60'}`}></div>
              </div>
            ),
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.03, rotateX: 2, rotateY: -2 }}
            className="transform-gpu"
          >
            <GlassCard className={`p-6 flex flex-col h-full backdrop-blur-xl border ${isLight ? 'border-slate-200 hover:shadow-xl hover:shadow-emerald-500/20' : 'border-white/10 hover:shadow-xl hover:shadow-emerald-500/20'} transition-all duration-300`}>
              {/* Card header */}
              <div className="flex items-center gap-3 mb-5">
                <div
                  className={`h-12 w-12 rounded-full flex items-center justify-center shadow-inner ${isLight ? `bg-${item.color}-100` : `bg-${item.color}-500/20`}`}
                >
                  <item.icon className={`h-6 w-6 ${isLight ? `text-${item.color}-600` : `text-${item.color}-400`}`} />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{item.title}</h3>
                  <p className={`text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>{item.desc}</p>
                </div>
              </div>

              {/* Card preview */}
              <div className="flex-1">{item.preview}</div>

              {/* Card CTA */}
              <Link
                href={item.href}
                className={`mt-6 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all
    ${item.strong
                    ? strongBtnClasses[item.color]   // ✅ solid colors now always work
                    : isLight
                      ? `bg-gradient-to-r from-${item.color}-500 to-${item.color}-600 text-white hover:shadow-lg hover:shadow-${item.color}-500/40`
                      : `bg-gradient-to-r from-${item.color}-500 to-${item.color}-600 text-white hover:shadow-lg hover:shadow-${item.color}-500/40`
                  }`}
              >
                Open {item.title}
                <ArrowRight size={14} />
              </Link>

            </GlassCard>
          </motion.div>
        ))}
      </div>

    </motion.div>
  </section>
);

export default PlatformOverviewSection;
