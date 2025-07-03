import React, { useEffect } from 'react';
import { CheckCircle, Clock, User, RefreshCw } from 'lucide-react';
import { marcarDocumentoAssinado } from '../../../services/apiService';
import { useAuth } from '../../../contexts/AuthContext';

interface Signer {
  id: number;
  signer_name: string;
  signer_email: string;
  signer_status: string;
  signature_url?: string;
}

interface SignatureProgressProps {
  signers: Signer[];
  className?: string;
  documentId?: string;
  documentStatus?: string;
  onStatusUpdate?: () => void;
  onCheckStatus?: (documentId: string) => void;
}

export function SignatureProgress({ signers, className = '', documentId, documentStatus, onStatusUpdate, onCheckStatus }: SignatureProgressProps) {
  const { user } = useAuth();
  const totalSigners = signers.length;
  const signedCount = signers.filter(s => s.signer_status === 'signed').length;
  const progress = totalSigners > 0 ? (signedCount / totalSigners) * 100 : 0;
  const isFullySigned = progress === 100 && totalSigners > 0;

  // Debug detalhado dos signers
  console.log(`🔍 DEBUG SIGNATURE PROGRESS - Documento ${documentId}:`, {
    totalSigners,
    signedCount,
    progress,
    isFullySigned,
    documentStatus,
    signers: signers.map(s => ({
      id: s.id,
      name: s.signer_name,
      status: s.signer_status,
      email: s.signer_email
    }))
  });

  useEffect(() => {
    const markDocumentAsSigned = async () => {
      if (isFullySigned && documentId && documentStatus === 'pending_signature' && user) {
        try {
          console.log(`🎉 Todas as assinaturas concluídas! Marcando documento ${documentId} como assinado...`);
          const response = await marcarDocumentoAssinado(documentId, user);
          console.log(`✅ Documento ${documentId} marcado como assinado com sucesso!`, response);
          
          // Forçar atualização imediata
          if (onStatusUpdate) {
            // Aguardar um pouco para o backend processar
            setTimeout(() => {
              onStatusUpdate();
            }, 1000);
          }
        } catch (error) {
          console.error('❌ Erro ao marcar documento como assinado:', error);
        }
      }
    };

    markDocumentAsSigned();
  }, [isFullySigned, documentId, documentStatus, user, onStatusUpdate]);

  const getSignerStatusIcon = (status: string) => {
    switch (status) {
      case 'signed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <User className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSignerStatusText = (status: string) => {
    switch (status) {
      case 'signed':
        return 'Assinado';
      case 'pending':
        return 'Pendente';
      default:
        return 'Aguardando';
    }
  };

  const getSignerStatusColor = (status: string) => {
    switch (status) {
      case 'signed':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      default:
        return 'text-gray-500';
    }
  };

  if (totalSigners === 0) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        Nenhum assinante definido
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-3">
        <div className="flex justify-between items-center text-sm mb-2">
          <span className="text-gray-700 font-medium">Progresso das Assinaturas</span>
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">{signedCount}/{totalSigners} assinados</span>
            {documentId && onCheckStatus && documentStatus === 'pending_signature' && (
              <button
                onClick={() => onCheckStatus(documentId)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                title="Verificar status das assinaturas"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      <div className="space-y-2">
        {signers.map(signer => (
          <div key={signer.id} className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              {getSignerStatusIcon(signer.signer_status)}
              <span className="text-gray-900">{signer.signer_name}</span>
            </div>
            <span className={`text-xs font-medium ${getSignerStatusColor(signer.signer_status)}`}>
              {getSignerStatusText(signer.signer_status)}
            </span>
          </div>
        ))}
      </div>

      {isFullySigned && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <div className="flex-1">
              <span className="text-sm text-green-800 font-medium block">
                🎉 Documento Assinado!
              </span>
              <span className="text-xs text-green-700">
                Todas as assinaturas foram concluídas com sucesso
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}