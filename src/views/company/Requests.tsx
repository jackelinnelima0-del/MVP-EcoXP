import React, { useState } from 'react';
import { useApp } from '../../context';
import {
  PageHeader, RequestStatusBadge, Btn, Badge, Modal, EmptyState, StarRating, TimelineStep
} from '../../components/ui';
import { IconPlus, IconEye, IconList, IconChevronLeft, IconCheck, IconX } from '../../components/Icons';
import { OPERATORS } from '../../data';
import type { WasteRequest } from '../../types';

function statusOrder(s: WasteRequest['status']): number {
  const map = { receiving_proposals: 0, operator_selected: 1, collection_scheduled: 2, in_collection: 3, collection_done: 4, destination_confirmed: 5 };
  return map[s] ?? 0;
}

function RequestTimeline({ status }: { status: WasteRequest['status'] }) {
  const steps = [
    'Necessidade publicada',
    'Recebendo propostas',
    'Operador selecionado',
    'Coleta agendada',
    'Em coleta',
    'Coleta realizada',
    'Destinação confirmada',
  ];
  const statusOrder: Record<string, number> = {
    receiving_proposals: 1,
    operator_selected: 2,
    collection_scheduled: 3,
    in_collection: 4,
    collection_done: 5,
    destination_confirmed: 6,
  };
  const current = statusOrder[status] ?? 1;
  return (
    <div className="py-2">
      {steps.map((s, i) => (
        <TimelineStep key={s} label={s} done={i < current} active={i === current} last={i === steps.length - 1} />
      ))}
    </div>
  );
}

