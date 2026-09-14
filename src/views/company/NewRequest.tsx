import React, { useState } from 'react';
import { useApp } from '../../context';
import { PageHeader, Btn } from '../../components/ui';
import { IconArrowLeft } from '../../components/Icons';

const WASTE_CATEGORIES = [
  {
    label: '♻️ Recicláveis',
    types: ['Papel', 'Papelão', 'Plástico', 'Vidro', 'Metal', 'Alumínio'],
  },
  {
    label: '🏭 Resíduos industriais',
    types: ['Resíduos industriais', 'Resíduos de processo', 'Embalagens contaminadas', 'Sucata metálica'],
  },
  {
    label: '☣️ Resíduos contaminados/perigosos',
    types: ['Resíduos contaminados', 'Materiais contaminados', 'Produtos químicos', 'Embalagens contaminadas (perigosas)'],
  },
  {
    label: '🦺 EPIs',
    types: ['Luvas', 'Máscaras', 'Uniformes', 'EPIs contaminados', 'EPIs diversos'],
  },
  {
    label: '💻 Eletroeletrônicos',
    types: ['Computadores', 'Cabos', 'Equipamentos eletrônicos', 'Componentes eletrônicos'],
  },
  {
    label: '💡 Outros',
    types: ['Lâmpadas fluorescentes', 'Lâmpadas de LED', 'Madeira', 'Outros resíduos'],
  },
];

const CONDITIONS = ['Limpo', 'Separado', 'Contaminado', 'Misturado', 'Necessita avaliação'];
const UNITS = ['kg', 'toneladas', 'unidades', 'litros', 'm³'];
const DESTINATIONS = ['Reciclagem', 'Recuperação', 'Tratamento', 'Reutilização', 'Destinação adequada', 'Avaliação do operador'];
const TREATMENT = ['Sim', 'Não', 'Não sei'];

