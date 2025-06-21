import React, { useState, useEffect } from 'react';
import { Plus, FileText, Send, CheckCircle, Search, Calendar, X, Archive, ChevronLeft, ChevronRight, Trash2, AlertTriangle, Download, Eye, MoreVertical, ExternalLink } from 'lucide-react';
import { Modal } from './components/Modal';
// Importar configuração do PDF logo no início
import './utils/pdfConfig';
import { DocumentoForm } from './components/DocumentoForm';
import { DocumentStatus } from './components/DocumentStatus';
import { SignatureProgress } from './components/SignatureProgress';
import { DocumentViewer } from './components/DocumentViewer';
import { obterDocumentos, DocumentListParams, enviarDocumentoParaAssinatura, baixarDocumentoAssinado, arquivarDocumento, desarquivarDocumento, excluirDocumento, restaurarDocumento } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';

type TabType = 'rascunhos' | 'enviados' | 'assinados' | 'arquivados' | 'lixeira';

const statusMapping: Record<TabType, string | undefined> = {
  'rascunhos': 'draft',
  'enviados': 'pending_signature', 
  'assinados': 'signed',
  'arquivados': undefined, // Will be handled separately
  'lixeira': undefined // Will be handled separately
};

interface BackendDocument {
  id: string | number;
  name: string;
  status: 'draft' | 'pending_signature' | 'signed' | 'rejected';
  storage_url: string;
  signed_document_url?: string;
  autentique_document_id?: string;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  client?: {
    id: number;
    name: string;
    email: string;
  };
  signers: Array<{
    id: number;
    signer_name: string;
    signer_email: string;
    signer_cpf?: string;
    signer_status: string;
    signature_url?: string;
    autentique_signer_id?: string;
  }>;
}

