import React, { useState } from 'react';
import { useApp } from '../../context';
import { PageHeader, CollectionStatusBadge, Btn, Modal, Badge } from '../../components/ui';
import { IconTruck, IconChevronLeft } from '../../components/Icons';
import type { Collection } from '../../types';

const MY_OPERATOR_ID = 'op3';

function CollectionActionBtn({ col, setDetailId }: { col: Collection; setDetailId: (id: string) => void }) {
  const { updateCollectionStatus } = useApp();
  if (col.status === 'scheduled') {
    return (
      <Btn size="sm" variant="orange" onClick={() => updateCollectionStatus(col.id, 'in_progress')}>
        Iniciar coleta
      </Btn>
    );
  }
  if (col.status === 'in_progress') {
    return (
      <Btn size="sm" onClick={() => updateCollectionStatus(col.id, 'done')}>
        Finalizar coleta
      </Btn>
    );
  }
  if (col.status === 'done') {
    return (
      <Btn size="sm" onClick={() => setDetailId(col.id)}>
        Confirmar destinação
      </Btn>
    );
  }
  return null;
}

const DESTINATION_TYPES = [
  'Reciclagem', 'Recuperação', 'Reutilização', 'Tratamento',
  'Destinação final adequada', 'Tratamento e destinação final adequada', 'Outra'
];

