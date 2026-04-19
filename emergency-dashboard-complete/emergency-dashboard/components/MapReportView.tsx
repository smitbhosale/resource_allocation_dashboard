import React, { useState } from 'react';
import { MapVisualizer } from './MapVisualizer';
import { ChatbotView } from './ChatbotView';
import { EmergencyRequest } from '../types';
import { MapPin, Navigation, ArrowRight, CornerDownLeft } from 'lucide-react';

interface MapReportViewProps {
  onSubmit: (data: Partial<EmergencyRequest>) => void;
}

export const MapReportView: React.FC<MapReportViewProps> = ({ onSubmit }) => {
  const [step, setStep] = useState<'map' | 'chat'>('map');
  const [tempLocation, setTempLocation] = useState<{ x?: number, y?: number, lat: number, lng: number } | null>(null);

  const handleMapClick = (coords: { x?: number, y?: number, lat: number, lng: number }) => {
    setTempLocation(coords);
  };

  const handleUseMyLocation = () => {
    // Center of map as fallback if geolocation fails
    setTempLocation({ lat: 20.5937, lng: 78.9629 });
  };

  const handleConfirmLocation = () => {
    if (tempLocation) {
      setStep('chat');
    }
  };

  // Mock data for map background
  const emptyList = React.useMemo(() => [], []);
  
  // Format coordinates for display
  const getLatLong = (loc: {lat: number, lng: number}) => {
      return `${loc.lat.toFixed(6)}, ${loc.lng.toFixed(6)}`;
  }

  return (
    <div className="flex-1 flex flex-col relative h-full bg-slate-900">
      {/* Map Layer - Always visible but dimmed when in chat */}
      <div className={`absolute inset-0 transition-all duration-500 ease-in-out ${step === 'chat' ? 'brightness-[0.2] scale-[1.02] blur-sm' : ''}`}>
        <MapVisualizer 
          requests={emptyList} 
          resources={emptyList} 
          zones={emptyList}
          role="citizen"
          onMarkerClick={() => {}}
          onZonesChange={() => {}}
          isReportingMode={step === 'map'}
          onMapClick={handleMapClick}
          tempMarker={tempLocation || undefined}
        />
      </div>

      {/* Map Overlays (Only in 'map' step) */}
      {step === 'map' && (
        <div className="absolute inset-0 pointer-events-none z-20 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start pointer-events-auto">
             <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-xl max-w-sm">
                <h2 className="text-xl font-black text-white mb-2 flex items-center gap-2">
                    <MapPin className="text-cyan-400" />
                    Report Incident
                </h2>
                <p className="text-sm text-slate-400">
                    Tap anywhere on the map to pin the location of the disaster. Locate precisely for faster response.
                </p>
             </div>
             
             <button 
                onClick={handleUseMyLocation}
                className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl shadow-lg flex items-center gap-2 font-bold transition-all"
            >
                <Navigation className="w-5 h-5" />
                Use My Location
             </button>
          </div>

          <div className="flex justify-center pointer-events-auto">
             {tempLocation && (
                 <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <button 
                        onClick={handleConfirmLocation}
                        className="group bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white px-8 py-4 rounded-2xl shadow-[0_0_30px_-5px_rgba(239,68,68,0.5)] flex items-center gap-3 font-black text-lg transition-all hover:scale-105"
                    >
                        Report Here
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </button>
                 </div>
             )}
          </div>
        </div>
      )}

      {/* Chat Interface (Slides in) */}
      {step === 'chat' && tempLocation && (
          <div className="absolute inset-y-0 right-0 w-full md:w-[500px] z-30 bg-slate-900 shadow-2xl border-l border-white/10 animate-in slide-in-from-right duration-500 flex flex-col">
              <div className="p-4 border-b border-white/10 bg-slate-800/50 backdrop-blur flex justify-between items-center">
                  <div>
                      <div className="text-[10px] bg-cyan-900/50 text-cyan-400 px-2 py-0.5 rounded font-bold inline-block mb-1 border border-cyan-500/20">
                          LOCATION LOCKED
                      </div>
                      <div className="text-slate-200 font-mono text-xs flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-cyan-400" />
                          {getLatLong(tempLocation)}
                      </div>
                  </div>
                  <button 
                    onClick={() => setStep('map')}
                    className="text-slate-400 hover:text-white flex items-center gap-1 text-xs font-bold px-3 py-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                      <CornerDownLeft className="w-4 h-4" />
                      Change
                  </button>
              </div>
              <div className="flex-1 relative">
                  <ChatbotView onSubmit={(data) => {
                      // Add real location to report data
                      const reportWithLoc = {
                          ...data,
                          location: { 
                              lat: tempLocation.lat,
                              lng: tempLocation.lng
                          }
                      };
                      onSubmit(reportWithLoc);
                  }} />
              </div>
          </div>
      )}
    </div>
  );
};
