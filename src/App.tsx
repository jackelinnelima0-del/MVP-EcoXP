import React, { useState } from 'react';
import { AuthChoice } from './components/auth/AuthChoice';
import { EmpresaRegister } from './components/auth/EmpresaRegister';
import { OperadorRegister } from './components/auth/OperadorRegister';
import { Login } from './components/auth/Login';

export function App() {
  const [screen, setScreen] = useState<'choice' | 'empresa' | 'operador' | 'login'>('choice');

  return (
    <div className="min-h-screen bg-gray-100">
      {screen === 'choice' && (
        <AuthChoice 
          onSelectRole={(role) => setScreen(role)} 
          onGoToLogin={() => setScreen('login')} 
        />
      )}

      {screen === 'login' && (
        <Login 
          onBack={() => setScreen('choice')}
          onGoToRegister={() => setScreen('choice')}
        />
      )}

      {screen === 'empresa' && (
        <EmpresaRegister onBack={() => setScreen('choice')} />
      )}

      {screen === 'operador' && (
        <OperadorRegister onBack={() => setScreen('choice')} />
      )}
    </div>
  );
}

export default App;