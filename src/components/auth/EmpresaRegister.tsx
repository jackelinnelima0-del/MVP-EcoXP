import React, { useState } from 'react';
import { supabase } from '../../supabase';

interface EmpresaRegisterProps {
  onBack: () => void;
}

export const EmpresaRegister: React.FC<EmpresaRegisterProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    senha: '',
    tipoPessoa: 'PJ',
    documento: '',
    razaoSocial: '',
    nomeFantasia: '',
    telefone: '',
    cep: '',
    logradouro: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    nomeResponsavelTecnico: '',
    emailResponsavelTecnico: '',
    // Planos e Pagamento
    planoEscolhido: 'pro', // 'essencial', 'pro', ou 'enterprise'
    nomeCartao: '',
    numeroCartao: '',
    validadeCartao: '',
    cvvCartao: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.senha,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Extrai apenas os últimos 4 dígitos do cartão por segurança
        const ultimosDigitos = formData.numeroCartao.replace(/\s+/g, '').slice(-4);

        // 2. Salvar perfil da empresa no banco de dados
        const { error: profileError } = await supabase.from('profiles_empresa').insert([
          {
            id: authData.user.id,
            email: formData.email,
            tipo_pessoa: formData.tipoPessoa,
            documento: formData.documento,
            razao_social: formData.razaoSocial,
            nome_fantasia: formData.nomeFantasia,
            telefone: formData.telefone,
            cep: formData.cep,
            logradouro: formData.logradouro,
            numero: formData.numero,
            bairro: formData.bairro,
            cidade: formData.cidade,
            estado: formData.estado,
            nome_responsavel_tecnico: formData.nomeResponsavelTecnico,
            email_responsavel_tecnico: formData.emailResponsavelTecnico,
            plano_escolhido: formData.planoEscolhido,
            forma_pagamento: 'cartao_credito',
            titular_cartao: formData.nomeCartao,
            ultimos_digitos_cartao: ultimosDigitos,
          },
        ]);

        if (profileError) throw profileError;

        alert('Cadastro e assinatura realizada com sucesso!');
        onBack();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao realizar cadastro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow">
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700 mb-4">
          ← Voltar para seleção
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Cadastro de Empresa (Gerador)</h2>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. Acesso */}
          <div className="border-b pb-6">
            <h3 className="text-md font-semibold text-gray-700 mb-3">1. Acesso à Conta</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-gray-700">E-mail Corporativo *</label>
                <input type="email" required name="email" value={formData.email} onChange={handleChange} className="mt-1 w-full border rounded-lg p-2.5 text-sm" placeholder="suaempresa@email.com" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Senha *</label>
                <input type="password" required name="senha" value={formData.senha} onChange={handleChange} className="mt-1 w-full border rounded-lg p-2.5 text-sm" placeholder="••••••••" />
              </div>
            </div>
          </div>

          {/* 2. Escolha do Plano Recorrente */}
          <div className="border-b pb-6">
            <h3 className="text-md font-semibold text-gray-700 mb-1">2. Escolha o Plano Recorrente EcoXP</h3>
            <p className="text-xs text-gray-500 mb-4">Selecione o plano ideal para a gestão ambiental da sua empresa:</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Plano Essencial */}
              <label className={`border-2 rounded-xl p-4 cursor-pointer transition flex flex-col justify-between ${formData.planoEscolhido === 'essencial' ? 'border-green-600 bg-green-50/30' : 'border-gray-200 hover:border-gray-300'}`}>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-800 text-sm">Essencial</span>
                    <input type="radio" name="planoEscolhido" value="essencial" checked={formData.planoEscolhido === 'essencial'} onChange={handleChange} className="text-green-600 focus:ring-green-500" />
                  </div>
                  <p className="text-2xl font-extrabold text-gray-900 mb-2">R$ 199<span className="text-xs font-normal text-gray-500">/mês</span></p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Até 5 solicitações/mês</li>
                    <li>• Emissão básica de MTR</li>
                    <li>• Suporte via e-mail</li>
                  </ul>
                </div>
              </label>

              {/* Plano Pro */}
              <label className={`border-2 rounded-xl p-4 cursor-pointer transition flex flex-col justify-between relative ${formData.planoEscolhido === 'pro' ? 'border-green-600 bg-green-50/30' : 'border-gray-200 hover:border-gray-300'}`}>
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">Mais Popular</span>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-800 text-sm">Pro</span>
                    <input type="radio" name="planoEscolhido" value="pro" checked={formData.planoEscolhido === 'pro'} onChange={handleChange} className="text-green-600 focus:ring-green-500" />
                  </div>
                  <p className="text-2xl font-extrabold text-gray-900 mb-2">R$ 399<span className="text-xs font-normal text-gray-500">/mês</span></p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Coletas Ilimitadas</li>
                    <li>• Gestão de MTR & CDF automática</li>
                    <li>• Relatórios de Sustentabilidade</li>
                    <li>• Suporte Prioritário WhatsApp</li>
                  </ul>
                </div>
              </label>

              {/* Plano Enterprise */}
              <label className={`border-2 rounded-xl p-4 cursor-pointer transition flex flex-col justify-between ${formData.planoEscolhido === 'enterprise' ? 'border-green-600 bg-green-50/30' : 'border-gray-200 hover:border-gray-300'}`}>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-800 text-sm">Enterprise</span>
                    <input type="radio" name="planoEscolhido" value="enterprise" checked={formData.planoEscolhido === 'enterprise'} onChange={handleChange} className="text-green-600 focus:ring-green-500" />
                  </div>
                  <p className="text-2xl font-extrabold text-gray-900 mb-2">R$ 799<span className="text-xs font-normal text-gray-500">/mês</span></p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Múltiplas Unidades e Filiais</li>
                    <li>• API de Integração com ERP</li>
                    <li>• Consultor Ambiental Dedicado</li>
                    <li>• Auditoria de Licenças Ambientais</li>
                  </ul>
                </div>
              </label>
            </div>
          </div>

          {/* 3. Pagamento via Cartão de Crédito */}
          <div className="border-b pb-6">
            <h3 className="text-md font-semibold text-gray-700 mb-1">3. Dados do Cartão de Crédito</h3>
            <p className="text-xs text-gray-500 mb-4">A cobrança será efetuada mensalmente no cartão cadastrado abaixo.</p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-700">Nome impresso no Cartão *</label>
                <input type="text" required name="nomeCartao" value={formData.nomeCartao} onChange={handleChange} className="mt-1 w-full border rounded-lg p-2.5 text-sm" placeholder="COMO ESTÁ NO CARTÃO" />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-700">Número do Cartão *</label>
                <input type="text" required name="numeroCartao" maxLength={19} value={formData.numeroCartao} onChange={handleChange} className="mt-1 w-full border rounded-lg p-2.5 text-sm" placeholder="0000 0000 0000 0000" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">Validade (MM/AA) *</label>
                <input type="text" required name="validadeCartao" maxLength={5} value={formData.validadeCartao} onChange={handleChange} className="mt-1 w-full border rounded-lg p-2.5 text-sm" placeholder="12/28" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">Código de Segurança (CVV) *</label>
                <input type="text" required name="cvvCartao" maxLength={4} value={formData.cvvCartao} onChange={handleChange} className="mt-1 w-full border rounded-lg p-2.5 text-sm" placeholder="123" />
              </div>
            </div>
          </div>

          {/* 4. Dados Cadastrais */}
          <div className="border-b pb-6">
            <h3 className="text-md font-semibold text-gray-700 mb-3">4. Dados Cadastrais</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-gray-700">Tipo de Documento</label>
                <select name="tipoPessoa" value={formData.tipoPessoa} onChange={handleChange} className="mt-1 w-full border rounded-lg p-2.5 text-sm">
                  <option value="PJ">CNPJ (Pessoa Jurídica)</option>
                  <option value="PF">CPF (Pessoa Física)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">{formData.tipoPessoa === 'PJ' ? 'CNPJ *' : 'CPF *'}</label>
                <input type="text" required name="documento" value={formData.documento} onChange={handleChange} className="mt-1 w-full border rounded-lg p-2.5 text-sm" placeholder="00.000.000/0000-00" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-700">Razão Social / Nome Completo *</label>
                <input type="text" required name="razaoSocial" value={formData.razaoSocial} onChange={handleChange} className="mt-1 w-full border rounded-lg p-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Nome Fantasia</label>
                <input type="text" name="nomeFantasia" value={formData.nomeFantasia} onChange={handleChange} className="mt-1 w-full border rounded-lg p-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Telefone / WhatsApp *</label>
                <input type="text" required name="telefone" value={formData.telefone} onChange={handleChange} className="mt-1 w-full border rounded-lg p-2.5 text-sm" placeholder="(16) 99999-9999" />
              </div>
            </div>
          </div>

          {/* 5. Endereço */}
          <div className="border-b pb-6">
            <h3 className="text-md font-semibold text-gray-700 mb-3">5. Endereço</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-gray-700">CEP *</label>
                <input type="text" required name="cep" value={formData.cep} onChange={handleChange} className="mt-1 w-full border rounded-lg p-2.5 text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-700">Logradouro / Rua *</label>
                <input type="text" required name="logradouro" value={formData.logradouro} onChange={handleChange} className="mt-1 w-full border rounded-lg p-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Número *</label>
                <input type="text" required name="numero" value={formData.numero} onChange={handleChange} className="mt-1 w-full border rounded-lg p-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Bairro *</label>
                <input type="text" required name="bairro" value={formData.bairro} onChange={handleChange} className="mt-1 w-full border rounded-lg p-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Cidade *</label>
                <input type="text" required name="cidade" value={formData.cidade} onChange={handleChange} className="mt-1 w-full border rounded-lg p-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Estado (UF) *</label>
                <input type="text" required name="estado" value={formData.estado} onChange={handleChange} className="mt-1 w-full border rounded-lg p-2.5 text-sm" placeholder="SP" />
              </div>
            </div>
          </div>

          {/* 6. Responsável Técnico */}
          <div>
            <h3 className="text-md font-semibold text-gray-700 mb-3">6. Responsável Técnico / Ambiental</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-gray-700">Nome do Responsável</label>
                <input type="text" name="nomeResponsavelTecnico" value={formData.nomeResponsavelTecnico} onChange={handleChange} className="mt-1 w-full border rounded-lg p-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">E-mail do Responsável</label>
                <input type="email" name="emailResponsavelTecnico" value={formData.emailResponsavelTecnico} onChange={handleChange} className="mt-1 w-full border rounded-lg p-2.5 text-sm" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition shadow-md disabled:opacity-50 text-base"
          >
            {loading ? 'Processando Assinatura e Cadastro...' : 'Assinar Plano e Finalizar Cadastro'}
          </button>
        </form>
      </div>
    </div>
  );
};