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
    <div className="h-full flex flex-col bg-transparent">
      <div className="p-4 border-b border-white/5">
        <h2 className="text-xl font-black text-white">Active Incidents</h2>
        <p className="text-xs text-slate-400 mt-1">{pending.length} pending dispatch</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {pending.map(req => (
          <div key={req.id} onClick={() => onSelect(req)}
            className={`group p-4 rounded-xl border transition-all duration-300 cursor-pointer relative overflow-hidden ${selectedRequestId === req.id ? 'border-blue-500/50 bg-blue-500/10 shadow-[0_0_20px_-5px_rgba(59,130,246,0.2)]' : 'border-white/5 bg-slate-900/40 hover:bg-slate-800/60 hover:border-white/10 hover:scale-[1.01] hover:shadow-lg'}`}>
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${req.severity === Severity.CRITICAL ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]' : req.severity === Severity.HIGH ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.6)]' : 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.6)]'}`} />
            <div className="flex items-start justify-between mb-2 pl-2">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${req.severity === Severity.CRITICAL ? 'bg-red-500 animate-pulse' : req.severity === Severity.HIGH ? 'bg-orange-500' : 'bg-yellow-500'}`} />
                <span className={`text-[10px] font-black uppercase tracking-wider ${req.severity === Severity.CRITICAL ? 'text-red-400' : req.severity === Severity.HIGH ? 'text-orange-400' : 'text-yellow-400'}`}>
                  {req.severity} Priority
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-600">#{req.id}</span>
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