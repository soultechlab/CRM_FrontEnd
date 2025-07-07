import React from 'react';
import { Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { WebhookConfig } from '../../../../types/integrations';

interface WebhookListProps {
  webhooks: WebhookConfig[];
  onEdit: (webhook: WebhookConfig) => void;
  onDelete: (id: string) => void;
}

export default function WebhookList({ webhooks, onEdit, onDelete }: WebhookListProps) {
  return (
    <div className="space-y-4">
      {webhooks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nenhum webhook configurado
        </div>
      ) : (
        webhooks.map((webhook) => (
          <div
            key={webhook.id}
            className="border rounded-lg p-4 hover:border-blue-500 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900">{webhook.url}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    webhook.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {webhook.active ? (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Ativo
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        Inativo
                      </div>
                    )}
                  </span>
                </div>
                {webhook.description && (
                  <p className="text-sm text-gray-500 mt-1">{webhook.description}</p>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  {webhook.events.map((event) => (
                    <span
                      key={event}
                      className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
                    >
                      {event}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-start gap-2 ml-4">
                <button
                  onClick={() => onEdit(webhook)}
                  className="p-1 text-gray-400 hover:text-blue-600"
                  title="Editar webhook"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(webhook.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                  title="Excluir webhook"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            {webhook.lastTriggered && (
              <div className="mt-3 text-xs text-gray-500">
                Último disparo: {new Date(webhook.lastTriggered).toLocaleString()}
                <span className="ml-2 text-green-600">
                  Taxa de sucesso: {webhook.successRate}%
                </span>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}