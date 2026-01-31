import React, { useMemo } from 'react';
import { EmergencyRequest, ResourceUnit } from '../types';
import { getBestResource } from '../services/allocationEngine';
import { X, Truck, TrendingUp } from 'lucide-react';

interface AllocationModalProps {
  request: EmergencyRequest;
  resources: ResourceUnit[];
  onClose: () => void;
  onAllocate: (requestId: string, resourceId: string) => void;
}

export const AllocationModal: React.FC<AllocationModalProps> = ({ request, resources, onClose, onAllocate }) => {
  const best = useMemo(() => getBestResource(request, resources), [request, resources]);
  const available = resources.filter(r => r.type === request.resourceNeeded && r.status === 'Available');
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-700">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-2xl font-black text-white">Allocate Resource</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-all">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="p-4 bg-slate-800 rounded-xl">
            <h3 className="font-bold text-white mb-2">Request Details</h3>
            <div className="space-y-1 text-sm">
              <p className="text-slate-300"><span className="text-slate-500">Type:</span> {request.disasterType}</p>
              <p className="text-slate-300"><span className="text-slate-500">Severity:</span> {request.severity}</p>
              <p className="text-slate-300"><span className="text-slate-500">Needed:</span> {request.resourceNeeded}</p>
            </div>
          </div>
          
          {best && (
            <div className="p-4 bg-blue-950/30 border-2 border-blue-600 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <span className="font-bold text-blue-400">AI RECOMMENDED</span>
              </div>
              <button onClick={() => onAllocate(request.id, best.resourceId)}
                className="w-full p-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold transition-all flex items-center justify-between">
                <span>{resources.find(r => r.id === best.resourceId)?.name}</span>
                <span className="text-sm">{best.distance}km • Score: {best.score.toFixed(0)}</span>
              </button>
            </div>
          )}
          
          <div className="space-y-2">
            <h3 className="font-bold text-white">All Available ({available.length})</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {available.map(res => (
                <button key={res.id} onClick={() => onAllocate(request.id, res.id)}
                  className="w-full p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-left transition-all flex items-center justify-between">
                  <span className="text-white font-medium">{res.name}</span>
                  <Truck className="w-5 h-5 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};