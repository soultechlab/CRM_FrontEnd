import React, { useState } from 'react';
import { X, Download, ExternalLink, Send, Archive, Trash2, Eye, FileText, RefreshCw } from 'lucide-react';
import { DocumentStatus } from './DocumentStatus';
import { SignatureProgress } from './SignatureProgress';
import { PdfViewer } from './PdfViewer';
import { Modal } from './Modal';
import { 
  enviarDocumentoParaAssinatura, 
  baixarDocumentoAssinado, 
  arquivarDocumento, 
  excluirDocumento,
  sincronizarStatusDocumento
} from '../../../services/apiService';
import { useAuth } from '../../../contexts/AuthContext';
import { BackendDocument } from '../../../types';


interface DocumentViewerProps {
  document: BackendDocument;
  isOpen: boolean;
  onClose: () => void;
  onDocumentUpdate?: () => void;
}

export function DocumentViewer({ document, isOpen, onClose, onDocumentUpdate }: DocumentViewerProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendDocument = async () => {
    try {
      setLoading(true);
      setError(null);
      await enviarDocumentoParaAssinatura(document.id, user);
      onDocumentUpdate?.();
    } catch (err) {
      setError('Erro ao enviar documento para assinatura');
      console.error('Erro ao enviar documento:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSigned = async () => {
    try {
      setLoading(true);
      setError(null);
      const blob = await baixarDocumentoAssinado(document.id, user);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${document.name}_assinado.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Erro ao baixar documento assinado');
      console.error('Erro ao baixar documento:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveDocument = async () => {
    try {
      setLoading(true);
      setError(null);
      await arquivarDocumento(document.id, user);
      onDocumentUpdate?.();
      onClose();
    } catch (err) {
      setError('Erro ao arquivar documento');
      console.error('Erro ao arquivar documento:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async () => {
    if (confirm('Tem certeza que deseja excluir este documento?')) {
      try {
        setLoading(true);
        setError(null);
        await excluirDocumento(document.id, user);
        onDocumentUpdate?.();
        onClose();
      } catch (err) {
        setError('Erro ao excluir documento');
        console.error('Erro ao excluir documento:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSyncStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔄 Sincronizando status do documento ${document.id}...`);
      const response = await sincronizarStatusDocumento(document.id, user);
      
      console.log('✅ Resposta da sincronização:', response);
      
      if (response.success) {
        console.log(`📊 Status sincronizado: ${response.data.previous_status} → ${response.data.current_status}`);
        onDocumentUpdate?.();
      }
    } catch (err) {
      setError('Erro ao sincronizar status do documento');
      console.error('Erro ao sincronizar status:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sempre usar o documento original no preview interno do modal
  const documentUrl = document.storage_url;


  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="max-w-7xl">
      <div className="flex flex-col h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b bg-gray-50">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <FileText className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">{document.name}</h2>
              <DocumentStatus status={document.status} />
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span>Cliente: {document.client?.name || 'Documento Universal'}</span>
              <span>Criado: {new Date(document.created_at).toLocaleDateString('pt-BR')}</span>
              <span>Atualizado: {new Date(document.updated_at).toLocaleDateString('pt-BR')}</span>
              {document.autentique_document_id && (
                <span>ID Autentique: {document.autentique_document_id}</span>
              )}
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 border-r bg-gray-50 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Document Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Informações do Documento</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <DocumentStatus status={document.status} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Assinantes:</span>
                    <span className="text-gray-900">{document.signers.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Criado por:</span>
                    <span className="text-gray-900">{document.user?.name || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Signature Progress */}
              {document.signers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Progresso das Assinaturas</h3>
                  <SignatureProgress signers={document.signers} />
                </div>
              )}

              {/* Signature Links */}
              {document.status === 'pending_signature' && document.signers.some(s => s.signature_url) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Links de Assinatura</h3>
                  <div className="space-y-2">
                    {document.signers
                      .filter(signer => signer.signature_url && signer.signer_status === 'pending')
                      .map(signer => (
                      <a
                        key={signer.id}
                        href={signer.signature_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-orange-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-orange-600 transition-colors text-center"
                      >
                        <ExternalLink className="w-4 h-4 inline mr-2" />
                        Assinar - {signer.signer_name}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Ações</h3>
                <div className="space-y-2">
                  {document.status === 'draft' && (
                    <button
                      onClick={handleSendDocument}
                      disabled={loading}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {loading ? 'Enviando...' : 'Enviar para Assinatura'}
                    </button>
                  )}
                  
                  {/* Botão Ver Assinado - para documentos com URL da Autentique */}
                  {(document.status === 'signed' && document.signed_document_url) && (
                    <button
                      onClick={() => window.open(document.signed_document_url, '_blank')}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Ver Assinado (Autentique)
                    </button>
                  )}

                  {/* Botão Ver Preview - para documentos enviados com URL da Autentique */}
                  {(document.status === 'pending_signature' && document.autentique_document_url) && (
                    <button
                      onClick={() => window.open(document.autentique_document_url, '_blank')}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Ver Preview (Autentique)
                    </button>
                  )}

                  {/* Botão Sincronizar Status - para documentos enviados */}
                  {(document.status === 'pending_signature' || document.status === 'signed') && document.autentique_document_id && (
                    <button
                      onClick={handleSyncStatus}
                      disabled={loading}
                      className="w-full bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      {loading ? 'Sincronizando...' : 'Sincronizar Status'}
                    </button>
                  )}

                  {document.status === 'signed' && document.signed_document_url && (
                    <button
                      onClick={handleDownloadSigned}
                      disabled={loading}
                      className="w-full bg-emerald-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {loading ? 'Baixando...' : 'Download Assinado'}
                    </button>
                  )}
                  
                  <button
                    onClick={() => window.open(documentUrl, '_blank')}
                    className="w-full bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Abrir em Nova Aba
                  </button>
                  
                  {(document.status === 'signed' || document.status === 'draft') && (
                    <button
                      onClick={handleArchiveDocument}
                      disabled={loading}
                      className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      {loading ? 'Arquivando...' : 'Arquivar'}
                    </button>
                  )}
                  
                  <button
                    onClick={handleDeleteDocument}
                    disabled={loading}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {loading ? 'Excluindo...' : 'Excluir'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* PDF Viewer */}
          <div className="flex-1 bg-gray-100 overflow-y-auto">
            <PdfViewer
              pdfUrl={documentUrl}
              readOnly={true}
              showSignatureFields={document.status === 'signed'}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}