export default function NewRequest() {
  const { navigate, createRequest } = useApp();
  const [form, setForm] = useState({
    wasteType: '',
    wasteCategory: '',
    quantity: '',
    unit: 'kg',
    condition: '',
    location: 'Av. Paulista, 1578 — São Paulo, SP',
    desiredDate: '',
    needsTransport: true,
    needsTreatment: 'Não sei',
    desiredDestination: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.wasteType) e.wasteType = 'Selecione o tipo de resíduo.';
    if (!form.quantity || Number(form.quantity) <= 0) e.quantity = 'Informe uma quantidade válida.';
    if (!form.condition) e.condition = 'Selecione a condição.';
    if (!form.location) e.location = 'Informe o local.';
    if (!form.desiredDate) e.desiredDate = 'Selecione a data desejada.';
    if (!form.desiredDestination) e.desiredDestination = 'Selecione a destinação desejada.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    createRequest({
      ...form,
      quantity: Number(form.quantity),
      needsTransport: form.needsTransport,
    });
  };

  const labelClass = 'block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5';
  const inputClass = 'w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all';
  const inputOk = `${inputClass} border-gray-200 bg-white`;
  const inputErr = `${inputClass} border-red-300 bg-red-50`;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('company-requests')} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
          <IconArrowLeft size={18} />
        </button>
        <div>
          <h1 className="font-display font-800 text-2xl text-gray-900">Nova necessidade</h1>
          <p className="text-gray-500 text-sm">Publique sua necessidade e receba propostas de operadores qualificados.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tipo de resíduo */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-display font-700 text-gray-900 mb-4">Tipo de resíduo</h2>
          <div className="space-y-3">
            {WASTE_CATEGORIES.map(cat => (
              <div key={cat.label}>
                <button
                  type="button"
                  onClick={() => setSelectedCategory(selectedCategory === cat.label ? '' : cat.label)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    selectedCategory === cat.label ? 'bg-green-50 border-green-300 text-green-700' : 'bg-gray-50 border-gray-100 text-gray-600 hover:border-gray-200'
                  }`}
                >
                  <span>{cat.label}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${selectedCategory === cat.label ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                {selectedCategory === cat.label && (
                  <div className="mt-2 grid grid-cols-2 gap-2 pl-2">
                    {cat.types.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => { set('wasteType', t); set('wasteCategory', cat.label.replace(/^[^\s]+\s/, '')); }}
                        className={`px-3 py-2 rounded-lg border text-sm text-left transition-all ${
                          form.wasteType === t ? 'bg-green-600 text-white border-green-600' : 'bg-white border-gray-200 text-gray-600 hover:border-green-300'
                        }`}
                      >{t}</button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          {form.wasteType && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-gray-500">Selecionado:</span>
              <span className="px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">{form.wasteType}</span>
            </div>
          )}
          {errors.wasteType && <p className="text-red-500 text-xs mt-2">{errors.wasteType}</p>}
        </div>

        {/* Quantidade e condição */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-display font-700 text-gray-900 mb-4">Quantidade e condição</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Quantidade</label>
              <div className="flex gap-2">
                <input
                  type="number" min="0" placeholder="500"
                  value={form.quantity}
                  onChange={e => set('quantity', e.target.value)}
                  className={`flex-1 ${errors.quantity ? inputErr : inputOk}`}
                />
                <select
                  value={form.unit}
                  onChange={e => set('unit', e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {UNITS.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
            </div>
            <div>
              <label className={labelClass}>Condição do material</label>
              <select value={form.condition} onChange={e => set('condition', e.target.value)}
                className={errors.condition ? inputErr : inputOk}>
                <option value="">Selecione...</option>
                {CONDITIONS.map(c => <option key={c}>{c}</option>)}
              </select>
              {errors.condition && <p className="text-red-500 text-xs mt-1">{errors.condition}</p>}
            </div>
          </div>
        </div>

        {/* Localização e data */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-display font-700 text-gray-900 mb-4">Coleta</h2>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Local da coleta</label>
              <input type="text" placeholder="Endereço completo"
                value={form.location} onChange={e => set('location', e.target.value)}
                className={errors.location ? inputErr : inputOk} />
              {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Data desejada</label>
                <input type="date" value={form.desiredDate} onChange={e => set('desiredDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={errors.desiredDate ? inputErr : inputOk} />
                {errors.desiredDate && <p className="text-red-500 text-xs mt-1">{errors.desiredDate}</p>}
              </div>
              <div>
                <label className={labelClass}>Necessita transporte?</label>
                <div className="flex gap-2">
                  {['Sim', 'Não'].map(v => (
                    <button key={v} type="button"
                      onClick={() => set('needsTransport', v === 'Sim')}
                      className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        form.needsTransport === (v === 'Sim') ? 'bg-green-600 text-white border-green-600' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >{v}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Destinação */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-display font-700 text-gray-900 mb-4">Destinação</h2>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Necessita tratamento?</label>
              <div className="flex gap-2 flex-wrap">
                {TREATMENT.map(v => (
                  <button key={v} type="button"
                    onClick={() => set('needsTreatment', v)}
                    className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                      form.needsTreatment === v ? 'bg-green-600 text-white border-green-600' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >{v}</button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Destinação desejada</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DESTINATIONS.map(d => (
                  <button key={d} type="button"
                    onClick={() => set('desiredDestination', d)}
                    className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left ${
                      form.desiredDestination === d ? 'bg-green-600 text-white border-green-600' : 'bg-white border-gray-200 text-gray-600 hover:border-green-300'
                    }`}
                  >{d}</button>
                ))}
              </div>
              {errors.desiredDestination && <p className="text-red-500 text-xs mt-2">{errors.desiredDestination}</p>}
            </div>
            <div>
              <label className={labelClass}>Observações (opcional)</label>
              <textarea rows={3} placeholder="Informações adicionais sobre o resíduo..."
                value={form.notes} onChange={e => set('notes', e.target.value)}
                className={`${inputOk} resize-none`} />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Btn variant="outline" onClick={() => navigate('company-requests')}>Cancelar</Btn>
          <Btn type="submit" size="lg" className="flex-1">
            Publicar necessidade
          </Btn>
        </div>
      </form>
    </div>
  );
}
