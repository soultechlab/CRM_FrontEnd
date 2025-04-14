import React from 'react';
import { Check, X, ExternalLink } from 'lucide-react';
import { EmailPlatform } from '../../../../types/integrations';

interface EmailPlatformListProps {
  platforms: EmailPlatform[];
  onPlatformClick: (platform: EmailPlatform) => void;
}

export default function EmailPlatformList({ platforms, onPlatformClick }: EmailPlatformListProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Plataforma
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Data de Integração
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Última Sincronização
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {platforms.map((platform) => (
            <tr key={platform.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <img
                    src={platform.logo}
                    alt={platform.name}
                    className="h-8 w-auto"
                  />
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {platform.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {platform.description}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  platform.connected
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {platform.connected ? (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      Conectado
                    </>
                  ) : (
                    <>
                      <X className="h-3 w-3 mr-1" />
                      Desconectado
                    </>
                  )}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {platform.connected
                  ? new Date(platform.createdAt).toLocaleDateString()
                  : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {platform.lastSync
                  ? new Date(platform.lastSync).toLocaleString()
                  : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onPlatformClick(platform)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}