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
  
  obterTemplates: (filters?: DocumentTemplateFilters) => Promise<void>;
  obterTemplatesAvailables: () => Promise<{ default: DocumentTemplate[]; custom: DocumentTemplate[]; total: number } | null>;
  criar: (data: CreateDocumentTemplateData) => Promise<boolean>;
  atualizar: (id: number, data: Partial<CreateDocumentTemplateData>) => Promise<boolean>;
  excluir: (id: number) => Promise<{ success: boolean; isRealDelete: boolean; message: string }>;
  alternarStatus: (id: number) => Promise<boolean>;
  criarDocumento: (templateId: number, data: CreateDocumentFromTemplateData) => Promise<boolean>;
  obterEstatisticas: () => Promise<any>;
  obterLixeira: () => Promise<DocumentTemplate[]>;
  restaurar: (id: number) => Promise<boolean>;
  debug: (id: number) => Promise<any>;
  
  clearError: () => void;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
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
        if (response.data) {
          setTemplates(prev => [...prev, response.data]);
        }
        return true;
      } else {
        setError(response.message || 'Erro ao criar template');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar template de documento');
      return false;
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
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const excluir = useCallback(async (id: number): Promise<{ success: boolean; isRealDelete: boolean; message: string }> => {
    setLoading(true);
    setError(null);
    
    setTemplates(prev => prev.filter(template => template.id !== id));
    
    try {
      const response = await excluirTemplateDocumento(id, user);
      
      if (response.success) {
        return {
          success: true,
          isRealDelete: true,
          message: 'Template excluído permanentemente do servidor!'
        };
      }
      
      return {
        success: true,
        isRealDelete: false,
        message: 'Template removido da lista (não foi possível excluir do servidor)'
      };
    } catch (err: any) {
      
      return {
        success: true,
        isRealDelete: false,
        message: 'Template ocultado localmente (servidor não disponível)'
      };
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
