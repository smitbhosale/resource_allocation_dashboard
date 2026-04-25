import '../css/components/CivilServantView.css';
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
    <div className="civilservantview-element-1">
      <div className="civilservantview-element-2">
        <div className="civilservantview-element-3">
          <h2 className="civilservantview-element-4">My Active Tasks</h2>
          <p className="civilservantview-element-5">{myTasks.length} assignments</p>
        </div>
        
        <div className="civilservantview-element-6">
          {myTasks.map(task => (
            <div key={task.id} className="civilservantview-element-7">
              <div className="civilservantview-element-8">
                <div>
                  <h3 className="civilservantview-element-9">{task.disasterType}</h3>
                  <p className="civilservantview-element-10">#{task.id}</p>
                </div>
                <span className="civilservantview-element-11">IN PROGRESS</span>
              </div>
              
              <p className="civilservantview-element-12">{task.description}</p>
              
              <div className="civilservantview-element-13">
                <button className="civilservantview-element-14">
                  <Navigation className="civilservantview-element-15" />
                  Navigate
                </button>
                <button className="civilservantview-element-16">
                  <Phone className="civilservantview-element-17" />
                  Contact HQ
                </button>
                <button onClick={() => onResolve(task.id)}
                  className="civilservantview-element-18">
                  <CheckCircle className="civilservantview-element-19" />
                  Resolve
                </button>
              </div>
            </div>
          ))}
          
          {myTasks.length === 0 && (
            <div className="civilservantview-element-20">
              <p className="civilservantview-element-21">No active tasks</p>
              <p className="civilservantview-element-22">You'll be notified when assigned</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};