import React, { useState } from 'react';
import { Webhook, Bell, Plus, Trash2, AlertCircle } from 'lucide-react';
import WebhookModal from '../modals/WebhookModal';
import WebhookList from '../lists/WebhookList';
import { WebhookConfig } from '../../../../types/integrations';

export default function WebhookManager() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookConfig | null>(null);

  const handleSaveWebhook = (webhook: WebhookConfig) => {
    if (selectedWebhook) {
      setWebhooks(prev => prev.map(w => w.id === webhook.id ? webhook : w));
    } else {
      setWebhooks(prev => [...prev, { ...webhook, id: Date.now().toString() }]);
    }
    setShowModal(false);
    setSelectedWebhook(null);
  };

  const handleDeleteWebhook = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este webhook?')) {
      setWebhooks(prev => prev.filter(w => w.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Webhook className="h-6 w-6 text-blue-500" />
            <h3 className="text-lg font-semibold">Webhooks</h3>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Novo Webhook
          </button>
        </div>

        {/* Aviso de Segurança */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800">Importante</h4>
              <p className="text-sm text-yellow-700">
                Webhooks permitem que seu sistema receba notificações em tempo real sobre eventos.
                Certifique-se de que a URL do webhook seja segura e acessível publicamente.
              </p>
            </div>
          </div>
        </div>

        <WebhookList
          webhooks={webhooks}
          onEdit={setSelectedWebhook}
          onDelete={handleDeleteWebhook}
        />
      </div>

      {/* Modal de Webhook */}
      {showModal && (
        <WebhookModal
          webhook={selectedWebhook}
          onClose={() => {
            setShowModal(false);
            setSelectedWebhook(null);
          }}
          onSave={handleSaveWebhook}
        />
      )}
    </div>
  );
}