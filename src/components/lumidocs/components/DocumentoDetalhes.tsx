import React from 'react';
import { Download, Eye, Send, RefreshCw, Link, CheckCircle, XCircle, Clock, Archive } from 'lucide-react';
import { Documento } from '../types';

interface DocumentoDetalhesProps {
  documento: Documento;
  onDownload: (id: string) => void;
  onView: (id: string) => void;
  onSend: (id: string) => void;
  onResend: (id: string) => void;
  onCopyLink: (id: string) => void;
}

export function DocumentoDetalhes({
  documento,
  onDownload,
  onView,
  onSend,
  onResend,
  onCopyLink
}: DocumentoDetalhesProps) {
  const statusInfo = {
    aguardando_envio: {
      icon: Clock,
      color: 'text-yellow-500',
      label: 'Aguardando Envio'
    },
    aguardando_assinatura: {
      icon: Clock,
      color: 'text-blue-500',
      label: 'Aguardando Assinatura'
    },
    assinado: {
      icon: CheckCircle,
      color: 'text-green-500',
      label: 'Assinado'
    },
    arquivado: {
      icon: Archive,
      color: 'text-gray-500',
      label: 'Arquivado'
    }
  };

  const StatusIcon = statusInfo[documento.status].icon;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <StatusIcon className={`w-6 h-6 ${statusInfo[documento.status].color}`} />
        <span className="text-lg font-medium">{statusInfo[documento.status].label}</span>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Informações do Documento</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <p className="text-sm text-gray-500">Nome</p>
            <p className="font-medium">{documento.nome}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Data de Criação</p>
            <p className="font-medium">{formatDate(documento.created_at)}</p>
          </div>
          {documento.sent_at && (
            <div>
              <p className="text-sm text-gray-500">Data de Envio</p>
              <p className="font-medium">{formatDate(documento.sent_at)}</p>
            </div>
          )}
          {documento.signed_at && (
            <div>
              <p className="text-sm text-gray-500">Data de Assinatura</p>
              <p className="font-medium">{formatDate(documento.signed_at)}</p>
            </div>
          )}
          {documento.archived_at && (
            <div>
              <p className="text-sm text-gray-500">Data de Arquivamento</p>
              <p className="font-medium">{formatDate(documento.archived_at)}</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Assinantes</h3>
        <div className="space-y-3">
          {documento.assinantes.map((assinante) => (
            <div
              key={assinante.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-medium">{assinante.nome}</p>
                <p className="text-sm text-gray-500">{assinante.email}</p>
              </div>
              {documento.status === 'assinado' || documento.status === 'arquivado' ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : documento.status === 'aguardando_assinatura' ? (
                <Clock className="w-5 h-5 text-blue-500" />
              ) : (
                <Clock className="w-5 h-5 text-yellow-500" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onView(documento.id)}
          className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <Eye className="w-4 h-4 mr-2" />
          Visualizar Original
        </button>
        
        {(documento.status === 'assinado' || documento.status === 'arquivado') ? (
          <button
            onClick={() => onDownload(documento.id)}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Baixar Assinado
          </button>
        ) : documento.status === 'aguardando_envio' ? (
          <button
            onClick={() => onSend(documento.id)}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700"
          >
            <Send className="w-4 h-4 mr-2" />
            Enviar
          </button>
        ) : (
          <button
            onClick={() => onResend(documento.id)}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reenviar
          </button>
        )}
      </div>

      {documento.status !== 'arquivado' && (
        <button
          onClick={() => onCopyLink(documento.id)}
          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <Link className="w-4 h-4 mr-2" />
          Copiar Link para Envio
        </button>
      )}
    </div>
  );
}