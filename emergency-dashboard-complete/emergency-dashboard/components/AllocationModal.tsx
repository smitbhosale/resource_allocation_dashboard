import '../css/components/AllocationModal.css';
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
    <div className="allocationmodal-element-1">
      <div className="allocationmodal-element-2">
        <div className="allocationmodal-element-3">
          <h2 className="allocationmodal-element-4">Allocate Resource</h2>
          <button onClick={onClose} className="allocationmodal-element-5">
            <X className="allocationmodal-element-6" />
          </button>
        </div>
        
        <div className="allocationmodal-element-7">
          <div className="allocationmodal-element-8">
            <h3 className="allocationmodal-element-9">Request Details</h3>
            <div className="allocationmodal-element-10">
              <p className="allocationmodal-element-11"><span className="allocationmodal-element-12">Type:</span> {request.disasterType}</p>
              <p className="allocationmodal-element-13"><span className="allocationmodal-element-14">Severity:</span> {request.severity}</p>
              <p className="allocationmodal-element-15"><span className="allocationmodal-element-16">Needed:</span> {request.resourceNeeded}</p>
            </div>
          </div>
          
          {best && (
            <div className="allocationmodal-element-17">
              <div className="allocationmodal-element-18">
                <TrendingUp className="allocationmodal-element-19" />
                <span className="allocationmodal-element-20">AI RECOMMENDED</span>
              </div>
              <button onClick={() => onAllocate(request.id, best.resourceId)}
                className="allocationmodal-element-21">
                <span>{resources.find(r => r.id === best.resourceId)?.name}</span>
                <span className="allocationmodal-element-22">{best.distance}km • Score: {best.score.toFixed(0)}</span>
              </button>
            </div>
          )}
          
          <div className="allocationmodal-element-23">
            <h3 className="allocationmodal-element-24">All Available ({available.length})</h3>
            <div className="allocationmodal-element-25">
              {available.map(res => (
                <button key={res.id} onClick={() => onAllocate(request.id, res.id)}
                  className="allocationmodal-element-26">
                  <span className="allocationmodal-element-27">{res.name}</span>
                  <Truck className="allocationmodal-element-28" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};