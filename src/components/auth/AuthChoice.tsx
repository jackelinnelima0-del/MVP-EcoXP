import React from 'react';

interface AuthChoiceProps {
  onSelectRole: (role: 'empresa' | 'operador') => void;
  onGoToLogin: () => void;
}

export const AuthChoice: React.FC<AuthChoiceProps> = ({ onSelectRole, onGoToLogin }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">Bem-vindo ao EcoXP</h2>
        <p className="mt-2 text-sm text-gray-600">Selecione o tipo de conta que deseja criar</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Card Empresa */}
          <div 
            onClick={() => onSelectRole('empresa')}
            className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-green-600 cursor-pointer shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-2xl mb-4 font-bold">
              🏢
            </div>
            <h3 className="text-lg font-bold text-gray-800">Empresa / Gerador</h3>
            <p className="text-sm text-gray-500 mt-2">
              Para empresas que geram resíduos e precisam solicitar coleta e gerenciamento ambiental.
            </p>
            <button className="mt-6 w-full py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">
              Cadastrar Empresa
            </button>
          </div>

          {/* Card Operador */}
          <div 
            onClick={() => onSelectRole('operador')}
            className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-emerald-600 cursor-pointer shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-2xl mb-4 font-bold">
              🚛
            </div>
            <h3 className="text-lg font-bold text-gray-800">Operador Ambiental</h3>
            <p className="text-sm text-gray-500 mt-2">
              Para transportadores e destinadores licenciados para coleta, transporte e tratamento.
            </p>
            <button className="mt-6 w-full py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition">
              Cadastrar Operador
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Já possui uma conta?{' '}
            <button onClick={onGoToLogin} className="font-semibold text-green-600 hover:text-green-500">
              Fazer Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};