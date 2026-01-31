import React from 'react';
import { EmergencyRequest, ResourceUnit, MapZone, UserRole, Severity } from '../types';
import { MapPin, Navigation } from 'lucide-react';

interface MapVisualizerProps {
  requests: EmergencyRequest[];
  resources: ResourceUnit[];
  zones: MapZone[];
  role: UserRole;
  selectedRequest?: EmergencyRequest;
  onMarkerClick: (id: string, type: 'req' | 'res') => void;
  onZonesChange: (zones: MapZone[]) => void;
}

export const MapVisualizer: React.FC<MapVisualizerProps> = ({ requests, resources, selectedRequest, onMarkerClick }) => {
  return (
    <div className="relative w-full h-full bg-slate-900" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h60v60H0z' fill='%230f172a'/%3E%3Cpath d='M0 0h30v30H0zm30 30h30v30H30z' fill='%231e293b' fill-opacity='.1'/%3E%3C/svg%3E")` }}>
      <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur px-4 py-2 rounded-lg border border-slate-700">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span className="text-slate-300">Critical</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div><span className="text-slate-300">High</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span className="text-slate-300">Resources</span></div>
        </div>
      </div>
      
      <div className="absolute inset-0 flex items-center justify-center p-20">
        <div className="relative w-full h-full">
          {requests.slice(0, 10).map((req, idx) => (
            <button key={req.id} onClick={() => onMarkerClick(req.id, 'req')}
              className={`absolute w-10 h-10 rounded-full flex items-center justify-center transition-all transform hover:scale-125 ${req.severity === Severity.CRITICAL ? 'bg-red-500 animate-pulse' : req.severity === Severity.HIGH ? 'bg-orange-500' : 'bg-yellow-500'} ${selectedRequest?.id === req.id ? 'ring-4 ring-white scale-125' : ''}`}
              style={{ left: `${idx * 10 + 10}%`, top: `${(idx % 3) * 30 + 20}%` }}>
              <MapPin className="w-5 h-5 text-white" />
            </button>
          ))}
          
          {resources.slice(0, 8).map((res, idx) => (
            <div key={res.id}
              className="absolute w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center"
              style={{ left: `${idx * 12 + 5}%`, top: `${(idx % 2) * 40 + 30}%` }}>
              <Navigation className="w-4 h-4 text-white" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};