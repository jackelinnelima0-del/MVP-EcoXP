import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import type {
  UserRole, WasteRequest, Proposal, Collection, Destination, Certificate, Notification, ImpactData
} from './types';
import {
  OPERATORS, INITIAL_REQUESTS, INITIAL_PROPOSALS, INITIAL_COLLECTIONS,
  INITIAL_DESTINATIONS, INITIAL_NOTIFICATIONS, INITIAL_CERTIFICATES, calcCo2e
} from './data';
import { supabase } from './supabase';

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
  useEffect(() => {
    const loadRequests = async () => {
      const { data: rows, error } = await supabase
        .from('collection_requests')
        .select(`
          id,
          company_id,
          waste_type_id,
          title,
          description,
          quantity,
          unit,
          pickup_address,
          preferred_date,
          service_required,
          status,
          created_at,
          waste_types (
            name,
            category
          ),
          companies (
            company_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar solicitações:', error);
        return;
      }

      const loadedRequests: WasteRequest[] = (rows ?? []).map((row: any, index: number) => {
        const wasteTypeName =
          row.waste_types?.name ||
          row.title?.replace('Necessidade de ', '') ||
          'Resíduo';

        const wasteCategory = row.waste_types?.category || '';
        const description = row.description || '';
        const conditionMatch = description.match(/Condição:\s*(.+)/i);
        const service = row.service_required || '';

        return {
          id: row.id,
          number: String(index + 1).padStart(3, '0'),
          wasteType: wasteTypeName,
          wasteCategory,
          quantity: Number(row.quantity || 0),
          unit: row.unit || 'kg',
          condition: conditionMatch?.[1] || 'Não informado',
          location: row.pickup_address || '',
          desiredDate: row.preferred_date || '',
          needsTransport: service.includes('Transporte'),
          needsTreatment:
            service.match(/Tratamento:\s*([^|]+)/i)?.[1]?.trim() || 'Não sei',
          desiredDestination:
            service.match(/Destinação:\s*([^|]+)/i)?.[1]?.trim() || '',
          notes: description.replace(/Condição:\s*.+/i, '').trim(),
          status:
            row.status === 'open'
              ? 'receiving_proposals'
              : row.status,
          proposalCount: 0,
          createdAt: new Date(row.created_at).toLocaleDateString('pt-BR'),
        };
      });

      setRequests(loadedRequests);
    };

    loadRequests();
  }, []);
  useEffect(() => {
    const loadProposals = async () => {
      const { data: rows, error } = await supabase
        .from('proposals')
        .select(`
  id,
  request_id,
  operator_id,
  price,
  estimated_pickup_date,
  service_description,
  notes,
  status,
  created_at,
  waste_operators (
    company_name,
    operator_type
  )
`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar propostas:', error);
        return;
      }

      const loadedProposals: Proposal[] = (rows ?? []).map((row: any) => {
        const servicesText = row.service_description || '';

        const servicesMatch = servicesText.match(/Serviços:\s*([^|]+)/i);
        const timeMatch = servicesText.match(/Horário disponível:\s*([^|]+)/i);

        const rawDate = row.estimated_pickup_date || '';

        return {
          id: row.id,
          requestId: row.request_id,
          operatorId: row.operator_id,
          value: Number(row.price || 0),
          availableDate: rawDate
            ? new Date(`${rawDate}T00:00:00`).toLocaleDateString('pt-BR')
            : '',
          availableTime: timeMatch?.[1]?.trim() || '08:00',
          services: servicesMatch
            ? servicesMatch[1].split(',').map((s: string) => s.trim())
            : [],
          notes: row.notes || '',
          status:
            row.status === 'submitted'
              ? 'sent'
              : row.status === 'accepted'
                ? 'accepted'
                : 'not_selected',
operatorName: row.waste_operators?.company_name || 'Operador de Resíduos',
operatorType: row.waste_operators?.operator_type || '',
        };
      });

      setProposals(loadedProposals);

      setRequests(prev =>
        prev.map(request => ({
          ...request,
          proposalCount: loadedProposals.filter(
            proposal => proposal.requestId === request.id
          ).length,
        }))
      );
    };

    loadProposals();
  }, []);
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

  const createRequest = useCallback(async (
  data: Omit<WasteRequest, 'id' | 'number' | 'status' | 'proposalCount' | 'createdAt'>
) => {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      showToast('Sua sessão não está mais ativa. Faça login novamente.', 'error');
      return;
    }

    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, city, state')
      .eq('profile_id', user.id)
      .maybeSingle();

    if (companyError || !company) {
      console.error(companyError);
      showToast('Não encontramos a empresa vinculada a esta conta.', 'error');
      return;
    }

    const wasteTypeMap: Record<string, string> = {
      'Papel': 'Papel e papelão',
      'Papelão': 'Papel e papelão',
      'Plástico': 'Plásticos',
      'Vidro': 'Vidro',
      'Metal': 'Metais',
      'Alumínio': 'Metais',

      'Resíduos industriais': 'Resíduos industriais',
      'Resíduos de processo': 'Resíduos industriais',
      'Embalagens contaminadas': 'Resíduos contaminados',
      'Sucata metálica': 'Metais',

      'Resíduos contaminados': 'Resíduos contaminados',
      'Materiais contaminados': 'Resíduos contaminados',
      'Produtos químicos': 'Resíduos contaminados',
      'Embalagens contaminadas (perigosas)': 'Resíduos contaminados',

      'Luvas': 'EPIs',
      'Máscaras': 'EPIs',
      'Uniformes': 'EPIs',
      'EPIs contaminados': 'EPIs',
      'EPIs diversos': 'EPIs',

      'Computadores': 'Resíduos eletrônicos',
      'Cabos': 'Resíduos eletrônicos',
      'Equipamentos eletrônicos': 'Resíduos eletrônicos',
      'Componentes eletrônicos': 'Resíduos eletrônicos',

      'Lâmpadas fluorescentes': 'Lâmpadas',
      'Lâmpadas de LED': 'Lâmpadas',
      'Madeira': 'Outros',
      'Outros resíduos': 'Outros',
    };

    const dbWasteTypeName = wasteTypeMap[data.wasteType] || data.wasteType;

    const { data: wasteType, error: wasteTypeError } = await supabase
      .from('waste_types')
      .select('id, name')
      .eq('name', dbWasteTypeName)
      .eq('active', true)
      .maybeSingle();

    if (wasteTypeError || !wasteType) {
      console.error(wasteTypeError);
      showToast(`Tipo de resíduo não encontrado: ${data.wasteType}`, 'error');
      return;
    }

    const serviceRequired = [
      data.needsTransport ? 'Transporte' : null,
      `Tratamento: ${data.needsTreatment}`,
      `Destinação: ${data.desiredDestination}`,
    ]
      .filter(Boolean)
      .join(' | ');

    const { data: inserted, error: insertError } = await supabase
      .from('collection_requests')
      .insert({
        company_id: company.id,
        waste_type_id: wasteType.id,
        title: `Necessidade de ${data.wasteType}`,
        description: [
          data.notes || null,
          `Condição: ${data.condition}`,
        ]
          .filter(Boolean)
          .join('\n'),
        quantity: data.quantity,
        unit: data.unit,
        pickup_address: data.location,
        pickup_city: company.city || null,
        pickup_state: company.state || null,
        preferred_date: data.desiredDate || null,
        service_required: serviceRequired,
      })
      .select('*')
      .single();

    if (insertError || !inserted) {
      console.error(insertError);
      showToast('Não foi possível publicar a necessidade.', 'error');
      return;
    }

    const num = String(reqCounter++).padStart(3, '0');

    const req: WasteRequest = {
      ...data,
      id: inserted.id,
      number: num,
      status: 'receiving_proposals',
      proposalCount: 0,
      createdAt: new Date(inserted.created_at).toLocaleDateString('pt-BR'),
    };

    setRequests(prev => [req, ...prev]);

    showToast('Necessidade publicada com sucesso.');
    navigate('company-requests');
  } catch (error) {
    console.error(error);
    showToast('Ocorreu um erro ao publicar a necessidade.', 'error');
  }
}, [navigate, showToast]);

  const submitProposal = useCallback(async (
  data: Omit<Proposal, 'id' | 'status'>
) => {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      showToast('Sua sessão não está mais ativa. Faça login novamente.', 'error');
      return;
    }

    const { data: operator, error: operatorError } = await supabase
      .from('waste_operators')
      .select('id')
      .eq('profile_id', user.id)
      .eq('active', true)
      .maybeSingle();

    if (operatorError || !operator) {
      console.error(operatorError);
      showToast('Operador não encontrado para esta conta.', 'error');
      return;
    }

    const existing = await supabase
      .from('proposals')
      .select('id')
      .eq('request_id', data.requestId)
      .eq('operator_id', operator.id)
      .maybeSingle();

    if (existing.data) {
      showToast('Você já enviou uma proposta para este chamado.', 'info');
      return;
    }

    const pickupDate = data.availableDate.includes('/')
      ? data.availableDate.split('/').reverse().join('-')
      : data.availableDate;

    const serviceDescription = [
      `Serviços: ${data.services.join(', ')}`,
      `Horário disponível: ${data.availableTime}`,
    ].join(' | ');

    const { data: inserted, error: insertError } = await supabase
      .from('proposals')
      .insert({
        request_id: data.requestId,
        operator_id: operator.id,
        price: data.value,
        estimated_pickup_date: pickupDate || null,
        service_description: serviceDescription,
        notes: data.notes || null,
        status: 'submitted',
      })
      .select('*')
      .single();

    if (insertError || !inserted) {
      console.error(insertError);
      showToast('Não foi possível enviar a proposta.', 'error');
      return;
    }

    const proposal: Proposal = {
      id: inserted.id,
      requestId: inserted.request_id,
      operatorId: inserted.operator_id,
      value: Number(inserted.price || 0),
      availableDate: data.availableDate,
      availableTime: data.availableTime,
      services: data.services,
      notes: inserted.notes || '',
      status: 'sent',
    };

    setProposals(prev => [...prev, proposal]);

    setRequests(prev =>
      prev.map(r =>
        r.id === data.requestId
          ? { ...r, proposalCount: r.proposalCount + 1 }
          : r
      )
    );

    showToast('Proposta enviada com sucesso.');
  } catch (error) {
    console.error(error);
    showToast('Ocorreu um erro ao enviar a proposta.', 'error');
  }
}, [showToast]);
  const selectOperator = useCallback(async (
  requestId: string,
  operatorId: string,
  proposalId: string
) => {
  try {
    const { data: updatedProposal, error: proposalError } = await supabase
      .from('proposals')
      .update({ status: 'accepted' })
      .eq('id', proposalId)
      .select('*')
      .single();

    if (proposalError || !updatedProposal) {
      console.error(proposalError);
      showToast('Não foi possível aceitar a proposta.', 'error');
      return;
    }

    const { error: otherProposalsError } = await supabase
      .from('proposals')
      .update({ status: 'not_selected' })
      .eq('request_id', requestId)
      .neq('id', proposalId);

    if (otherProposalsError) {
      console.error(otherProposalsError);
      showToast('A proposta foi aceita, mas não foi possível atualizar as demais.', 'error');
      return;
    }

    const { error: requestError } = await supabase
      .from('collection_requests')
      .update({ status: 'operator_selected' })
      .eq('id', requestId);

    if (requestError) {
      console.error(requestError);
      showToast('A proposta foi aceita, mas não foi possível atualizar o chamado.', 'error');
      return;
    }

    const req = requests.find(r => r.id === requestId);

    const { data: collection, error: collectionError } = await supabase
      .from('collections')
      .insert({
        request_id: requestId,
        proposal_id: proposalId,
        operator_id: operatorId,
        scheduled_date: req?.desiredDate || null,
        status: 'scheduled',
      })
      .select('*')
      .single();

    if (collectionError || !collection) {
      console.error(collectionError);
      showToast('A proposta foi aceita, mas não foi possível criar a coleta.', 'error');
      return;
    }

    setRequests(prev =>
      prev.map(r =>
        r.id === requestId
          ? {
              ...r,
              status: 'collection_scheduled',
              selectedOperatorId: operatorId,
            }
          : r
      )
    );

    setProposals(prev =>
      prev.map(p =>
        p.requestId === requestId
          ? {
              ...p,
              status: p.id === proposalId ? 'accepted' : 'not_selected',
            }
          : p
      )
    );

    const localCollection: Collection = {
      id: collection.id,
      requestId: collection.request_id,
      operatorId: collection.operator_id,
      scheduledDate: collection.scheduled_date || '',
      status: 'scheduled',
    };

    setCollections(prev => [...prev, localCollection]);

    addNotification({
      message: 'Operador selecionado',
      detail: `Operador selecionado para o Chamado #${
        req?.number || requestId
      }. Coleta agendada.`,
      type: 'selection',
      requestId,
    });

    showToast('Operador selecionado com sucesso.');
  } catch (error) {
    console.error(error);
    showToast('Ocorreu um erro ao selecionar o operador.', 'error');
  }
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
