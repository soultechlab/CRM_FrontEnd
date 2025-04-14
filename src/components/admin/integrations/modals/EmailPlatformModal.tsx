import React, { useState } from 'react';
import { X, Mail, Link2, AlertCircle } from 'lucide-react';
import { EmailPlatform } from '../../../../types/integrations';

interface EmailPlatformModalProps {
  platform: EmailPlatform;
  onClose: () => void;
  onSave: (id: string, updates: Partial<EmailPlatform>) => void;
}

export default function EmailPlatformModal({ platform, onClose, onSave }: EmailPlatformModalProps) {
  const [form, setForm] = useState({
    apiUrl: platform.fields?.apiUrl || '',
    apiKey: platform.fields?.apiKey || '',
    defaultList: platform.fields?.defaultList || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(platform.id, {
      connected: true,
      fields: form
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-4">
            <img src={platform.logo} alt={platform.name} className="h-8 object-contain" />
            <h2 className="text-xl font-semibold">{platform.name}</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* API URL (apenas para ActiveCampaign) */}
          {platform.id === 'activecampaign' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site API URL
              </label>
              <input
                type="url"
                value={form.apiUrl}
                onChange={(e) => setForm({ ...form, apiUrl: e.target.value })}
                placeholder="https://suaconta.api-us1.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Encontre em Configurações → Developer → API Access
              </p>
            </div>
          )}

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <input
              type="text"
              value={form.apiKey}
              onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
              placeholder="Sua API Key"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              required
            />
          </div>

          {/* Lista Padrão */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID da Lista Padrão
            </label>
            <input
              type="text"
              value={form.defaultList}
              onChange={(e) => setForm({ ...form, defaultList: e.target.value })}
              placeholder="ID da lista principal"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              required
            />
          </div>

          {/* Instruções */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Dados do Usuário</h4>
            <p className="text-sm text-blue-700 mb-2">
              Os seguintes dados serão sincronizados automaticamente:
            </p>
            <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
              <li>Nome completo</li>
              <li>Email</li>
              <li>Senha padrão: muda123</li>
              <li>Data de cadastro</li>
              <li>Plano atual</li>
            </ul>
          </div>

          {/* Aviso de Segurança */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Importante</h4>
                <p className="text-sm text-yellow-700">
                  Mantenha suas chaves de API seguras. Nunca compartilhe ou exponha essas informações.
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