
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { EmergencyRequest, ResourceUnit, ResourceStatus, UserRole, ActiveView, Severity, MapZone } from './types';
import { INITIAL_REQUESTS, INITIAL_RESOURCES } from './constants';
import { DataService } from './services/dataService';
import { calculatePriorityScore } from './services/allocationEngine';
import { initializeSeedData } from './services/seedData';
import { authService } from './services/authService';
import { AuthPage } from './components/AuthPage';
import { Sidebar } from './components/Sidebar';
import { EmergencyPanel } from './components/EmergencyPanel';
import { InventoryPanel } from './components/InventoryPanel';
import { MapVisualizer } from './components/MapVisualizer';
import { AllocationModal } from './components/AllocationModal';
import { SummaryStats } from './components/SummaryStats';
import { ReportView } from './components/ReportView';
import { IntelligenceView } from './components/IntelligenceView';
import { SurvivalGuide } from './components/SurvivalGuide';
import { CivilServantView } from './components/CivilServantView';
import { Shield, Smartphone, Briefcase, Globe, CloudOff, Play, CheckCircle, Truck, Info, Zap, Siren } from 'lucide-react';
import { getBestResource } from './services/allocationEngine';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
    }
    
    const dbReq = DataService.getRequests();
    const dbRes = DataService.getResources();
    const savedZones = localStorage.getItem('dpi4_zones');

    // Initialize with enhanced seed data if database is empty
    if (dbReq.length === 0) {
      const { requests: seedRequests, resources: seedResources } = initializeSeedData();
      setRequests(seedRequests);
      setResources(seedResources);
      DataService.saveData(seedRequests, seedResources);
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

  const handleNewReport = (reportData: Partial<EmergencyRequest>) => {
    const newRequest: EmergencyRequest = {
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Pending',
      timestamp: new Date().toISOString(),
      location: { lat: 34.0522 + (Math.random() - 0.5) * 0.1, lng: -118.2437 + (Math.random() - 0.5) * 0.1 },
      priorityScore: 0,
      syncStatus: isOnline ? 'synced' : 'pending',
      disasterType: reportData.disasterType || INITIAL_REQUESTS[0].disasterType,
      severity: reportData.severity || Severity.MEDIUM,
      resourceNeeded: reportData.resourceNeeded || INITIAL_REQUESTS[0].resourceNeeded,
      description: reportData.description || 'No description provided.',
      areaId: reportData.areaId
    };
    newRequest.priorityScore = calculatePriorityScore(newRequest);
    setRequests(prev => [newRequest, ...prev]);
    setActiveView('guidelines');
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
    return <AuthPage onAuthSuccess={handleLogin} />;
  }

  return (
    <div className={`flex h-screen overflow-hidden ${role === 'authority' ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
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
              <div className="flex items-center justify-between bg-slate-900 border-b border-slate-800 pr-4">
                <SummaryStats requests={requests} resources={resources} />
                <button
                  onClick={simulateAlert}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 transition-all"
                >
                  <Play className="w-3 h-3 text-blue-400" />
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
                    <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl flex items-center justify-between gap-6">
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
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
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
            <div className="hidden lg:block w-96 border-l border-slate-800">
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

        {activeView === 'report' && <ReportView onSubmit={handleNewReport} />}
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
