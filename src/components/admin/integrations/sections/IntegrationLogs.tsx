import React, { useState } from 'react';
import { Activity, Filter, Download, CheckCircle, XCircle } from 'lucide-react';

interface Log {
  id: string;
  type: string;
  status: 'success' | 'error';
  message: string;
  timestamp: string;
  details?: any;
}

export default function IntegrationLogs() {
  const [logs, setLogs] = useState<Log[]>([
    {
      id: '1',
      type: 'webhook',
      status: 'success',
      message: 'Webhook disparado com sucesso',
      timestamp: '2024-03-19T10:30:00Z',
      details: {
        url: 'https://api.example.com/webhook',
        event: 'payment.success'
      }
    },
    {
      id: '2',
      type: 'email',
      status: 'error',
      message: 'Falha ao sincronizar com Mailchimp',
      timestamp: '2024-03-19T10:15:00Z',
      details: {
        error: 'API Key inválida'
      }
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-blue-500" />
            <h3 className="text-lg font-semibold">Logs de Integração</h3>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
              <Filter className="h-4 w-4" />
              Filtrar
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
              <Download className="h-4 w-4" />
              Exportar
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className={`border rounded-lg p-4 ${
                log.status === 'success' ? 'bg-green-50' : 'bg-red-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {log.status === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mt-1" />
                  )}
                  <div>
                    <h4 className="font-medium text-gray-900">{log.message}</h4>
                    <p className="text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                    {log.details && (
                      <pre className="mt-2 text-xs bg-white bg-opacity-50 p-2 rounded">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    log.status === 'success'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {log.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}