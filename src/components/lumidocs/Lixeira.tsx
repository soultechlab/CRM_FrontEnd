import React, { useState, useEffect } from 'react';
import { FileText, Search, RefreshCw, AlertTriangle, CheckCircle, RotateCcw, Trash2, ArrowLeft, Eye } from 'lucide-react';
import { LumiDocsHeader } from './components/LumiDocsHeader';
import { DocumentTemplate } from '../../types';
import { useTemplates } from '../../hooks/useTemplates';
import { mapApiToCategory, detectCategoryFromText, type ModelCategory } from '../../utils/categoryMapping';

interface TemplateWithCategory extends DocumentTemplate {
  category?: ModelCategory;
}

interface LixeiraProps {
  onBack: () => void;
}

export function Lixeira({ onBack }: LixeiraProps) {
  const {
    loading,
    error,
    obterLixeira,
    restaurar,
    debug,
    clearError
  } = useTemplates();
  
  const [trashedTemplates, setTrashedTemplates] = useState<TemplateWithCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    carregarTemplatesLixeira();
  }, []);

  const carregarTemplatesLixeira = async () => {
    try {
      clearError();
      
      const templates = await obterLixeira();
      
      // Mapear categoria da API para categorias do frontend
      const mapearCategoria = (template: DocumentTemplate): TemplateWithCategory => {
        let category: ModelCategory = 'outros';
        
        if (template.category) {
          category = mapApiToCategory(template.category);
        } else {
          category = detectCategoryFromText(template.name);
        }
        
        return { ...template, category };
      };
      
      const templatesWithCategory = templates.map(mapearCategoria);
      setTrashedTemplates(templatesWithCategory);
    } catch (error: any) {
      setError('Erro ao carregar templates da lixeira');
    }
  };

  const handleRestore = async (templateId: number, templateName: string) => {
    try {
      const success = await restaurar(templateId);
      if (success) {
        await carregarTemplatesLixeira(); // Recarregar lista
        setSuccessMessage(`Template "${templateName}" restaurado com sucesso!`);
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error: any) {
      setError('Erro ao restaurar template');
    }
  };

  const handleDebug = async (templateId: number) => {
    try {
      const debugData = await debug(templateId);
      setDebugInfo(debugData);
      setShowDebug(true);
    } catch (error: any) {
      // Debug silencioso em caso de erro
    }
  };

  const handleSync = async () => {
    await carregarTemplatesLixeira();
    setSuccessMessage('Lixeira sincronizada com sucesso!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const filteredTemplates = trashedTemplates.filter(template => {
    return !searchTerm || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <>
      <LumiDocsHeader 
        onNewDocumentClick={() => {}} 
        onNewModelClick={() => {}}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Lixeira - Templates Excluídos</h1>
            {loading && (
              <div className="flex items-center text-sm text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Carregando...
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSync}
              disabled={loading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Sincronizar lixeira"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Sincronizar
            </button>
          </div>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Erro</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* SUCCESS MESSAGE */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Sucesso</h3>
                <div className="mt-2 text-sm text-green-700">{successMessage}</div>
              </div>
            </div>
          </div>
        )}

        {/* SEARCH */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar templates excluídos..."
              className="w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            />
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
          </div>
          <div className="mt-4 text-sm text-gray-500">
            {filteredTemplates.length} template(s) na lixeira
          </div>
        </div>

        {/* CONTENT */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            {filteredTemplates.length === 0 ? (
              // Estado vazio
              <div className="text-center py-12">
                <Trash2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  {searchTerm ? 'Nenhum template encontrado' : 'Lixeira vazia'}
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  {searchTerm ? 'Tente termos de busca diferentes' : 'Templates excluídos aparecerão aqui'}
                </p>
              </div>
            ) : (
              // Grid de templates excluídos
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="border border-red-200 rounded-lg p-6 bg-red-50 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3">
                        <FileText className="h-8 w-8 text-red-600 mt-1" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-medium text-gray-900 truncate">{template.name}</h3>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Excluído
                            </span>
                          </div>
                          {template.description && (
                            <p className="text-sm text-gray-500 mt-1 overflow-hidden text-ellipsis" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>{template.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                      <span>Criado em: {new Date(template.created_at).toLocaleDateString('pt-BR')}</span>
                      <span className="text-red-600">Na lixeira</span>
                    </div>
                    
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDebug(template.id)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Debug template"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => handleRestore(template.id, template.name)}
                        disabled={loading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Restaurar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Debug Modal */}
      {showDebug && debugInfo && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDebug(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Debug Template #{debugInfo.id}
                  </h3>
                  <button
                    onClick={() => setShowDebug(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <span className="sr-only">Fechar</span>
                    ×
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setShowDebug(false)}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
