import React, { useState } from 'react';
import { X, Key, Link2, Copy, Check, AlertCircle } from 'lucide-react';
import { Gateway } from '../../../../types/integrations';

interface GatewayConfigModalProps {
  gateway: Gateway;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Gateway>) => void;
}

export default function GatewayConfigModal({ gateway, onClose, onSave }: GatewayConfigModalProps) {
  const [form, setForm] = useState({
    apiKey: gateway.apiKey || '',
    webhookUrl: gateway.webhookUrl || `https://api.seusite.com/webhooks/${gateway.id}`,
    connected: gateway.connected
  });
  const [copied, setCopied] = useState<'apiKey' | 'webhook' | null>(null);

  const handleCopy = (type: 'apiKey' | 'webhook', value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(gateway.id, {
      ...form,
      connected: true
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-4">
            <img src={gateway.logo} alt={gateway.name} className="h-8 object-contain" />
            <h2 className="text-xl font-semibold">{gateway.name}</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* API Key Configuration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-gray-400" />
                API Key / Token
              </div>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.apiKey}
                onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                placeholder={`${gateway.name} API Key`}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2"
                required
              />
              <button
                type="button"
                onClick={() => handleCopy('apiKey', form.apiKey)}
                className="px-3 py-2 text-gray-500 hover:text-gray-700"
              >
                {copied === 'apiKey' ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Webhook Configuration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-gray-400" />
                URL do Webhook
              </div>
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={form.webhookUrl}
                onChange={(e) => setForm({ ...form, webhookUrl: e.target.value })}
                placeholder="https://api.seusite.com/webhooks/..."
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2"
                required
              />
              <button
                type="button"
                onClick={() => handleCopy('webhook', form.webhookUrl)}
                className="px-3 py-2 text-gray-500 hover:text-gray-700"
              >
                {copied === 'webhook' ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Configure esta URL no painel da {gateway.name} para receber notificações
            </p>
          </div>

          {/* Instruções */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Instruções de Configuração</h4>
            <ol className="list-decimal list-inside text-sm text-blue-700 space-y-2">
              <li>Acesse o painel da {gateway.name}</li>
              <li>Vá em Configurações {'->'} Integrações</li>
              <li>Copie a API Key/Token fornecida</li>
              <li>Configure a URL do webhook para receber notificações</li>
              <li>Salve as configurações</li>
            </ol>
          </div>

          {/* Aviso de Segurança */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Importante</h4>
                <p className="text-sm text-yellow-700">
                  Mantenha suas chaves de API e tokens seguros. Nunca compartilhe ou exponha essas informações.
                  Em caso de comprometimento, revogue imediatamente as credenciais afetadas.
                </p>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Salvar Configurações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}