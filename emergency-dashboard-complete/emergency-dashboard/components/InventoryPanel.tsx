import React, { useState } from 'react';
import { ResourceUnit, ResourceStatus, ResourceType } from '../types';

interface InventoryPanelProps {
  resources: ResourceUnit[];
}

export const InventoryPanel: React.FC<InventoryPanelProps> = ({ resources }) => {
  const [filter, setFilter] = useState<ResourceStatus | 'All'>('All');
  const filtered = filter === 'All' ? resources : resources.filter(r => r.status === filter);
  
  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-slate-900">Resource Inventory</h2>
          <div className="flex gap-2">
            {(['All', ...Object.values(ResourceStatus)] as const).map(status => (
              <button key={status} onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === status ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {status}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(resource => (
            <div key={resource.id} className="p-4 border-2 border-slate-200 rounded-xl hover:border-blue-300 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{resource.type === ResourceType.AMBULANCE ? '🚑' : resource.type === ResourceType.MEDICAL_TEAM ? '🏥' : resource.type === ResourceType.RESCUE_UNIT ? '🚒' : '📦'}</span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${resource.status === ResourceStatus.AVAILABLE ? 'bg-green-100 text-green-800' : resource.status === ResourceStatus.IN_USE ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-800'}`}>
                  {resource.status}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 mb-1">{resource.name}</h3>
              <p className="text-sm text-slate-600">{resource.type}</p>
              <div className="mt-3 text-xs text-slate-500">Qty: {resource.quantity}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};