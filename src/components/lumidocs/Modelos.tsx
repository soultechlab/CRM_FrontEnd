import React, { useState, useEffect } from 'react';
import { FileText, Search, Calendar, X, RefreshCw, AlertTriangle, CheckCircle, ScrollText, ArrowLeftRight, CalendarDays, Camera, Archive, Trash2, Eye } from 'lucide-react';
import { LumiDocsHeader } from './components/LumiDocsHeader';
import { NewModelModal } from './components/NewModelModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { DocumentoForm } from './components/DocumentoForm';
import { Modal } from './components/Modal';
import { ViewTemplateModal } from './components/ViewTemplateModal';
import { Lixeira } from './Lixeira';
import { TestSoftDelete } from './TestSoftDelete';
import { DocumentTemplate, CreateDocumentTemplateData, BackendDocument } from '../../types';
import { Cliente as LocalCliente } from '../../services/apiService'; 
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTemplates } from '../../hooks/useTemplates';
import { mapApiToCategory, mapCategoryToApi, detectCategoryFromText, type ModelCategory } from '../../utils/categoryMapping';
import { checkTemplateLimit, getPlanLimits } from '../../utils/planLimits';

interface TemplateWithCategory extends DocumentTemplate {
  category?: ModelCategory;
}

const categories: { key: ModelCategory; label: string; icon: React.ElementType }[] = [
  { key: 'contratos', label: 'Contratos', icon: ScrollText },
  { key: 'permuta', label: 'Permuta', icon: ArrowLeftRight },
  { key: 'eventos', label: 'Eventos', icon: CalendarDays },
  { key: 'ensaios', label: 'Ensaios', icon: Camera },
  { key: 'outros', label: 'Outros', icon: Archive },
];

