import axios from 'axios';
import { Agendamento, Cliente, DocumentStatusResponse, DocumentTemplate, DocumentTemplateFilters, CreateDocumentTemplateData, CreateDocumentFromTemplateData } from '../types';
import { User } from './auth/types';
import { Transacao } from '../types/financeiro';

const API_BASE_URL = import.meta.env.VITE_KODA_DESENVOLVIMENTO;

// Validar se a URL da API está configurada
if (!API_BASE_URL) {
  throw new Error('VITE_KODA_DESENVOLVIMENTO não está configurado no .env');
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos de timeout
});

// Helper para testar conectividade da API
export const testarConectividadeAPI = async (user: User | null) => {
  try {
    
    
    
    
    
    // Primeiro testar se o servidor está respondendo
    const healthResponse = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    }).catch(() => null);
    
    if (healthResponse) {
      
    } else {
      
    }
    
    // Testar o endpoint de documentos
    const testResponse = await fetch(`${API_BASE_URL}/documents`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${user?.token}`,
        'Content-Type': 'application/json',
      },
    });
    
    
    
    // Capturar conteúdo da resposta para análise
    const responseText = await testResponse.text();
    
    
    // Se retornar HTML, significa que há problema de roteamento
    const contentType = testResponse.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      return false;
    }
    
    return testResponse.status !== 404;
  } catch (error) {
    return false;
  }
};

// Autenticação
export const signIn = async (email: string, password: string): Promise<any> => {
  try {
    const response = await apiClient.post('/login', { email, password });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao fazer login');
  }
};

export const signUp = async (name: string, email: string, password: string): Promise<any> => {
  try {
    const response = await apiClient.post('/register', { email, password, name });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao fazer registro');
  }
};

export const signOut = async (user: User|null) => {
  try {
    const response = await apiClient.post('/logout', null, {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao fazer logout');
  }
}

// Clientes
export const obterClientes = async (user: User|null) => {
  try {
    const response = await apiClient.get('/clients', {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao obter clientes');
  }
}

export const salvarCliente = async (dadosCliente: Partial<Cliente>, user: User|null): Promise<Cliente> => {
  try {
    const response = await apiClient.post('/clients', dadosCliente, {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });

    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao salvar cliente');
  }
};

export const atualizarCliente = async (dadosCliente: Partial<Cliente>, clientId: any,user: User|null): Promise<Cliente> => {
  try {
    const response = await apiClient.put(`/clients/${clientId}`, dadosCliente, {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });

    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao obter clientes');
  }
}

export const excluirCliente = async (clientId: any, user: User|null) => {
  try {
    const response = await apiClient.delete(`/clients/${clientId}`, {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao deletar cliente');
  }
}

// Agendamentos
export const salvarAgendamento = async (dadosAgendamento: any, user: User|null): Promise<Agendamento> => {
  try {
    const response = await apiClient.post('/appointments', dadosAgendamento, {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });

    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao criar agendamento');
  }
};

export const atualizarAgendamento = async (agendamentoId: any, dadosAgendamento: any, user: User|null): Promise<Agendamento> => {
  try {
    const response = await apiClient.put(`/appointments/${agendamentoId}`, dadosAgendamento, {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });

    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao atualizar agendamento');
  }
};

export const obterAgendamentos = async (user: User|null) => {
  try {
    const response = await apiClient.get('/appointments', {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao obter agendamentos');
  }
}

export const excluirAgendamento = async (agendamentoId: string | number, user: User|null) => {
  try {
    const response = await apiClient.delete(`/appointments/${agendamentoId}`, {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao excluir agendamento');
  }
}

// Financeiro

export const salvarTransacao = async (dadosTransacao: any, user: User|null): Promise<Transacao> => {
  try {
    const response = await apiClient.post('/finances', dadosTransacao, {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao criar transação');
  }
}

export const obterTransacoes = async (user: User|null) => {
  try {
    const response = await apiClient.get('/finances', {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });
    return response.data.finances;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao obter transações');
  }
}

export const alterarTransacao = async (dadosTransacao: Partial<Transacao>, transacaoId: any,user: User|null) => {
  try {
    const response = await apiClient.put(`/finances/${transacaoId}`, dadosTransacao, {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });

    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao atualizar transação!');
  }
}

export const excluirTransacao = async (transacaoId: any, user: User|null) => {
  try {
    const response = await apiClient.delete(`/finances/${transacaoId}`, {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao deletar transacao');
  }
}

// Usuario

export const obterUsuarios = async (user: User|null) => {
  try {
    const response = await apiClient.get('/users', {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao obter agendamentos');
  }
}

export const adicionarUsuario = async (dadosUsuario: any, user: User|null) => {
  try {
    const response = await apiClient.post('/users', dadosUsuario, {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao adicionar usuário');
  }
}

export const atualizarUsuario = async (userId: any, dadosUsuario: Partial<User>, user: User|null) => {
  try {
    const response = await apiClient.put(`/users/${userId}`, dadosUsuario, {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao atualizar usuário');
  }
}

export const atualizarConfigUsuario = async (dadosUsuario: any, user: User|null) => {
  try {
    const response = await apiClient.put(`/settings-user/${user?.id}`, dadosUsuario, {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao atualizar dados');
  }
}

export const atualizarUsuarioTokenGoogle = async (token: string, user: User|null) => {
  try {
    const response = await apiClient.post(`/users/${user?.id}/add-calendar-token`, { token }, {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao atualizar token usuário');
  }
}

// Dashboard

export const buscarDadosDashboard = async (user: User|null) => {
  try {
    const response = await apiClient.get('dashboard', {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao buscar dados');
  }
}

export const getMonthlyDocumentStats = async (user: User | null) => {
  try {
    const response = await apiClient.get('/documents/monthly-stats', {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao obter estatísticas mensais de documentos');
  }
};

// Documentos

export interface DocumentListParams {
  page?: number;
  per_page?: number;
  status?: 'draft' | 'pending_signature' | 'signed' | 'rejected';
  is_active?: boolean;
  name?: string;
}

export interface SignerData {
  name: string;
  email: string;
  cpf?: string;
  fields: Array<{
    type: string;
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

export interface CreateDocumentData {
  name: string;
  client_id?: number;
  is_universal?: boolean;
  is_active?: boolean;
  file: File;
  signers?: SignerData[];
}

export const obterDocumentos = async (params: DocumentListParams, user: User | null) => {
  try {
    const response = await apiClient.get('/documents', {
      params,
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao obter documentos');
  }
};

export const criarDocumento = async (data: CreateDocumentData, user: User | null) => {
  try {
    const formData = new FormData();
    
    formData.append('file', data.file);
    formData.append('name', data.name);
    
    if (data.client_id) {
      formData.append('client_id', data.client_id.toString());
    }
    
    formData.append('is_universal', data.is_universal ? 'true' : 'false');
    formData.append('is_active', data.is_active ? 'true' : 'false');

    if (data.signers && data.signers.length > 0) {
      formData.append('signers', JSON.stringify(data.signers));
      
    } else {
      
    }

    if (!data.file || !(data.file instanceof File) || data.file.size === 0) {
      throw new Error('Arquivo PDF inválido ou corrompido');
    }


    const response = await fetch(`${API_BASE_URL}/documents`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
      body: formData
    });

    if (!response.ok) {
      // Capturar todo o conteúdo da resposta primeiro
      const responseText = await response.text();
      const contentType = response.headers.get('content-type');
      
      // Verificar se a resposta é HTML
      if (contentType && contentType.includes('text/html')) {
        // Procurar por mensagens de erro específicas no HTML
        if (responseText.includes('404') || responseText.includes('Not Found')) {
          throw new Error(`Endpoint não encontrado (404). Verifique se a rota /documents existe na API.`);
        } else if (responseText.includes('500') || responseText.includes('Internal Server Error')) {
          throw new Error(`Erro interno do servidor (500). Verifique os logs do backend.`);
        } else if (responseText.includes('nginx') || responseText.includes('Apache')) {
          throw new Error(`Servidor web retornou erro. Verifique se a API Laravel está rodando.`);
        } else {
          throw new Error(`Servidor retornou página HTML (${response.status}). API pode não estar funcionando corretamente.`);
        }
      }
      
      // Tentar parsear como JSON
      try {
        const errorData = JSON.parse(responseText);
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      } catch (jsonError) {
        throw new Error(`Resposta inválida da API (${response.status}): ${responseText.substring(0, 200)}`);
      }
    }

    const responseData = await response.json();
    return responseData;
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao criar documento');
  }
};

export const enviarDocumentoParaAssinatura = async (
  documentId: string, 
  user: User | null, 
  signers?: Array<{
    id: number;
    signer_name: string;
    signer_email: string;
    signer_cpf?: string;
  }>
) => {
  try {
    const requestBody = signers ? { signers } : {};
    const response = await apiClient.post(`/documents/${documentId}/send-autentique`, requestBody, {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao enviar documento para assinatura');
  }
};

export const marcarDocumentoAssinado = async (documentId: string, user: User | null) => {
  try {
    const response = await apiClient.post(`/documents/${documentId}/mark-signed`, {}, {
      headers: {
        Authorization: `Bearer ${user?.token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao marcar documento como assinado');
  }
};

