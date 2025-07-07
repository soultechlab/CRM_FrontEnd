import React, { useState } from 'react';
import { UserCircle, Edit2, Trash2, Eye, Download, Send, RefreshCw, Link, CheckCircle, XCircle, Clock, Archive, ChevronDown, ChevronUp, Undo, AlertTriangle, FileText } from 'lucide-react';
import { Documento } from '../types';
import { Modal } from './Modal';
import { DocumentoForm } from './DocumentoForm';
import { DocumentoDetalhes } from './DocumentoDetalhes';

interface DocumentoCardProps {
  documento: Documento;
  onDelete: (id: string) => void;
  onEdit: (documento: Documento) => void;
  onEditSent: (documento: Documento) => void;
  onDownload: (id: string) => void;
  onView: (id: string) => void;
  onSend: (id: string) => void;
  onResend: (id: string) => void;
  onCopyLink: (id: string) => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onRestore: (id: string, status: 'aguardando_envio' | 'aguardando_assinatura' | 'assinado' | 'arquivado') => void;
  onPermanentDelete: (id: string) => void;
  showDeleteWarning?: boolean;
}

const statusConfig = {
  aguardando_envio: {
    label: 'Rascunho',
    icon: Clock,
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    iconColor: 'text-yellow-500'
  },
  aguardando_assinatura: {
    label: 'Aguardando Assinatura',
    icon: Clock,
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    iconColor: 'text-blue-500'
  },
  assinado: {
    label: 'Assinado',
    icon: CheckCircle,
    color: 'bg-green-50 text-green-700 border-green-200',
    iconColor: 'text-green-500'
  },
  arquivado: {
    label: 'Arquivado',
    icon: Archive,
    color: 'bg-gray-50 text-gray-700 border-gray-200',
    iconColor: 'text-gray-500'
  },
  excluido: {
    label: 'Excluído',
    icon: Trash2,
    color: 'bg-red-50 text-red-700 border-red-200',
    iconColor: 'text-red-500'
  }
} as const;

