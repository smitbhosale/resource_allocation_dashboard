import React from 'react';
import { EmergencyRequest, ResourceUnit } from '../types';
import { AlertCircle, Package, Clock, TrendingUp } from 'lucide-react';

interface SummaryStatsProps {
  requests: EmergencyRequest[];
  resources: ResourceUnit[];
}

export const SummaryStats: React.FC<SummaryStatsProps> = ({ requests, resources }) => {
  const pending = requests.filter(r => r.status === 'Pending').length;
  const available = resources.filter(r => r.status === 'Available').length;
  const resolved = requests.filter(r => r.status === 'Resolved').length;
  const avgTime = resolved > 0 ? '4.2m' : 'N/A';
  
  return (
    <div className="flex items-center gap-4 px-6 py-4">
      <div className="flex items-center gap-3 px-4 py-2 bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl group hover:bg-slate-800/50 transition-colors">
        <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center shadow-[0_0_15px_-3px_rgba(239,68,68,0.3)] group-hover:scale-110 transition-transform">
          <AlertCircle className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <div className="text-2xl font-black text-white leading-none">{pending}</div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Pending</div>
        </div>
      </div>
      <div className="flex items-center gap-3 px-4 py-2 bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl group hover:bg-slate-800/50 transition-colors">
        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)] group-hover:scale-110 transition-transform">
          <Package className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <div className="text-2xl font-black text-white leading-none">{available}</div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Available</div>
        </div>
      </div>
      <div className="flex items-center gap-3 px-4 py-2 bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl group hover:bg-slate-800/50 transition-colors">
        <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center shadow-[0_0_15px_-3px_rgba(34,197,94,0.3)] group-hover:scale-110 transition-transform">
          <TrendingUp className="w-5 h-5 text-green-500" />
        </div>
        <div>
          <div className="text-2xl font-black text-white leading-none">{resolved}</div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Resolved</div>
        </div>
      </div>
      <div className="flex items-center gap-3 px-4 py-2 bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl group hover:bg-slate-800/50 transition-colors">
        <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center shadow-[0_0_15px_-3px_rgba(168,85,247,0.3)] group-hover:scale-110 transition-transform">
          <Clock className="w-5 h-5 text-purple-500" />
        </div>
        <div>
          <div className="text-sm font-black text-white leading-none">{avgTime}</div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Avg Time</div>
        </div>
      </div>
    </div>
  );
};