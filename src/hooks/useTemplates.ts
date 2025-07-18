import { useState, useCallback } from 'react';
import {
  DocumentTemplate,
  DocumentTemplateFilters,
  CreateDocumentTemplateData,
  CreateDocumentFromTemplateData
} from '../types';
import {
  obterTemplatesDocumentos,
  obterTemplatesDisponiveis,
  criarTemplateDocumento,
  atualizarTemplateDocumento,
  excluirTemplateDocumento,
  alternarStatusTemplateDocumento,
  criarDocumentoAPartirDoTemplate,
  obterEstatisticasTemplates,
  obterTemplatesLixeira,
  restaurarTemplateDocumento,
  debugTemplateDocumento
} from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';

interface UseTemplatesReturn {
  templates: DocumentTemplate[];
  loading: boolean;
  error: string | null;
  
  // Actions
  obterTemplates: (filters?: DocumentTemplateFilters) => Promise<void>;
  obterTemplatesAvailables: () => Promise<{ default: DocumentTemplate[]; custom: DocumentTemplate[]; total: number } | null>;
  criar: (data: CreateDocumentTemplateData) => Promise<boolean>;
  atualizar: (id: number, data: Partial<CreateDocumentTemplateData>) => Promise<boolean>;
  excluir: (id: number) => Promise<boolean>;
  alternarStatus: (id: number) => Promise<boolean>;
  criarDocumento: (templateId: number, data: CreateDocumentFromTemplateData) => Promise<boolean>;
  obterEstatisticas: () => Promise<any>;
  obterLixeira: () => Promise<DocumentTemplate[]>;
  restaurar: (id: number) => Promise<boolean>;
  debug: (id: number) => Promise<any>;
  
  // Utilities
  clearError: () => void;
  setError: React.Dispatch<React.SetStateAction<string | null>>; // Adicionar setError aqui
}

export function useTemplates(): UseTemplatesReturn {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const obterTemplates = useCallback(async (filters?: DocumentTemplateFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await obterTemplatesDocumentos(filters || {}, user);
      
      if (response.success && response.data?.data) {
        setTemplates(response.data.data);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar templates');
      console.error('Erro ao obter templates:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const obterTemplatesAvailables = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await obterTemplatesDisponiveis(user);
      
      if (response.success) {
        return {
          default: response.data.default || [],
          custom: response.data.custom || [],
          total: response.data.total || 0
        };
      }
      
      return null;
    } catch (err: any) {
      console.warn('API de templates não disponível, usando modo demo:', err.message);
      
      // Modo demo - retornar templates de exemplo
      const demoTemplates = [
        {
          id: 1,
          name: 'Contrato de Ensaio Fotográfico',
          description: 'Template padrão para contratos de ensaio',
          file_path: '#demo',
          category: 'Ensaios',
          is_default: true,
          is_active: true,
          type: 'default' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Contrato de Casamento',
          description: 'Template para eventos de casamento',
          file_path: '#demo',
          category: 'Eventos',
          is_default: true,
          is_active: true,
          type: 'default' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      setError('⚠️ Modo demonstração - Backend não conectado');
      
      return {
        default: demoTemplates,
        custom: [],
        total: demoTemplates.length
      };
    } finally {
      setLoading(false);
    }
  }, [user]);

  const criar = useCallback(async (data: CreateDocumentTemplateData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await criarTemplateDocumento(data, user);
      
      if (response.success) {
        // Atualizar a lista local
        if (response.data) {
          setTemplates(prev => [...prev, response.data]);
        }
        return true;
      }
      
      return false;
    } catch (err: any) {
      console.warn('API de criação não disponível, simulando criação:', err.message);
      
      // Modo demo - simular criação
      const novoTemplate = {
        id: Date.now(),
        name: data.name,
        description: data.description,
        file_path: '#demo',
        category: data.category,
        is_default: data.is_default || false,
        is_active: data.is_active || true,
        type: data.type || 'custom' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setTemplates(prev => [...prev, novoTemplate]);
      setError('⚠️ Modo demonstração - Template criado localmente');
      
      return true;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const atualizar = useCallback(async (id: number, data: Partial<CreateDocumentTemplateData>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await atualizarTemplateDocumento(id, data, user);
      
      if (response.success) {
        // Atualizar na lista local
        setTemplates(prev => 
          prev.map(template => 
            template.id === id ? { ...template, ...response.data } : template
          )
        );
        return true;
      }
      
      return false;
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar template');
      console.error('Erro ao atualizar template:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const excluir = useCallback(async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await excluirTemplateDocumento(id, user);
      
      if (response.success) {
        // Remover da lista local (soft delete)
        setTemplates(prev => prev.filter(template => template.id !== id));
        return true;
      }
      
      return false;
    } catch (err: any) {
      console.warn('API de exclusão não disponível, simulando exclusão:', err.message);
      
      // Modo demo - simular exclusão
      setTemplates(prev => prev.filter(template => template.id !== id));
      setError('⚠️ Modo demonstração - Template removido localmente');
      
      return true;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const alternarStatus = useCallback(async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await alternarStatusTemplateDocumento(id, user);
      
      if (response.success) {
        // Atualizar status na lista local
        setTemplates(prev => 
          prev.map(template => 
            template.id === id 
              ? { ...template, is_active: !template.is_active }
              : template
          )
        );
        return true;
      }
      
      return false;
    } catch (err: any) {
      console.warn('API de status não disponível, simulando alteração:', err.message);
      
      // Modo demo - simular alteração de status
      setTemplates(prev => 
        prev.map(template => 
          template.id === id 
            ? { ...template, is_active: !template.is_active }
            : template
        )
      );
      setError('⚠️ Modo demonstração - Status alterado localmente');
      
      return true;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const criarDocumento = useCallback(async (templateId: number, data: CreateDocumentFromTemplateData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await criarDocumentoAPartirDoTemplate(templateId, data, user);
      
      if (response.success) {
        return true;
      }
      
      return false;
    } catch (err: any) {
      setError(err.message || 'Erro ao criar documento a partir do template');
      console.error('Erro ao criar documento:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const obterEstatisticas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await obterEstatisticasTemplates(user);
      
      if (response.success) {
        return response.data;
      }
      
      return null;
    } catch (err: any) {
      setError(err.message || 'Erro ao obter estatísticas');
      console.error('Erro ao obter estatísticas:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const obterLixeira = useCallback(async (): Promise<DocumentTemplate[]> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await obterTemplatesLixeira(user);
      
      if (response.success && response.data?.data) {
        return response.data.data;
      }
      
      return [];
    } catch (err: any) {
      setError(err.message || 'Erro ao obter templates da lixeira');
      console.error('Erro ao obter lixeira:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  const restaurar = useCallback(async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await restaurarTemplateDocumento(id, user);
      
      if (response.success) {
        return true;
      }
      
      return false;
    } catch (err: any) {
      setError(err.message || 'Erro ao restaurar template');
      console.error('Erro ao restaurar template:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const debug = useCallback(async (id: number): Promise<any> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await debugTemplateDocumento(id, user);
      
      if (response.success) {
        return response.data;
      }
      
      return null;
    } catch (err: any) {
      setError(err.message || 'Erro ao obter debug do template');
      console.error('Erro ao obter debug do template:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    templates,
    loading,
    error,
    obterTemplates,
    obterTemplatesAvailables,
    criar,
    atualizar,
    excluir,
    alternarStatus,
    criarDocumento,
    obterEstatisticas,
    obterLixeira,
    restaurar,
    debug,
    clearError,
    setError
  };
}
