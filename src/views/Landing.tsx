import React from 'react';
import { useApp } from '../context';
import ecoxpLogoSrc from '../imports/WhatsApp_Image_2026-08-06_at_11.02.36.jpeg';

export default function Landing() {
  const { setRole } = useApp();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 flex flex-col">
      {/* Header */}
      <header className="px-6 py-5 flex items-center gap-3">
        <img src={ecoxpLogoSrc} alt="ECOXP" className="h-10 object-contain" />
        <div className="ml-2 px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">MVP</div>
      </header>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 text-center">
        <div className="inline-flex items-center gap-2 border text-xs font-semibold px-3 py-1.5 rounded-full mb-8"
          style={{ backgroundColor: '#F0FBF2', borderColor: '#A8D5B0', color: '#1B5E2A' }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#2D8A3E' }}/>
          Plataforma digital de gestão de resíduos
        </div>

        {/* Large logo */}
        <img src={ecoxpLogoSrc} alt="ECOXP" className="h-24 md:h-32 object-contain mb-4" />

        <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: '#1B5E2A' }}>
          Gestão Ambiental · Conecta · Gera Valor
        </p>

        <h1 className="font-display font-800 text-3xl md:text-4xl text-gray-900 leading-tight max-w-xl mb-3">
          Conectamos empresas a{' '}
          <span style={{ color: '#1B5E2A' }}>operadores de resíduos</span>{' '}
          qualificados
        </h1>
        <p className="text-gray-500 text-lg max-w-lg mb-12 leading-relaxed">
          Publique necessidades, receba propostas, compare operadores e acompanhe cada coleta com rastreabilidade completa.
        </p>

        {/* Role selection */}
        <div className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-5">Como você usa a ECOXP?</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full">

          {/* Consumer */}
          <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center opacity-60 cursor-not-allowed">
            <div className="text-4xl mb-3">👤</div>
            <h3 className="font-display font-700 text-gray-900 mb-1">Consumidor</h3>
            <p className="text-xs text-gray-500 mb-4">Descarte consciente para pessoas físicas</p>
            <div className="inline-block px-3 py-1.5 bg-gray-100 text-gray-500 text-xs rounded-full font-medium">Em breve</div>
          </div>

          {/* Company */}
          <button
            onClick={() => setRole('company')}
            className="group bg-white rounded-2xl border-2 shadow-md p-6 text-center hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ borderColor: '#A8D5B0' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#1B5E2A')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#A8D5B0')}
          >
            <div className="text-4xl mb-3">🏢</div>
            <h3 className="font-display font-700 text-gray-900 mb-1">Empresa</h3>
            <p className="text-xs text-gray-500 mb-4">Gerencie e destine seus resíduos com rastreabilidade</p>
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-white text-xs rounded-full font-semibold transition-colors"
              style={{ backgroundColor: '#1B5E2A' }}
            >
              Acessar
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </button>

          {/* Operator */}
          <button
            onClick={() => setRole('operator')}
            className="group bg-white rounded-2xl border-2 shadow-md p-6 text-center hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ borderColor: '#F5C89A' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#E87B1A')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#F5C89A')}
          >
            <div className="text-4xl mb-3">♻️</div>
            <h3 className="font-display font-700 text-gray-900 mb-1">Operador de Resíduos</h3>
            <p className="text-xs text-gray-500 mb-4">Encontre oportunidades compatíveis com sua especialidade</p>
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-white text-xs rounded-full font-semibold transition-colors"
              style={{ backgroundColor: '#E87B1A' }}
            >
              Acessar
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </button>
        </div>

        {/* Features row */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl w-full text-center">
          {[
            { emoji: '📋', label: 'Marketplace de serviços' },
            { emoji: '🔍', label: 'Comparação de propostas' },
            { emoji: '📍', label: 'Rastreabilidade' },
            { emoji: '🌿', label: 'Registro de impacto' },
          ].map(f => (
            <div key={f.label} className="flex flex-col items-center gap-1.5">
              <span className="text-2xl">{f.emoji}</span>
              <span className="text-xs text-gray-500 font-medium">{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      <footer className="py-4 text-center text-xs text-gray-400">
        Ambiente demonstrativo — dados fictícios · ECOXP MVP 2026
      </footer>
    </div>
  );
}
