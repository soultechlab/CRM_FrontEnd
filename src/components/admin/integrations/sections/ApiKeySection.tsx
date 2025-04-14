import React, { useState } from 'react';
import { Key, RefreshCw, Copy, Check } from 'lucide-react';

const ApiKeySection: React.FC = () => {
  const [keys, setKeys] = useState({
    apiKey: '',
    publicKey: '',
    webhookToken: '',
    webhookUrl: ''
  });
  const [copied, setCopied] = useState<string | null>(null);

  const generateKey = () => {
    return 'key_' + Math.random().toString(36).substring(2, 15);
  };

  const handleGenerateApiKey = () => {
    setKeys((prev) => ({
      ...prev,
      apiKey: generateKey(),
      publicKey: generateKey()
    }));
  };

  const handleGenerateWebhookToken = () => {
    setKeys((prev) => ({
      ...prev,
      webhookToken: generateKey()
    }));
  };

  const copyToClipboard = (value: string, field: string) => {
    navigator.clipboard.writeText(value);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Configuração de Integrações</h3>

      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            onClick={handleGenerateApiKey}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Key className="h-4 w-4" />
            Gerar API Key
          </button>

          <button
            onClick={handleGenerateWebhookToken}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <RefreshCw className="h-4 w-4" />
            Gerar Webhook Token
          </button>
        </div>

        {keys.apiKey && (
          <div className="space-y-3">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">Chave Pública</label>
              <div className="flex items-center mt-1">
                <input
                  type="text"
                  value={keys.publicKey}
                  readOnly
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 bg-gray-50"
                />
                <button
                  onClick={() => copyToClipboard(keys.publicKey, 'public')}
                  className="ml-2 p-2 text-gray-500 hover:text-blue-600"
                >
                  {copied === 'public' ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">API Key</label>
              <div className="flex items-center mt-1">
                <input
                  type="text"
                  value={keys.apiKey}
                  readOnly
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 bg-gray-50"
                />
                <button
                  onClick={() => copyToClipboard(keys.apiKey, 'api')}
                  className="ml-2 p-2 text-gray-500 hover:text-blue-600"
                >
                  {copied === 'api' ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {keys.webhookToken && (
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">Webhook Token</label>
                <div className="flex items-center mt-1">
                  <input
                    type="text"
                    value={keys.webhookToken}
                    readOnly
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 bg-gray-50"
                  />
                  <button
                    onClick={() => copyToClipboard(keys.webhookToken, 'webhook')}
                    className="ml-2 p-2 text-gray-500 hover:text-blue-600"
                  >
                    {copied === 'webhook' ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Webhook URL</label>
              <input
                type="text"
                value={keys.webhookUrl}
                onChange={(e) =>
                  setKeys((prev) => ({ ...prev, webhookUrl: e.target.value }))
                }
                placeholder="https://sua-url.com/webhook"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiKeySection;
