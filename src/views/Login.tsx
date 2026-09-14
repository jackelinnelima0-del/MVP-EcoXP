import React from 'react';
import { useApp } from '../context';
import ecoxpLogoSrc from '../imports/WhatsApp_Image_2026-08-06_at_11.02.36.jpeg';

export default function Login() {
  const { role, setLoggedIn, navigate, setRole } = useApp();

  const isCompany = role === 'company';
  const name = isCompany ? 'Empresa Eco Industrial' : 'EcoTrat Resíduos e Reciclagem';
  const email = isCompany ? 'contato@ecoindustrial.com.br' : 'contato@ecotrat.com.br';
  const tag = isCompany ? 'Empresa' : 'Operador de Resíduos';
  const dashTarget = isCompany ? 'company-dashboard' : 'operator-dashboard';

  const brandColor = isCompany ? '#1B5E2A' : '#E87B1A';
  const brandLight = isCompany ? '#F0FBF2' : '#FFF4E8';
  const brandBorder = isCompany ? '#A8D5B0' : '#F5C89A';

  const handleLogin = () => {
    setLoggedIn(true);
    navigate(dashTarget);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src={ecoxpLogoSrc} alt="ECOXP" className="h-16 object-contain mx-auto mb-2" />
          <p className="text-gray-500 text-sm font-medium" style={{ color: '#1B5E2A', opacity: 0.7 }}>
            Gestão Ambiental · Conecta · Gera Valor
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Top accent */}
          <div className="h-1.5" style={{ backgroundColor: brandColor }} />

          <div className="p-8">
            <div className="mb-6">
              <span
                className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-3"
                style={{ backgroundColor: brandLight, color: brandColor }}
              >{tag}</span>
              <h2 className="font-display font-700 text-xl text-gray-900">Entrar como demonstração</h2>
              <p className="text-gray-500 text-sm mt-1">Acesso rápido ao ambiente demonstrativo.</p>
            </div>

            {/* Demo account info */}
            <div
              className="rounded-xl p-4 mb-6 border"
              style={{ backgroundColor: brandLight, borderColor: brandBorder }}
            >
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Conta demonstrativa</p>
              <p className="font-display font-600 text-gray-900">{name}</p>
              <p className="text-sm text-gray-500 mt-0.5">{email}</p>
            </div>

            {/* Fields (decorative) */}
            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">E-mail</label>
                <input
                  type="email"
                  defaultValue={email}
                  readOnly
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Senha</label>
                <input
                  type="password"
                  defaultValue="demo1234"
                  readOnly
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-sm focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleLogin}
              className="w-full py-3 rounded-xl text-white font-display font-700 text-sm transition-opacity hover:opacity-90 focus:outline-none"
              style={{ backgroundColor: brandColor }}
            >
              Entrar no ambiente demonstrativo
            </button>

            <p className="text-center text-xs text-gray-400 mt-4">
              Ambiente demonstrativo — sem dados reais
            </p>
          </div>
        </div>

        <button
          onClick={() => setRole(null)}
          className="mt-4 w-full text-sm text-gray-400 hover:text-gray-600 text-center transition-colors"
        >
          ← Voltar à seleção de perfil
        </button>
      </div>
    </div>
  );
}
