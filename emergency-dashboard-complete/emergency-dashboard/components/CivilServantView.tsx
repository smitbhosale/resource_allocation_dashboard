import React from 'react';
import { EmergencyRequest, ResourceUnit } from '../types';
import { CheckCircle, Navigation, Phone } from 'lucide-react';

interface CivilServantViewProps {
  requests: EmergencyRequest[];
  resources: ResourceUnit[];
  onResolve: (id: string) => void;
  onStatusUpdate: () => void;
}

export const CivilServantView: React.FC<CivilServantViewProps> = ({ requests, onResolve }) => {
  const myTasks = requests.filter(r => r.status === 'Allocated').slice(0, 5);
  
  return (
    <div className="flex-1 p-6 overflow-y-auto bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-black text-slate-900">My Active Tasks</h2>
          <p className="text-sm text-slate-500">{myTasks.length} assignments</p>
        </div>
        
        <div className="space-y-4">
          {myTasks.map(task => (
            <div key={task.id} className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900">{task.disasterType}</h3>
                  <p className="text-sm text-slate-500">#{task.id}</p>
                </div>
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-lg text-xs font-bold">IN PROGRESS</span>
              </div>
              
              <p className="text-slate-700 mb-4">{task.description}</p>
              
              <div className="flex gap-3">
                <button className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all">
                  <Navigation className="w-5 h-5" />
                  Navigate
                </button>
                <button className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl flex items-center justify-center gap-2 transition-all">
                  <Phone className="w-5 h-5" />
                  Contact HQ
                </button>
                <button onClick={() => onResolve(task.id)}
                  className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all">
                  <CheckCircle className="w-5 h-5" />
                  Resolve
                </button>
              </div>
            </div>
          ))}
          
          {myTasks.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <p className="text-lg font-bold">No active tasks</p>
              <p className="text-sm">You'll be notified when assigned</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};