import React, { useState, useEffect, useCallback } from 'react';
import { Plus, FileText, Send, CheckCircle, Search, Calendar, X, Archive, ChevronLeft, ChevronRight, Trash2, AlertTriangle, Download, Eye, MoreVertical, ExternalLink, RefreshCw } from 'lucide-react';
import { Modal } from './components/Modal';
import { ConfirmationModal } from './components/ConfirmationModal';
import './utils/pdfConfig';
import { DocumentoForm } from './components/DocumentoForm';
import { DocumentStatus } from './components/DocumentStatus';
import { SignatureProgress } from './components/SignatureProgress';
import { DocumentViewer } from './components/DocumentViewer';
import { SendSignatureModal } from './components/SendSignatureModal';
import { SendStatus, SendStatusIcon } from './components/SendStatus';
import { LumiDocsHeader } from './components/LumiDocsHeader';
import { obterDocumentos, DocumentListParams, enviarDocumentoParaAssinatura, baixarDocumentoAssinado, arquivarDocumento, desarquivarDocumento, excluirDocumento, restaurarDocumento, verificarStatusDocumento, marcarDocumentoAssinado, sincronizarStatusDocumento, buscarDocumentosArquivados, buscarDocumentosLixeira, buscarEstatisticasDocumentos, limparDocumentosAntigosLixeira, marcarDocumentoPermanentementeExcluido } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import { BackendDocument } from '../../types';

type TabType = 'rascunhos' | 'enviados' | 'assinados' | 'arquivados' | 'lixeira';

