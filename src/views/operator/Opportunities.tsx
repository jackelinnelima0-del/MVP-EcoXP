import React, { useState } from 'react';
import { useApp } from '../../context';
import { PageHeader, Badge, Btn, RequestStatusBadge, Modal } from '../../components/ui';
import { IconFilter, IconPackage, IconChevronLeft } from '../../components/Icons';
import type { WasteRequest } from '../../types';

const MY_OPERATOR_ID = 'op3';

const COMPATIBILITY_SCORES: Record<string, number> = {
  'EPIs contaminados': 98,
  'Resíduos industriais': 95,
  'Lâmpadas fluorescentes': 90,
  'Resíduos contaminados': 97,
  'Papelão': 72,
  'default': 65,
};

function getCompatibility(req: WasteRequest): number {
  return COMPATIBILITY_SCORES[req.wasteType] || COMPATIBILITY_SCORES['default'];
}

function CompatibilityBadge({ score }: { score: number }) {
  const color = score >= 90 ? 'text-green-700 bg-green-50 border-green-200' : score >= 75 ? 'text-orange-700 bg-orange-50 border-orange-200' : 'text-gray-600 bg-gray-50 border-gray-200';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${color}`}>
      ⚡ {score}% compatível
    </span>
  );
}

function ProposalModal({ open, onClose, requestId }: { open: boolean; onClose: () => void; requestId: string }) {
  const { submitProposal } = useApp();
  const [form, setForm] = useState({
    value: '',
    availableDate: '',
    availableTime: '08:00',
    services: [] as string[],
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const SERVICES = ['Coleta', 'Transporte', 'Tratamento', 'Reciclagem', 'Recuperação', 'Destinação'];

  const toggleService = (s: string) => {
    setForm(f => ({ ...f, services: f.services.includes(s) ? f.services.filter(x => x !== s) : [...f.services, s] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.value || !form.availableDate || form.services.length === 0) return;
    submitProposal({
      requestId,
      operatorId: MY_OPERATOR_ID,
      value: Number(form.value),
      availableDate: new Date(form.availableDate).toLocaleDateString('pt-BR'),
      availableTime: form.availableTime,
      services: form.services,
      notes: form.notes,
    });
    setSubmitted(true);
    setTimeout(() => { onClose(); setSubmitted(false); setForm({ value: '', availableDate: '', availableTime: '08:00', services: [], notes: '' }); }, 1500);
  };

  if (submitted) {
    return (
      <Modal open={open} onClose={onClose} title="Proposta enviada" size="sm">
        <div className="p-8 text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h3 className="font-display font-700 text-green-900 mb-1">Proposta enviada com sucesso!</h3>
          <p className="text-gray-500 text-sm">A empresa será notificada da sua proposta.</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={onClose} title="Enviar proposta" size="md">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Valor (R$)</label>
            <input type="number" min="0" placeholder="800" value={form.value}
              onChange={e => setForm(f => ({ ...f, value: e.target.value }))} required
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Horário disponível</label>
            <input type="time" value={form.availableTime}
              onChange={e => setForm(f => ({ ...f, availableTime: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Data disponível</label>
          <input type="date" value={form.availableDate}
            onChange={e => setForm(f => ({ ...f, availableDate: e.target.value }))} required
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Serviço oferecido</label>
          <div className="flex gap-2 flex-wrap">
            {SERVICES.map(s => (
              <button key={s} type="button"
                onClick={() => toggleService(s)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                  form.services.includes(s) ? 'bg-green-600 text-white border-green-600' : 'bg-white border-gray-200 text-gray-600 hover:border-green-300'
                }`}>{s}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Observações</label>
          <textarea rows={3} placeholder="Informações adicionais sobre sua proposta..."
            value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
        </div>
        <div className="flex gap-3 pt-2">
          <Btn variant="outline" full onClick={onClose} type="button">Cancelar</Btn>
          <Btn full type="submit" disabled={!form.value || !form.availableDate || form.services.length === 0}>
            Enviar proposta
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

