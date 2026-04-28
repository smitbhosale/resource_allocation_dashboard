import '../css/components/SurvivalGuide.css';
import React, { useState } from 'react';
import { SURVIVAL_GUIDES } from '../constants';
import { BookOpen, Search } from 'lucide-react';

export const SurvivalGuide: React.FC = () => {
  const [search, setSearch] = useState('');
  const filtered = SURVIVAL_GUIDES.filter(guide => guide.title.toLowerCase().includes(search.toLowerCase()) || guide.disasterType.toLowerCase().includes(search.toLowerCase()));
  
  return (
    <div className="survivalguide-element-1">
      <div className="survivalguide-element-2">
        <div className="survivalguide-element-3">
          <div className="survivalguide-element-4">
            <BookOpen className="survivalguide-element-5" />
          </div>
          <div>
            <h2 className="survivalguide-element-6">Safety Guidelines</h2>
            <p className="survivalguide-element-7">Emergency survival protocols</p>
          </div>
        </div>
        
        <div className="survivalguide-element-8">
          <div className="survivalguide-element-9">
            <Search className="survivalguide-element-10" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              className="survivalguide-element-11"
              placeholder="Search guidelines..." />
          </div>
        </div>
        
        <div className="survivalguide-element-12">
          {filtered.map(guide => (
            <div key={guide.id} className="survivalguide-element-13">
              <div className="survivalguide-element-14">
                <div>
                  <h3 className="survivalguide-element-15">{guide.title}</h3>
                  <p className="survivalguide-element-16">{guide.disasterType}</p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${guide.priority === 'Primary' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                  {guide.priority}
                </span>
              </div>
              <ul className="survivalguide-element-17">
                {guide.content.map((step, idx) => (
                  <li key={idx} className="survivalguide-element-18">
                    <span className="survivalguide-element-19">{idx + 1}</span>
                    <span className="survivalguide-element-20">{step}</span>
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