const statusMapping: Record<TabType, string | undefined> = {
  'rascunhos': 'draft',
  'enviados': 'pending_signature', 
  'assinados': 'signed',
  'arquivados': 'archived', 
  'lixeira': undefined 
};


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
  const [monthSendCount, setMonthSendCount] = useState(0);
  const [sendLimit, setSendLimit] = useState(0);
  const [sendLimitReached, setSendLimitReached] = useState(false);
  const [periodStart, setPeriodStart] = useState<string | null>(null);
  const [periodEnd, setPeriodEnd] = useState<string | null>(null);

  const [selectedDocument, setSelectedDocument] = useState<BackendDocument | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedDocumentForSignature, setSelectedDocumentForSignature] = useState<BackendDocument | null>(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isResendMode, setIsResendMode] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState<Set<string>>(new Set());
  const [autoCheckInProgress, setAutoCheckInProgress] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPermanentDeleteModalOpen, setIsPermanentDeleteModalOpen] = useState(false);
  const [documentToPermanentDelete, setDocumentToPermanentDelete] = useState<string | null>(null);
  const [isPermanentDeleting, setIsPermanentDeleting] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [documentToRestore, setDocumentToRestore] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isCleanupModalOpen, setIsCleanupModalOpen] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<any>(null);

  const loadTabCounts = useCallback(async () => {
    if (!user) return;
    try {
      // Estatísticas por status (para abas)
      const statsResponse = await buscarEstatisticasDocumentos(user);
      const stats = statsResponse.data || {};
      setTabCounts({
        rascunhos: stats.draft || 0,
        enviados: stats.pending_signature || 0,
        assinados: stats.signed || 0,
        arquivados: stats.archived || 0,
        lixeira: stats.trashed || 0
      });

      // Estatísticas mensais (novo endpoint)
      const { getMonthlyDocumentStats } = await import('../../services/apiService');
      const monthlyStatsResponse = await getMonthlyDocumentStats(user);
      const monthly = monthlyStatsResponse.data || {};
      setMonthSendCount(monthly.month_sends || 0);
      setSendLimit(monthly.month_limit || 0);
      setSendLimitReached((monthly.month_sends || 0) >= (monthly.month_limit || 0));
      setPeriodStart(monthly.period_start || null);
      setPeriodEnd(monthly.period_end || null);
    } catch (err) {}
  }, [user]);

  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        setError('Usuário não autenticado');
        return;
      }
      
      let response;
      
      if (activeTab === 'arquivados') {
        response = await buscarDocumentosArquivados(user);
      } else if (activeTab === 'lixeira') {
        response = await buscarDocumentosLixeira(user);
      } else {
        const params: DocumentListParams = {
          page: currentPage,
          per_page: perPage
        };

        if (statusMapping[activeTab]) {
          params.status = statusMapping[activeTab] as any;
        }

        response = await obterDocumentos(params, user);
      }
      
      setDocumentos(response.data || []);
      setTotalPages(response.meta?.last_page || 1);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar documentos';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, activeTab, currentPage, perPage]);

  useEffect(() => {
    if (user && user.token) {
      loadDocuments();
    } else {
      setLoading(false);
      setError('Usuário não autenticado ou token inválido');
    }
  }, [user, activeTab, currentPage, loadDocuments]);

  useEffect(() => {
    if (user && user.token) {
      loadTabCounts();
    }
  }, [user, loadTabCounts]);


  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDocumentoSubmit = useCallback((novoDocumento: BackendDocument) => {
    setIsModalOpen(false);
    loadDocuments();
    loadTabCounts();
  }, [loadDocuments, loadTabCounts]);

  const handleSendDocument = async (documentId: string, signers?: Array<{
    id: number;
    signer_name: string;
    signer_email: string;
    signer_cpf?: string;
  }>) => {
    try {
      setError(null);
      
      setDocumentos(prev => prev.map(doc => 
        String(doc.id) === documentId 
          ? { ...doc, send_status: 'pending' as const }
          : doc
      ));

      const response = await enviarDocumentoParaAssinatura(documentId, user, signers);
      
      if (response.success) {
        setDocumentos(prev => prev.map(doc => 
          String(doc.id) === documentId 
            ? { 
                ...doc, 
                send_status: 'success' as const,
                last_send_attempt: new Date().toISOString(),
                status: 'pending_signature' as const
              }
            : doc
        ));
      } else {
        setDocumentos(prev => prev.map(doc => 
          String(doc.id) === documentId 
            ? { 
                ...doc, 
                send_status: 'failed' as const,
                send_error_message: response.error || 'Erro desconhecido',
                last_send_attempt: new Date().toISOString()
              }
            : doc
        ));
      }
      
      loadTabCounts();
      
    } catch (err: any) {
      setDocumentos(prev => prev.map(doc => 
        String(doc.id) === documentId 
          ? { 
              ...doc, 
              send_status: 'failed' as const,
              send_error_message: err.message || 'Erro ao enviar documento',
              last_send_attempt: new Date().toISOString()
            }
          : doc
      ));
      
      setError('Erro ao enviar documento para assinatura');
    }
  };

  const handleOpenSignatureModal = (document: BackendDocument, isResend = false) => {
    setSelectedDocumentForSignature(document);
    setIsResendMode(isResend);
    setIsSignatureModalOpen(true);
  };

  const handleCloseSignatureModal = () => {
    setIsSignatureModalOpen(false);
    setSelectedDocumentForSignature(null);
    setIsResendMode(false);
  };

  const handleCheckDocumentStatus = useCallback(async (documentId: string) => {
    try {
      setCheckingStatus(prev => new Set(prev).add(documentId));
      
      const response = await verificarStatusDocumento(documentId, user);
      
      if (response.success) {
        const { data } = response;
        const wasUpdated = data.local_status !== data.autentique_status || data.updated_signers > 0;
        const wasCompleted = data.all_signed && data.document.status === 'signed';
        
        if (wasCompleted) {
          const message = `Documento "${data.document.name}" foi totalmente assinado!`;
          setSuccessMessage(message);
          setTimeout(() => setSuccessMessage(null), 5000);
        }
        
        setDocumentos(prev => prev.map(doc => 
          String(doc.id) === documentId 
            ? { 
                ...doc, 
                ...data.document,
                status: data.document.status,
                signers: data.document.signers
              }
            : doc
        ));
        
        if (wasUpdated) {
          loadTabCounts();
          
          if (wasCompleted && activeTab === 'enviados') {
            loadDocuments();
          }
        }
      }
    } catch (err: any) {
      setError(`Erro ao verificar status do documento ${documentId}: ${err.message}`);
    } finally {
      setCheckingStatus(prev => {
        const newSet = new Set(prev);
        newSet.delete(documentId);
        return newSet;
      });
    }
  }, [user, loadTabCounts, loadDocuments]);

  const handleSyncAllDocuments = useCallback(async () => {
    if (!user || syncingAll) return;
    
    setSyncingAll(true);
    setError(null);
    
    try {
      const documentsToCheck = documentos.filter(doc => 
        doc.status === 'pending_signature' && 
        doc.signers.every(signer => signer.signer_status === 'signed')
      );
      
      for (const doc of documentsToCheck) {
        try {
          await handleCheckDocumentStatus(String(doc.id));
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
        }
      }
      
      setTimeout(() => {
        loadDocuments();
        loadTabCounts();
      }, 1000);
      
      setSuccessMessage(`Sincronização concluída! ${documentsToCheck.length} documentos verificados.`);
      setTimeout(() => setSuccessMessage(null), 5000);
      
    } catch (error) {
      setError('Erro ao sincronizar documentos');
    } finally {
      setSyncingAll(false);
    }
  }, [user, documentos, handleCheckDocumentStatus, loadDocuments, loadTabCounts, syncingAll]);

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
    }
  };

  const handleArchiveDocument = useCallback(async (documentId: string) => {
    try {
      setError(null);
      await arquivarDocumento(documentId, user);
      loadDocuments();
      loadTabCounts();
    } catch (err) {
      setError('Erro ao arquivar documento');
    }
  }, [user, loadDocuments, loadTabCounts]);

  const handleDeleteDocument = useCallback(async (documentId: string) => {
    setDocumentToDelete(documentId);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!documentToDelete) return;
    
    try {
      setIsDeleting(true);
      setError(null);
      await excluirDocumento(documentToDelete, user);
      loadDocuments();
      loadTabCounts();
      setIsDeleteModalOpen(false);
      setDocumentToDelete(null);
    } catch (err) {
      setError('Erro ao excluir documento');
    } finally {
      setIsDeleting(false);
    }
  }, [documentToDelete, user, loadDocuments, loadTabCounts]);

  const handleCancelDelete = useCallback(() => {
    setIsDeleteModalOpen(false);
    setDocumentToDelete(null);
  }, []);

  const handleRestoreDocument = useCallback(async (documentId: string) => {
    setDocumentToRestore(documentId);
    setIsRestoreModalOpen(true);
  }, []);

  const handleConfirmRestore = useCallback(async () => {
    if (!documentToRestore) return;
    
    try {
      setIsRestoring(true);
      setError(null);
      await restaurarDocumento(documentToRestore, user);
      loadDocuments();
      loadTabCounts();
      setSuccessMessage('Documento restaurado com sucesso!');
      setTimeout(() => setSuccessMessage(null), 3000);
      setIsRestoreModalOpen(false);
      setDocumentToRestore(null);
    } catch (err) {
      setError('Erro ao restaurar documento');
    } finally {
      setIsRestoring(false);
    }
  }, [documentToRestore, user, loadDocuments, loadTabCounts]);

  const handleCancelRestore = useCallback(() => {
    setIsRestoreModalOpen(false);
    setDocumentToRestore(null);
  }, []);

  const handlePermanentDelete = useCallback(async (documentId: string) => {
    setDocumentToPermanentDelete(documentId);
    setIsPermanentDeleteModalOpen(true);
  }, []);

  const handleConfirmPermanentDelete = useCallback(async () => {
    if (!documentToPermanentDelete) return;
    
    try {
      setIsPermanentDeleting(true);
      setError(null);
      await marcarDocumentoPermanentementeExcluido(documentToPermanentDelete, user);
      loadDocuments();
      loadTabCounts();
      setSuccessMessage('Documento marcado como permanentemente excluído!');
      setTimeout(() => setSuccessMessage(null), 3000);
      setIsPermanentDeleteModalOpen(false);
      setDocumentToPermanentDelete(null);
    } catch (err) {
      setError('Erro ao marcar documento como permanentemente excluído');
    } finally {
      setIsPermanentDeleting(false);
    }
  }, [documentToPermanentDelete, user, loadDocuments, loadTabCounts]);

  const handleCancelPermanentDelete = useCallback(() => {
    setIsPermanentDeleteModalOpen(false);
    setDocumentToPermanentDelete(null);
  }, []);

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

  const DocumentCard = ({ document }: { document: BackendDocument }) => {
    const isTrash = activeTab === 'lixeira';
    
    const deletionDate = isTrash && document.updated_at 
      ? new Date(new Date(document.updated_at).getTime() + 30 * 24 * 60 * 60 * 1000)
      : null;

    return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{document.name}</h3>
            {(document.status === 'pending_signature' || document.status === 'signed') && (
              <SendStatusIcon status={document.send_status} errorMessage={document.send_error_message} />
            )}
          </div>
          <p className="text-sm text-gray-600 mb-1">
            Cliente: {document.client?.name || 'Documento Universal'}
          </p>
          {isTrash ? (
            <>
              <p className="text-sm text-gray-500 mb-1">
                Criado em: {new Date(document.created_at).toLocaleDateString('pt-BR')}
              </p>
              <p className="text-sm text-gray-500 mb-1">
                Excluído em: {document.updated_at ? new Date(document.updated_at).toLocaleDateString('pt-BR') : 'Data não disponível'}
              </p>
              {deletionDate && (
                <p className="text-sm text-red-600 mb-2">
                  Exclusão permanente: {deletionDate.toLocaleDateString('pt-BR')}
                </p>
              )}
              <div className="mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Status anterior: {document.status === 'draft' ? 'Rascunho' : 
                                   document.status === 'pending_signature' ? 'Pendente' : 
                                   document.status === 'signed' ? 'Assinado' : 
                                   document.status === 'archived' ? 'Arquivado' : 'Desconhecido'}
                </span>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-2">
                Criado em: {new Date(document.created_at).toLocaleDateString('pt-BR')}
              </p>
              <DocumentStatus status={document.status} />
            </>
          )}
        </div>
        <div className="relative">
          <button className="p-1 rounded-full hover:bg-gray-100">
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {!isTrash && (
        <>
          <div className="mb-4">
            <SignatureProgress 
              signers={document.signers} 
              documentId={String(document.id)}
              documentStatus={document.status}
              onStatusUpdate={useCallback(() => {
                loadDocuments();
                loadTabCounts();
              }, [loadDocuments, loadTabCounts])}
              onSyncStatus={handleCheckDocumentStatus}
              onDocumentStatusChange={useCallback((documentId: string, newStatus: 'signed' | 'pending_signature') => {
                setDocumentos(prev => prev.map(doc => 
                  String(doc.id) === documentId 
                    ? { ...doc, status: newStatus }
                    : doc
                ));
              }, [])}
            />
          </div>

          {(document.status === 'pending_signature' || document.status === 'signed') && document.send_status && (
            <SendStatus 
              status={document.send_status} 
              errorMessage={document.send_error_message}
              lastAttempt={document.last_send_attempt}
            />
          )}
        </>
      )}

      <div className="flex flex-wrap gap-2">
        {isTrash ? (
          <>
            <button
              onClick={() => handleRestoreDocument(String(document.id))}
              className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Restaurar
            </button>
            <button
              onClick={() => handlePermanentDelete(String(document.id))}
              className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Marcar como Excluído
            </button>
          </>
        ) : (
          <>
        {document.status === 'draft' && !document.send_status && (
          <button
            onClick={() => handleOpenSignatureModal(document)}
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

        {document.status === 'pending_signature' && (
          <button
            onClick={() => handleOpenSignatureModal(document, true)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center ${
              document.send_status === 'failed' 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-yellow-600 text-white hover:bg-yellow-700'
            }`}
            title={document.send_status === 'failed' ? 'Tentar enviar novamente' : 'Reenviar para assinatura'}
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Tentar Novamente
          </button>
        )}

        {document.status === 'draft' && document.send_status === 'failed' && (
          <button
            onClick={() => handleOpenSignatureModal(document)}
            className="bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center"
            title="Tentar enviar novamente"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Tentar Novamente
          </button>
        )}

        
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

        <button
          onClick={() => handleViewDocument(document)}
          className="bg-gray-500 text-white px-3 py-2 rounded-md text-sm hover:bg-gray-600 transition-colors"
          title="Visualizar documento"
        >
          <Eye className="w-4 h-4" />
        </button>

        {(document.status === 'signed' || document.status === 'draft') && (
          <button
            onClick={() => handleArchiveDocument(String(document.id))}
            className="bg-indigo-500 text-white px-3 py-2 rounded-md text-sm hover:bg-indigo-600 transition-colors"
            title="Arquivar documento"
          >
            <Archive className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={() => handleDeleteDocument(String(document.id))}
          className="bg-red-500 text-white px-3 py-2 rounded-md text-sm hover:bg-red-600 transition-colors"
          title="Excluir documento"
        >
          <Trash2 className="w-4 h-4" />
        </button>
          </>
        )}
      </div>

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
  };

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
    <>
      <LumiDocsHeader onNewDocumentClick={() => setIsModalOpen(true)} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Documentos</h1>
              {autoCheckInProgress && (
                <div className="flex items-center text-sm text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Verificando status de assinaturas...
                </div>
              )}
              {syncingAll && (
                <div className="flex items-center text-sm text-green-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                  Sincronizando documentos...
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSyncAllDocuments}
                disabled={syncingAll}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Sincronizar status de todos os documentos"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${syncingAll ? 'animate-spin' : ''}`} />
                Sincronizar
              </button>
            </div>
        </div>

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

        {activeTab === 'lixeira' && (
          <div className="my-8 bg-yellow-50 border border-yellow-200 rounded-md p-6">
            <div className="flex justify-between items-start">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Aviso - Lixeira</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    Os documentos na lixeira são automaticamente excluídos permanentemente após 30 dias da data de exclusão.
                  </div>
                </div>
              </div>
              <button
                onClick={async () => {
                  try {
                    setError(null);
                    const result = await limparDocumentosAntigosLixeira(user);
                    loadDocuments();
                    loadTabCounts();
                    setSuccessMessage(`Limpeza concluída! ${result.data.deleted_count} documentos antigos foram excluídos permanentemente.`);
                    setTimeout(() => setSuccessMessage(null), 5000);
                  } catch (err) {
                    setError('Erro ao executar limpeza automática');
                  }
                }}
                className="inline-flex items-center px-3 py-2 border border-yellow-300 rounded-md text-sm font-medium text-yellow-800 bg-yellow-100 hover:bg-yellow-200 transition-colors"
                title="Excluir permanentemente documentos com mais de 30 dias na lixeira"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpar Antigos (30+ dias)
              </button>
            </div>
          </div>
        )}

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

        {selectedDocumentForSignature && (
          <SendSignatureModal
            document={selectedDocumentForSignature}
            isOpen={isSignatureModalOpen}
            onClose={handleCloseSignatureModal}
            onConfirm={handleSendDocument}
            isResend={isResendMode}
            currentSendCount={monthSendCount}
            sendLimit={sendLimit}
            sendLimitReached={sendLimitReached}
            userPlan={user.plan || 'free'}
          />
        )}

        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title="Excluir Documento"
          message="Tem certeza que deseja mover este documento para a lixeira? Esta ação pode ser desfeita."
          confirmText="Excluir"
          cancelText="Cancelar"
          type="danger"
          loading={isDeleting}
        />

        <ConfirmationModal
          isOpen={isPermanentDeleteModalOpen}
          onClose={handleCancelPermanentDelete}
          onConfirm={handleConfirmPermanentDelete}
          title="Marcar como Permanentemente Excluído"
          message="Tem certeza que deseja marcar este documento como permanentemente excluído? O documento ficará inacessível mas será mantido no sistema para auditoria."
          confirmText="Marcar como Excluído"
          cancelText="Cancelar"
          type="danger"
          loading={isPermanentDeleting}
        />

        <ConfirmationModal
          isOpen={isRestoreModalOpen}
          onClose={handleCancelRestore}
          onConfirm={handleConfirmRestore}
          title="Restaurar Documento"
          message="Tem certeza que deseja restaurar este documento? Ele será movido de volta para seu status anterior."
          confirmText="Restaurar"
          cancelText="Cancelar"
          type="success"
          loading={isRestoring}
        />
      </div>
    </>
  );
}