function ProposalCard({ proposal, requestId, canSelect }: { proposal: any; requestId: string; canSelect: boolean }) {
  const { compareIds, toggleCompare, selectOperator, navigate } = useApp();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const op = OPERATORS.find(o => o.id === proposal.operatorId);
  if (!op) return null;

  const isInCompare = compareIds.includes(proposal.id);

  return (
    <div className={`bg-white rounded-xl border p-4 transition-all ${
      proposal.status === 'accepted' ? 'border-green-300 bg-green-50/30' :
      proposal.status === 'not_selected' ? 'border-gray-100 opacity-60' :
      'border-gray-200 hover:border-gray-300 hover:shadow-sm'
    }`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display font-700 text-gray-900">{op.name}</span>
            {proposal.status === 'accepted' && <Badge color="green">✓ Selecionado</Badge>}
            {proposal.status === 'not_selected' && <Badge color="gray">Não selecionado</Badge>}
          </div>
          <span className="text-xs text-gray-500">{op.type}</span>
        </div>
        <div className="text-right shrink-0">
          <p className="font-display font-800 text-xl text-gray-900">R$ {proposal.value.toLocaleString('pt-BR')}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-3">
        <div className="bg-gray-50 rounded-lg px-2.5 py-1.5">
          <p className="text-gray-400">Avaliação</p>
          <p className="font-semibold text-gray-700">★ {op.rating}</p>
        </div>
        <div className="bg-gray-50 rounded-lg px-2.5 py-1.5">
          <p className="text-gray-400">Distância</p>
          <p className="font-semibold text-gray-700">{op.distance} km</p>
        </div>
        <div className="bg-gray-50 rounded-lg px-2.5 py-1.5">
          <p className="text-gray-400">Disponível</p>
          <p className="font-semibold text-gray-700">{proposal.availableDate}</p>
        </div>
        <div className="bg-gray-50 rounded-lg px-2.5 py-1.5">
          <p className="text-gray-400">Horário</p>
          <p className="font-semibold text-gray-700">{proposal.availableTime}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {proposal.services.map((s: string) => <Badge key={s} color="green">{s}</Badge>)}
      </div>

      {proposal.notes && <p className="text-xs text-gray-500 mb-3 italic">"{proposal.notes}"</p>}

      {proposal.status === 'sent' && canSelect && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => toggleCompare(proposal.id)}
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
              isInCompare ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'
            }`}
          >
            {isInCompare ? '✓ Comparando' : 'Comparar'}
          </button>
          <Btn size="sm" onClick={() => setConfirmOpen(true)}>Escolher operador</Btn>
        </div>
      )}

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirmar escolha?" size="sm">
        <div className="p-6">
          <p className="text-gray-600 text-sm mb-4">Você está selecionando:</p>
          <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2 text-sm">
            <p><span className="text-gray-400">Operador:</span> <strong className="text-gray-900">{op.name}</strong></p>
            <p><span className="text-gray-400">Serviços:</span> {proposal.services.join(', ')}</p>
            <p><span className="text-gray-400">Valor:</span> <strong className="text-green-700">R$ {proposal.value.toLocaleString('pt-BR')}</strong></p>
            <p><span className="text-gray-400">Data:</span> {proposal.availableDate} às {proposal.availableTime}</p>
          </div>
          <div className="flex gap-2">
            <Btn variant="outline" full onClick={() => setConfirmOpen(false)}>Cancelar</Btn>
            <Btn full onClick={() => { selectOperator(requestId, proposal.operatorId, proposal.id); setConfirmOpen(false); }}>
              <IconCheck size={16} /> Confirmar escolha
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function CompareModal({ open, onClose, proposalIds, requestId }: { open: boolean; onClose: () => void; proposalIds: string[]; requestId: string }) {
  const { proposals, selectOperator } = useApp();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const toCompare = proposalIds.map(id => proposals.find(p => p.id === id)).filter(Boolean) as any[];

  if (!open) return null;

  const rows = [
    { label: 'Tipo', fn: (p: any) => OPERATORS.find(o => o.id === p.operatorId)?.type || '-' },
    { label: 'Avaliação', fn: (p: any) => `★ ${OPERATORS.find(o => o.id === p.operatorId)?.rating}` },
    { label: 'Distância', fn: (p: any) => `${OPERATORS.find(o => o.id === p.operatorId)?.distance} km` },
    { label: 'Capacidade', fn: (p: any) => OPERATORS.find(o => o.id === p.operatorId)?.capacity || '-' },
    { label: 'Serviços', fn: (p: any) => p.services.join(', ') },
    { label: 'Prazo', fn: (p: any) => p.availableDate },
    { label: 'Horário', fn: (p: any) => p.availableTime },
    { label: 'Valor', fn: (p: any) => `R$ ${p.value.toLocaleString('pt-BR')}`, highlight: true },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Comparar propostas" size="xl">
      <div className="p-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3 pr-4 w-28">Critério</th>
              {toCompare.map(p => {
                const op = OPERATORS.find(o => o.id === p.operatorId);
                return (
                  <th key={p.id} className="text-left pb-3 px-3">
                    <div className="font-display font-700 text-gray-900">{op?.name}</div>
                    <div className="text-xs text-gray-400 font-normal">{op?.type}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map(row => (
              <tr key={row.label} className="hover:bg-gray-50">
                <td className="py-3 pr-4 text-gray-500 font-medium text-xs uppercase tracking-wide">{row.label}</td>
                {toCompare.map(p => {
                  const val = row.fn(p);
                  return (
                    <td key={p.id} className={`py-3 px-3 font-medium ${row.highlight ? 'text-green-700 font-bold font-display text-base' : 'text-gray-800'}`}>
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 border-t border-gray-100 pt-5">
          <p className="text-sm text-gray-500 mb-3">Escolha o melhor operador para sua necessidade:</p>
          <div className="flex gap-2 flex-wrap">
            {toCompare.map(p => {
              const op = OPERATORS.find(o => o.id === p.operatorId);
              return (
                <button
                  key={p.id}
                  onClick={() => setConfirmId(p.id)}
                  className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors"
                >
                  Escolher {op?.name}
                </button>
              );
            })}
          </div>
        </div>

        {confirmId && (() => {
          const p = toCompare.find(x => x.id === confirmId)!;
          const op = OPERATORS.find(o => o.id === p.operatorId);
          return (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-sm font-medium text-green-900 mb-3">Confirmar: <strong>{op?.name}</strong>?</p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmId(null)} className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Cancelar</button>
                <button onClick={() => { selectOperator(requestId, p.operatorId, p.id); onClose(); }} className="px-3 py-1.5 text-xs rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700">
                  Confirmar escolha
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    </Modal>
  );
}

function RequestDetail({ requestId, onBack }: { requestId: string; onBack: () => void }) {
  const { requests, proposals, collections, destinations, certificates, compareIds, clearCompare, generateCertificate, navigate } = useApp();
  const req = requests.find(r => r.id === requestId);
  const [showCompare, setShowCompare] = useState(false);
  if (!req) return null;

  const reqProposals = proposals.filter(p => p.requestId === requestId);
  const op = req.selectedOperatorId ? OPERATORS.find(o => o.id === req.selectedOperatorId) : null;
  const col = collections.find(c => c.requestId === requestId);
  const dest = col ? destinations.find(d => d.collectionId === col.id) : null;
  const cert = certificates.find(c => c.requestId === requestId);
  const canSelect = req.status === 'receiving_proposals';

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
          <IconChevronLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display font-800 text-xl text-gray-900">Chamado #{req.number}</h1>
            <RequestStatusBadge status={req.status} />
          </div>
          <p className="text-gray-500 text-sm mt-0.5">{req.wasteType} · {req.quantity} {req.unit} · {req.location}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: details + timeline */}
        <div className="lg:col-span-1 space-y-4">
          {/* Info card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="font-display font-700 text-gray-900 mb-3 text-sm">Detalhes</h3>
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
            {req.notes && <p className="text-xs text-gray-500 mt-3 border-t border-gray-50 pt-3 italic">{req.notes}</p>}
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="font-display font-700 text-gray-900 mb-3 text-sm">Status</h3>
            <RequestTimeline status={req.status} />
          </div>

          {/* Selected operator */}
          {op && (
            <div className="bg-green-50 rounded-xl border border-green-200 p-4">
              <h3 className="font-display font-700 text-green-900 mb-2 text-sm">Operador selecionado</h3>
              <p className="font-semibold text-gray-900">{op.name}</p>
              <p className="text-xs text-gray-500">{op.type}</p>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="text-amber-500">★ {op.rating}</span>
                <span className="text-gray-400">{op.distance} km</span>
              </div>
            </div>
          )}

          {/* Destination info */}
          {dest && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-display font-700 text-gray-900 mb-3 text-sm">Destinação</h3>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-gray-400">Tipo</span><span className="font-medium text-gray-700">{dest.destinationType}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Quantidade</span><span className="font-medium text-gray-700">{dest.quantity} kg</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Data</span><span className="font-medium text-gray-700">{dest.date}</span></div>
              </div>
              {dest.notes && <p className="text-xs text-gray-500 mt-2 italic">{dest.notes}</p>}
              {!cert && req.status === 'destination_confirmed' && (
                <button
                  onClick={() => col && generateCertificate(req.id, col.id)}
                  className="mt-3 w-full py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-semibold transition-colors"
                >
                  🏆 Gerar certificado
                </button>
              )}
              {cert && (
                <div className="mt-3 flex items-center gap-2 text-xs text-green-700">
                  <IconCheck size={14} /> Certificado gerado · {cert.validationCode}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: proposals */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-700 text-gray-900">Propostas recebidas <span className="text-gray-400 font-normal text-sm">({reqProposals.length})</span></h2>
            {compareIds.length >= 2 && (
              <div className="flex items-center gap-2">
                <button onClick={clearCompare} className="text-xs text-gray-400 hover:text-gray-600">Limpar</button>
                <Btn size="sm" variant="outline" onClick={() => setShowCompare(true)}>
                  Comparar ({compareIds.length})
                </Btn>
              </div>
            )}
          </div>

          {reqProposals.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <p className="text-gray-400 text-sm">Aguardando propostas de operadores...</p>
              <p className="text-xs text-gray-300 mt-1">Operadores compatíveis serão notificados automaticamente.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reqProposals.map(p => (
                <ProposalCard key={p.id} proposal={p} requestId={req.id} canSelect={canSelect} />
              ))}
            </div>
          )}
        </div>
      </div>

      <CompareModal
        open={showCompare}
        onClose={() => setShowCompare(false)}
        proposalIds={compareIds}
        requestId={req.id}
      />
    </div>
  );
}

export default function MyRequests() {
  const { requests, navigate, viewParam } = useApp();
  const [detailId, setDetailId] = useState<string | null>(viewParam || null);

  if (detailId) {
    return <RequestDetail requestId={detailId} onBack={() => setDetailId(null)} />;
  }

  const statusColor: Record<string, string> = {
    receiving_proposals: 'border-l-blue-400',
    operator_selected: 'border-l-purple-400',
    collection_scheduled: 'border-l-orange-400',
    in_collection: 'border-l-yellow-400',
    collection_done: 'border-l-green-400',
    destination_confirmed: 'border-l-green-600',
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Meus Chamados"
        subtitle={`${requests.length} chamados registrados`}
        action={
          <Btn onClick={() => navigate('company-new-request')}>
            <IconPlus size={16} /> Publicar necessidade
          </Btn>
        }
      />

      {requests.length === 0 ? (
        <EmptyState
          icon={<IconList size={24} />}
          title="Nenhuma necessidade encontrada"
          body="Quando sua empresa publicar uma necessidade, ela aparecerá aqui."
          action={<Btn onClick={() => navigate('company-new-request')}><IconPlus size={16}/> Publicar necessidade</Btn>}
        />
      ) : (
        <div className="space-y-3">
          {requests.map(req => {
            return (
              <div
                key={req.id}
                className={`bg-white rounded-xl border border-l-4 border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer ${statusColor[req.status] || 'border-l-gray-200'}`}
                onClick={() => setDetailId(req.id)}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-display font-700 text-gray-900">#{req.number}</span>
                        <span className="font-medium text-gray-700">{req.wasteType}</span>
                        <RequestStatusBadge status={req.status} />
                      </div>
                      <div className="flex items-center gap-3 flex-wrap text-xs text-gray-500">
                        <span>{req.quantity} {req.unit}</span>
                        <span>·</span>
                        <span>{req.condition}</span>
                        <span>·</span>
                        <span>{req.location.split('—')[0].trim()}</span>
                        <span>·</span>
                        <span>Data: {req.desiredDate}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {req.proposalCount > 0 && (
                        <span className="text-sm font-semibold text-blue-600">{req.proposalCount} proposta{req.proposalCount > 1 ? 's' : ''}</span>
                      )}
                      <p className="text-xs text-gray-400 mt-1">{req.createdAt}</p>
                    </div>
                  </div>
                </div>
                <div className="px-4 pb-3 flex items-center justify-between">
                  <div className="flex gap-1 flex-wrap">
                    {req.desiredDestination && <Badge color="gray">{req.desiredDestination}</Badge>}
                    {req.needsTransport && <Badge color="blue">Transporte</Badge>}
                    {req.needsTreatment === 'Sim' && <Badge color="orange">Tratamento</Badge>}
                  </div>
                  <button className="text-xs text-green-600 font-semibold flex items-center gap-1 hover:text-green-700">
                    <IconEye size={14} /> Ver detalhes
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
