import '../css/components/Sidebar.css';
import React from 'react';
import { ActiveView, UserRole } from '../types';
import { Home, FileText, Package, Brain, BookOpen, CheckSquare, LogOut, Menu, X, Bot } from 'lucide-react';

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  role: UserRole;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, role, onLogout }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const menuItems = role === 'authority' ? [
    { view: 'home' as ActiveView, icon: Home, label: 'Dashboard' },
    { view: 'inventory' as ActiveView, icon: Package, label: 'Resources' },
    { view: 'intelligence' as ActiveView, icon: Brain, label: 'Intelligence' },
  ] : role === 'civil_servant' ? [
    { view: 'task' as ActiveView, icon: CheckSquare, label: 'My Tasks' },
    { view: 'guidelines' as ActiveView, icon: BookOpen, label: 'Guidelines' },
  ] : [
    { view: 'report' as ActiveView, icon: FileText, label: 'Map Report' },
    { view: 'chat' as ActiveView, icon: Bot, label: 'AI Assistant' },
    { view: 'guidelines' as ActiveView, icon: BookOpen, label: 'Safety Guide' },
  ];

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className="sidebar-element-1">
        {isOpen ? <X className="sidebar-element-2" /> : <Menu className="sidebar-element-3" />}
      </button>
      <div className={`${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform fixed lg:relative z-40 w-64 h-screen bg-slate-950/80 backdrop-blur-xl border-r border-white/5 flex flex-col`}>
        <div className="sidebar-element-4">
          <div className="sidebar-element-5">
            <img src="/logo.jpg" alt="RAD" className="sidebar-element-6" />
            <h1 className="sidebar-element-7">RAD</h1>
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mt-2 font-bold">{role}</p>
        </div>
        <nav className="sidebar-element-8">
          {menuItems.map(item => (
            <button key={item.view} onClick={() => { setActiveView(item.view); setIsOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${activeView === item.view ? 'bg-gradient-to-r from-blue-600/20 to-blue-400/10 text-blue-100 shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}>
              {activeView === item.view && <div className="absolute left-0 top-3 bottom-3 w-1 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />}
              <item.icon className={`w-5 h-5 transition-colors ${activeView === item.view ? 'text-blue-400' : 'group-hover:text-slate-300'}`} />
              <span className={`font-bold tracking-wide text-sm ${activeView === item.view ? 'text-white' : ''}`}>{item.label}</span>
            </button>
          ))}
        </nav>
        <button onClick={onLogout} className="sidebar-element-9">
          <LogOut className="sidebar-element-10" />
          <span className="sidebar-element-11">Logout</span>
        </button>
      </div>
    </>
  );
};