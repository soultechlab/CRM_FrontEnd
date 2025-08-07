import React, { useState } from 'react';
import { Plus, X, User, AlertCircle, Calendar, Hash, Instagram, Facebook } from 'lucide-react';
import { Cliente } from '../utils/localStorage';
import { salvarCliente } from '../../../services/apiService';
import { useAuth } from '../../../contexts/AuthContext';
import { Cliente as ClienteCompleto } from '../../../types';
import { toast } from 'react-toastify';

interface AddClientInlineProps {
  onClientAdded: (cliente: Cliente) => void;
  onCancel: () => void;
}

export function AddClientInline({ onClientAdded, onCancel }: AddClientInlineProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    instagram: '',
    facebook: '',
    indicadoPor: '',
    profissao: '',
    dataNascimento: '',
    origem: [] as string[],
    observacoes: '',
    status: 'prospecto' as 'ativo' | 'inativo' | 'prospecto',
    tiposServico: [] as string[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    nome?: string;
    email?: string;
    telefone?: string;
    general?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (formData.telefone && !/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(formData.telefone)) {
      newErrors.telefone = 'Telefone inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 11) {
      return digits
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3');
    }
    return digits.slice(0, 11)
      .replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const mapearDadosCliente = (dados: any, user: any) => {
    return {
      name: dados.nome,
      email: dados.email,
      phone: dados.telefone,
      instagram: dados.instagram,
      facebook: dados.facebook,
      referred_by: dados.indicadoPor,
      profession: dados.profissao,
      birth_date: dados.dataNascimento,
      origin: dados.origem,
      notes: dados.observacoes,
      status: dados.status || 'prospecto',
      service_type: dados.tiposServico ? dados.tiposServico[0] : '',
      user_id: user?.id,
    };
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const dadosCliente = {
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        telefone: formData.telefone.trim(),
        instagram: formData.instagram.trim(),
        facebook: formData.facebook.trim(),
        indicadoPor: formData.indicadoPor.trim(),
        profissao: formData.profissao.trim(),
        dataNascimento: formData.dataNascimento,
        origem: formData.origem.length > 0 ? formData.origem : ['lumi-docs'],
        observacoes: formData.observacoes.trim() || 'Cliente cadastrado via LumiDocs',
        status: formData.status,
        tiposServico: formData.tiposServico,
        dataCadastro: new Date().toISOString().split('T')[0],
      };

      const dadosMapeados = mapearDadosCliente(dadosCliente, user);
      const novoCliente = await salvarCliente(dadosMapeados, user);

      const clienteLumiDocs: Cliente = {
        id: novoCliente.id,
        nome: novoCliente.name || novoCliente.nome || formData.nome,
        email: novoCliente.email || formData.email,
        cpf: novoCliente.cpf || '', 
        created_at: novoCliente.created_at || novoCliente.dataCadastro || new Date().toISOString()
      };

      toast.success('Cliente cadastrado com sucesso!');

      onClientAdded(clienteLumiDocs);
      
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        instagram: '',
        facebook: '',
        indicadoPor: '',
        profissao: '',
        dataNascimento: '',
        origem: [],
        observacoes: '',
        status: 'prospecto',
        tiposServico: []
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar cliente. Tente novamente.';
      toast.error(errorMessage);
      
      setErrors({
        general: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData({ ...formData, telefone: formatted });
  };

  const handleOrigemChange = (origem: string) => {
    setFormData(prev => ({
      ...prev,
      origem: prev.origem.includes(origem)
        ? prev.origem.filter(o => o !== origem)
        : [...prev.origem, origem]
    }));
  };

  const handleServicoChange = (servico: string) => {
    setFormData(prev => ({
      ...prev,
      tiposServico: prev.tiposServico.includes(servico)
        ? prev.tiposServico.filter(s => s !== servico)
        : [...prev.tiposServico, servico]
    }));
  };

  return (
    <div className="border-t border-gray-200 pt-4 mt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <User className="h-5 w-5 text-blue-600 mr-2" />
          <h4 className="text-sm font-medium text-gray-900">Adicionar novo cliente</h4>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-500"
          disabled={isSubmitting}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Nome */}
        <div>
          <label htmlFor="addClientName" className="block text-sm font-medium text-gray-700 mb-1">
            Nome *
          </label>
          <input
            id="addClientName"
            type="text"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.nome ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Digite o nome completo"
            disabled={isSubmitting}
          />
          {errors.nome && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {errors.nome}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="addClientEmail" className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            id="addClientEmail"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="cliente@exemplo.com"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {errors.email}
            </p>
          )}
        </div>

        {/* Telefone */}
        <div>
          <label htmlFor="addClientPhone" className="block text-sm font-medium text-gray-700 mb-1">
            Telefone
          </label>
          <input
            id="addClientPhone"
            type="text"
            value={formData.telefone}
            onChange={handlePhoneChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.telefone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="(11) 99999-9999"
            maxLength={15}
            disabled={isSubmitting}
          />
          {errors.telefone && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {errors.telefone}
            </p>
          )}
        </div>

        {/* Instagram */}
        <div>
          <label htmlFor="addClientInstagram" className="block text-sm font-medium text-gray-700 mb-1">
            Instagram
          </label>
          <div className="relative">
            <Instagram className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              id="addClientInstagram"
              type="text"
              value={formData.instagram}
              onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="@usuario"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Facebook */}
        <div>
          <label htmlFor="addClientFacebook" className="block text-sm font-medium text-gray-700 mb-1">
            Facebook
          </label>
          <div className="relative">
            <Facebook className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              id="addClientFacebook"
              type="text"
              value={formData.facebook}
              onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nome no Facebook"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Profissão */}
        <div>
          <label htmlFor="addClientProfession" className="block text-sm font-medium text-gray-700 mb-1">
            Profissão
          </label>
          <input
            id="addClientProfession"
            type="text"
            value={formData.profissao}
            onChange={(e) => setFormData({ ...formData, profissao: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Advogada, Médico, Estudante..."
            disabled={isSubmitting}
          />
        </div>

        {/* Data de Nascimento */}
        <div>
          <label htmlFor="addClientBirthDate" className="block text-sm font-medium text-gray-700 mb-1">
            Data de Nascimento
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              id="addClientBirthDate"
              type="date"
              value={formData.dataNascimento}
              onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Indicado Por */}
        <div>
          <label htmlFor="addClientReferredBy" className="block text-sm font-medium text-gray-700 mb-1">
            Indicado Por
          </label>
          <input
            id="addClientReferredBy"
            type="text"
            value={formData.indicadoPor}
            onChange={(e) => setFormData({ ...formData, indicadoPor: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nome de quem indicou"
            disabled={isSubmitting}
          />
        </div>

        {/* Origem */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Origem do Cliente
          </label>
          <div className="grid grid-cols-2 gap-2">
            {['facebook', 'instagram', 'indicacao', 'anuncio', 'tiktok', 'outros'].map((origem) => (
              <label key={origem} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.origem.includes(origem)}
                  onChange={() => handleOrigemChange(origem)}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isSubmitting}
                />
                <span className="text-sm text-gray-700 capitalize">{origem}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Status */}
        <div>
          <label htmlFor="addClientStatus" className="block text-sm font-medium text-gray-700 mb-1">
            Status *
          </label>
          <select
            id="addClientStatus"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ativo' | 'inativo' | 'prospecto' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            <option value="prospecto">Prospecto</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>

        {/* Tipos de Serviço */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipos de Serviço
          </label>
          <div className="grid grid-cols-2 gap-2">
            {['unico', 'recorrente', 'trimestral', 'semestral', 'anual'].map((servico) => (
              <label key={servico} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.tiposServico.includes(servico)}
                  onChange={() => handleServicoChange(servico)}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isSubmitting}
                />
                <span className="text-sm text-gray-700 capitalize">{servico}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Observações */}
        <div>
          <label htmlFor="addClientNotes" className="block text-sm font-medium text-gray-700 mb-1">
            Observações
          </label>
          <textarea
            id="addClientNotes"
            value={formData.observacoes}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Informações adicionais sobre o cliente..."
            rows={2}
            disabled={isSubmitting}
          />
        </div>

        {/* Erro geral */}
        {errors.general && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.general}
            </p>
          </div>
        )}

        {/* Botões */}
        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            disabled={isSubmitting || !formData.nome.trim() || !formData.email.trim()}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Cliente
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}