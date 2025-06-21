import React from 'react';
import { CheckCircle, Clock, User } from 'lucide-react';

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
}

export function SignatureProgress({ signers, className = '' }: SignatureProgressProps) {
  const totalSigners = signers.length;
  const signedCount = signers.filter(s => s.signer_status === 'signed').length;
  const progress = totalSigners > 0 ? (signedCount / totalSigners) * 100 : 0;

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
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-700 font-medium">Progresso das Assinaturas</span>
          <span className="text-gray-600">{signedCount}/{totalSigners} assinados</span>
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

      {progress === 100 && (
        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
            <span className="text-sm text-green-800 font-medium">
              Todas as assinaturas foram concluídas!
            </span>
          </div>
        </div>
      )}
    </div>
  );
}