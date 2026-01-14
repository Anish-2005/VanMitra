import React from "react";
import GlassCard from "@/components/ui/GlassCard";
import { Server } from "lucide-react";

interface SystemStatusSectionProps {
  isLight: boolean;
}

const SystemStatusSection: React.FC<SystemStatusSectionProps> = ({ isLight }) => (
  <GlassCard className={`p-6 ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
    <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
      <Server className="h-5 w-5" />
      System Status
    </h3>
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className={`text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>API Services</span>
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${isLight ? 'bg-green-600' : 'bg-green-500'}`}></div>
          <span className={`text-xs ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>Online</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>Database</span>
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${isLight ? 'bg-green-600' : 'bg-green-500'}`}></div>
          <span className={`text-xs ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>Healthy</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>OCR Engine</span>
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${isLight ? 'bg-green-600' : 'bg-green-500'}`}></div>
          <span className={`text-xs ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>Active</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>Map Services</span>
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${isLight ? 'bg-green-500' : 'bg-green-500'}`}></div>
          <span className={`text-xs ${isLight ? 'text-green-300' : 'text-green-200'}`}>Active</span>
        </div>
      </div>
    </div>
    <div className={`mt-4 pt-4 border-t ${isLight ? 'border-emerald-200' : 'border-white/10'}`}>
      <div className={`text-xs ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>
        Last maintenance: 2 hours ago
      </div>
    </div>
  </GlassCard>
);

export default SystemStatusSection;
