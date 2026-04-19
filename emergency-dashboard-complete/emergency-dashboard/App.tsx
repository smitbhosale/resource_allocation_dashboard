
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { EmergencyRequest, ResourceUnit, ResourceStatus, UserRole, ActiveView, Severity, MapZone } from './types';
import { INITIAL_REQUESTS, INITIAL_RESOURCES } from './constants';
import { DataService } from './services/dataService';
import { calculatePriorityScore } from './services/allocationEngine';
import { initializeSeedData } from './services/seedData';
import { authService } from './services/authService';
import { AuthPage } from './components/AuthPage';
import { LandingPage } from './components/LandingPage';
import { Sidebar } from './components/Sidebar';
import { EmergencyPanel } from './components/EmergencyPanel';
import { InventoryPanel } from './components/InventoryPanel';
import { MapVisualizer } from './components/MapVisualizer';
import { AllocationModal } from './components/AllocationModal';
import { SummaryStats } from './components/SummaryStats';
import { ReportView } from './components/ReportView';
import { MapReportView } from './components/MapReportView';
import { IntelligenceView } from './components/IntelligenceView';
import { SurvivalGuide } from './components/SurvivalGuide';
import { CivilServantView } from './components/CivilServantView';
import { ChatbotView } from './components/ChatbotView';
import { Shield, Smartphone, Briefcase, Globe, CloudOff, Play, CheckCircle, Truck, Info, Zap, Siren } from 'lucide-react';
import { getBestResource } from './services/allocationEngine';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [role, setRole] = useState<UserRole>('guest');
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [resources, setResources] = useState<ResourceUnit[]>([]);
  const [zones, setZones] = useState<MapZone[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string | undefined>();
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Network Status Monitor
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync Logic for Offline Reports
  useEffect(() => {
    if (isOnline) {
      const pendingCount = requests.filter(r => r.syncStatus === 'pending').length;
      if (pendingCount > 0) {
        console.log(`Syncing ${pendingCount} offline reports...`);
        setRequests(prev => prev.map(r => ({ ...r, syncStatus: 'synced' })));
      }
    }
  }, [isOnline, requests]);

  // Persistence & Data Loading
  useEffect(() => {
    // Check if user is already authenticated
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setIsAuthenticated(true);
      setRole(currentUser.role);
      setShowLanding(false);
    }
    
    let dbReq = DataService.getRequests();
    let dbRes = DataService.getResources();
    const savedZones = localStorage.getItem('dpi4_zones');

    // Filter out old mock LA data
    dbReq = dbReq.filter(req => req.location.lng > 0);
    dbRes = dbRes.filter(res => res.location.lng > 0);

    // Initialize seed data block
    if (dbReq.length === 0 || dbRes.length === 0) {
      const { requests: seedRequests, resources: seedResources } = initializeSeedData();
      
      const newReqs = dbReq.length === 0 ? seedRequests : dbReq;
      const newRes = dbRes.length === 0 ? seedResources : dbRes;

      setRequests(newReqs);
      setResources(newRes);
      DataService.saveData(newReqs, newRes);
    } else {
      setRequests(dbReq);
      setResources(dbRes);
    }

    if (savedZones) setZones(JSON.parse(savedZones));

    if (currentUser) {
      if (currentUser.role === 'citizen') setActiveView('guidelines');
      else if (currentUser.role === 'civil_servant') setActiveView('task');
    }
  }, []);

  useEffect(() => {
    if (requests.length > 0) DataService.saveData(requests, resources);
    localStorage.setItem('dpi4_zones', JSON.stringify(zones));
  }, [requests, resources, zones]);

  const handleLogin = (selectedRole: UserRole) => {
    setIsAuthenticated(true);
    setRole(selectedRole);
    setActiveView(selectedRole === 'authority' ? 'home' : (selectedRole === 'civil_servant' ? 'task' : 'guidelines'));
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setRole('guest');
    setActiveView('home');
  };

  const simulateAlert = () => {
    const newAlert = DataService.generateMockAlert();
    setRequests(prev => [newAlert, ...prev]);
  };

  const handleNewReport = (reportData: Partial<EmergencyRequest>, redirect = true) => {
    const newRequest: EmergencyRequest = {
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Pending',
      timestamp: new Date().toISOString(),
      location: reportData.location || { lat: 34.0522 + (Math.random() - 0.5) * 0.1, lng: -118.2437 + (Math.random() - 0.5) * 0.1 },
      priorityScore: 0,
      syncStatus: isOnline ? 'synced' : 'pending',
      disasterType: reportData.disasterType || INITIAL_REQUESTS[0].disasterType,
      severity: reportData.severity || Severity.MEDIUM,
      resourceNeeded: reportData.resourceNeeded || INITIAL_REQUESTS[0].resourceNeeded,
      description: reportData.description || 'No description provided.',
      areaId: reportData.areaId
    };
    newRequest.priorityScore = reportData.priorityScore || calculatePriorityScore(newRequest);

    let allocatedRes: any = null;
    // Auto-dispatch logic: If score is high or severity is critical
    if (newRequest.priorityScore >= 70 || newRequest.severity === Severity.CRITICAL) {
        allocatedRes = getBestResource(newRequest, resources);
        if (allocatedRes) {
            newRequest.status = 'Allocated';
            newRequest.assignedResourceId = allocatedRes.resourceId;
        }
    }

    setRequests(prev => [newRequest, ...prev]);

    if (allocatedRes) {
        setResources(prev => prev.map(res => 
            res.id === allocatedRes.resourceId ? { ...res, status: ResourceStatus.IN_USE } : res
        ));
    }

    if (redirect) setActiveView('guidelines');
  };

  const sortedRequests = useMemo(() => {
    return [...requests].sort((a, b) => b.priorityScore - a.priorityScore);
  }, [requests]);

  const selectedRequest = useMemo(() => {
    return requests.find(r => r.id === selectedRequestId);
  }, [requests, selectedRequestId]);

  const assignedResource = useMemo(() => {
    if (!selectedRequest?.assignedResourceId) return null;
    return resources.find(r => r.id === selectedRequest.assignedResourceId);
  }, [selectedRequest, resources]);

  const handleAllocate = useCallback((requestId: string, resourceId: string) => {
    if (role !== 'authority') return;
    setRequests(prev => prev.map(req =>
      req.id === requestId ? { ...req, status: 'Allocated', assignedResourceId: resourceId } : req
    ));
    setResources(prev => prev.map(res =>
      res.id === resourceId ? { ...res, status: ResourceStatus.IN_USE } : res
    ));
    setIsAllocationModalOpen(false);
  }, [role]);

  const handleResolve = useCallback((requestId: string) => {
    if (role !== 'authority') return;
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    setRequests(prev => prev.map(r =>
      r.id === requestId ? { ...r, status: 'Resolved' } : r
    ));

    if (req.assignedResourceId) {
      setResources(prev => prev.map(res =>
        res.id === req.assignedResourceId ? { ...res, status: ResourceStatus.AVAILABLE } : res
      ));
    }
  }, [role, requests]);

  const handleAutoAllocate = useCallback((requestId: string) => {
    if (role !== 'authority') return;
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    const bestResource = getBestResource(req, resources);
    if (bestResource) {
      handleAllocate(requestId, bestResource.resourceId);
    } else {
      // In a real app, show a toast notification
      console.warn("No suitable resources available nearby");
    }
  }, [role, requests, resources, handleAllocate]);

  if (!isAuthenticated) {
    if (showLanding) {
      return <LandingPage onGetStarted={() => setShowLanding(false)} />;
    }
    return <AuthPage onAuthSuccess={handleLogin} />;
  }

  return (
    <div className={`flex h-screen overflow-hidden ${role === 'authority' ? 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      <Sidebar activeView={activeView} setActiveView={setActiveView} role={role} onLogout={handleLogout} />

      <main className="flex-1 flex flex-col min-w-0">
        {!isOnline && role === 'citizen' && (
          <div className="bg-orange-500 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-bold animate-pulse">
            <CloudOff className="w-4 h-4" /> LOW CONNECTIVITY MODE: REPORTS WILL SYNC AUTOMATICALLY
          </div>
        )}

        {activeView === 'home' && role === 'authority' && (
          <div className="flex-1 flex flex-col md:flex-row min-h-0">
            <div className="flex-1 relative flex flex-col">
              <div className="flex items-center justify-between bg-slate-900/50 backdrop-blur-md border-b border-white/5 pr-4">
                <SummaryStats requests={requests} resources={resources} />
                <button
                  onClick={simulateAlert}
                  className="group relative flex items-center gap-2 px-4 py-2 bg-slate-900/50 hover:bg-blue-900/20 text-blue-100 rounded-xl text-xs font-bold border border-white/5 hover:border-blue-500/30 transition-all shadow-[0_0_15px_-5px_rgba(59,130,246,0.1)] hover:shadow-[0_0_20px_-5px_rgba(59,130,246,0.4)] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Play className="w-3 h-3 text-blue-400 group-hover:text-blue-300 transition-colors" />
                  Simulate Alert
                </button>
              </div>
              <div className="flex-1 relative">
                <MapVisualizer
                  requests={requests}
                  resources={resources}
                  zones={zones}
                  role={role}
                  selectedRequest={selectedRequest}
                  onMarkerClick={(id, type) => {
                    if (type === 'req') setSelectedRequestId(id);
                  }}
                  onZonesChange={setZones}
                />
                {selectedRequest && (
                  <div className="absolute bottom-6 left-6 right-6 z-30">
                    <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 p-5 rounded-2xl shadow-[0_0_50px_-10px_rgba(0,0,0,0.7)] flex items-center justify-between gap-6 relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-black/40 to-transparent" />
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center font-bold ${selectedRequest.severity === Severity.CRITICAL ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'
                          }`}>{selectedRequest.severity[0]}</div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-white truncate">{selectedRequest.disasterType} <span className="text-[10px] text-slate-500 font-mono ml-2">#{selectedRequest.id}</span></h4>
                          <p className="text-xs text-slate-400 max-w-md truncate">{selectedRequest.description}</p>
                        </div>
                      </div>

                      {assignedResource && (
                        <div className="flex flex-col gap-1 items-end border-l border-slate-800 pl-6 h-full justify-center">
                          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold">
                            <Truck className="w-4 h-4" />
                            {assignedResource.name}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${assignedResource.status === ResourceStatus.IN_USE ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`} />
                            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                              {assignedResource.status}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 border-l border-slate-800 pl-6 h-full items-center">
                        {selectedRequest.status === 'Pending' && (
                          <button
                            onClick={() => setIsAllocationModalOpen(true)}
                            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl font-bold text-sm text-white shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.6)] transition-all flex items-center gap-2 border border-white/10"
                          >
                            <Truck className="w-4 h-4" />
                            Dispatch Unit
                          </button>
                        )}
                        {selectedRequest.status === 'Allocated' && (
                          <button
                            onClick={() => handleResolve(selectedRequest.id)}
                            className="px-6 py-2.5 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-sm shadow-lg shadow-green-500/20 transition-all flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Mark Resolved
                          </button>
                        )}
                        {selectedRequest.status === 'Resolved' && (
                          <div className="px-6 py-2.5 bg-slate-800 text-slate-400 rounded-xl font-bold text-sm border border-slate-700 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Task Completed
                          </div>
                        )}
                        <button
                          onClick={() => setSelectedRequestId(undefined)}
                          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl transition-all"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="hidden lg:block w-96 border-l border-white/5 bg-slate-950/30 backdrop-blur-sm">
              <EmergencyPanel
                requests={sortedRequests}
                resources={resources}
                onSelect={(req) => setSelectedRequestId(req.id)}
                selectedRequestId={selectedRequestId}
                onAutoAllocate={handleAutoAllocate}
              />
            </div>
          </div>
        )}

        {activeView === 'report' && <MapReportView onSubmit={handleNewReport} />}
        {activeView === 'chat' && <ChatbotView onSubmit={(data) => handleNewReport(data, false)} />}
        {activeView === 'guidelines' && <SurvivalGuide />}
        {activeView === 'intelligence' && <IntelligenceView requests={requests} resources={resources} />}
        {activeView === 'inventory' && <div className="flex-1 p-0 flex justify-center"><InventoryPanel resources={resources} /></div>}

        {activeView === 'home' && role === 'citizen' && <SurvivalGuide />}

        {activeView === 'task' && role === 'civil_servant' && (
          <CivilServantView
            requests={requests}
            resources={resources}
            onResolve={handleResolve}
            onStatusUpdate={() => { }}
          />
        )}
      </main>

      {role === 'authority' && isAllocationModalOpen && selectedRequest && (
        <AllocationModal
          request={selectedRequest}
          resources={resources}
          onClose={() => setIsAllocationModalOpen(false)}
          onAllocate={handleAllocate}
        />
      )}
    </div>
  );
};

export default App;
