import React, { useState } from 'react';
import { X, Mail, Edit3, Send, AlertCircle } from 'lucide-react';
import { BackendDocument } from '../../../types';

interface SendSignatureModalProps {
  document: BackendDocument;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (documentId: string, signers?: Array<{
    id: number;
    signer_name: string;
    signer_email: string;
    signer_cpf?: string;
  }>) => void;
  isResend?: boolean;
}

export function SendSignatureModal({ document, isOpen, onClose, onConfirm, isResend = false }: SendSignatureModalProps) {
  const [editableSigners, setEditableSigners] = useState(
    document.signers.map(signer => ({
      id: signer.id,
      signer_name: signer.signer_name,
      signer_email: signer.signer_email,
      signer_cpf: signer.signer_cpf || ''
    }))
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleEmailChange = (index: number, newEmail: string) => {
    setEditableSigners(prev => 
      prev.map((signer, i) => 
        i === index ? { ...signer, signer_email: newEmail } : signer
      )
    );
  };

  const handleNameChange = (index: number, newName: string) => {
    setEditableSigners(prev => 
      prev.map((signer, i) => 
        i === index ? { ...signer, signer_name: newName } : signer
      )
    );
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(String(document.id), editableSigners);
      onClose();
    } catch (error) {
      console.error('Erro ao enviar documento:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasValidEmails = editableSigners.every(signer => 
    signer.signer_email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signer.signer_email)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Mail className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {isResend ? 'Reenviar para Assinatura' : 'Confirmar Envio para Assinatura'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {document.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium text-gray-900">
                Destinatários ({editableSigners.length})
              </h4>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Edit3 className="w-4 h-4 mr-1" />
                {isEditing ? 'Concluir Edição' : 'Editar'}
              </button>
            </div>

            <div className="space-y-3">
              {editableSigners.map((signer, index) => (
                <div key={signer.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 space-y-2">
                      {isEditing ? (
                        <>
                          <input
                            type="text"
                            value={signer.signer_name}
                            onChange={(e) => handleNameChange(index, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Nome do signatário"
                          />
                          <input
                            type="email"
                            value={signer.signer_email}
                            onChange={(e) => handleEmailChange(index, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="email@exemplo.com"
                          />
                        </>
                      ) : (
                        <>
                          <div className="font-medium text-gray-900">
                            {signer.signer_name}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            {signer.signer_email}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {!hasValidEmails && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center">
                  <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                  <span className="text-sm text-red-700">
                    Todos os emails devem ser válidos para enviar o documento
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h5 className="font-medium text-blue-900 mb-2">O que acontecerá:</h5>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Cada destinatário receberá {isResend ? 'um novo' : 'um'} email com o link de assinatura</li>
              {isResend && <li>• Os links de assinatura anteriores continuarão válidos</li>}
              <li>• O documento {isResend ? 'continuará' : 'ficará'} com status "Aguardando Assinatura"</li>
              <li>• Você será notificado quando todas as assinaturas forem coletadas</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!hasValidEmails || isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isResend ? 'Reenviando...' : 'Enviando...'}
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {isResend ? 'Reenviar para Assinatura' : 'Enviar para Assinatura'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}