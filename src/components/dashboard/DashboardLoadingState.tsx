import React from "react";

interface DashboardLoadingStateProps {
  isLight: boolean;
}

const DashboardLoadingState: React.FC<DashboardLoadingStateProps> = ({ isLight }) => (
  <div className="flex items-center justify-center py-20">
    <div className="text-center">
      <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${isLight ? 'border-emerald-600' : 'border-emerald-400'} mx-auto mb-4`}></div>
      <p className={isLight ? 'text-emerald-700' : 'text-emerald-200'}>Loading dashboard data...</p>
    </div>
  </div>
);

export default DashboardLoadingState;