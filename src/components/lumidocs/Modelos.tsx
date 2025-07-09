import React, { useState } from 'react';
import { FileText, Search, Calendar, X, RefreshCw, AlertTriangle, CheckCircle, ScrollText, ArrowLeftRight, CalendarDays, Camera, Archive } from 'lucide-react';
import { LumiDocsHeader } from './components/LumiDocsHeader';
import { NewModelModal } from './components/NewModelModal';

type ModelCategory = 'contratos' | 'permuta' | 'eventos' | 'ensaios' | 'outros';

interface ModelTemplate {
  id: string;
  name: string;
  category: ModelCategory;
  description?: string;
  createdAt: Date;
}

const categories: { key: ModelCategory; label: string; icon: React.ElementType }[] = [
  { key: 'contratos', label: 'Contratos', icon: ScrollText },
  { key: 'permuta', label: 'Permuta', icon: ArrowLeftRight },
  { key: 'eventos', label: 'Eventos', icon: CalendarDays },
  { key: 'ensaios', label: 'Ensaios', icon: Camera },
  { key: 'outros', label: 'Outros', icon: Archive },
];

export function Modelos() {
  const [activeCategory, setActiveCategory] = useState<ModelCategory>('contratos');
  const [templates, setTemplates] = useState<ModelTemplate[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
      setLoading(true);
      setError(null);
      
      // TODO: Implementar criação do modelo via API
      console.log('Dados do modelo:', modelData);
      
      // Simular criação de modelo
      const newTemplate: ModelTemplate = {
        id: Date.now().toString(),
        name: modelData.name,
        category: modelData.category,
        description: modelData.description,
        createdAt: new Date(),
      };
      
      setTemplates(prev => [...prev, newTemplate]);
      setSuccessMessage('Modelo criado com sucesso!');
      setIsModalOpen(false);
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Erro ao criar modelo:', error);
      setError('Erro ao criar modelo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncModels = () => {
    setLoading(true);
    // Simular sincronização
    setTimeout(() => {
      setLoading(false);
      setSuccessMessage('Modelos sincronizados com sucesso!');
      setTimeout(() => setSuccessMessage(null), 3000);
    }, 2000);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateRange({ start: '', end: '' });
  };

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = template.category === activeCategory;
    const matchesSearch = !searchTerm || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDate = true;
    if (dateRange.start || dateRange.end) {
      const templateDate = new Date(template.createdAt);
      if (dateRange.start) {
        matchesDate = matchesDate && templateDate >= new Date(dateRange.start);
      }
      if (dateRange.end) {
        matchesDate = matchesDate && templateDate <= new Date(dateRange.end);
      }
    }
    
    return matchesCategory && matchesSearch && matchesDate;
  });

  return (
    <>
      <LumiDocsHeader 
        onNewDocumentClick={() => {}} 
        onNewModelClick={handleNewTemplate}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Modelos de Documentos</h1>
            {loading && (
              <div className="flex items-center text-sm text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Carregando modelos...
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSyncModels}
              disabled={loading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Sincronizar modelos"
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

        {/* FILTERS */}
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
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
              <div className="flex flex-col sm:flex-row gap-4">
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
                {(searchTerm || dateRange.start || dateRange.end) && (
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

        {/* TABS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-5">
          <div className="grid grid-cols-1 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setActiveCategory(category.key)}
                className={`
                  flex flex-col items-center justify-center p-4 transition-all
                  ${activeCategory === category.key
                    ? 'bg-blue-50'
                    : 'hover:bg-gray-50'
                  }
                `}
              >
                <div className={`
                  p-2 rounded-lg mb-2
                  ${activeCategory === category.key
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-500'
                  }
                `}>
                  <category.icon className="h-5 w-5" />
                </div>
                <span className={`
                  text-sm font-medium
                  ${activeCategory === category.key
                    ? 'text-blue-700'
                    : 'text-gray-700'
                  }
                `}>
                  {category.label}
                </span>
                <span className={`
                  text-xs mt-1
                  ${activeCategory === category.key
                    ? 'text-blue-600'
                    : 'text-gray-500'
                  }
                `}>
                  {templates.filter(t => t.category === category.key).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-5">
          <div className="p-6">
            {filteredTemplates.length === 0 ? (
              // Estado vazio
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  Nenhum modelo encontrado nesta categoria
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Clique em "Novo Modelo" para criar seu primeiro modelo
                </p>
              </div>
            ) : (
              // Grid de modelos
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <FileText className="h-8 w-8 text-blue-600 mr-3" />
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                          {template.description && (
                            <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {template.createdAt.toLocaleDateString()}
                      </span>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
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

      {/* Modal para novo modelo */}
      <NewModelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModelSubmit}
      />
    </>
  );
}