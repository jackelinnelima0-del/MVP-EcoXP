import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import type {
  UserRole, WasteRequest, Proposal, Collection, Destination, Certificate, Notification, ImpactData
} from './types';
import {
  OPERATORS, INITIAL_REQUESTS, INITIAL_PROPOSALS, INITIAL_COLLECTIONS,
  INITIAL_DESTINATIONS, INITIAL_NOTIFICATIONS, INITIAL_CERTIFICATES, calcCo2e
} from './data';

interface Toast { message: string; type: 'success' | 'error' | 'info' }

interface AppContextType {
  role: UserRole | null;
  loggedIn: boolean;
  view: string;
  viewParam: string | null;
  requests: WasteRequest[];
  proposals: Proposal[];
  collections: Collection[];
  destinations: Destination[];
  notifications: Notification[];
  certificates: Certificate[];
  impact: ImpactData;
  toast: Toast | null;
  compareIds: string[];
  sidebarOpen: boolean;

  setRole: (r: UserRole | null) => void;
  setLoggedIn: (v: boolean) => void;
  navigate: (view: string, param?: string) => void;
  logout: () => void;
  createRequest: (data: Omit<WasteRequest, 'id' | 'number' | 'status' | 'proposalCount' | 'createdAt'>) => void;
  submitProposal: (data: Omit<Proposal, 'id' | 'status'>) => void;
  selectOperator: (requestId: string, operatorId: string, proposalId: string) => void;
  updateCollectionStatus: (collectionId: string, status: Collection['status']) => void;
  confirmDestination: (collectionId: string, data: Omit<Destination, 'id'>) => void;
  generateCertificate: (requestId: string, collectionId: string) => void;
  showToast: (message: string, type?: Toast['type']) => void;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  toggleCompare: (proposalId: string) => void;
  clearCompare: () => void;
  setSidebarOpen: (v: boolean) => void;
  addNotification: (n: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
}

const AppContext = createContext<AppContextType>(undefined!);

function computeImpact(destinations: Destination[], requests: WasteRequest[], collections: Collection[]): ImpactData {
  let totalKg = 0;
  let co2e = 0;
  const confirmedDest = destinations;
  confirmedDest.forEach(d => {
    totalKg += d.quantity;
    const col = collections.find(c => c.id === d.collectionId);
    if (col) {
      const req = requests.find(r => r.id === col.requestId);
      if (req) co2e += calcCo2e(req.wasteType, d.quantity);
    }
  });
  const doneReqs = requests.filter(r => r.status === 'destination_confirmed' || r.status === 'collection_done');
  return {
    totalKg,
    co2eAvoided: co2e,
    operationsCount: confirmedDest.length,
    materialsRecovered: new Set(doneReqs.map(r => r.wasteType)).size,
  };
}

let notifCounter = 100;
let reqCounter = 6;
let propCounter = 20;
let colCounter = 10;
let destCounter = 10;
let certCounter = 10;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [view, setView] = useState('landing');
  const [viewParam, setViewParam] = useState<string | null>(null);
  const [requests, setRequests] = useState<WasteRequest[]>(INITIAL_REQUESTS);
  const [proposals, setProposals] = useState<Proposal[]>(INITIAL_PROPOSALS);
  const [collections, setCollections] = useState<Collection[]>(INITIAL_COLLECTIONS);
  const [destinations, setDestinations] = useState<Destination[]>(INITIAL_DESTINATIONS);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [certificates, setCertificates] = useState<Certificate[]>(INITIAL_CERTIFICATES);
  const [toast, setToast] = useState<Toast | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    setToast({ message, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  const navigate = useCallback((v: string, param?: string) => {
    setView(v);
    setViewParam(param || null);
    setSidebarOpen(false);
  }, []);

  const setRole = useCallback((r: UserRole | null) => {
    setRoleState(r);
    if (r) setView('login');
    else setView('landing');
  }, []);

  const logout = useCallback(() => {
    setRoleState(null);
    setLoggedIn(false);
    setView('landing');
    setViewParam(null);
  }, []);

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    const id = `notif${++notifCounter}`;
    setNotifications(prev => [{ ...n, id, read: false, createdAt: new Date().toLocaleDateString('pt-BR') }, ...prev]);
  }, []);

  const createRequest = useCallback((data: Omit<WasteRequest, 'id' | 'number' | 'status' | 'proposalCount' | 'createdAt'>) => {
    const num = String(reqCounter++).padStart(3, '0');
    const req: WasteRequest = {
      ...data,
      id: `req${num}`,
      number: num,
      status: 'receiving_proposals',
      proposalCount: 0,
      createdAt: new Date().toLocaleDateString('pt-BR'),
    };
    setRequests(prev => [req, ...prev]);
    showToast('Necessidade publicada com sucesso.');
    navigate('company-requests');
  }, [navigate, showToast]);

