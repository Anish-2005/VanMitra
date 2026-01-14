import React from "react";
import GlassCard from "@/components/ui/GlassCard";
import { Activity, FileText, MapPin, Download, Users } from "lucide-react";

interface QuickActionsSectionProps {
  isLight: boolean;
}

const QuickActionsSection: React.FC<QuickActionsSectionProps> = ({ isLight }) => (
  <GlassCard className={`p-6 ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
    <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
      <Activity className="h-5 w-5" />
      Quick Actions
    </h3>
    <div className="space-y-3">
      <button className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${isLight ? 'bg-emerald-50 border border-emerald-200 hover:bg-emerald-100' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}>
        <FileText className={`h-5 w-5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
        <div>
          <div className={`font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>New FRA Claim</div>
          <div className={`text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>Process a new forest rights claim</div>
        </div>
      </button>
      <button className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${isLight ? 'bg-emerald-50 border border-emerald-200 hover:bg-emerald-100' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}>
        <MapPin className={`h-5 w-5 ${isLight ? 'text-blue-600' : 'text-blue-400'}`} />
        <div>
          <div className={`font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>Map Analysis</div>
          <div className={`text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>Analyze village boundaries</div>
        </div>
      </button>
      <button className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${isLight ? 'bg-emerald-50 border border-emerald-200 hover:bg-emerald-100' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}>
        <Download className={`h-5 w-5 ${isLight ? 'text-purple-600' : 'text-purple-400'}`} />
        <div>
          <div className={`font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>Export Report</div>
          <div className={`text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>Generate comprehensive report</div>
        </div>
      </button>
      <button className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${isLight ? 'bg-emerald-50 border border-emerald-200 hover:bg-emerald-100' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}>
        <Users className={`h-5 w-5 ${isLight ? 'text-orange-600' : 'text-orange-400'}`} />
        <div>
          <div className={`font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>Team Assignment</div>
          <div className={`text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>Assign tasks to field officers</div>
        </div>
      </button>
    </div>
  </GlassCard>
);

export default QuickActionsSection;
