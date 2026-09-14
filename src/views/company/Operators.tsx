import React, { useState } from 'react';
import { useApp } from '../../context';
import { PageHeader, Badge, StarRating, Btn } from '../../components/ui';
import { OPERATORS } from '../../data';
import { IconChevronLeft } from '../../components/Icons';
import type { Operator } from '../../types';

function OperatorProfile({ op, onBack }: { op: Operator; onBack: () => void }) {
  const { navigate } = useApp();
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
          <IconChevronLeft size={18} />
        </button>
        <h1 className="font-display font-800 text-xl text-gray-900">Perfil do operador</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-400" />
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h2 className="font-display font-800 text-2xl text-gray-900">{op.name}</h2>
              <p className="text-gray-500">{op.type}</p>
              <div className="flex items-center gap-3 mt-2">
                <StarRating value={op.rating} />
                <span className="text-sm text-gray-400">{op.distance} km de distância</span>
              </div>
            </div>
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-2xl shrink-0">♻️</div>
          </div>

          <p className="text-gray-600 text-sm mb-6 leading-relaxed">{op.description}</p>

          <div className="grid sm:grid-cols-2 gap-5 mb-6">
            <div>
              <h3 className="font-display font-700 text-gray-900 text-sm mb-2">Especialidades</h3>
              <div className="flex flex-wrap gap-1.5">
                {op.specialties.map(s => <Badge key={s} color="green">{s}</Badge>)}
              </div>
            </div>
            <div>
              <h3 className="font-display font-700 text-gray-900 text-sm mb-2">Serviços oferecidos</h3>
              <div className="flex flex-wrap gap-1.5">
                {op.services.map(s => <Badge key={s} color="blue">{s}</Badge>)}
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 mb-6">
            <div>
              <h3 className="font-display font-700 text-gray-900 text-sm mb-2">Materiais aceitos</h3>
              <div className="flex flex-wrap gap-1.5">
                {op.materialsAccepted.map(m => <Badge key={m} color="gray">{m}</Badge>)}
              </div>
            </div>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">Capacidade</p>
                <p className="font-display font-700 text-gray-900">{op.capacity}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">Área de atendimento</p>
                <p className="font-display font-600 text-gray-700 text-sm">{op.serviceArea}</p>
              </div>
            </div>
          </div>

          <Btn full onClick={() => navigate('company-requests')}>
            Ver meus chamados para contratar
          </Btn>
        </div>
      </div>
    </div>
  );
}

export default function Operators() {
  const { viewParam } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(viewParam || null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('Todos');

  if (selectedId) {
    const op = OPERATORS.find(o => o.id === selectedId);
    if (op) return <OperatorProfile op={op} onBack={() => setSelectedId(null)} />;
  }

  const types = ['Todos', ...Array.from(new Set(OPERATORS.map(o => o.type)))];
  const filtered = OPERATORS.filter(op => {
    const q = search.toLowerCase();
    const matchSearch = !search || op.name.toLowerCase().includes(q) || op.specialties.some(s => s.toLowerCase().includes(q));
    const matchType = typeFilter === 'Todos' || op.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="p-6">
      <PageHeader title="Operadores de Resíduos" subtitle="Diretório de operadores especializados disponíveis na plataforma." />

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6 flex gap-3 flex-wrap">
        <input
          type="text" placeholder="Buscar por nome ou especialidade..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[180px] px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <div className="flex gap-2 flex-wrap">
          {types.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                typeFilter === t ? 'bg-green-600 text-white border-green-600' : 'bg-white border-gray-200 text-gray-600 hover:border-green-300'
              }`}>{t}</button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(op => (
          <button
            key={op.id}
            onClick={() => setSelectedId(op.id)}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-left hover:shadow-md hover:border-green-200 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-display font-700 text-gray-900 text-sm">{op.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{op.type}</p>
              </div>
              <StarRating value={op.rating} />
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              {op.specialties.slice(0, 3).map(s => <Badge key={s} color="gray">{s}</Badge>)}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{op.distance} km · {op.capacity}</span>
              <span className="text-green-600 font-semibold">Ver perfil →</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
