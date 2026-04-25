import '../css/components/MapReportView.css';
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
    <div className="mapreportview-element-1">
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
        <div className="mapreportview-element-2">
          <div className="mapreportview-element-3">
             <div className="mapreportview-element-4">
                <h2 className="mapreportview-element-5">
                    <MapPin className="mapreportview-element-6" />
                    Report Incident
                </h2>
                <p className="mapreportview-element-7">
                    Tap anywhere on the map to pin the location of the disaster. Locate precisely for faster response.
                </p>
             </div>
             
             <button 
                onClick={handleUseMyLocation}
                className="mapreportview-element-8"
            >
                <Navigation className="mapreportview-element-9" />
                Use My Location
             </button>
          </div>

          <div className="mapreportview-element-10">
             {tempLocation && (
                 <div className="mapreportview-element-11">
                    <button 
                        onClick={handleConfirmLocation}
                        className="group bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white px-8 py-4 rounded-2xl shadow-[0_0_30px_-5px_rgba(239,68,68,0.5)] flex items-center gap-3 font-black text-lg transition-all hover:scale-105"
                    >
                        Report Here
                        <ArrowRight className="mapreportview-element-12" />
                    </button>
                 </div>
             )}
          </div>
        </div>
      )}

      {/* Chat Interface (Slides in) */}
      {step === 'chat' && tempLocation && (
          <div className="mapreportview-element-13">
              <div className="mapreportview-element-14">
                  <div>
                      <div className="text-[10px] bg-cyan-900/50 text-cyan-400 px-2 py-0.5 rounded font-bold inline-block mb-1 border border-cyan-500/20">
                          LOCATION LOCKED
                      </div>
                      <div className="mapreportview-element-15">
                          <MapPin className="mapreportview-element-16" />
                          {getLatLong(tempLocation)}
                      </div>
                  </div>
                  <button 
                    onClick={() => setStep('map')}
                    className="mapreportview-element-17"
                  >
                      <CornerDownLeft className="mapreportview-element-18" />
                      Change
                  </button>
              </div>
              <div className="mapreportview-element-19">
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
