import React, { useState, useEffect } from 'react';
import { Plus, FileText, Send, CheckCircle, Search, Calendar, X, Archive, ChevronLeft, ChevronRight, Trash2, AlertTriangle } from 'lucide-react';
import { Modal } from './components/Modal';
// Importar configuração do PDF logo no início
import './utils/pdfConfig';
import { DocumentoForm } from './components/DocumentoForm';
import { syncStorage as storage, Documento } from './utils/localStorage';
import { createTestData } from './utils/testData';

type TabType = 'rascunhos' | 'enviados' | 'assinados' | 'arquivados' | 'lixeira';

export function Documentos() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [activeTab, setActiveTab] = useState<TabType>('rascunhos');
  const [currentPage, setCurrentPage] = useState(1);
  const [documentos, setDocumentos] = useState(storage.getDocumentos());

  useEffect(() => {
    // Limpar dados antigos e recriar dados de teste
    localStorage.removeItem('clientes');
    localStorage.removeItem('documentos');
    localStorage.removeItem('modelos');
    
    if (storage.getClientes().length === 0 && storage.getDocumentos().length === 0) {
      createTestData();
      setDocumentos(storage.getDocumentos());
    }
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDocumentoSubmit = (novoDocumento: Documento) => {
    const novosDocumentos = [...documentos, novoDocumento];
    setDocumentos(novosDocumentos);
    localStorage.setItem('lumidocs_documentos', JSON.stringify(novosDocumentos));
    setIsModalOpen(false);
  };

  const totalPages = Math.floor(Math.random() * 10);

  const tabs = [
    {
      id: 'rascunhos',
      label: 'Rascunhos',
      icon: <FileText className="w-5 h-5" />,
      count: Math.floor(Math.random() * 100)
    },
    {
      id: 'enviados',
      label: 'Enviados',
      icon: <Send className="w-5 h-5" />,
      count: Math.floor(Math.random() * 100)
    },
    {
      id: 'assinados',
      label: 'Assinados',
      icon: <CheckCircle className="w-5 h-5" />,
      count: Math.floor(Math.random() * 100)
    },
    {
      id: 'arquivados',
      label: 'Arquivados',
      icon: <Archive className="w-5 h-5" />,
      count: Math.floor(Math.random() * 100)
    },
    {
      id: 'lixeira',
      label: 'Lixeira',
      icon: <Trash2 className="w-5 h-5" />,
      count: Math.floor(Math.random() * 100)
    }
  ] as const;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Documentos</h1>
            <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
            <Plus className="h-5 w-5 mr-2" />
            Novo Documento
            </button>
        </div>

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
                    placeholder="Buscar por nome do documento, nome do cliente ou email..."
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
                    className="inline-flex items-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                    <X className="h-5 w-5 mr-2" />
                    Limpar Filtros
                    </button>
                )}
                </div>
            </div>
            <div className="text-sm text-gray-500">
                0 documentos encontrados
            </div>
            </div>
        </div>

        {/* TABS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-5">
          <div className="grid grid-cols-1 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex flex-col items-center justify-center p-4 transition-all
                  ${activeTab === tab.id
                    ? 'bg-blue-50'
                    : 'hover:bg-gray-50'
                  }
                `}
              >
                <div className={`
                  p-2 rounded-lg mb-2
                  ${activeTab === tab.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-400 group-hover:text-gray-500'
                  }
                `}>
                  {tab.icon}
                </div>
                <span className={`
                  font-medium text-sm
                  ${activeTab === tab.id
                    ? 'text-blue-600'
                    : 'text-gray-600'
                  }
                `}>
                  {tab.label}
                </span>
                <span className={`
                  mt-1 px-2 py-0.5 rounded-full text-xs font-medium
                  ${activeTab === tab.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                  }
                `}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* PAGINATION */}
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-4 mt-5">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Itens por página:</span>
            <select
              className="border rounded-md px-2 py-1 text-sm"
            >
              <option value={10}>10</option>
              <option value={30}>30</option>
              <option value={100}>100</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              className="p-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  const distance = Math.abs(page - currentPage);
                  return distance === 0 || distance === 1 || page === 1 || page === totalPages;
                })
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2">...</span>
                    )}
                    <button
                      onClick={() => handlePageChange(page)}
                      className={`w-8 h-8 rounded-md ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'border hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* DOCUMENTS */}
        <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mb-4 text-gray-400" />
            <p className="text-lg font-medium">
            {searchTerm || dateRange.start || dateRange.end
                ? 'Nenhum documento encontrado com os filtros aplicados'
                : `Nenhum documento ${
                    activeTab === 'rascunhos' ? 'em rascunho' : 
                    activeTab === 'enviados' ? 'enviado' : 
                    activeTab === 'assinados' ? 'assinado' : 
                    activeTab === 'arquivados' ? 'arquivado' :
                    'na lixeira'
                }`}
            </p>
        </div>
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Cadastrar Documento">
          <DocumentoForm onSubmit={handleDocumentoSubmit} />
        </Modal>
    </div>
  );
}