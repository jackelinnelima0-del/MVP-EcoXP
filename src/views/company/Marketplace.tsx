import React, { useState } from 'react';
import { useApp } from '../../context';
import { PageHeader, Badge, StarRating, Btn } from '../../components/ui';
import { IconFilter, IconCheck, IconAlertCircle } from '../../components/Icons';
import { OPERATORS } from '../../data';
import type { Operator } from '../../types';

const WASTE_FILTERS = ['Todos', 'Papel/Papelão', 'Plástico', 'Metal', 'Vidro', 'Eletrônicos', 'EPIs', 'Contaminados', 'Industriais', 'Lâmpadas', 'Outros'];
const OPERATOR_TYPES = ['Todos', 'Cooperativa', 'Recicladora', 'Tratadora', 'Destinadora', 'Transportadora', 'Operador especializado'];
const SERVICES = ['Todos', 'Coleta', 'Transporte', 'Reciclagem', 'Tratamento', 'Recuperação', 'Destinação'];
const DISTANCES = ['Qualquer', 'Até 10 km', 'Até 25 km', 'Até 50 km'];
const RATINGS = ['Todas', '4,5+', '4,0+'];

function CompatibilityTag({ match, label }: { match: 'ok' | 'warn' | 'none'; label: string }) {
  if (match === 'none') return null;
  return (
    <div className={`flex items-center gap-1 text-xs ${match === 'ok' ? 'text-green-600' : 'text-amber-600'}`}>
      {match === 'ok' ? <IconCheck size={12} /> : <IconAlertCircle size={12} />}
      {label}
    </div>
  );
}

function OperatorCard({ op, onView }: { op: Operator; onView: () => void }) {
  const { requests } = useApp();
  const activeReq = requests.find(r => r.status === 'receiving_proposals');

  const specialtyMatch = activeReq && op.specialties.some(s =>
    activeReq.wasteType.toLowerCase().includes(s.toLowerCase()) ||
    s.toLowerCase().includes(activeReq.wasteType.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-700 text-gray-900">{op.name}</h3>
            <span className="text-xs text-gray-500">{op.type}</span>
          </div>
          <div className="text-right shrink-0">
            <StarRating value={op.rating} />
            <p className="text-xs text-gray-400 mt-0.5">{op.distance} km</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {op.specialties.map(s => <Badge key={s} color="gray">{s}</Badge>)}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div className="bg-gray-50 rounded-lg px-2.5 py-1.5">
            <p className="text-gray-400">Capacidade</p>
            <p className="font-semibold text-gray-700">{op.capacity}</p>
          </div>
          <div className="bg-gray-50 rounded-lg px-2.5 py-1.5">
            <p className="text-gray-400">Área</p>
            <p className="font-semibold text-gray-700 truncate">{op.serviceArea.split(' e ')[0]}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {op.services.map(s => <Badge key={s} color="green">{s}</Badge>)}
        </div>

        {/* Compatibility */}
        {activeReq && (
          <div className="border-t border-gray-50 pt-3 space-y-1">
            <CompatibilityTag match={specialtyMatch ? 'ok' : 'warn'} label={specialtyMatch ? 'Especialidade compatível' : 'Necessita avaliação'} />
            <CompatibilityTag match="ok" label="Atende sua região" />
            <CompatibilityTag match={op.capacity.includes('1,5') ? 'warn' : 'ok'} label={op.capacity.includes('1,5') ? 'Capacidade limitada' : 'Capacidade disponível'} />
          </div>
        )}
      </div>
      <div className="px-5 pb-4">
        <Btn full variant="outline" size="sm" onClick={onView}>Ver perfil e contratar</Btn>
      </div>
    </div>
  );
}

export default function Marketplace() {
  const { navigate } = useApp();
  const [wasteFilter, setWasteFilter] = useState('Todos');
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [serviceFilter, setServiceFilter] = useState('Todos');
  const [distFilter, setDistFilter] = useState('Qualquer');
  const [ratingFilter, setRatingFilter] = useState('Todas');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = OPERATORS.filter(op => {
    if (wasteFilter !== 'Todos') {
      const wl = wasteFilter.toLowerCase();
      const hasMatch = op.specialties.some(s => s.toLowerCase().includes(wl.split('/')[0])) ||
        op.materialsAccepted.some(m => m.toLowerCase().includes(wl.split('/')[0]));
      if (!hasMatch) return false;
    }
    if (typeFilter !== 'Todos' && !op.type.toLowerCase().includes(typeFilter.toLowerCase())) return false;
    if (serviceFilter !== 'Todos' && !op.services.includes(serviceFilter)) return false;
    if (distFilter !== 'Qualquer') {
      const km = parseInt(distFilter.replace(/\D/g, ''));
      if (op.distance > km) return false;
    }
    if (ratingFilter === '4,5+' && op.rating < 4.5) return false;
    if (ratingFilter === '4,0+' && op.rating < 4.0) return false;
    return true;
  });

  const FilterChip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button onClick={onClick} className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all whitespace-nowrap ${
      active ? 'bg-green-600 text-white border-green-600' : 'bg-white border-gray-200 text-gray-600 hover:border-green-300'
    }`}>{label}</button>
  );

  return (
    <div className="p-6">
      <PageHeader
        title="Marketplace de Resíduos"
        subtitle="Encontre operadores especializados para cada necessidade."
      />

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-600 text-gray-700 text-sm">Filtros</h3>
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700">
            <IconFilter size={14} /> {showFilters ? 'Menos filtros' : 'Mais filtros'}
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-400 mb-1.5 font-medium">Tipo de resíduo</p>
            <div className="flex gap-2 flex-wrap">
              {WASTE_FILTERS.map(f => <FilterChip key={f} label={f} active={wasteFilter === f} onClick={() => setWasteFilter(f)} />)}
            </div>
          </div>
          {showFilters && (
            <>
              <div>
                <p className="text-xs text-gray-400 mb-1.5 font-medium">Tipo de operador</p>
                <div className="flex gap-2 flex-wrap">
                  {OPERATOR_TYPES.map(f => <FilterChip key={f} label={f} active={typeFilter === f} onClick={() => setTypeFilter(f)} />)}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1.5 font-medium">Serviço</p>
                <div className="flex gap-2 flex-wrap">
                  {SERVICES.map(f => <FilterChip key={f} label={f} active={serviceFilter === f} onClick={() => setServiceFilter(f)} />)}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1.5 font-medium">Distância</p>
                  <div className="flex gap-2 flex-wrap">
                    {DISTANCES.map(f => <FilterChip key={f} label={f} active={distFilter === f} onClick={() => setDistFilter(f)} />)}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1.5 font-medium">Avaliação</p>
                  <div className="flex gap-2 flex-wrap">
                    {RATINGS.map(f => <FilterChip key={f} label={f} active={ratingFilter === f} onClick={() => setRatingFilter(f)} />)}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{filtered.length} operador{filtered.length !== 1 ? 'es' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(op => (
          <OperatorCard key={op.id} op={op} onView={() => navigate('company-operators', op.id)} />
        ))}
        {filtered.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3 text-center py-12 text-gray-400">
            <p className="font-medium">Nenhum operador encontrado</p>
            <p className="text-sm mt-1">Tente ajustar os filtros</p>
          </div>
        )}
      </div>
    </div>
  );
}
