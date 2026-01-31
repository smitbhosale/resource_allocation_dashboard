import React from 'react';
import { EmergencyRequest, ResourceUnit, Severity } from '../types';
import { Zap, Clock } from 'lucide-react';

interface EmergencyPanelProps {
  requests: EmergencyRequest[];
  resources: ResourceUnit[];
  onSelect: (req: EmergencyRequest) => void;
  selectedRequestId?: string;
  onAutoAllocate: (id: string) => void;
}

export const EmergencyPanel: React.FC<EmergencyPanelProps> = ({ requests, onSelect, selectedRequestId, onAutoAllocate }) => {
  const pending = requests.filter(r => r.status === 'Pending');
  
  return (
    <div className="h-full flex flex-col bg-slate-950">
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-xl font-black text-white">Active Incidents</h2>
        <p className="text-xs text-slate-400 mt-1">{pending.length} pending dispatch</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {pending.map(req => (
          <div key={req.id} onClick={() => onSelect(req)}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedRequestId === req.id ? 'border-blue-500 bg-blue-950/30' : 'border-slate-800 bg-slate-900 hover:border-slate-700'}`}>
            <div className="flex items-start justify-between mb-2">
              <span className={`px-2 py-1 rounded text-xs font-black ${req.severity === Severity.CRITICAL ? 'bg-red-600' : req.severity === Severity.HIGH ? 'bg-orange-600' : 'bg-yellow-600'}`}>
                {req.severity}
              </span>
              <span className="text-xs text-slate-500">#{req.id}</span>
            </div>
            <h3 className="font-bold text-white mb-1">{req.disasterType}</h3>
            <p className="text-xs text-slate-400 mb-3">{req.description}</p>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-slate-500">
                <Clock className="w-3 h-3" />
                {new Date(req.timestamp).toLocaleTimeString()}
              </div>
              {req.status === 'Pending' && (
                <button onClick={(e) => { e.stopPropagation(); onAutoAllocate(req.id); }}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded text-white font-bold">
                  <Zap className="w-3 h-3" />
                  Auto
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};