function OpportunityDetail({ req, onBack }: { req: WasteRequest; onBack: () => void }) {
  const { proposals } = useApp();
  const [proposalOpen, setProposalOpen] = useState(false);
  const alreadySent = proposals.find(p => p.requestId === req.id && p.operatorId === MY_OPERATOR_ID);
  const score = getCompatibility(req);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
          <IconChevronLeft size={18} />
        </button>
        <div>
          <h1 className="font-display font-800 text-xl text-gray-900">Chamado #{req.number}</h1>
          <p className="text-gray-500 text-sm">{req.wasteType} · Empresa Eco Industrial</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-display font-700 text-gray-900 mb-4">Necessidade</h3>
          <div className="space-y-2 text-sm">
            {[
              ['Resíduo', req.wasteType],
              ['Quantidade', `${req.quantity} ${req.unit}`],
              ['Condição', req.condition],
              ['Local', req.location],
              ['Data desejada', req.desiredDate],
              ['Transporte', req.needsTransport ? 'Sim' : 'Não'],
              ['Tratamento', req.needsTreatment],
              ['Destinação', req.desiredDestination],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2">
                <span className="text-gray-400 text-xs">{k}</span>
                <span className="text-gray-700 text-xs font-medium text-right">{v}</span>
              </div>
            ))}
          </div>
          {req.notes && <p className="text-xs text-gray-500 mt-3 italic border-t border-gray-50 pt-3">{req.notes}</p>}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-display font-700 text-gray-900 mb-3">Compatibilidade</h3>
            <div className="flex items-center justify-center py-4">
              <CompatibilityBadge score={score} />
            </div>
            <div className="space-y-2">
              {[
                { ok: score >= 90, label: 'Especialidade compatível' },
                { ok: true, label: 'Atende sua região' },
                { ok: req.needsTreatment === 'Sim' ? true : true, label: 'Capacidade disponível' },
                { ok: req.needsTransport, label: 'Necessita transporte — disponível' },
              ].map(({ ok, label }) => (
                <div key={label} className={`flex items-center gap-2 text-xs ${ok ? 'text-green-600' : 'text-gray-400'}`}>
                  <span>{ok ? '✓' : '○'}</span> {label}
                </div>
              ))}
            </div>
          </div>

          {alreadySent ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-green-700 font-semibold text-sm">✓ Proposta já enviada</p>
              <p className="text-xs text-green-600 mt-1">R$ {alreadySent.value.toLocaleString('pt-BR')} · {alreadySent.availableDate}</p>
            </div>
          ) : (
            <Btn full size="lg" onClick={() => setProposalOpen(true)}>
              Enviar proposta
            </Btn>
          )}
        </div>
      </div>

      <ProposalModal open={proposalOpen} onClose={() => setProposalOpen(false)} requestId={req.id} />
    </div>
  );
}