export const sincronizarStatusDocumento = async (documentId: string, user: User | null) => {
  try {
    const response = await apiClient.post(`/documents/${documentId}/sync-status`, {}, {
      headers: {
        Authorization: `Bearer ${user?.token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao sincronizar status do documento');
  }
};

export const verificarStatusDocumento = async (documentId: string, user: User | null): Promise<DocumentStatusResponse> => {
  try {
    const headers = {
      Authorization: `Bearer ${user?.token}`,
      'Content-Type': 'application/json',
    };

    const response = await apiClient.get(`/documents/${documentId}/status`, {
      headers,
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao verificar status do documento');
  }
};

export const baixarDocumentoAssinado = async (documentId: string, user: User | null) => {
  try {
    const response = await apiClient.get(`/documents/${documentId}/download-signed`, {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
      responseType: 'blob',
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao baixar documento assinado');
  }
};

export const arquivarDocumento = async (documentId: string, user: User | null) => {
  try {
    const response = await apiClient.post(`/documents/${documentId}/archive`, {}, {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao arquivar documento');
  }
};

export const desarquivarDocumento = async (documentId: string, user: User | null) => {
  try {
    const response = await apiClient.post(`/documents/${documentId}/unarchive`, {}, {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao desarquivar documento');
  }
};

export const excluirDocumento = async (documentId: string, user: User | null) => {
  try {
    const response = await apiClient.delete(`/documents/${documentId}`, {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao excluir documento');
  }
};

export const buscarDocumentosArquivados = async (user: User | null, filters?: any) => {
  try {
    const response = await apiClient.get('/documents/archived', {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
      params: filters,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao buscar documentos arquivados');
  }
};

export const buscarDocumentosLixeira = async (user: User | null, filters?: any) => {
  try {
    const response = await apiClient.get('/documents/trashed', {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
      params: filters,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao buscar documentos na lixeira');
  }
};

export const buscarEstatisticasDocumentos = async (user: User | null) => {
  try {
    const response = await apiClient.get('/documents/stats', {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao buscar estatísticas');
  }
};

export const restaurarDocumento = async (documentId: string, user: User | null) => {
  try {
    const response = await apiClient.post(`/documents/${documentId}/restore`, 
      {}, {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao restaurar documento');
  }
};

export const limparDocumentosAntigosLixeira = async (user: User | null) => {
  try {
    const response = await apiClient.delete('/documents/cleanup-old-trashed', {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao limpar documentos antigos');
  }
};

export const marcarDocumentoPermanentementeExcluido = async (documentId: string, user: User | null) => {
  try {
    const response = await apiClient.put(`/documents/${documentId}/mark-permanently-deleted`, 
      {}, {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao marcar documento como permanentemente excluído');
  }
};

// Document Templates

export const obterTemplatesDocumentos = async (filters: DocumentTemplateFilters, user: User | null) => {
  try {
    const response = await apiClient.get('/document-templates', {
      params: filters,
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao obter templates de documentos');
  }
};

export const obterTemplatesDisponiveis = async (user: User | null) => {
  try {
    const response = await apiClient.get('/document-templates/available', {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || `Server Error (${error.response?.status})`);
  }
};

export const criarTemplateDocumento = async (data: CreateDocumentTemplateData, user: User | null) => {
  try {
    const formData = new FormData();
    
    formData.append('file', data.file);
    formData.append('name', data.name);
    formData.append('category', data.category);
    
    if (data.description) {
      formData.append('description', data.description);
    }
    
    if (data.default_fields) {
      formData.append('default_fields', data.default_fields);
    }
    
    formData.append('is_active', data.is_active !== false ? 'true' : 'false');
    
    if (data.is_default !== undefined) {
      formData.append('is_default', data.is_default ? 'true' : 'false');
    }
    
    if (data.type) {
      formData.append('type', data.type);
    }

    if (!data.file || !(data.file instanceof File) || data.file.size === 0) {
      throw new Error('Arquivo PDF inválido ou corrompido');
    }

    const response = await apiClient.post('/document-templates', formData, {
      headers: {
        Authorization: `Bearer ${user?.token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data?.message || `HTTP ${error.response.status}`);
    }
    throw new Error(error.message || 'Erro ao criar template de documento');
  }
};

export const obterTemplateDocumento = async (templateId: number, user: User | null) => {
  try {
    const response = await apiClient.get(`/document-templates/${templateId}`, {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao obter template de documento');
  }
};

export const atualizarTemplateDocumento = async (templateId: number, data: Partial<CreateDocumentTemplateData>, user: User | null) => {
  try {
    const formData = new FormData();
    
    // Obrigatório para multipart/form-data com PUT
    formData.append('_method', 'PUT');
    
    if (data.file) {
      formData.append('file', data.file);
    }
    
    if (data.name) {
      formData.append('name', data.name);
    }
    
    if (data.category) {
      formData.append('category', data.category);
    }
    
    if (data.description !== undefined) {
      formData.append('description', data.description);
    }
    
    if (data.default_fields) {
      formData.append('default_fields', data.default_fields);
    }
    
    if (data.is_active !== undefined) {
      formData.append('is_active', data.is_active ? 'true' : 'false');
    }
    
    if (data.is_default !== undefined) {
      formData.append('is_default', data.is_default ? 'true' : 'false');
    }
    
    if (data.type) {
      formData.append('type', data.type);
    }

    const response = await fetch(`${API_BASE_URL}/document-templates/${templateId}`, {
      method: 'POST', // Usar POST com _method=PUT conforme especificação
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao atualizar template de documento');
  }
};

export const excluirTemplateDocumento = async (templateId: number, user: User | null) => {
  try {
    const response = await apiClient.delete(`/document-templates/${templateId}`, {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao excluir template de documento');
  }
};

export const alternarStatusTemplateDocumento = async (templateId: number, user: User | null) => {
  try {
    const response = await apiClient.put(`/document-templates/${templateId}/toggle-active`, {}, {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao alterar status do template');
  }
};

export const criarDocumentoAPartirDoTemplate = async (templateId: number, data: CreateDocumentFromTemplateData, user: User | null) => {
  try {
    const response = await apiClient.post(`/document-templates/${templateId}/create-document`, data, {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao criar documento a partir do template');
  }
};

export const obterEstatisticasTemplates = async (user: User | null) => {
  try {
    const response = await apiClient.get('/document-templates/stats', {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao obter estatísticas dos templates');
  }
};

export const obterTemplatesLixeira = async (user: User | null) => {
  try {
    const response = await apiClient.get('/document-templates/trashed', {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao obter templates na lixeira');
  }
};

export const restaurarTemplateDocumento = async (templateId: number, user: User | null) => {
  try {
    const response = await apiClient.post('/document-templates/restore', {
      template_id: templateId // API espera template_id, não template_ids
    }, {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao restaurar template de documento');
  }
};

export const debugTemplateDocumento = async (templateId: number, user: User | null) => {
  try {
    const response = await apiClient.get(`/document-templates/debug/${templateId}`, {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao obter debug do template');
  }
};

export interface CreateTemplateFromHtmlData {
  name: string;
  category: string;
  html_content: string;
  description?: string;
  default_fields?: string;
  is_active?: boolean;
  is_default?: boolean;
  type?: 'default' | 'custom';
  styles: {
    font_family: string;
    font_size: number;
    color: string;
  };
}

export const criarTemplateDocumentoFromHtml = async (data: CreateTemplateFromHtmlData, user: User | null) => {
  try {
    const response = await apiClient.post('/document-templates/from-html', data, {
      headers: {
        Authorization: `Bearer ${user?.token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao criar template de documento a partir do HTML');
  }
};