function DestinationModal({ open, onClose, collectionId }: { open: boolean; onClose: () => void; collectionId: string }) {
  const { confirmDestination } = useApp();
  const [form, setForm] = useState({
    destinationType: '',
    quantity: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [done, setDone] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.destinationType || !form.quantity) return;
    confirmDestination(collectionId, {
      collectionId,
      destinationType: form.destinationType,
      quantity: Number(form.quantity),
      date: new Date(form.date).toLocaleDateString('pt-BR'),
      notes: form.notes,
    });
    setDone(true);
    setTimeout(() => { onClose(); setDone(false); }, 1500);
  };

  if (done) {
    return (
      <Modal open={open} onClose={onClose} title="" size="sm">
        <div className="p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h3 className="font-display font-700 text-green-900">Destinação confirmada!</h3>
          <p className="text-gray-500 text-sm mt-2">O registro foi atualizado e a empresa foi notificada.</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={onClose} title="Confirmar destinação" size="md">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Tipo de destinação</label>
          <div className="grid grid-cols-2 gap-2">
            {DESTINATION_TYPES.map(d => (
              <button key={d} type="button"
                onClick={() => setForm(f => ({ ...f, destinationType: d }))}
                className={`px-3 py-2 rounded-xl border text-xs font-medium text-left transition-all ${
                  form.destinationType === d ? 'bg-green-600 text-white border-green-600' : 'bg-white border-gray-200 text-gray-600 hover:border-green-300'
                }`}>{d}</button>
            ))}
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Quantidade efetiva (kg)</label>
            <input type="number" min="0" placeholder="148" value={form.quantity}
              onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} required
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Data</label>
            <input type="date" value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Observações</label>
          <textarea rows={3} placeholder="Referência do documento, MTR, observações..."
            value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
        </div>
        <div className="flex gap-3 pt-2">
          <Btn variant="outline" full onClick={onClose} type="button">Cancelar</Btn>
          <Btn full type="submit" disabled={!form.destinationType || !form.quantity}>
            Confirmar destinação
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

function CollectionDetail({ col, onBack }: { col: Collection; onBack: () => void }) {
  const { requests, updateCollectionStatus, destinations } = useApp();
  const [destModal, setDestModal] = useState(false);
  const req = requests.find(r => r.id === col.requestId);
  const dest = destinations.find(d => d.collectionId === col.id);

  if (!req) return null;

  const nextAction = col.status === 'scheduled'
    ? { label: 'Iniciar coleta', next: 'in_progress' as const, color: 'orange' as const }
    : col.status === 'in_progress'
    ? { label: 'Finalizar coleta', next: 'done' as const, color: 'primary' as const }
    : null;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
          <IconChevronLeft size={18} />
        </button>
        <div>
          <h1 className="font-display font-800 text-xl text-gray-900">Coleta — {req.wasteType}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <CollectionStatusBadge status={col.status} />
            <span className="text-gray-400 text-xs">·</span>
            <span className="text-xs text-gray-500">{col.scheduledDate}</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-display font-700 text-gray-900 mb-4 text-sm">Detalhes do chamado</h3>
          <div className="space-y-2">
            {[
              ['Resíduo', req.wasteType],
              ['Quantidade', `${req.quantity} ${req.unit}`],
              ['Condição', req.condition],
              ['Endereço', req.location],
              ['Data agendada', col.scheduledDate],
              ['Serviço', req.desiredDestination],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2 text-xs">
                <span className="text-gray-400">{k}</span>
                <span className="text-gray-700 font-medium text-right">{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-display font-700 text-gray-900 mb-4 text-sm">Status da operação</h3>
          <div className="space-y-3">
            {([
              { key: 'scheduled', label: 'Agendada' },
              { key: 'in_progress', label: 'Em coleta' },
              { key: 'done', label: 'Coleta realizada' },
              { key: 'destination_confirmed', label: 'Destinação confirmada' },
            ] as const).map((step, i, arr) => {
              const statusOrder = { scheduled: 0, in_progress: 1, done: 2, destination_confirmed: 3 };
              const done = statusOrder[col.status] >= statusOrder[step.key];
              const active = col.status === step.key;
              return (
                <div key={step.key} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 shrink-0 ${
                    done ? 'bg-green-600 border-green-600 text-white' :
                    active ? 'border-green-600 text-green-600 bg-white' :
                    'border-gray-200 text-gray-300 bg-white'
                  }`}>
                    {done ? '✓' : ''}
                  </div>
                  <span className={`text-sm ${done ? 'text-gray-700 font-medium' : active ? 'text-green-700 font-semibold' : 'text-gray-300'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Destination info */}
      {dest && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-4">
          <h3 className="font-display font-700 text-green-900 mb-3 text-sm">Destinação confirmada</h3>
          <div className="space-y-1 text-sm">
            <p><span className="text-gray-500">Tipo:</span> <strong>{dest.destinationType}</strong></p>
            <p><span className="text-gray-500">Quantidade:</span> <strong>{dest.quantity} kg</strong></p>
            <p><span className="text-gray-500">Data:</span> <strong>{dest.date}</strong></p>
          </div>
          {dest.notes && <p className="text-xs text-gray-600 mt-2 italic">{dest.notes}</p>}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {nextAction && (
          <Btn
            full
            size="lg"
            variant={nextAction.color === 'orange' ? 'orange' : 'primary'}
            onClick={() => updateCollectionStatus(col.id, nextAction.next)}
          >
            {nextAction.label}
          </Btn>
        )}
        {col.status === 'done' && !dest && (
          <Btn full size="lg" onClick={() => setDestModal(true)}>
            Confirmar destinação
          </Btn>
        )}
      </div>

      <DestinationModal open={destModal} onClose={() => setDestModal(false)} collectionId={col.id} />
    </div>
  );
}

export default function Collections() {
  const { collections, requests, viewParam } = useApp();
  const [detailId, setDetailId] = useState<string | null>(viewParam || null);

  const myCollections = collections.filter(c => c.operatorId === MY_OPERATOR_ID);

  if (detailId) {
    const col = myCollections.find(c => c.id === detailId);
    if (col) return <CollectionDetail col={col} onBack={() => setDetailId(null)} />;
  }

  const active = myCollections.filter(c => c.status !== 'destination_confirmed');
  const done = myCollections.filter(c => c.status === 'destination_confirmed');

  return (
    <div className="p-6">
      <PageHeader title="Minhas Coletas" subtitle="Gerencie e atualize o status das suas coletas." />

      {myCollections.length === 0 ? (
        <div className="text-center py-16">
          <IconTruck size={32} className="mx-auto mb-3 text-gray-300" />
          <p className="font-display font-600 text-gray-700 mb-2">Nenhuma coleta registrada</p>
          <p className="text-gray-400 text-sm">As coletas aparecerão aqui quando uma proposta for aceita.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {active.length > 0 && (
            <div>
              <h2 className="font-display font-700 text-gray-900 mb-3">Ativas ({active.length})</h2>
              <div className="space-y-3">
                {active.map(col => {
                  const req = requests.find(r => r.id === col.requestId);
                  return (
                    <div
                      key={col.id}
                      className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all"
                    >
                      <div className="p-4 flex items-start gap-3">
                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                          <IconTruck size={18} className="text-orange-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-display font-700 text-gray-900">{req?.wasteType}</span>
                            <CollectionStatusBadge status={col.status} />
                          </div>
                          <p className="text-xs text-gray-500">Empresa Eco Industrial · {req?.quantity} {req?.unit} · {req?.location?.split('—')[0].trim()}</p>
                          <p className="text-xs text-gray-400 mt-1">📅 {col.scheduledDate}</p>
                        </div>
                      </div>
                      <div className="px-4 pb-3 flex gap-2">
                        <Btn variant="outline" size="sm" onClick={() => setDetailId(col.id)}>Ver detalhes</Btn>
                        <CollectionActionBtn col={col} setDetailId={setDetailId} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {done.length > 0 && (
            <div>
              <h2 className="font-display font-700 text-gray-700 text-sm mb-3">Concluídas ({done.length})</h2>
              <div className="space-y-2">
                {done.map(col => {
                  const req = requests.find(r => r.id === col.requestId);
                  return (
                    <button
                      key={col.id}
                      onClick={() => setDetailId(col.id)}
                      className="w-full bg-gray-50 rounded-xl border border-gray-100 p-4 flex items-center gap-3 text-left hover:bg-white transition-colors"
                    >
                      <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center shrink-0 text-green-600 text-sm">✓</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-600 text-sm text-gray-700">{req?.wasteType}</p>
                        <p className="text-xs text-gray-400">{req?.quantity} {req?.unit} · {col.scheduledDate}</p>
                      </div>
                      <CollectionStatusBadge status={col.status} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
