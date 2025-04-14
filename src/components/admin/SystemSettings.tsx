import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { SystemSettings as Settings } from '../../types/admin';

export default function SystemSettings() {
  const [settings, setSettings] = useState<Settings>({
    logo: '',
    welcomeMessage: '',
    systemName: 'LumiCRM',
    stripeWebhookUrl: '',
    stripePublicKey: ''
  });

  const handleSave = () => {
    // Implement settings save logic
    console.log('Settings saved:', settings);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Configurações do Sistema</h2>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          {/* Personalização */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Personalização</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logo URL
                </label>
                <input
                  type="text"
                  value={settings.logo}
                  onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Sistema
                </label>
                <input
                  type="text"
                  value={settings.systemName}
                  onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensagem de Boas-vindas
                </label>
                <textarea
                  value={settings.welcomeMessage}
                  onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Integrações */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Integrações</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL do Webhook Stripe
                </label>
                <input
                  type="text"
                  value={settings.stripeWebhookUrl}
                  onChange={(e) => setSettings({ ...settings, stripeWebhookUrl: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chave Pública do Stripe
                </label>
                <input
                  type="text"
                  value={settings.stripePublicKey}
                  onChange={(e) => setSettings({ ...settings, stripePublicKey: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Botão Salvar */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
            >
              <Save className="h-5 w-5" />
              Salvar Configurações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}