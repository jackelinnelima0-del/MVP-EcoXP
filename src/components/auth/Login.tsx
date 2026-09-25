import React, { useState } from 'react';
import { supabase } from '../../supabase';

interface LoginProps {
  onBack: () => void;
  onGoToRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onBack, onGoToRegister }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) throw error;

      alert('Login efetuado com sucesso!');
      // Na próxima etapa, aqui redirecionaremos para o Dashboard da Empresa ou do Operador
    } catch (err: any) {
      setErrorMsg(err.message || 'E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700 mb-4 block mx-auto">
          ← Voltar para início
        </button>
        <h2 className="text-center text-3xl font-extrabold text-gray-900">Entrar no EcoXP</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Acesse sua conta de Empresa ou Operador Ambiental
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow rounded-xl sm:px-10 border border-gray-100">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {errorMsg}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-gray-700">E-mail corporativo</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-green-500 focus:border-green-500"
                placeholder="seu.email@empresa.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700">Senha</label>
              <input
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-green-500 focus:border-green-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition shadow-sm disabled:opacity-50"
            >
              {loading ? 'Autenticando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-gray-100 pt-6">
            <p className="text-xs text-gray-600">
              Ainda não tem uma conta?{' '}
              <button onClick={onGoToRegister} className="font-semibold text-green-600 hover:text-green-500">
                Criar uma conta
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};