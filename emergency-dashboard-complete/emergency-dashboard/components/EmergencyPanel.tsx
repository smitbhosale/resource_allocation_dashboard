import '../css/components/EmergencyPanel.css';
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
    <div className="emergencypanel-element-1">
      <div className="emergencypanel-element-2">
        <h2 className="emergencypanel-element-3">Active Incidents</h2>
        <p className="emergencypanel-element-4">{pending.length} pending dispatch</p>
      </div>
      <div className="emergencypanel-element-5">
        {pending.map(req => (
          <div key={req.id} onClick={() => onSelect(req)}
            className={`group p-4 rounded-xl border transition-all duration-300 cursor-pointer relative overflow-hidden ${selectedRequestId === req.id ? 'border-blue-500/50 bg-blue-500/10 shadow-[0_0_20px_-5px_rgba(59,130,246,0.2)]' : 'border-white/5 bg-slate-900/40 hover:bg-slate-800/60 hover:border-white/10 hover:scale-[1.01] hover:shadow-lg'}`}>
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${req.severity === Severity.CRITICAL ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]' : req.severity === Severity.HIGH ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.6)]' : 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.6)]'}`} />
            <div className="emergencypanel-element-6">
              <div className="emergencypanel-element-7">
                <span className={`w-2 h-2 rounded-full ${req.severity === Severity.CRITICAL ? 'bg-red-500 animate-pulse' : req.severity === Severity.HIGH ? 'bg-orange-500' : 'bg-yellow-500'}`} />
                <span className={`text-[10px] font-black uppercase tracking-wider ${req.severity === Severity.CRITICAL ? 'text-red-400' : req.severity === Severity.HIGH ? 'text-orange-400' : 'text-yellow-400'}`}>
                  {req.severity} Priority
                </span>
              </div>
              <span className="emergencypanel-element-8">#{req.id}</span>
            </div>
            <h3 className="emergencypanel-element-9">{req.disasterType}</h3>
            <p className="emergencypanel-element-10">{req.description}</p>
            <div className="emergencypanel-element-11">
              <div className="emergencypanel-element-12">
                <Clock className="emergencypanel-element-13" />
                {new Date(req.timestamp).toLocaleTimeString()}
              </div>
              {req.status === 'Pending' && (
                <button onClick={(e) => { e.stopPropagation(); onAutoAllocate(req.id); }}
                  className="emergencypanel-element-14">
                  <Zap className="emergencypanel-element-15" />
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