export default function Opportunities() {
  const { requests, proposals, viewParam } = useApp();
  const [detailId, setDetailId] = useState<string | null>(viewParam || null);
  const [proposalModal, setProposalModal] = useState<string | null>(null);
  const [wasteFilter, setWasteFilter] = useState('Todos');
  const [sortBy, setSortBy] = useState<'date' | 'compat'>('compat');

  if (detailId) {
    const req = requests.find(r => r.id === detailId);
    if (req) return <OpportunityDetail req={req} onBack={() => setDetailId(null)} />;
  }

  const allOpportunities = requests.filter(r => r.status === 'receiving_proposals');
  const myProposals = proposals.filter(p => p.operatorId === MY_OPERATOR_ID);

  const withProposal = allOpportunities.filter(r => myProposals.find(p => p.requestId === r.id));
  const withoutProposal = allOpportunities.filter(r => !myProposals.find(p => p.requestId === r.id));

  const wasteTypes = ['Todos', ...Array.from(new Set(allOpportunities.map(r => r.wasteType)))];
  const filtered = withoutProposal.filter(r => wasteFilter === 'Todos' || r.wasteType === wasteFilter);
  const sorted = [...filtered].sort((a, b) =>
    sortBy === 'compat' ? getCompatibility(b) - getCompatibility(a) : a.desiredDate.localeCompare(b.desiredDate)
  );

  return (
    <div className="p-6">
      <PageHeader
        title="Oportunidades"
        subtitle="Necessidades compatíveis com seu perfil e especialidades."
      />

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6 flex gap-3 flex-wrap items-center">
        <div className="flex gap-2 flex-wrap flex-1">
          {wasteTypes.map(t => (
            <button key={t} onClick={() => setWasteFilter(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                wasteFilter === t ? 'bg-orange-500 text-white border-orange-500' : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300'
              }`}>{t}</button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Ordenar:</span>
          <button onClick={() => setSortBy('compat')} className={`px-2.5 py-1 rounded-lg ${sortBy === 'compat' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>Compatibilidade</button>
          <button onClick={() => setSortBy('date')} className={`px-2.5 py-1 rounded-lg ${sortBy === 'date' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>Data</button>
        </div>
      </div>

      {/* Open opportunities */}
      <div className="space-y-3 mb-8">
        <h2 className="font-display font-700 text-gray-900">Aguardando proposta <span className="text-gray-400 font-normal">({sorted.length})</span></h2>
        {sorted.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
            <IconPackage size={28} className="mx-auto mb-2 opacity-30" />
            <p className="font-medium">Nenhuma oportunidade disponível</p>
            <p className="text-sm mt-1">Novas necessidades aparecerão aqui quando publicadas.</p>
          </div>
        )}
        {sorted.map(req => {
          const score = getCompatibility(req);
          return (
            <div key={req.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:border-orange-200 transition-all">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-xl shrink-0">
                    {req.wasteCategory?.includes('EPI') ? '🦺' : req.wasteCategory?.includes('industrial') ? '🏭' : '♻️'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-display font-700 text-gray-900">{req.wasteType}</span>
                      <CompatibilityBadge score={score} />
                    </div>
                    <div className="flex items-center gap-3 flex-wrap text-xs text-gray-500">
                      <span>{req.quantity} {req.unit}</span>
                      <span>·</span>
                      <span>{req.condition}</span>
                      <span>·</span>
                      <span>{req.location.split('—')[0].trim()}</span>
                      <span>·</span>
                      <span>📅 {req.desiredDate}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {req.desiredDestination && <Badge color="orange">{req.desiredDestination}</Badge>}
                  {req.needsTransport && <Badge color="blue">Transporte necessário</Badge>}
                  {req.needsTreatment === 'Sim' && <Badge color="red">Tratamento necessário</Badge>}
                </div>
              </div>
              <div className="px-4 pb-3 flex gap-2">
                <Btn variant="outline" size="sm" onClick={() => setDetailId(req.id)}>Ver detalhes</Btn>
                <Btn size="sm" variant="orange" onClick={() => setProposalModal(req.id)}>
                  Enviar proposta
                </Btn>
              </div>
            </div>
          );
        })}
      </div>

      {/* Already proposed */}
      {withProposal.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display font-700 text-gray-700 text-sm">Proposta já enviada ({withProposal.length})</h2>
          {withProposal.map(req => {
            const prop = myProposals.find(p => p.requestId === req.id)!;
            return (
              <div key={req.id} className="bg-gray-50 rounded-xl border border-gray-100 p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-display font-600 text-sm text-gray-700">{req.wasteType}</p>
                  <p className="text-xs text-gray-500">{req.quantity} {req.unit} · {req.desiredDate}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">R$ {prop.value.toLocaleString('pt-BR')}</p>
                  <Badge color="blue">Enviada</Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {proposalModal && (
        <ProposalModal open={true} onClose={() => setProposalModal(null)} requestId={proposalModal} />
      )}
    </div>
  );
}
