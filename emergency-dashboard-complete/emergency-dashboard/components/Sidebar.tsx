import React from 'react';
import { ActiveView, UserRole } from '../types';
import { Home, FileText, Package, Brain, BookOpen, CheckSquare, LogOut, Menu, X } from 'lucide-react';

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
    { view: 'report' as ActiveView, icon: FileText, label: 'Report Incident' },
    { view: 'guidelines' as ActiveView, icon: BookOpen, label: 'Safety Guide' },
  ];

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 rounded-lg">
        {isOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
      </button>
      <div className={`${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform fixed lg:relative z-40 w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col`}>
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-black text-white">DPI-4</h1>
          <p className="text-xs text-slate-400 mt-1">{role.toUpperCase()}</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map(item => (
            <button key={item.view} onClick={() => { setActiveView(item.view); setIsOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeView === item.view ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
              <item.icon className="w-5 h-5" />
              <span className="font-bold">{item.label}</span>
            </button>
          ))}
        </nav>
        <button onClick={onLogout} className="m-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-900/20 text-red-400 hover:bg-red-900/30 transition-all">
          <LogOut className="w-5 h-5" />
          <span className="font-bold">Logout</span>
        </button>
      </div>
    </>
  );
};