export function DocumentoCard({
  documento,
  onDelete,
  onEdit,
  onEditSent,
  onDownload,
  onView,
  onSend,
  onResend,
  onCopyLink,
  onArchive,
  onUnarchive,
  onRestore,
  onPermanentDelete,
  showDeleteWarning
}: DocumentoCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir este documento?')) {
      onDelete(documento.id);
    }
  };

  const config = statusConfig[documento.status];
  const StatusIcon = config.icon;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (documento.status === 'excluido') {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div
          className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Trash2 className="h-5 w-5 text-red-500 flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="font-medium text-gray-900 truncate">{documento.nome}</h3>
                <p className="text-sm text-gray-500">
                  Excluído em {documento.deleted_at ? formatDate(documento.deleted_at) : 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {showDeleteWarning && (
                <div className="hidden sm:flex items-center text-yellow-600">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  <span className="text-sm whitespace-nowrap">Exclusão automática em breve</span>
                </div>
              )}
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
              )}
            </div>
          </div>
          {showDeleteWarning && (
            <div className="sm:hidden mt-2 flex items-center text-yellow-600">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <span className="text-sm">Exclusão automática em breve</span>
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="px-6 pb-4 space-y-4">
            <div className="space-y-2">
              <div className="text-sm">
                <span className="text-gray-500">Status anterior:</span>{' '}
                <span className="text-gray-900">{documento.previous_status}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">Criado em:</span>{' '}
                <span className="text-gray-900">{formatDate(documento.created_at)}</span>
              </div>
              {documento.deleted_at && (
                <div className="text-sm">
                  <span className="text-gray-500">Será excluído em:</span>{' '}
                  <span className="text-gray-900">
                    {formatDate(new Date(new Date(documento.deleted_at).getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString())}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsRestoreModalOpen(true);
                }}
                className="flex items-center justify-center px-3 py-2 border border-green-300 rounded-md text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100"
              >
                <Undo className="h-4 w-4 mr-2" />
                Restaurar
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Tem certeza que deseja excluir permanentemente este documento? Esta ação não pode ser desfeita.')) {
                    onPermanentDelete(documento.id);
                  }
                }}
                className="flex items-center justify-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Permanentemente
              </button>
            </div>
          </div>
        )}

        <Modal
          isOpen={isRestoreModalOpen}
          onClose={() => setIsRestoreModalOpen(false)}
          title="Restaurar Documento"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Selecione para qual status você deseja restaurar este documento:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onRestore(documento.id, 'aguardando_envio');
                  setIsRestoreModalOpen(false);
                }}
                className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FileText className="h-5 w-5 mx-auto mb-2 text-gray-400" />
                <span className="text-sm font-medium">Rascunho</span>
              </button>
              <button
                onClick={() => {
                  onRestore(documento.id, 'aguardando_assinatura');
                  setIsRestoreModalOpen(false);
                }}
                className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Send className="h-5 w-5 mx-auto mb-2 text-gray-400" />
                <span className="text-sm font-medium">Enviados</span>
              </button>
              <button
                onClick={() => {
                  onRestore(documento.id, 'assinado');
                  setIsRestoreModalOpen(false);
                }}
                className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <CheckCircle className="h-5 w-5 mx-auto mb-2 text-gray-400" />
                <span className="text-sm font-medium">Assinados</span>
              </button>
              <button
                onClick={() => {
                  onRestore(documento.id, 'arquivado');
                  setIsRestoreModalOpen(false);
                }}
                className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Archive className="h-5 w-5 mx-auto mb-2 text-gray-400" />
                <span className="text-sm font-medium">Arquivados</span>
              </button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  if (documento.status === 'arquivado') {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div
          className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Archive className="h-5 w-5 text-gray-400" />
              <div>
                <h3 className="font-medium text-gray-900">{documento.nome}</h3>
                <p className="text-sm text-gray-500">
                  Arquivado em {documento.archived_at ? formatDate(documento.archived_at) : 'N/A'}
                </p>
              </div>
            </div>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="px-6 pb-4 space-y-4">
            <div className="space-y-2">
              <div className="text-sm">
                <span className="text-gray-500">Criado em:</span>{' '}
                <span className="text-gray-900">{formatDate(documento.created_at)}</span>
              </div>
              {documento.sent_at && (
                <div className="text-sm">
                  <span className="text-gray-500">Enviado em:</span>{' '}
                  <span className="text-gray-900">{formatDate(documento.sent_at)}</span>
                </div>
              )}
              {documento.signed_at && (
                <div className="text-sm">
                  <span className="text-gray-500">Assinado em:</span>{' '}
                  <span className="text-gray-900">{formatDate(documento.signed_at)}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-500">Assinantes:</h4>
              <div className="space-y-1">
                {documento.assinantes.map((assinante) => (
                  <div
                    key={assinante.id}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <UserCircle className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{assinante.nome}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Deseja reenviar este documento para assinatura?')) {
                    onUnarchive(documento.id);
                  }
                }}
                className="flex-1 flex items-center justify-center px-3 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100"
              >
                <Undo className="h-4 w-4 mr-2" />
                Reenviar para Assinatura
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Tem certeza que deseja excluir permanentemente este documento?')) {
                    onDelete(documento.id);
                  }
                }}
                className="flex-1 flex items-center justify-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Permanentemente
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div 
        className="group relative bg-white rounded-xl shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md hover:border-gray-300 cursor-pointer overflow-hidden"
        onClick={() => setIsDetailsModalOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="px-6 pt-6 pb-4">
          <div className="flex justify-between items-start mb-4">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color} border`}>
              <StatusIcon className={`w-4 h-4 mr-2 ${config.iconColor}`} />
              {config.label}
            </div>
            <div className="flex space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onView(documento.id);
                }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                title="Visualizar"
              >
                <Eye className="w-4 h-4" />
              </button>
              {(documento.status === 'aguardando_envio' || documento.status === 'aguardando_assinatura') && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditModalOpen(true);
                  }}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
              {documento.status === 'assinado' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive(documento.id);
                  }}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                  title="Arquivar"
                >
                  <Archive className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleDelete}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                title="Excluir"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {documento.nome}
          </h3>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-500">Assinantes:</h4>
            <div className="flex flex-wrap gap-2">
              {documento.assinantes.map((assinante) => (
                <div
                  key={assinante.id}
                  className="flex items-center bg-gray-50 rounded-full px-3 py-1"
                >
                  <UserCircle className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600 truncate max-w-[150px]">
                    {assinante.nome}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Criado em {formatDate(documento.created_at)}
            </div>
            <div className="flex space-x-2">
              {documento.status === 'aguardando_envio' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSend(documento.id);
                  }}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar
                </button>
              )}
              {documento.status === 'aguardando_assinatura' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onResend(documento.id);
                  }}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reenviar
                </button>
              )}
              {documento.status === 'assinado' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload(documento.id);
                  }}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg text-green-700 bg-green-50 hover:bg-green-100"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Documento"
      >
        <DocumentoForm
          initialData={documento}
          onSubmit={(data) => {
            if (documento.status === 'aguardando_assinatura') {
              onEditSent(data);
            } else {
              onEdit(data);
            }
            setIsEditModalOpen(false);
          }}
        />
      </Modal>

      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Detalhes do Documento"
      >
        <DocumentoDetalhes
          documento={documento}
          onDownload={onDownload}
          onView={onView}
          onSend={onSend}
          onResend={onResend}
          onCopyLink={onCopyLink}
        />
      </Modal>
    </>
  );
}