import React, { useState } from 'react';
import { SURVIVAL_GUIDES } from '../constants';
import { BookOpen, Search } from 'lucide-react';

export const SurvivalGuide: React.FC = () => {
  const [search, setSearch] = useState('');
  const filtered = SURVIVAL_GUIDES.filter(guide => guide.title.toLowerCase().includes(search.toLowerCase()) || guide.disasterType.toLowerCase().includes(search.toLowerCase()));
  
  return (
    <div className="flex-1 p-6 overflow-y-auto bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">Safety Guidelines</h2>
            <p className="text-sm text-slate-500">Emergency survival protocols</p>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
              placeholder="Search guidelines..." />
          </div>
        </div>
        
        <div className="space-y-4">
          {filtered.map(guide => (
            <div key={guide.id} className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900">{guide.title}</h3>
                  <p className="text-sm text-slate-500">{guide.disasterType}</p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${guide.priority === 'Primary' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                  {guide.priority}
                </span>
              </div>
              <ul className="space-y-2">
                {guide.content.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                    <span className="text-slate-700">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};