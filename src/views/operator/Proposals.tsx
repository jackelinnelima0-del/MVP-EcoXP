import React from 'react';
import { useApp } from '../../context';
import { PageHeader, Badge } from '../../components/ui';
import { IconClipboard } from '../../components/Icons';
import { OPERATORS } from '../../data';

const MY_OPERATOR_ID = 'op3';

export default function MyProposals() {
  const { proposals, requests, navigate } = useApp();
  const myProposals = proposals.filter(p => p.operatorId === MY_OPERATOR_ID);

  const statusLabel: Record<string, { label: string; color: string; emoji: string }> = {
    sent: { label: 'Enviada', color: 'blue', emoji: '🟡' },
    accepted: { label: 'Aceita', color: 'green', emoji: '🟢' },
    not_selected: { label: 'Não selecionada', color: 'gray', emoji: '⚪' },
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Minhas Propostas"
        subtitle={`${myProposals.length} proposta${myProposals.length !== 1 ? 's' : ''} enviada${myProposals.length !== 1 ? 's' : ''}`}
      />

      {myProposals.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <IconClipboard size={24} className="text-gray-400" />
          </div>
          <p className="font-display font-600 text-gray-700 mb-2">Nenhuma proposta enviada</p>
          <p className="text-gray-400 text-sm">Envie propostas para oportunidades compatíveis.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myProposals.map(prop => {
            const req = requests.find(r => r.id === prop.requestId);
            const st = statusLabel[prop.status] || statusLabel.sent;
            return (
              <button
                key={prop.id}
                onClick={() => navigate('operator-opportunities', req?.id)}
                className="w-full bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-left hover:shadow-md hover:border-gray-200 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm">{st.emoji}</span>
                      <span className="font-display font-700 text-gray-900">{req?.wasteType || 'Chamado'}</span>
                      <Badge color={st.color}>{st.label}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      Empresa Eco Industrial · {req?.quantity} {req?.unit} · {req?.location?.split('—')[0].trim()}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {prop.services.map(s => <Badge key={s} color="green">{s}</Badge>)}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display font-800 text-xl text-gray-900">R$ {prop.value.toLocaleString('pt-BR')}</p>
                    <p className="text-xs text-gray-400 mt-1">{prop.availableDate}</p>
                    <p className="text-xs text-gray-400">{prop.availableTime}</p>
                  </div>
                </div>
                {prop.notes && <p className="text-xs text-gray-500 mt-2 italic border-t border-gray-50 pt-2">"{prop.notes}"</p>}
                {prop.status === 'accepted' && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-green-700 font-semibold">
                    ✓ Proposta aceita — coleta agendada
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {myProposals.length > 0 && (
        <div className="mt-6 grid grid-cols-3 gap-3">
          {(['sent', 'accepted', 'not_selected'] as const).map(s => {
            const count = myProposals.filter(p => p.status === s).length;
            const st = statusLabel[s];
            return (
              <div key={s} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-center">
                <p className="text-xs text-gray-400 mb-1">{st.label}</p>
                <p className="font-display font-800 text-2xl text-gray-900">{count}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