  const submitProposal = useCallback((data: Omit<Proposal, 'id' | 'status'>) => {
    const existing = proposals.find(p => p.requestId === data.requestId && p.operatorId === data.operatorId);
    if (existing) { showToast('Você já enviou uma proposta para este chamado.', 'info'); return; }
    const prop: Proposal = { ...data, id: `prop${++propCounter}`, status: 'sent' };
    setProposals(prev => [...prev, prop]);
    setRequests(prev => prev.map(r => r.id === data.requestId ? { ...r, proposalCount: r.proposalCount + 1 } : r));
    addNotification({ message: 'Nova proposta recebida', detail: `EcoTrat Resíduos enviou uma proposta para o Chamado #${proposals.find(p=>p.requestId===data.requestId)?.requestId || data.requestId}.`, type: 'proposal', requestId: data.requestId });
    showToast('Proposta enviada com sucesso.');
  }, [proposals, addNotification, showToast]);

  const selectOperator = useCallback((requestId: string, operatorId: string, proposalId: string) => {
    setRequests(prev => prev.map(r =>
      r.id === requestId ? { ...r, status: 'collection_scheduled', selectedOperatorId: operatorId } : r
    ));
    setProposals(prev => prev.map(p =>
      p.requestId === requestId ? { ...p, status: p.id === proposalId ? 'accepted' : 'not_selected' } : p
    ));
    const req = requests.find(r => r.id === requestId);
    const col: Collection = {
      id: `col${++colCounter}`,
      requestId,
      operatorId,
      scheduledDate: req?.desiredDate || '',
      status: 'scheduled',
    };
    setCollections(prev => [...prev, col]);
    addNotification({ message: 'Operador selecionado', detail: `Operador selecionado para o Chamado #${requests.find(r=>r.id===requestId)?.number || requestId}. Coleta agendada.`, type: 'selection', requestId });
    showToast('Operador selecionado com sucesso.');
  }, [requests, addNotification, showToast]);

  const updateCollectionStatus = useCallback((collectionId: string, status: Collection['status']) => {
    setCollections(prev => prev.map(c => c.id === collectionId ? { ...c, status } : c));
    const col = collections.find(c => c.id === collectionId);
    if (col) {
      const statusMap: Record<Collection['status'], WasteRequest['status']> = {
        scheduled: 'collection_scheduled',
        in_progress: 'in_collection',
        done: 'collection_done',
        destination_confirmed: 'destination_confirmed',
      };
      setRequests(prev => prev.map(r => r.id === col.requestId ? { ...r, status: statusMap[status] } : r));
    }
    const messages: Record<Collection['status'], string> = {
      scheduled: 'Coleta agendada.',
      in_progress: 'Coleta iniciada.',
      done: 'Coleta finalizada.',
      destination_confirmed: 'Destinação confirmada.',
    };
    showToast(messages[status]);
  }, [collections, showToast]);

  const confirmDestination = useCallback((collectionId: string, data: Omit<Destination, 'id'>) => {
    const dest: Destination = { ...data, id: `dest${++destCounter}` };
    setDestinations(prev => [...prev, dest]);
    updateCollectionStatus(collectionId, 'destination_confirmed');
    showToast('Destinação confirmada.');
  }, [updateCollectionStatus, showToast]);

  const generateCertificate = useCallback((requestId: string, collectionId: string) => {
    const existing = certificates.find(c => c.requestId === requestId);
    if (existing) { showToast('Certificado já gerado.', 'info'); navigate('company-certificates'); return; }
    const req = requests.find(r => r.id === requestId);
    const code = `ECOXP-2026-${req?.number || String(certCounter).padStart(3, '0')}`;
    const cert: Certificate = {
      id: `cert${++certCounter}`,
      requestId,
      collectionId,
      validationCode: code,
      createdAt: new Date().toLocaleDateString('pt-BR'),
    };
    setCertificates(prev => [...prev, cert]);
    showToast('Certificado gerado.');
    navigate('company-certificates');
  }, [certificates, requests, showToast, navigate]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const toggleCompare = useCallback((id: string) => {
    setCompareIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev);
  }, []);

  const clearCompare = useCallback(() => setCompareIds([]), []);

  const impact = computeImpact(destinations, requests, collections);

  return (
    <AppContext.Provider value={{
      role, loggedIn, view, viewParam,
      requests, proposals, collections, destinations, notifications, certificates, impact,
      toast, compareIds, sidebarOpen,
      setRole, setLoggedIn, navigate, logout,
      createRequest, submitProposal, selectOperator,
      updateCollectionStatus, confirmDestination, generateCertificate,
      showToast, markNotificationRead, markAllRead,
      toggleCompare, clearCompare, setSidebarOpen, addNotification,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
