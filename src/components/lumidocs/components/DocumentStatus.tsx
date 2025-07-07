import React from 'react';
import { CheckCircle, Clock, Send, XCircle, AlertCircle } from 'lucide-react';

interface DocumentStatusProps {
  status: 'draft' | 'pending_signature' | 'signed' | 'rejected';
  className?: string;
}

export function DocumentStatus({ status, className = '' }: DocumentStatusProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'draft':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          text: 'Rascunho',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600'
        };
      case 'pending_signature':
        return {
          icon: <Clock className="w-4 h-4" />,
          text: 'Aguardando Assinatura',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600'
        };
      case 'signed':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          text: 'Assinado',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          iconColor: 'text-green-500'
        };
      case 'rejected':
        return {
          icon: <XCircle className="w-4 h-4" />,
          text: 'Rejeitado',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          iconColor: 'text-red-600'
        };
      default:
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          text: status,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} ${className}`}>
      <span className={`mr-1 ${config.iconColor}`}>
        {config.icon}
      </span>
      {config.text}
    </span>
  );
}