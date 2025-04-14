import React from 'react';
import { Check, Link } from 'lucide-react';
import { EmailPlatform } from '../../../../types/integrations';

interface EmailPlatformCardProps {
  platform: EmailPlatform;
  onClick: (platform: EmailPlatform) => void;
}

export default function EmailPlatformCard({ platform, onClick }: EmailPlatformCardProps) {
  return (
    <div
      className="border rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-colors"
      onClick={() => onClick(platform)}
    >
      <div className="flex items-center justify-between mb-4">
        <img
          src={platform.logo}
          alt={platform.name}
          className="h-8 object-contain"
        />
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            platform.connected
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {platform.connected ? 'Conectado' : 'Desconectado'}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-4">{platform.description}</p>

      {platform.connected && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Check className="h-4 w-4 text-green-500" />
            <span>Sincronização automática</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link className="h-4 w-4 text-blue-500" />
            <span>Lista principal vinculada</span>
          </div>
        </div>
      )}
    </div>
  );
}