export function Documentos() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [activeTab, setActiveTab] = useState<TabType>('rascunhos');
  const [currentPage, setCurrentPage] = useState(1);
  const [documentos, setDocumentos] = useState<BackendDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(15);
  const [tabCounts, setTabCounts] = useState({
    rascunhos: 0,
    enviados: 0,
    assinados: 0,
    arquivados: 0,
    lixeira: 0
  });

  const [selectedDocument, setSelectedDocument] = useState<BackendDocument | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const loadTabCounts = async () => {
    if (!user) return;
    
    try {
      const promises = [
        obterDocumentos({ status: 'draft', per_page: 1000 }, user),
        obterDocumentos({ status: 'pending_signature', per_page: 1000 }, user),
        obterDocumentos({ status: 'signed', per_page: 1000 }, user),
        obterDocumentos({ is_active: false, per_page: 1000 }, user),
      ];

      const [rascunhosRes, enviadosRes, assinadosRes, arquivadosRes] = await Promise.all(promises);
      
      setTabCounts({
        rascunhos: rascunhosRes.data?.length || 0,
        enviados: enviadosRes.data?.length || 0,
        assinados: assinadosRes.data?.length || 0,
        arquivados: arquivadosRes.data?.length || 0,
        lixeira: 0 // Implementar lógica para lixeira se necessário
      });
    } catch (err) {
      console.error('Erro ao carregar contagens:', err);
    }
  };

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      
      if (!user) {
        setError('Usuário não autenticado');
        return;
      }
      
      const params: DocumentListParams = {
        page: currentPage,
        per_page: perPage
      };

      if (statusMapping[activeTab]) {
        params.status = statusMapping[activeTab] as any;
      }

      // Para arquivados, usamos is_active: false
      if (activeTab === 'arquivados') {
        params.is_active = false;
      } else if (activeTab !== 'lixeira') {
        params.is_active = true;
      }

      const response = await obterDocumentos(params, user);
      
      setDocumentos(response.data || []);
      setTotalPages(response.meta?.last_page || 1);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar documentos';
      setError(errorMessage);
      console.error('Erro ao carregar documentos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.token) {
      loadDocuments();
    } else {
      setLoading(false);
      setError('Usuário não autenticado ou token inválido');
    }
  }, [user, activeTab, currentPage]);

  // Carregar contagens apenas uma vez quando o usuário é autenticado
  useEffect(() => {
    if (user && user.token) {
      loadTabCounts();
    }
  }, [user]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDocumentoSubmit = (novoDocumento: BackendDocument) => {
    setIsModalOpen(false);
    loadDocuments(); // Reload documents after creating new one
    loadTabCounts(); // Reload counts after creating new document
  };

  const handleSendDocument = async (documentId: string) => {
    try {
      setError(null);
      await enviarDocumentoParaAssinatura(documentId, user);
      loadDocuments(); // Reload to get updated status
      loadTabCounts(); // Reload counts after status change
    } catch (err) {
      setError('Erro ao enviar documento para assinatura');
      console.error('Erro ao enviar documento:', err);
    }
  };

  const handleDownloadSigned = async (documentId: string, documentName: string) => {
    try {
      setError(null);
      const blob = await baixarDocumentoAssinado(documentId, user);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentName}_assinado.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Erro ao baixar documento assinado');
      console.error('Erro ao baixar documento:', err);
    }
  };

  const handleArchiveDocument = async (documentId: string) => {
    try {
      setError(null);
      await arquivarDocumento(documentId, user);
      loadDocuments(); // Reload to update list
      loadTabCounts(); // Reload counts after archiving
    } catch (err) {
      setError('Erro ao arquivar documento');
      console.error('Erro ao arquivar documento:', err);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (confirm('Tem certeza que deseja excluir este documento?')) {
      try {
        setError(null);
        await excluirDocumento(documentId, user);
        loadDocuments(); // Reload to update list
        loadTabCounts(); // Reload counts after deletion
      } catch (err) {
        setError('Erro ao excluir documento');
        console.error('Erro ao excluir documento:', err);
      }
    }
  };

  const getStatusText = (status: string) => {
    const statusTexts: Record<string, string> = {
      'draft': 'Rascunho',
      'pending_signature': 'Aguardando Assinatura',
      'signed': 'Assinado',
      'rejected': 'Rejeitado'
    };
    return statusTexts[status] || status;
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'draft': 'bg-gray-100 text-gray-800',
      'pending_signature': 'bg-yellow-100 text-yellow-800',
      'signed': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleViewDocument = (document: BackendDocument) => {
    setSelectedDocument(document);
    setIsViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
    setSelectedDocument(null);
  };

  const tabs = [
    {
      id: 'rascunhos',
      label: 'Rascunhos',
      icon: <FileText className="w-5 h-5" />,
      count: tabCounts.rascunhos
    },
    {
      id: 'enviados',
      label: 'Enviados',
      icon: <Send className="w-5 h-5" />,
      count: tabCounts.enviados
    },
    {
      id: 'assinados',
      label: 'Assinados',
      icon: <CheckCircle className="w-5 h-5" />,
      count: tabCounts.assinados
    },
    {
      id: 'arquivados',
      label: 'Arquivados',
      icon: <Archive className="w-5 h-5" />,
      count: tabCounts.arquivados
    },
    {
      id: 'lixeira',
      label: 'Lixeira',
      icon: <Trash2 className="w-5 h-5" />,
      count: tabCounts.lixeira
    }
  ] as const;

  const DocumentCard = ({ document }: { document: BackendDocument }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{document.name}</h3>
          <p className="text-sm text-gray-600 mb-1">
            Cliente: {document.client?.name || 'Documento Universal'}
          </p>
          <p className="text-sm text-gray-500 mb-2">
            Criado em: {new Date(document.created_at).toLocaleDateString('pt-BR')}
          </p>
          <DocumentStatus status={document.status} />
        </div>
        <div className="relative">
          <button className="p-1 rounded-full hover:bg-gray-100">
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <SignatureProgress signers={document.signers} />
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Action buttons based on document status */}
        {document.status === 'draft' && (
          <button
            onClick={() => handleSendDocument(String(document.id))}
            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <Send className="w-4 h-4 mr-1" />
            Enviar para Assinatura
          </button>
        )}
        
        {document.status === 'signed' && document.signed_document_url && (
          <button
            onClick={() => handleDownloadSigned(String(document.id), document.name)}
            className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <Download className="w-4 h-4 mr-1" />
            Download Assinado
          </button>
        )}
        
        {/* Signature links for pending documents */}
        {document.status === 'pending_signature' && document.signers.length > 0 && (
          <div className="flex-1 space-y-1">
            {document.signers
              .filter(signer => signer.signature_url && signer.signer_status === 'pending')
              .slice(0, 2)
              .map(signer => (
              <a
                key={signer.id}
                href={signer.signature_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-orange-500 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-orange-600 transition-colors text-center"
              >
                <ExternalLink className="w-3 h-3 inline mr-1" />
                Assinar - {signer.signer_name.split(' ')[0]}
              </a>
            ))}
          </div>
        )}

        {/* View document button */}
        <button
          onClick={() => handleViewDocument(document)}
          className="bg-gray-500 text-white px-3 py-2 rounded-md text-sm hover:bg-gray-600 transition-colors"
          title="Visualizar documento"
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* Archive button */}
        {(document.status === 'signed' || document.status === 'draft') && (
          <button
            onClick={() => handleArchiveDocument(String(document.id))}
            className="bg-indigo-500 text-white px-3 py-2 rounded-md text-sm hover:bg-indigo-600 transition-colors"
            title="Arquivar documento"
          >
            <Archive className="w-4 h-4" />
          </button>
        )}

        {/* Delete button */}
        <button
          onClick={() => handleDeleteDocument(String(document.id))}
          className="bg-red-500 text-white px-3 py-2 rounded-md text-sm hover:bg-red-600 transition-colors"
          title="Excluir documento"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Document info footer */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between text-xs text-gray-500">
          <span>ID: {String(document.id).slice(0, 8)}...</span>
          {document.autentique_document_id && (
            <span>Autentique: {String(document.autentique_document_id).slice(0, 8)}...</span>
          )}
        </div>
      </div>
    </div>
  );

  // If user is not authenticated, show login message
  if (!user || !user.token) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Não autenticado</h3>
          <p className="mt-1 text-sm text-gray-500">
            Você precisa fazer login para acessar os documentos.
          </p>
        </div>
      </div>
    );
  }

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
                {documentos.length} documento(s) encontrado(s)
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
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando documentos...</p>
            </div>
          </div>
        ) : documentos.length === 0 ? (
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {documentos.map((document) => (
              <DocumentCard key={document.id} document={document} />
            ))}
          </div>
        )}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Cadastrar Documento" maxWidth="max-w-6xl">
          <DocumentoForm onSubmit={handleDocumentoSubmit} />
        </Modal>

        {selectedDocument && (
          <DocumentViewer
            document={selectedDocument}
            isOpen={isViewerOpen}
            onClose={handleCloseViewer}
            onDocumentUpdate={loadDocuments}
          />
        )}
    </div>
  );
}