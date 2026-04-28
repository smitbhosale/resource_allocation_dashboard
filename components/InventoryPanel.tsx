import '../css/components/InventoryPanel.css';
import React, { useState } from 'react';
import { ResourceUnit, ResourceStatus, ResourceType } from '../types';

interface InventoryPanelProps {
  resources: ResourceUnit[];
}

export const InventoryPanel: React.FC<InventoryPanelProps> = ({ resources }) => {
  const [filter, setFilter] = useState<ResourceStatus | 'All'>('All');
  const filtered = filter === 'All' ? resources : resources.filter(r => r.status === filter);
  
  return (
    <div className="inventorypanel-element-1">
      <div className="inventorypanel-element-2">
        <div className="inventorypanel-element-3">
          <h2 className="inventorypanel-element-4">Resource Inventory</h2>
          <div className="inventorypanel-element-5">
            {(['All', ...Object.values(ResourceStatus)] as const).map(status => (
              <button key={status} onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === status ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {status}
              </button>
            ))}
          </div>
        </div>
        <div className="inventorypanel-element-6">
          {filtered.map(resource => (
            <div key={resource.id} className="inventorypanel-element-7">
              <div className="inventorypanel-element-8">
                <span className="inventorypanel-element-9">{resource.type === ResourceType.AMBULANCE ? '🚑' : resource.type === ResourceType.MEDICAL_TEAM ? '🏥' : resource.type === ResourceType.RESCUE_UNIT ? '🚒' : '📦'}</span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${resource.status === ResourceStatus.AVAILABLE ? 'bg-green-100 text-green-800' : resource.status === ResourceStatus.IN_USE ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-800'}`}>
                  {resource.status}
                </span>
              </div>
              <h3 className="inventorypanel-element-10">{resource.name}</h3>
              <p className="inventorypanel-element-11">{resource.type}</p>
              <div className="inventorypanel-element-12">Qty: {resource.quantity}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};