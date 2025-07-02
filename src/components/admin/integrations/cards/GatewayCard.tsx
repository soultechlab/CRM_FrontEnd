import React from 'react';
import { Key } from 'lucide-react';
import { Gateway } from '../../../../types/integrations';

interface GatewayCardProps {
  gateway: Gateway;
  onClick: (gateway: Gateway) => void;
}

export default function GatewayCard({ gateway, onClick }: GatewayCardProps) {
  return (
    <div
      className="border rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-colors"
      onClick={() => onClick(gateway)}
    >
      <div className="flex items-center justify-between mb-4">
        <img
          src={gateway.logo}
          alt={gateway.name}
          className="h-8 object-contain"
        />
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            gateway.connected
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {gateway.connected ? 'Conectado' : 'Desconectado'}
        </span>
      </div>

      {gateway.connected && (
        <div className="mt-4 space-y-2">
          {gateway.webhookUrl && (
            <div>
              <label className="block text-xs font-medium text-gray-500">
                Webhook URL
              </label>
              <code className="block mt-1 text-xs bg-gray-50 p-2 rounded">
                {gateway.webhookUrl}
              </code>
            </div>
          )}
          {gateway.apiKey && (
            <div>
              <label className="block text-xs font-medium text-gray-500">
                API Key
              </label>
              <div className="flex items-center gap-2">
                <code className="block flex-1 text-xs bg-gray-50 p-2 rounded">
                  {gateway.apiKey}
                </code>
                <Key className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}