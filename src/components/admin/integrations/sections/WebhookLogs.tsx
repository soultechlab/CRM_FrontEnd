import React, { useState } from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

interface WebhookLog {
  id: string;
  event: string;
  status: 'success' | 'error';
  timestamp: string;
  details: string;
}

// Logs de exemplo para simulação
const MOCK_LOGS: WebhookLog[] = [
  {
    id: '1',
    event: 'payment.success',
    status: 'success',
    timestamp: new Date().toISOString(),
    details: 'Pagamento processado com sucesso',
  },
  {
    id: '2',
    event: 'user.created',
    status: 'success',
    timestamp: new Date().toISOString(),
    details: 'Novo usuário criado',
  },
  {
    id: '3',
    event: 'payment.failed',
    status: 'error',
    timestamp: new Date().toISOString(),
    details: 'Falha no processamento do pagamento',
  },
];

export default function WebhookLogs() {
  const [logs] = useState<WebhookLog[]>(MOCK_LOGS);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Logs de Webhook</h3>

      <div className="space-y-3">
        {logs.length > 0 ? (
          logs.map((log) => (
            <div
              key={log.id}
              className={`p-4 rounded-lg border ${
                log.status === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {log.status === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-medium">{log.event}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
              <p className="text-sm text-gray-600">{log.details}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">
            <p>Nenhum log de webhook disponível</p>
          </div>
        )}
      </div>
    </div>
  );
}
