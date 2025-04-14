import React, { useState } from 'react';
import { Key, Copy, RefreshCw, Trash2, Check, AlertCircle } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
  scopes: string[];
}

export default function ApiKeyManager() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Produção',
      key: 'sk_prod_123456789',
      createdAt: '2024-03-19T10:00:00Z',
      lastUsed: '2024-03-19T10:30:00Z',
      scopes: ['read', 'write']
    }
  ]);

  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCreateKey = () => {
    if (!newKeyName.trim()) return;

    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `sk_${Math.random().toString(36).substring(2)}`,
      createdAt: new Date().toISOString(),
      scopes: ['read', 'write']
    };

    setApiKeys([...apiKeys, newKey]);
    setNewKeyName('');
    setShowNewKeyForm(false);
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDeleteKey = (id: string) => {
    if (confirm('Tem certeza que deseja revogar esta chave? Esta ação não pode ser desfeita.')) {
      setApiKeys(apiKeys.filter(key => key.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Key className="h-6 w-6 text-blue-500" />
            <h3 className="text-lg font-semibold">Chaves de API</h3>
          </div>
          <button
            onClick={() => setShowNewKeyForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Key className="h-4 w-4" />
            Nova Chave
          </button>
        </div>

        {/* Aviso de Segurança */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800">Importante</h4>
              <p className="text-sm text-yellow-700">
                Mantenha suas chaves de API seguras. Nunca compartilhe ou exponha suas chaves em código público.
                Se uma chave for comprometida, revogue-a imediatamente.
              </p>
            </div>
          </div>
        </div>

        {/* Formulário de Nova Chave */}
        {showNewKeyForm && (
          <div className="mb-6 p-4 border rounded-lg">
            <h4 className="font-medium mb-4">Criar Nova Chave</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Chave
                </label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Ex: Produção, Homologação"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowNewKeyForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateKey}
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Criar Chave
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Chaves */}
        <div className="space-y-4">
          {apiKeys.map((apiKey) => (
            <div
              key={apiKey.id}
              className="border rounded-lg p-4 hover:border-blue-500 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{apiKey.name}</h4>
                  <div className="mt-2 flex items-center gap-3">
                    <code className="text-sm bg-gray-50 px-2 py-1 rounded">
                      {apiKey.key}
                    </code>
                    <button
                      onClick={() => handleCopyKey(apiKey.key)}
                      className="p-1 text-gray-400 hover:text-blue-600"
                      title="Copiar chave"
                    >
                      {copiedKey === apiKey.key ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {apiKey.scopes.map((scope) => (
                      <span
                        key={scope}
                        className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
                      >
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteKey(apiKey.id)}
                    className="p-2 text-gray-400 hover:text-red-600"
                    title="Revogar chave"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="flex flex-col items-end text-xs text-gray-500">
                    <span>Criada em: {new Date(apiKey.createdAt).toLocaleDateString()}</span>
                    {apiKey.lastUsed && (
                      <span>Último uso: {new Date(apiKey.lastUsed).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}