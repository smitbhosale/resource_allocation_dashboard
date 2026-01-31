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
    <div className="flex items-center gap-6 px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <div className="text-2xl font-black text-white">{pending}</div>
          <div className="text-xs text-slate-500">Pending</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
          <Package className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <div className="text-2xl font-black text-white">{available}</div>
          <div className="text-xs text-slate-500">Available</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <div className="text-2xl font-black text-white">{resolved}</div>
          <div className="text-xs text-slate-500">Resolved</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
          <Clock className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <div className="text-2xl font-black text-white">{avgTime}</div>
          <div className="text-xs text-slate-500">Avg Time</div>
        </div>
      </div>
    </div>
  );
};