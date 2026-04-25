import '../css/components/MapVisualizer.css';
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
  // New props for reporting mode
  isReportingMode?: boolean;
  onMapClick?: (coords: { x?: number, y?: number, lat: number, lng: number }) => void;
  tempMarker?: { x: number, y: number, lat?: number, lng?: number };
}

export const MapVisualizer: React.FC<MapVisualizerProps> = ({ 
  requests, resources, selectedRequest, onMarkerClick, 
  isReportingMode, onMapClick, tempMarker 
}) => {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only kept for fallback or wrapper clicks, but actual coordinates come from Leaflet now.
  };

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'MAP_CLICK' && isReportingMode && onMapClick) {
        onMapClick({ x: event.data.x, y: event.data.y, lat: event.data.lat, lng: event.data.lng });
      } else if (event.data?.type === 'MARKER_CLICK') {
        onMarkerClick(event.data.id, event.data.markerType);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isReportingMode, onMapClick, onMarkerClick]);

  React.useEffect(() => {
    // Sync data to the map iframe when requests or resources change
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'SYNC_DATA',
        requests,
        resources,
        selectedRequestId: selectedRequest?.id,
        tempMarker: tempMarker
      }, '*');
    }
  }, [requests, resources, selectedRequest, tempMarker]);

  return (
    <div 
      className={`relative w-full h-full bg-slate-900 overflow-hidden ${isReportingMode ? 'cursor-crosshair' : ''}`} 
    >
      <iframe 
        ref={iframeRef}
        src="/map_dashboard.html" 
        className="mapvisualizer-element-1" 
        title="Interactive Map Background"
        style={{ zIndex: 0 }}
      ></iframe>
      {/* Old markers completely removed as per requirement */}
    </div>
  );
};