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
    <div className="flex-1 p-6 overflow-y-auto bg-slate-50">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Report Emergency</h2>
              <p className="text-sm text-slate-500">Help is on the way</p>
            </div>
          </div>
          
          {submitted && (
            <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
              <p className="text-green-800 font-bold">✓ Report submitted successfully! Authorities have been notified.</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Disaster Type</label>
              <select value={formData.disasterType} onChange={e => setFormData({...formData, disasterType: e.target.value as DisasterType})}
                className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none">
                {Object.values(DisasterType).map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Severity</label>
              <div className="grid grid-cols-4 gap-2">
                {Object.values(Severity).map(sev => (
                  <button key={sev} type="button" onClick={() => setFormData({...formData, severity: sev})}
                    className={`p-3 rounded-xl font-bold transition-all ${formData.severity === sev ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {sev}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Resource Needed</label>
              <select value={formData.resourceNeeded} onChange={e => setFormData({...formData, resourceNeeded: e.target.value as ResourceType})}
                className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none">
                {Object.values(ResourceType).map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none h-32"
                placeholder="Describe the emergency situation..."></textarea>
            </div>
            
            <button type="submit" className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all">
              <Send className="w-5 h-5" />
              Submit Emergency Report
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};