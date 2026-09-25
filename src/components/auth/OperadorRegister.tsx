import React, { useState } from 'react';
import { supabase } from '../../supabase';

interface OperadorRegisterProps {
  onBack: () => void;
}

export const OperadorRegister: React.FC<OperadorRegisterProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    senha: '',
    documento: '',
    razaoSocial: '',
    telefone: '',
    numeroCTF: '',
    tiposAtividade: [] as string[],
    tiposResiduo: [] as string[],
  });

  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    licencaOperacao: null,
    certificadobama: null,
    licencaVeiculo: null,
    artResponsavel: null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    if (e.target.files && e.target.files[0]) {
      setFiles({ ...files, [fieldName]: e.target.files[0] });
    }
  };

  const handleCheckboxChange = (value: string, listName: 'tiposAtividade' | 'tiposResiduo') => {
    const list = formData[listName];
    const updated = list.includes(value)
      ? list.filter((item) => item !== value)
      : [...list, value];
    setFormData({ ...formData, [listName]: updated });
  };

  const uploadDocument = async (file: File | null, pathPrefix: string, userId: string) => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/${pathPrefix}_${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from('documentos-operadores')
      .upload(filePath, file);

    if (error) {
      console.error(`Erro ao enviar ${pathPrefix}:`, error.message);
      return null;
    }

    const { data } = supabase.storage.from('documentos-operadores').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Criar usuário de Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.senha,
      });

      if (authError) throw authError;

      if (authData.user) {
        const userId = authData.user.id;

        // 2. Fazer upload dos PDFs/Imagens para o Storage
        const licencaUrl = await uploadDocument(files.licencaOperacao, 'licenca_operacao', userId);
        const ibamaUrl = await uploadDocument(files.certificadobama, 'certificado_ibama', userId);
        const veiculoUrl = await uploadDocument(files.licencaVeiculo, 'licenca_veiculo', userId);
        const artUrl = await uploadDocument(files.artResponsavel, 'art_responsavel', userId);

        // 3. Inserir os dados no banco de dados
        const { error: profileError } = await supabase.from('profiles_operador').insert([
          {
            id: userId,
            email: formData.email,
            documento: formData.documento,
            razao_social: formData.razaoSocial,
            telefone: formData.telefone,
            numero_ctf: formData.numeroCTF,
            tipos_atividade: formData.tiposAtividade,
            tipos_residuo: formData.tiposResiduo,
            licenca_operacao_url: licencaUrl,
            certificado_ibama_url: ibamaUrl,
            licenca_veiculo_url: veiculoUrl,
            art_responsavel_url: artUrl,
            status_aprovacao: 'EM_ANALISE',
          },
        ]);

        if (profileError) throw profileError;

        alert('Cadastro enviado para análise com sucesso!');
        onBack();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao cadastrar operador.');
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Cadastro de Operador Ambiental</h2>
        <p className="text-sm text-gray-500 mb-6">Cadastre sua empresa e insira a documentação necessária prevista na PNRS.</p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-md font-semibold text-gray-700 mb-3">1. Dados da Empresa Operadora</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-gray-700">E-mail *</label>
                <input type="email" required name="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="mt-1 w-full border rounded-lg p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Senha *</label>
                <input type="password" required name="senha" value={formData.senha} onChange={(e) => setFormData({ ...formData, senha: e.target.value })} className="mt-1 w-full border rounded-lg p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">CNPJ / CPF *</label>
                <input type="text" required name="documento" value={formData.documento} onChange={(e) => setFormData({ ...formData, documento: e.target.value })} className="mt-1 w-full border rounded-lg p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Razão Social / Nome *</label>
                <input type="text" required name="razaoSocial" value={formData.razaoSocial} onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })} className="mt-1 w-full border rounded-lg p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Nº Cadastro Técnico Federal (CTF / IBAMA) *</label>
                <input type="text" required name="numeroCTF" value={formData.numeroCTF} onChange={(e) => setFormData({ ...formData, numeroCTF: e.target.value })} className="mt-1 w-full border rounded-lg p-2 text-sm" placeholder="Ex: 1234567" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Telefone / WhatsApp *</label>
                <input type="text" required name="telefone" value={formData.telefone} onChange={(e) => setFormData({ ...formData, telefone: e.target.value })} className="mt-1 w-full border rounded-lg p-2 text-sm" />
              </div>
            </div>
          </div>

          <div className="border-b pb-4">
            <h3 className="text-md font-semibold text-gray-700 mb-3">2. Escopo de Atuação</h3>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-2">Serviços Oferecidos:</label>
              <div className="flex flex-wrap gap-4 text-sm">
                {['Coleta', 'Transporte', 'Armazenamento Temporário', 'Triagem/Reciclagem', 'Destinação Final'].map((ativ) => (
                  <label key={ativ} className="flex items-center space-x-2">
                    <input type="checkbox" checked={formData.tiposAtividade.includes(ativ)} onChange={() => handleCheckboxChange(ativ, 'tiposAtividade')} className="rounded text-emerald-600" />
                    <span>{ativ}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Classes de Resíduos Atendidas:</label>
              <div className="flex flex-wrap gap-4 text-sm">
                {['Classe I (Perigosos)', 'Classe II A (Não Inertes)', 'Classe II B (Inertes)', 'Resíduos de Saúde (RSS)'].map((res) => (
                  <label key={res} className="flex items-center space-x-2">
                    <input type="checkbox" checked={formData.tiposResiduo.includes(res)} onChange={() => handleCheckboxChange(res, 'tiposResiduo')} className="rounded text-emerald-600" />
                    <span>{res}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-md font-semibold text-gray-700 mb-1">3. Anexo de Documentos Regulatórios</h3>
            <p className="text-xs text-gray-500 mb-4">Envie os PDFs ou imagens das licenças e autorizações válidas.</p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="border p-3 rounded-lg bg-gray-50">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Licença Ambiental de Operação (LAO) *</label>
                <input type="file" accept=".pdf,.png,.jpg,.jpeg" required onChange={(e) => handleFileChange(e, 'licencaOperacao')} className="text-xs w-full" />
              </div>

              <div className="border p-3 rounded-lg bg-gray-50">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Certificado de Regularidade IBAMA (CTF) *</label>
                <input type="file" accept=".pdf,.png,.jpg,.jpeg" required onChange={(e) => handleFileChange(e, 'certificadobama')} className="text-xs w-full" />
              </div>

              <div className="border p-3 rounded-lg bg-gray-50">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Licença/CIV do Veículo</label>
                <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => handleFileChange(e, 'licencaVeiculo')} className="text-xs w-full" />
              </div>

              <div className="border p-3 rounded-lg bg-gray-50">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Anotação de Resp. Técnica (ART/CRQ/CREA)</label>
                <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => handleFileChange(e, 'artResponsavel')} className="text-xs w-full" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {loading ? 'Enviando Dados e Licenças...' : 'Enviar Cadastro e Documentação para Análise'}
          </button>
        </form>
      </div>
    </div>
  );
};