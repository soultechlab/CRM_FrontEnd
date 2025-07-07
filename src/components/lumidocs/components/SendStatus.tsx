import React from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface SendStatusProps {
  status?: 'success' | 'failed' | 'pending';
  errorMessage?: string;
  lastAttempt?: string;
}

export function SendStatus({ status, errorMessage, lastAttempt }: SendStatusProps) {
  if (!status) return null;

  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: 'Enviado com sucesso',
          description: lastAttempt ? `Enviado em ${new Date(lastAttempt).toLocaleString('pt-BR')}` : undefined
        };
      case 'failed':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: 'Falha no envio',
          description: errorMessage || 'Erro desconhecido ao enviar'
        };
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          label: 'Processando envio',
          description: 'O envio está sendo processado'
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div className={`flex items-start space-x-2 p-3 rounded-lg border ${config.bgColor} ${config.borderColor} mb-3`}>
      <Icon className={`w-5 h-5 ${config.color} flex-shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${config.color}`}>
          {config.label}
        </p>
        {config.description && (
          <p className="text-xs text-gray-600 mt-1">
            {config.description}
          </p>
        )}
        {status === 'failed' && lastAttempt && (
          <p className="text-xs text-gray-500 mt-1">
            Última tentativa: {new Date(lastAttempt).toLocaleString('pt-BR')}
          </p>
        )}
      </div>
    </div>
  );
}

// Componente compacto para exibir apenas o ícone
export function SendStatusIcon({ status, errorMessage }: { status?: 'success' | 'failed' | 'pending', errorMessage?: string }) {
  if (!status) return null;

  const getIconConfig = () => {
    switch (status) {
      case 'success':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          title: 'Enviado com sucesso'
        };
      case 'failed':
        return {
          icon: XCircle,
          color: 'text-red-500',
          title: `Falha no envio: ${errorMessage || 'Erro desconhecido'}`
        };
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-500',
          title: 'Processando envio'
        };
      default:
        return null;
    }
  };

  const config = getIconConfig();
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div className="inline-flex items-center" title={config.title}>
      <Icon className={`w-4 h-4 ${config.color}`} />
    </div>
  );
}