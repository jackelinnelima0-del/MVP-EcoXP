import React from 'react';
import { PageHeader, Badge } from '../../components/ui';
import { IconCheck } from '../../components/Icons';

const plans = [
  {
    name: 'Essencial',
    price: 'Demo',
    current: true,
    color: 'green',
    features: ['Chamados ilimitados', 'Histórico completo', 'Indicadores básicos', 'Certificados demonstrativos', 'Acesso ao marketplace'],
  },
  {
    name: 'Profissional',
    price: 'Em breve',
    current: false,
    color: 'blue',
    features: ['Tudo do Essencial', 'Relatórios avançados', 'Rastreabilidade detalhada', 'Múltiplos locais', 'Suporte prioritário', 'Integração ERP'],
  },
  {
    name: 'Enterprise',
    price: 'Sob consulta',
    current: false,
    color: 'purple',
    features: ['Tudo do Profissional', 'Gestão multi-unidade', 'API e integrações', 'Consultoria ambiental', 'SLA dedicado', 'Onboarding personalizado'],
  },
];

export default function Plan() {
  return (
    <div className="p-6">
      <PageHeader
        title="Meu Plano"
        subtitle="Demonstração — não implementa cobrança real."
      />

      <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-medium mb-6">
        🎯 Demonstração — nenhum plano real é ativado
      </div>

      <div className="grid md:grid-cols-3 gap-4 max-w-4xl">
        {plans.map(plan => (
          <div
            key={plan.name}
            className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
              plan.current ? 'border-green-300 shadow-green-100 shadow-md' : 'border-gray-100'
            }`}
          >
            {plan.current && (
              <div className="bg-green-600 text-white text-xs font-bold text-center py-1.5 tracking-wide">PLANO ATUAL</div>
            )}
            <div className="p-5">
              <h3 className="font-display font-800 text-xl text-gray-900 mb-1">{plan.name}</h3>
              <p className={`text-2xl font-display font-800 mb-4 ${
                plan.current ? 'text-green-600' : 'text-gray-400'
              }`}>{plan.price}</p>
              <ul className="space-y-2">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <IconCheck size={16} className={plan.current ? 'text-green-500' : 'text-gray-300'} />
                    {f}
                  </li>
                ))}
              </ul>
              {!plan.current && (
                <button disabled className="mt-5 w-full py-2.5 rounded-xl border border-gray-200 text-gray-400 text-sm font-semibold cursor-not-allowed">
                  {plan.price === 'Em breve' ? 'Em breve' : 'Falar com vendas'}
                </button>
              )}
              {plan.current && (
                <div className="mt-5 w-full py-2.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-semibold text-center">
                  ✓ Ativo
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-8 max-w-lg">
        Planos demonstrativos para fins de visualização do produto. Nenhuma cobrança será realizada neste protótipo.
      </p>
    </div>
  );
}
