import '../css/components/SummaryStats.css';
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
    <div className="summarystats-element-1">
      <div className="group summarystats-element-2">
        <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center shadow-[0_0_15px_-3px_rgba(239,68,68,0.3)] group-hover:scale-110 transition-transform">
          <AlertCircle className="summarystats-element-3" />
        </div>
        <div>
          <div className="summarystats-element-4">{pending}</div>
          <div className="summarystats-element-5">Pending</div>
        </div>
      </div>
      <div className="group summarystats-element-6">
        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)] group-hover:scale-110 transition-transform">
          <Package className="summarystats-element-7" />
        </div>
        <div>
          <div className="summarystats-element-8">{available}</div>
          <div className="summarystats-element-9">Available</div>
        </div>
      </div>
      <div className="group summarystats-element-10">
        <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center shadow-[0_0_15px_-3px_rgba(34,197,94,0.3)] group-hover:scale-110 transition-transform">
          <TrendingUp className="summarystats-element-11" />
        </div>
        <div>
          <div className="summarystats-element-12">{resolved}</div>
          <div className="summarystats-element-13">Resolved</div>
        </div>
      </div>
      <div className="group summarystats-element-14">
        <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center shadow-[0_0_15px_-3px_rgba(168,85,247,0.3)] group-hover:scale-110 transition-transform">
          <Clock className="summarystats-element-15" />
        </div>
        <div>
          <div className="summarystats-element-16">{avgTime}</div>
          <div className="summarystats-element-17">Avg Time</div>
        </div>
      </div>
    </div>
  );
};