import React from 'react';
import { useApp } from '../../context';
import { KpiCard, PageHeader, RequestStatusBadge, Btn } from '../../components/ui';
import {
  IconPackage, IconList, IconClipboard, IconTruck, IconLeaf, IconActivity, IconPlus, IconArrowLeft
} from '../../components/Icons';
import { OPERATORS } from '../../data';

export default function CompanyDashboard() {
  const { requests, proposals, collections, destinations, impact, notifications, navigate } = useApp();

  const totalKg = requests.reduce((s, r) => s + r.quantity, 0);
  const activeRequests = requests.filter(r => r.status === 'receiving_proposals' || r.status === 'collection_scheduled' || r.status === 'in_collection').length;
  const totalProposals = proposals.filter(p => requests.find(r => r.id === p.requestId)).length;
  const doneCollections = collections.filter(c => c.status === 'destination_confirmed').length;
  const destKg = destinations.reduce((s, d) => s + d.quantity, 0);

  const recentActivity = [
    { icon: '📋', text: 'Chamado #004 publicado', time: '10/09/2026', req: 'req4' },
    { icon: '📩', text: 'Nova proposta — EcoTrat Resíduos para #002', time: '09/09/2026', req: 'req2' },
    { icon: '✅', text: 'Operador selecionado — MetalRec para #003', time: '09/09/2026', req: 'req3' },
    { icon: '📅', text: 'Coleta agendada — Chamado #003 em 20/09', time: '09/09/2026', req: 'req3' },
    { icon: '🏁', text: 'Destinação confirmada — Chamado #002', time: '10/09/2026', req: 'req2' },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Olá, Empresa Eco Industrial"
        subtitle="Acompanhe suas necessidades de resíduos, operações e impacto."
        action={
          <Btn onClick={() => navigate('company-new-request')} className="shrink-0">
            <IconPlus size={16} /> Publicar necessidade
          </Btn>
        }
      />

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <KpiCard label="Resíduos gerados" value={`${totalKg.toLocaleString('pt-BR')} kg`} icon={<IconPackage size={20}/>} />
        <KpiCard label="Chamados ativos" value={activeRequests} icon={<IconList size={20}/>} accent="bg-blue-50 text-blue-600" />
        <KpiCard label="Propostas recebidas" value={totalProposals} icon={<IconClipboard size={20}/>} accent="bg-purple-50 text-purple-600" />
        <KpiCard label="Coletas realizadas" value={doneCollections} icon={<IconTruck size={20}/>} accent="bg-orange-50 text-orange-600" />
        <KpiCard label="Kg destinados" value={`${destKg} kg`} icon={<IconLeaf size={20}/>} />
        <KpiCard label="CO₂e estimado" value={`${impact.co2eAvoided} kg`} sub="estimativa demonstrativa" icon={<IconActivity size={20}/>} accent="bg-emerald-50 text-emerald-600" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent requests */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-display font-700 text-gray-900">Chamados recentes</h2>
            <button onClick={() => navigate('company-requests')} className="text-xs text-green-600 font-semibold hover:text-green-700">Ver todos →</button>
          </div>
          <div className="divide-y divide-gray-50">
            {requests.slice(0, 4).map(req => (
              <button
                key={req.id}
                onClick={() => navigate('company-requests', req.id)}
                className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-600 text-sm text-gray-900">#{req.number}</span>
                    <span className="text-sm text-gray-600">{req.wasteType}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-gray-400">{req.quantity} {req.unit}</span>
                    {req.proposalCount > 0 && <span className="text-xs text-blue-600 font-medium">{req.proposalCount} proposta{req.proposalCount > 1 ? 's' : ''}</span>}
                  </div>
                </div>
                <RequestStatusBadge status={req.status} />
              </button>
            ))}
          </div>
        </div>

        {/* Activity */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="font-display font-700 text-gray-900">Atividade recente</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {recentActivity.map((a, i) => (
              <button
                key={i}
                onClick={() => navigate('company-requests', a.req)}
                className="w-full flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors text-left"
              >
                <span className="text-xl shrink-0 mt-0.5">{a.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">{a.text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
