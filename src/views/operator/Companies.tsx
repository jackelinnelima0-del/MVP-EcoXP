import React from 'react';
import { PageHeader, Badge } from '../../components/ui';

export default function Companies() {
  return (
    <div className="p-6">
      <PageHeader title="Empresas" subtitle="Empresas parceiras na plataforma ECOXP." />
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 flex items-start gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-2xl shrink-0">🏢</div>
          <div className="flex-1">
            <h3 className="font-display font-700 text-gray-900">Empresa Eco Industrial</h3>
            <p className="text-sm text-gray-500 mt-0.5">São Paulo, SP</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge color="green">Parceira ativa</Badge>
              <Badge color="gray">Setor Industrial</Badge>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-50 px-5 py-3 grid grid-cols-3 gap-3 text-center text-xs text-gray-500">
          <div><p className="font-display font-700 text-gray-900 text-lg">5</p><p>Chamados</p></div>
          <div><p className="font-display font-700 text-gray-900 text-lg">2</p><p>Coletas realizadas</p></div>
          <div><p className="font-display font-700 text-gray-900 text-lg">↗</p><p>Ativa</p></div>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-4">Funcionalidade demonstrativa. Em produção, exibirá todas as empresas parceiras.</p>
    </div>
  );
}