export function Modelos() {
  const navigate = useNavigate();
  const { user } = useAuth(); 
  const {
    loading,
    error,
    obterTemplatesAvailables,
    criar,
    excluir,
    alternarStatus,
    clearError,
    setError 
  } = useTemplates();
  
  const [templates, setTemplates] = useState<TemplateWithCategory[]>([]);
  const [defaultTemplates, setDefaultTemplates] = useState<TemplateWithCategory[]>([]);
  const [customTemplates, setCustomTemplates] = useState<TemplateWithCategory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [activeFilter, setActiveFilter] = useState<'todos' | ModelCategory>('todos'); 

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    templateId: number | null;
    templateName: string;
  }>({
    isOpen: false,
    templateId: null,
    templateName: ''
  });
  const [showTrash, setShowTrash] = useState(false);
  const [showTest, setShowTest] = useState(false);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false); 
  const [selectedTemplateForUse, setSelectedTemplateForUse] = useState<TemplateWithCategory | null>(null); 
  const [templatePdfUrl, setTemplatePdfUrl] = useState<string | null>(null); 
  const [isViewTemplateModalOpen, setIsViewTemplateModalOpen] = useState(false); 
  const [selectedTemplateForView, setSelectedTemplateForView] = useState<TemplateWithCategory | null>(null);

  const templateLimitInfo = checkTemplateLimit(user?.plan || 'free', customTemplates.length);

  useEffect(() => {
    carregarTemplates();
  }, []);

  const carregarTemplates = async () => {
    try {
      clearError();
      
      const response = await obterTemplatesAvailables();
      
      if (response) {
        const defaultTpls = response.default || [];
        const customTpls = response.custom || [];
        
        const mapearCategoria = (template: DocumentTemplate): TemplateWithCategory => {
          let category: ModelCategory = 'outros';
          
          if (template.category) {
            category = mapApiToCategory(template.category);
          } else {
            category = detectCategoryFromText(template.name);
          }
          
          return { ...template, category };
        };
        
        const defaultTemplatesWithCategory = defaultTpls.map(mapearCategoria);
        const customTemplatesWithCategory = customTpls.map(mapearCategoria);
        
        setDefaultTemplates(defaultTemplatesWithCategory);
        setCustomTemplates(customTemplatesWithCategory);
        setTemplates([...defaultTemplatesWithCategory, ...customTemplatesWithCategory]);
      }
    } catch (error: any) {
      setError('Falha ao carregar templates. Tente novamente.');
    }
  };

  const handleNewTemplate = () => {
    setIsModalOpen(true);
  };

  const handleModelSubmit = async (modelData: {
    name: string;
    category: ModelCategory;
    description?: string;
    file: File;
  }) => {
    try {
      clearError();
      
      const templateData: CreateDocumentTemplateData = {
        name: modelData.name,
        category: mapCategoryToApi(modelData.category),
        description: modelData.description,
        file: modelData.file,
        is_active: true,
        is_default: false,
        type: 'custom'
      };
      
      const success = await criar(templateData);
      
      if (success) {
        await carregarTemplates();
        setSuccessMessage('Modelo criado com sucesso!');
        setIsModalOpen(false);
        
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError('Falha ao criar template. Verifique os dados e tente novamente.');
      }
    } catch (error: any) {
      setError('Erro ao criar modelo. Verifique os dados e tente novamente.');
    }
  };

  const handleSyncModels = async () => {
    await carregarTemplates();
    setSuccessMessage('Modelos sincronizados com sucesso!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };
  
  const handleDeleteTemplate = (templateId: number, templateName: string) => {
    setDeleteModal({
      isOpen: true,
      templateId,
      templateName
    });
  };
  
  const confirmDeleteTemplate = async () => {
    if (!deleteModal.templateId) return;
    
    try {
      const success = await excluir(deleteModal.templateId);
      if (success) {
        await carregarTemplates();
        setSuccessMessage('Template excluído com sucesso!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error: any) {
      setError('Erro ao excluir template. Tente novamente.');
    } finally {
      setDeleteModal({
        isOpen: false,
        templateId: null,
        templateName: ''
      });
    }
  };
  
  const closeDeleteModal = () => {
    if (loading) return; 
    setDeleteModal({
      isOpen: false,
      templateId: null,
      templateName: ''
    });
  };
  
  const handleToggleStatus = async (templateId: number) => {
    try {
      const success = await alternarStatus(templateId);
      if (success) {
        await carregarTemplates();
        setSuccessMessage('Status alterado com sucesso!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error: any) {
      setError('Erro ao alterar status. Tente novamente.');
    }
  };

  const handleUseTemplate = async (template: TemplateWithCategory) => {
    setSelectedTemplateForUse(template);
    const pdfUrl = template.storage_url || template.file_path || '';
    
    if (!pdfUrl) {
      setError('URL do PDF do template não encontrada');
      return;
    }

    let fullUrl = pdfUrl;
    if (!fullUrl.startsWith('http')) {
      const baseUrl = import.meta.env.VITE_KODA_DESENVOLVIMENTO || 'http://localhost:8080';
      fullUrl = `${baseUrl}${fullUrl.startsWith('/') ? '' : '/'}${fullUrl}`;
    }

    setTemplatePdfUrl(fullUrl);
    setIsDocumentModalOpen(true);
  };

  const handleDocumentSubmit = async (documento: BackendDocument) => {
    try {
      clearError();
      setSuccessMessage('Documento criado com sucesso a partir do modelo!');
      setTimeout(() => setSuccessMessage(null), 3000);
      setIsDocumentModalOpen(false);
      setSelectedTemplateForUse(null);
      setTemplatePdfUrl(null);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar documento a partir do modelo.');
    }
  };
  
  const handleViewTemplate = (template: TemplateWithCategory) => {
    setSelectedTemplateForView(template);
    setIsViewTemplateModalOpen(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateRange({ start: '', end: '' });
    setActiveFilter('todos'); 
  };

  const filteredTemplates = templates.filter(template => {
    const matchesFilter = activeFilter === 'todos' || template.category === activeFilter;
    const matchesSearch = !searchTerm || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDate = true;
    if (dateRange.start || dateRange.end) {
      const templateDate = new Date(template.created_at);
      if (dateRange.start) {
        matchesDate = matchesDate && templateDate >= new Date(dateRange.start);
      }
      if (dateRange.end) {
        matchesDate = matchesDate && templateDate <= new Date(dateRange.end);
      }
    }
    
    return matchesFilter && matchesSearch && matchesDate;
  });

  if (showTrash) {
    return <Lixeira onBack={() => setShowTrash(false)} />;
  }

  if (showTest) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4">
          <div className="mb-6">
            <button
              onClick={() => setShowTest(false)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              ← Voltar aos Modelos
            </button>
          </div>
          <TestSoftDelete />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LumiDocsHeader 
        onNewDocumentClick={() => {}} 
        onNewModelClick={handleNewTemplate}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center mb-8">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Modelos de Documentos</h1>
            {loading && (
              <div className="flex items-center text-sm text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Carregando modelos...
              </div>
            )}
          </div>
          <div className="flex items-center sm:space-x-3 w-full sm:w-auto">
            <button
              onClick={handleSyncModels}
              disabled={loading}
              className="inline-flex items-center justify-center w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Sincronizar modelos"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Sincronizar
            </button>
          </div>
        </div>

        {error && (
          <div className={`mb-6 rounded-md p-4 ${
            error.includes('Modo demonstração') 
              ? 'bg-yellow-50 border border-yellow-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex">
              <AlertTriangle className={`h-5 w-5 ${
                error.includes('Modo demonstração') ? 'text-yellow-400' : 'text-red-400'
              }`} />
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${
                  error.includes('Modo demonstração') ? 'text-yellow-800' : 'text-red-800'
                }`}>
                  {error.includes('Modo demonstração') ? 'Modo Demonstração' : 'Erro'}
                </h3>
                <div className={`mt-2 text-sm ${
                  error.includes('Modo demonstração') ? 'text-yellow-700' : 'text-red-700'
                }`}>
                  {error}
                  {error.includes('Modo demonstração') && (
                    <div className="mt-2 text-xs">
                      Para usar todas as funcionalidades, certifique-se de que o backend está rodando na porta 8080 com os endpoints de templates implementados.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

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

        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="flex-1 min-w-0">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nome do modelo ou descrição..."
                    className="w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                  />
                  <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row w-full">
                <div className="sm:w-48">
                  <div className="relative">
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                    />
                    <Calendar className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <div className="sm:w-48">
                  <div className="relative">
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                    />
                    <Calendar className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>
                {(searchTerm || dateRange.start || dateRange.end || activeFilter !== 'todos') && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <X className="h-5 w-5 mr-2" />
                    Limpar Filtros
                  </button>
                )}
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {filteredTemplates.length} modelo(s) encontrado(s)
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-5 overflow-x-auto">
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-6 divide-y xs:divide-y-0 sm:divide-x divide-gray-200 min-w-[400px]">
            <button
              onClick={() => setActiveFilter('todos')}
              className={`flex flex-col items-center justify-center p-4 transition-all ${activeFilter === 'todos' ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
            >
              <div className={`p-2 rounded-lg mb-2 ${activeFilter === 'todos' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                <FileText className="h-5 w-5" />
              </div>
              <span className={`text-sm font-medium ${activeFilter === 'todos' ? 'text-blue-700' : 'text-gray-700'}`}>Todos</span>
              <span className={`text-xs mt-1 ${activeFilter === 'todos' ? 'text-blue-600' : 'text-gray-500'}`}>{templates.length}</span>
            </button>

            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setActiveFilter(category.key)}
                className={`flex flex-col items-center justify-center p-4 transition-all ${activeFilter === category.key ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
              >
                <div className={`p-2 rounded-lg mb-2 ${activeFilter === category.key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                  <category.icon className="h-5 w-5" />
                </div>
                <span className={`text-sm font-medium ${activeFilter === category.key ? 'text-blue-700' : 'text-gray-700'}`}>{category.label}</span>
                <span className={`text-xs mt-1 ${activeFilter === category.key ? 'text-blue-600' : 'text-gray-500'}`}>{templates.filter(t => t.category === category.key).length}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-5">
          <div className="p-6">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Nenhum modelo encontrado nesta categoria</p>
                <p className="text-gray-400 text-sm mt-2">Clique em "Novo Modelo" para criar seu primeiro modelo</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3">
                        <FileText className="h-8 w-8 text-blue-600 mt-1" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-medium text-gray-900 truncate">{template.name}</h3>
                            {template.type === 'default' && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Padrão
                              </span>
                            )}
                            {!template.is_active && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Inativo
                              </span>
                            )}
                          </div>
                          {template.description && (
                            <p
                              className="text-sm text-gray-500 mt-1 overflow-hidden break-words max-w-full"
                              style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                wordBreak: 'break-word'
                              }}
                            >
                              {template.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                      <span>{new Date(template.created_at).toLocaleDateString('pt-BR')}</span>
                      <span className={template.is_active ? 'text-green-600' : 'text-red-600'}>
                        {template.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewTemplate(template)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Visualizar template"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {template.type === 'custom' && (
                          <button
                            onClick={() => handleDeleteTemplate(template.id, template.name)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir template"
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      
                      <button 
                        onClick={() => handleUseTemplate(template)}
                        disabled={!template.is_active}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          template.is_active 
                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Usar modelo
                      </button>
                    </div>
                  </div>
                ))} 
              </div>
            )}
          </div>
        </div>
      </div>

      <NewModelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModelSubmit}
        currentTemplateCount={customTemplates.length}
        templateLimit={templateLimitInfo.limit}
        templateLimitReached={templateLimitInfo.reached}
        userPlan={user?.plan || 'free'}
      />
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteTemplate}
        title="Excluir Template"
        message={`Tem certeza que deseja excluir o template "${deleteModal.templateName}"? Esta ação não pode ser desfeita.`}
        loading={loading}
        type="danger"
        confirmText="Excluir"
        cancelText="Cancelar"
      />
      <Modal
        isOpen={isDocumentModalOpen}
        onClose={() => {
          setIsDocumentModalOpen(false);
          setSelectedTemplateForUse(null);
          setTemplatePdfUrl(null);
        }}
        title={`Criar Documento - ${selectedTemplateForUse?.name || ''}`}
        maxWidth="max-w-7xl"
      >
        <DocumentoForm
initialData={selectedTemplateForUse ? {
            id: `template-${selectedTemplateForUse.id}`,
            name: `${selectedTemplateForUse.name} - ${new Date().toLocaleDateString()}`,
            storage_url: templatePdfUrl || '',
            status: 'draft' as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            signers: [],
user: user ? { id: Number(user.id), name: user.name, email: user.email } : { id: 0, name: '', email: '' }
          } : undefined}
          onSubmit={handleDocumentSubmit}
        />
      </Modal>
      <ViewTemplateModal template={selectedTemplateForView} isOpen={isViewTemplateModalOpen} onClose={() => { setIsViewTemplateModalOpen(false); setSelectedTemplateForView(null); }} />
    </div>
  );
}
