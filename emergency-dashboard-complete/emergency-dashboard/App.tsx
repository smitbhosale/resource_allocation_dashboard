import './css/App.css';

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

      <main className="app-element-1">
        {!isOnline && role === 'citizen' && (
          <div className="app-element-2">
            <CloudOff className="app-element-3" /> LOW CONNECTIVITY MODE: REPORTS WILL SYNC AUTOMATICALLY
          </div>
        )}

        {activeView === 'home' && role === 'authority' && (
          <div className="app-element-4">
            <div className="app-element-5">
              <div className="app-element-6">
                <SummaryStats requests={requests} resources={resources} />
                <button
                  onClick={simulateAlert}
                  className="group relative flex items-center gap-2 px-4 py-2 bg-slate-900/50 hover:bg-blue-900/20 text-blue-100 rounded-xl text-xs font-bold border border-white/5 hover:border-blue-500/30 transition-all shadow-[0_0_15px_-5px_rgba(59,130,246,0.1)] hover:shadow-[0_0_20px_-5px_rgba(59,130,246,0.4)] overflow-hidden"
                >
                  <div className="app-element-7" />
                  <Play className="app-element-8" />
                  Simulate Alert
                </button>
              </div>
              <div className="app-element-9">
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
                  <div className="app-element-10">
                    <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 p-5 rounded-2xl shadow-[0_0_50px_-10px_rgba(0,0,0,0.7)] flex items-center justify-between gap-6 relative overflow-hidden group">
                      <div className="app-element-11" />
                      <div className="app-element-12" />
                      <div className="app-element-13">
                        <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center font-bold ${selectedRequest.severity === Severity.CRITICAL ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'
                          }`}>{selectedRequest.severity[0]}</div>
                        <div className="app-element-14">
                          <h4 className="app-element-15">{selectedRequest.disasterType} <span className="app-element-16">#{selectedRequest.id}</span></h4>
                          <p className="app-element-17">{selectedRequest.description}</p>
                        </div>
                      </div>

                      {assignedResource && (
                        <div className="app-element-18">
                          <div className="app-element-19">
                            <Truck className="app-element-20" />
                            {assignedResource.name}
                          </div>
                          <div className="app-element-21">
                            <span className={`w-2 h-2 rounded-full ${assignedResource.status === ResourceStatus.IN_USE ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`} />
                            <span className="app-element-22">
                              {assignedResource.status}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="app-element-23">
                        {selectedRequest.status === 'Pending' && (
                          <button
                            onClick={() => setIsAllocationModalOpen(true)}
                            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl font-bold text-sm text-white shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.6)] transition-all flex items-center gap-2 border border-white/10"
                          >
                            <Truck className="app-element-24" />
                            Dispatch Unit
                          </button>
                        )}
                        {selectedRequest.status === 'Allocated' && (
                          <button
                            onClick={() => handleResolve(selectedRequest.id)}
                            className="px-6 py-2.5 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-sm shadow-lg shadow-green-500/20 transition-all flex items-center gap-2"
                          >
                            <CheckCircle className="app-element-25" />
                            Mark Resolved
                          </button>
                        )}
                        {selectedRequest.status === 'Resolved' && (
                          <div className="px-6 py-2.5 bg-slate-800 text-slate-400 rounded-xl font-bold text-sm border border-slate-700 flex items-center gap-2">
                            <CheckCircle className="app-element-26" />
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
            <div className="app-element-27">
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
        {activeView === 'inventory' && <div className="app-element-28"><InventoryPanel resources={resources} /></div>}

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
