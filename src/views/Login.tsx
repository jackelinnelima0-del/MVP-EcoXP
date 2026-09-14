import React, { useState } from 'react';
import { useApp } from '../context';
import { supabase } from '../supabase';
import ecoxpLogoSrc from '../imports/WhatsApp_Image_2026-08-06_at_11.02.36.jpeg';

export default function Login() {
  const { role, setLoggedIn, navigate, setRole } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isCompany = role === 'company';
  const tag = isCompany ? 'Empresa' : 'Operador de Resíduos';
  const dashTarget = isCompany ? 'company-dashboard' : 'operator-dashboard';

  const brandColor = isCompany ? '#1B5E2A' : '#E87B1A';
  const brandLight = isCompany ? '#F0FBF2' : '#FFF4E8';
  const brandBorder = isCompany ? '#A8D5B0' : '#F5C89A';

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Informe seu e-mail e sua senha.');
      return;
    }

    try {
      setLoading(true);

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (!data.user) {
        setError('Não foi possível identificar o usuário.');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileError) {
        setError('Login realizado, mas não foi possível carregar seu perfil.');
        return;
      }

      const userRole =
        profile?.role === 'operator'
          ? 'operator'
          : profile?.role === 'admin'
            ? 'admin'
            : 'company';

      if (role && role !== userRole && userRole !== 'admin') {
        await supabase.auth.signOut();
        setError(
          `Esta conta está cadastrada como ${userRole === 'company' ? 'Empresa' : 'Operador de Resíduos'}.`
        );
        return;
      }

      setRole(userRole);
      setLoggedIn(true);

      navigate(
        userRole === 'operator'
          ? 'operator-dashboard'
          : 'company-dashboard'
      );
    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro ao realizar o login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src={ecoxpLogoSrc}
            alt="ECOXP"
            className="h-16 object-contain mx-auto mb-2"
          />

          <p
            className="text-gray-500 text-sm font-medium"
            style={{ color: '#1B5E2A', opacity: 0.7 }}
          >
            Gestão Ambiental · Conecta · Gera Valor
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div
            className="h-1.5"
            style={{ backgroundColor: brandColor }}
          />

          <div className="p-8">
            <div className="mb-6">
              <span
                className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-3"
                style={{
                  backgroundColor: brandLight,
                  color: brandColor,
                }}
              >
                {tag}
              </span>

              <h2 className="font-display font-700 text-xl text-gray-900">
                Entrar no EcoXP
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                Acesse sua conta para utilizar a plataforma.
              </p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    E-mail
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@empresa.com.br"
                    autoComplete="email"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: '#E5E7EB' }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Senha
                  </label>

                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    autoComplete="current-password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none"
                  />
                </div>
              </div>

              {error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white font-display font-700 text-sm transition-opacity hover:opacity-90 disabled:opacity-50 focus:outline-none"
                style={{ backgroundColor: brandColor }}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            <p className="text-center text-xs text-gray-400 mt-4">
              Acesso protegido pelo Supabase.
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