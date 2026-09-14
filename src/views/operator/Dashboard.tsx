import React from 'react';
import { useApp } from '../../context';
import { KpiCard, CollectionStatusBadge, Btn } from '../../components/ui';
import { IconPackage, IconClipboard, IconTruck, IconCheck, IconPlus } from '../../components/Icons';
import { OPERATORS } from '../../data';

const MY_OPERATOR_ID = 'op3';

export default function OperatorDashboard() {
  const { requests, proposals, collections, navigate } = useApp();

  const myOp = OPERATORS.find(o => o.id === MY_OPERATOR_ID)!;
  const myProposals = proposals.filter(p => p.operatorId === MY_OPERATOR_ID);
  const myCollections = collections.filter(c => c.operatorId === MY_OPERATOR_ID);
  const openOpportunities = requests.filter(r =>
    r.status === 'receiving_proposals' &&
    !myProposals.find(p => p.requestId === r.id)
  );
  const acceptedProposals = myProposals.filter(p => p.status === 'accepted');
  const activeCollections = myCollections.filter(c => c.status !== 'destination_confirmed');
  const doneCollections = myCollections.filter(c => c.status === 'destination_confirmed');

  const upcomingCollections = myCollections.map(col => {
    const req = requests.find(r => r.id === col.requestId);
    return { col, req };
  }).filter(x => x.req && x.col.status !== 'destination_confirmed');

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-800 text-2xl text-gray-900">Olá, EcoTrat Resíduos</h1>
          <p className="text-gray-500 text-sm mt-0.5">Acompanhe oportunidades, propostas e coletas.</p>
        </div>
        <Btn onClick={() => navigate('operator-opportunities')}>
          <IconPackage size={16} /> Ver oportunidades
        </Btn>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <KpiCard label="Oportunidades" value={openOpportunities.length} icon={<IconPackage size={20}/>} accent="bg-orange-50 text-orange-600" />
        <KpiCard label="Propostas enviadas" value={myProposals.length} icon={<IconClipboard size={20}/>} accent="bg-blue-50 text-blue-600" />
        <KpiCard label="Propostas aceitas" value={acceptedProposals.length} icon={<IconCheck size={20}/>} />
        <KpiCard label="Coletas ativas" value={activeCollections.length} icon={<IconTruck size={20}/>} accent="bg-orange-50 text-orange-600" />
        <KpiCard label="Coletas realizadas" value={doneCollections.length} icon={<IconCheck size={20}/>} accent="bg-emerald-50 text-emerald-600" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming collections */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-display font-700 text-gray-900">Próximas coletas</h2>
            <button onClick={() => navigate('operator-collections')} className="text-xs text-green-600 font-semibold hover:text-green-700">Ver todas →</button>
          </div>
          {upcomingCollections.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">
              <IconTruck size={28} className="mx-auto mb-2 opacity-30" />
              <p>Nenhuma coleta agendada.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {upcomingCollections.map(({ col, req }) => (
                <button
                  key={col.id}
                  onClick={() => navigate('operator-collections', col.id)}
                  className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-600 text-sm text-gray-900">{req?.wasteType}</p>
                    <p className="text-xs text-gray-500">Empresa Eco Industrial · {req?.quantity} {req?.unit}</p>
                  </div>
                  <div className="text-right">
                    <CollectionStatusBadge status={col.status} />
                    <p className="text-xs text-gray-400 mt-1">{col.scheduledDate}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Recent opportunities */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-display font-700 text-gray-900">Oportunidades recentes</h2>
            <button onClick={() => navigate('operator-opportunities')} className="text-xs text-orange-600 font-semibold hover:text-orange-700">Ver todas →</button>
          </div>
          {openOpportunities.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">
              <p>Nenhuma oportunidade disponível no momento.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {openOpportunities.slice(0, 4).map(req => (
                <button
                  key={req.id}
                  onClick={() => navigate('operator-opportunities', req.id)}
                  className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center shrink-0 text-orange-500 text-lg">
                    {req.wasteCategory?.includes('EPI') ? '🦺' : req.wasteCategory?.includes('industrial') ? '🏭' : '♻️'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-600 text-sm text-gray-900">{req.wasteType}</p>
                    <p className="text-xs text-gray-500">{req.quantity} {req.unit} · {req.desiredDate}</p>
                  </div>
                  <div className="shrink-0">
                    <span className="text-xs text-orange-600 font-semibold">Nova →</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* My specialties */}
      <div className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
        <h3 className="font-display font-700 text-green-900 mb-3">Minhas especialidades</h3>
        <div className="flex flex-wrap gap-2">
          {myOp.specialties.map(s => (
            <span key={s} className="px-3 py-1.5 bg-white rounded-xl border border-green-200 text-green-700 text-sm font-medium">{s}</span>
          ))}
        </div>
        <p className="text-xs text-green-600 mt-3">As oportunidades são filtradas automaticamente com base nas suas especialidades.</p>
      </div>
    </div>
  );
}
