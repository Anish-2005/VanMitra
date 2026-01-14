import React from "react";
import GlassCard from "@/components/ui/GlassCard";
import { Calendar } from "lucide-react";

interface RecentActivitySectionProps {
  isLight: boolean;
}

const RecentActivitySection: React.FC<RecentActivitySectionProps> = ({ isLight }) => (
  <GlassCard className={`p-6 ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
    <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
      <Calendar className="h-5 w-5" />
      Recent Activity
    </h3>
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className={`h-2 w-2 rounded-full mt-2 ${isLight ? 'bg-green-600' : 'bg-green-500'}`}></div>
        <div className="flex-1">
          <p className={`text-sm font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>New claim processed</p>
          <p className={`text-xs ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>Village: Chandrapur • 2 hours ago</p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <div className={`h-2 w-2 rounded-full mt-2 ${isLight ? 'bg-blue-600' : 'bg-blue-500'}`}></div>
        <div className="flex-1">
          <p className={`text-sm font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>Boundary survey completed</p>
          <p className={`text-xs ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>District: Raipur • 4 hours ago</p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <div className={`h-2 w-2 rounded-full mt-2 ${isLight ? 'bg-purple-600' : 'bg-purple-500'}`}></div>
        <div className="flex-1">
          <p className={`text-sm font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>Report generated</p>
          <p className={`text-xs ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>Monthly summary • 1 day ago</p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <div className={`h-2 w-2 rounded-full mt-2 ${isLight ? 'bg-orange-600' : 'bg-orange-500'}`}></div>
        <div className="flex-1">
          <p className={`text-sm font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>Officer assigned</p>
          <p className={`text-xs ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>Team Alpha • 2 days ago</p>
        </div>
      </div>
    </div>
  </GlassCard>
);

export default RecentActivitySection;
