import React from 'react';
import { PageHeader, Badge, StarRating, Btn } from '../../components/ui';
import { OPERATORS } from '../../data';

const MY_OPERATOR_ID = 'op3';

export default function OperatorProfile() {
  const op = OPERATORS.find(o => o.id === MY_OPERATOR_ID)!;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <PageHeader title="Meu Perfil" subtitle="Perfil demonstrativo do operador na plataforma ECOXP." />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
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
            <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-2xl shrink-0">♻️</div>
          </div>

          <p className="text-gray-600 text-sm mb-6 leading-relaxed">{op.description}</p>

          <div className="grid sm:grid-cols-2 gap-5 mb-5">
            <div>
              <h3 className="font-display font-700 text-gray-900 text-sm mb-2">Especialidades</h3>
              <div className="flex flex-wrap gap-1.5">
                {op.specialties.map(s => <Badge key={s} color="orange">{s}</Badge>)}
              </div>
            </div>
            <div>
              <h3 className="font-display font-700 text-gray-900 text-sm mb-2">Serviços oferecidos</h3>
              <div className="flex flex-wrap gap-1.5">
                {op.services.map(s => <Badge key={s} color="green">{s}</Badge>)}
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 mb-5">
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
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-xs font-bold text-amber-800 mb-1">Perfil demonstrativo</p>
        <p className="text-xs text-amber-700">Este perfil é demonstrativo. Em produção, o operador poderá editar suas informações, especialidades, certificações e área de atendimento.</p>
      </div>
    </div>
  );
}
