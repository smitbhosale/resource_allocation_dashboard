import '../css/components/ReportView.css';
import React, { useState } from 'react';
import { DisasterType, Severity, ResourceType } from '../types';
import { AlertCircle, MapPin, Send } from 'lucide-react';

interface ReportViewProps {
  onSubmit: (data: any) => void;
}

export const ReportView: React.FC<ReportViewProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({ disasterType: DisasterType.FLOOD, severity: Severity.MEDIUM, resourceNeeded: ResourceType.RESCUE_UNIT, description: '' });
  const [submitted, setSubmitted] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };
  
  return (
    <div className="reportview-element-1">
      <div className="reportview-element-2">
        <div className="reportview-element-3">
          <div className="reportview-element-4">
            <div className="reportview-element-5">
              <AlertCircle className="reportview-element-6" />
            </div>
            <div>
              <h2 className="reportview-element-7">Report Emergency</h2>
              <p className="reportview-element-8">Help is on the way</p>
            </div>
          </div>
          
          {submitted && (
            <div className="reportview-element-9">
              <p className="reportview-element-10">✓ Report submitted successfully! Authorities have been notified.</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="reportview-element-11">
            <div>
              <label className="reportview-element-12">Disaster Type</label>
              <select value={formData.disasterType} onChange={e => setFormData({...formData, disasterType: e.target.value as DisasterType})}
                className="reportview-element-13">
                {Object.values(DisasterType).map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            
            <div>
              <label className="reportview-element-14">Severity</label>
              <div className="reportview-element-15">
                {Object.values(Severity).map(sev => (
                  <button key={sev} type="button" onClick={() => setFormData({...formData, severity: sev})}
                    className={`p-3 rounded-xl font-bold transition-all ${formData.severity === sev ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {sev}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="reportview-element-16">Resource Needed</label>
              <select value={formData.resourceNeeded} onChange={e => setFormData({...formData, resourceNeeded: e.target.value as ResourceType})}
                className="reportview-element-17">
                {Object.values(ResourceType).map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            
            <div>
              <label className="reportview-element-18">Description</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                className="reportview-element-19"
                placeholder="Describe the emergency situation..."></textarea>
            </div>
            
            <button type="submit" className="reportview-element-20">
              <Send className="reportview-element-21" />
              Submit Emergency Report
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};