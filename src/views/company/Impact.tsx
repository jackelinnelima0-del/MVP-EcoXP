import React from 'react';
import { useApp } from '../../context';
import { PageHeader, KpiCard } from '../../components/ui';
import { IconLeaf, IconPackage, IconTruck, IconActivity, IconInfo } from '../../components/Icons';
import { OPERATORS } from '../../data';

export default function Impact() {
  const { impact, destinations, collections, requests } = useApp();

  const history = destinations.map(d => {
    const col = collections.find(c => c.id === d.collectionId);
    const req = col ? requests.find(r => r.id === col.requestId) : null;
    const op = col ? OPERATORS.find(o => o.id === col.operatorId) : null;
    return { d, req, op, col };
  }).filter(x => x.req && x.op);

  return (
    <div className="p-6">
      <PageHeader
        title="Impacto"
        subtitle="Registro do impacto ambiental estimado das operações realizadas."
      />

      <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-medium mb-6">
        <IconInfo size={14} /> Dados demonstrativos do protótipo
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Kg destinados" value={`${impact.totalKg.toLocaleString('pt-BR')} kg`} icon={<IconPackage size={20}/>} />
        <KpiCard label="Materiais recuperados" value={impact.materialsRecovered} icon={<IconLeaf size={20}/>} />
        <KpiCard label="Operações concluídas" value={impact.operationsCount} icon={<IconTruck size={20}/>} accent="bg-orange-50 text-orange-600" />
        <KpiCard label="CO₂e estimado evitado" value={`${impact.co2eAvoided} kg`} sub="estimativa demonstrativa" icon={<IconActivity size={20}/>} accent="bg-emerald-50 text-emerald-600" />
      </div>

      {/* CO2e section */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-6">
        <h2 className="font-display font-800 text-xl text-green-900 mb-2">CO₂e estimado evitado</h2>
        <div className="flex items-end gap-3 mb-3">
          <span className="font-display font-800 text-4xl text-green-700">{impact.co2eAvoided} kg</span>
          <span className="text-green-600 text-sm mb-1">CO₂e estimado</span>
        </div>
        <p className="text-green-700 text-sm leading-relaxed mb-4">
          Estimativa demonstrativa baseada no tipo e quantidade de material registrado. Cada material possui um fator de estimativa diferente.
        </p>
        <div className="bg-white/60 rounded-xl p-3 border border-green-200">
          <p className="text-xs text-green-800 font-semibold mb-1">⚠️ Aviso importante</p>
          <p className="text-xs text-green-700">
            Este valor é uma estimativa demonstrativa para fins de visualização. Não representa crédito de carbono, redução certificada ou ativo ambiental de qualquer natureza. Para certificação ambiental oficial, consulte um especialista.
          </p>
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="font-display font-700 text-gray-900">Histórico de destinações</h2>
        </div>
        {history.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            <IconLeaf size={32} className="mx-auto mb-3 opacity-30" />
            <p>Nenhuma destinação registrada ainda.</p>
            <p className="text-xs mt-1">Os dados aparecerão aqui após a primeira coleta ser confirmada.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {history.map(({ d, req, op }) => (
              <div key={d.id} className="px-5 py-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                  <IconLeaf size={18} className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-600 text-sm text-gray-900">{req?.wasteType}</p>
                  <p className="text-xs text-gray-500">{op?.name} · {d.destinationType}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-semibold text-gray-900">{d.quantity} kg</p>
                  <p className="text-xs text-green-600">{d.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Material breakdown */}
      <div className="mt-6 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-display font-700 text-gray-900 mb-4">Fatores de estimativa utilizados</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Papelão/Papel', factor: '0,4 kg CO₂e/kg' },
            { label: 'Plástico', factor: '1,5 kg CO₂e/kg' },
            { label: 'Metal/Sucata', factor: '2,5 kg CO₂e/kg' },
            { label: 'Eletroeletrônicos', factor: '3,0 kg CO₂e/kg' },
            { label: 'EPIs/Contaminados', factor: '1,0 kg CO₂e/kg' },
            { label: 'Resíduos industriais', factor: '0,8 kg CO₂e/kg' },
          ].map(item => (
            <div key={item.label} className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">{item.label}</p>
              <p className="font-display font-600 text-sm text-gray-900">{item.factor}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">Fatores demonstrativos para fins de visualização. Não representam certificação.</p>
      </div>
    </div>
  );
}
