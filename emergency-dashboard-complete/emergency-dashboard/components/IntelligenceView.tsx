import React from 'react';
import { EmergencyRequest, ResourceUnit } from '../types';
import { Brain, TrendingUp, MapPin } from 'lucide-react';

interface IntelligenceViewProps {
  requests: EmergencyRequest[];
  resources: ResourceUnit[];
}

export const IntelligenceView: React.FC<IntelligenceViewProps> = ({ requests }) => {
  const hotspots = [
    { area: 'Downtown Metro', riskLevel: 'High', count: requests.filter(r => r.status === 'Pending').length },
    { area: 'West Coastal', riskLevel: 'Medium', count: Math.floor(Math.random() * 5) },
    { area: 'Tech Corridor', riskLevel: 'Low', count: Math.floor(Math.random() * 3) }
  ];
  
  return (
    <div className="flex-1 p-6 overflow-y-auto bg-slate-950">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
            <Brain className="w-7 h-7 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">AI Intelligence</h2>
            <p className="text-sm text-slate-400">Predictive analytics and recommendations</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="flex items-center gap-2 font-bold text-white mb-4">
              <MapPin className="w-5 h-5 text-blue-400" />
              Risk Hotspots
            </h3>
            <div className="space-y-3">
              {hotspots.map(spot => (
                <div key={spot.area} className="p-4 bg-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">{spot.area}</div>
                    <div className="text-xs text-slate-400">{spot.count} active incidents</div>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${spot.riskLevel === 'High' ? 'bg-red-500/20 text-red-400' : spot.riskLevel === 'Medium' ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'}`}>
                    {spot.riskLevel}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="flex items-center gap-2 font-bold text-white mb-4">
              <TrendingUp className="w-5 h-5 text-green-400" />
              AI Recommendations
            </h3>
            <div className="space-y-3">
              <div className="p-4 bg-blue-950/30 border border-blue-800 rounded-xl">
                <p className="text-sm text-blue-300 mb-2">Deploy additional rescue units to Downtown Metro area</p>
                <span className="text-xs text-slate-500">Confidence: 87%</span>
              </div>
              <div className="p-4 bg-blue-950/30 border border-blue-800 rounded-xl">
                <p className="text-sm text-blue-300 mb-2">Preposition medical teams near West Coastal before evening rush</p>
                <span className="text-xs text-slate-500">Confidence: 92%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};