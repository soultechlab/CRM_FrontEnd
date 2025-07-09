import React, { useState } from 'react';
import { Plus, X, User, AlertCircle } from 'lucide-react';
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
    cpf: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    nome?: string;
    email?: string;
    cpf?: string;
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
    
    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/.test(formData.cpf.replace(/\D/g, ''))) {
      newErrors.cpf = 'CPF inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 11) {
      return digits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2');
    }
    return digits.slice(0, 11)
      .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  // Função para mapear dados igual à da página principal
  const mapearDadosCliente = (dados: any, user: any) => {
    return {
      name: dados.nome,
      email: dados.email,
      phone: dados.telefone || '',
      instagram: dados.instagram || '',
      facebook: dados.facebook || '',
      referred_by: dados.indicadoPor || '',
      profession: dados.profissao || '',
      birth_date: dados.dataNascimento || '',
      origin: dados.origem || ['lumi-docs'],
      notes: dados.observacoes || '',
      status: dados.status || 'prospecto',
      service_type: dados.tiposServico ? dados.tiposServico[0] : '',
      user_id: user?.id,
      // Campos adicionais para garantir compatibilidade
      registration_date: dados.dataCadastro || new Date().toISOString(),
      main_channel: dados.canalPrincipal || 'lumi-docs',
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Preparar dados do cliente seguindo a mesma estrutura da página principal
      const dadosCliente = {
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        telefone: '', // Vazio pois não é coletado no formulário inline
        instagram: '',
        facebook: '',
        indicadoPor: '',
        profissao: '',
        dataNascimento: '',
        origem: ['lumi-docs'],
        observacoes: `Cliente cadastrado via LumiDocs. CPF: ${formData.cpf}`,
        status: 'prospecto' as const,
        tiposServico: [],
        dataCadastro: new Date().toISOString(),
        // Campos para garantir compatibilidade com a tabela
        canalPrincipal: 'lumi-docs',
        endereco: {},
        preferencias: {},
        historico: {
          ultimaSessao: undefined,
          totalSessoes: 0,
          proximoAgendamento: undefined,
          valorTotalGasto: 0,
        },
        proximoAgendamento: undefined,
        ultimoAgendamento: undefined,
        totalGasto: 0,
      };

      // Mapear dados usando a mesma função da página principal
      const dadosMapeados = mapearDadosCliente(dadosCliente, user);

      // Criar cliente via API usando a mesma rota
      const novoCliente = await salvarCliente(dadosMapeados, user);

      // Converter para o formato esperado pelo LumiDocs
      const clienteLumiDocs: Cliente = {
        id: novoCliente.id,
        nome: novoCliente.name || novoCliente.nome,
        email: novoCliente.email || '',
        cpf: formData.cpf, // Manter formatação visual
        created_at: novoCliente.dataCadastro || new Date().toISOString()
      };

      // Notificar sucesso
      toast.success('Cliente cadastrado com sucesso!');

      onClientAdded(clienteLumiDocs);
      
      // Reset form
      setFormData({ nome: '', email: '', cpf: '' });
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar cliente. Tente novamente.';
      
      // Mostrar erro via toast
      toast.error(errorMessage);
      
      setErrors({
        general: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setFormData({ ...formData, cpf: formatted });
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

      <form onSubmit={handleSubmit} className="space-y-4">
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

        {/* CPF */}
        <div>
          <label htmlFor="addClientCPF" className="block text-sm font-medium text-gray-700 mb-1">
            CPF *
          </label>
          <input
            id="addClientCPF"
            type="text"
            value={formData.cpf}
            onChange={handleCPFChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.cpf ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="000.000.000-00"
            maxLength={14}
            disabled={isSubmitting}
          />
          {errors.cpf && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {errors.cpf}
            </p>
          )}
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
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            disabled={isSubmitting || !formData.nome.trim() || !formData.email.trim() || !formData.cpf.trim()}
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
      </form>
    </div>
  );
}