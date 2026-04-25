import '../css/components/IntelligenceView.css';
import React from 'react';
import { EmergencyRequest, ResourceUnit } from '../types';
import { Brain, TrendingUp, MapPin } from 'lucide-react';

interface IntelligenceViewProps {
  requests: EmergencyRequest[];
  resources: ResourceUnit[];
}

export const IntelligenceView: React.FC<IntelligenceViewProps> = ({ requests }) => {
  const hotspots = [
    { area: 'Downtown Metro', riskLevel: 'High', count: requests.filter(r => r.status === 'Pending').length },
    { area: 'West Coastal', riskLevel: 'Medium', count: Math.floor(Math.random() * 5) },
    { area: 'Tech Corridor', riskLevel: 'Low', count: Math.floor(Math.random() * 3) }
  ];
  
  const generateRecommendations = () => {
    const pending = requests.filter(r => r.status === 'Pending').sort((a, b) => b.priorityScore - a.priorityScore);
    if (pending.length === 0) {
      return [{ id: 'none', text: 'All clear. No critical active emergencies requiring immediate AI allocation.', confidence: 99 }];
    }
    
    return pending.slice(0, 3).map(req => {
      let text = `AI detected critical ${req.disasterType}. Recommend dispatching ${req.resourceNeeded.replace('_', ' ')} unit immediately to coordinate.`;
      
      if (req.description && req.description !== 'No description provided.') {
         text = `"${req.description}" -> Immediate AI recommendation: Dispatch ${req.resourceNeeded.replace('_', ' ')}.`;
      }
      
      return { 
        id: req.id,
        text, 
        confidence: Math.max(Math.min(Math.round(req.priorityScore + (Math.random() * 15)), 99), 75) 
      };
    });
  };

  const dynamicRecommendations = generateRecommendations();

  return (
    <div className="intelligenceview-element-1">
      <div className="intelligenceview-element-2">
        <div className="intelligenceview-element-3">
          <div className="intelligenceview-element-4">
            <Brain className="intelligenceview-element-5" />
          </div>
          <div>
            <h2 className="intelligenceview-element-6">AI Intelligence</h2>
            <p className="intelligenceview-element-7">Predictive analytics and recommendations</p>
          </div>
        </div>
        
        <div className="intelligenceview-element-8">
          <div className="intelligenceview-element-9">
            <h3 className="intelligenceview-element-10">
              <MapPin className="intelligenceview-element-11" />
              Risk Hotspots
            </h3>
            <div className="intelligenceview-element-12">
              {hotspots.map(spot => (
                <div key={spot.area} className="intelligenceview-element-13">
                  <div>
                    <div className="intelligenceview-element-14">{spot.area}</div>
                    <div className="intelligenceview-element-15">{spot.count} active incidents</div>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${spot.riskLevel === 'High' ? 'bg-red-500/20 text-red-400' : spot.riskLevel === 'Medium' ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'}`}>
                    {spot.riskLevel}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="intelligenceview-element-16">
            <h3 className="intelligenceview-element-17">
              <TrendingUp className="intelligenceview-element-18" />
              AI Recommendations
            </h3>
            <div className="intelligenceview-element-19">
              {dynamicRecommendations.map((rec, i) => (
                <div key={rec.id + i} className="intelligenceview-element-20">
                  <p className="intelligenceview-element-21">{rec.text}</p>
                  <span className="intelligenceview-element-22">Confidence: {rec.confidence}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};