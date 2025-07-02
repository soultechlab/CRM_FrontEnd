import React, { useState } from 'react';
import { X, Link2, AlertCircle } from 'lucide-react';
import { WebhookConfig } from '../../../../types/integrations';

interface WebhookModalProps {
  webhook?: WebhookConfig | null;
  onClose: () => void;
  onSave: (webhook: WebhookConfig) => void;
}

const AVAILABLE_EVENTS = [
  { id: 'user.created', label: 'Usuário Criado' },
  { id: 'user.updated', label: 'Usuário Atualizado' },
  { id: 'payment.success', label: 'Pagamento Aprovado' },
  { id: 'payment.failed', label: 'Pagamento Recusado' },
  { id: 'subscription.created', label: 'Assinatura Criada' },
  { id: 'subscription.canceled', label: 'Assinatura Cancelada' },
  { id: 'appointment.created', label: 'Agendamento Criado' },
  { id: 'appointment.updated', label: 'Agendamento Atualizado' }
];

export default function WebhookModal({ webhook, onClose, onSave }: WebhookModalProps) {
  const [form, setForm] = useState({
    url: webhook?.url || '',
    events: webhook?.events || [],
    active: webhook?.active ?? true,
    description: webhook?.description || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.url.startsWith('https://')) {
      alert('A URL do webhook deve usar HTTPS');
      return;
    }

    if (form.events.length === 0) {
      alert('Selecione pelo menos um evento');
      return;
    }

    onSave({
      id: webhook?.id || Date.now().toString(),
      ...form,
      successRate: webhook?.successRate || 100,
      lastTriggered: webhook?.lastTriggered
    });
  };

  const toggleEvent = (eventId: string) => {
    setForm(prev => ({
      ...prev,
      events: prev.events.includes(eventId)
        ? prev.events.filter(e => e !== eventId)
        : [...prev.events, eventId]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {webhook ? 'Editar Webhook' : 'Novo Webhook'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-gray-400" />
                URL do Webhook
              </div>
            </label>
            <input
              type="url"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://api.seusite.com/webhooks"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              A URL deve ser acessível publicamente e usar HTTPS
            </p>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Ex: Integração com sistema de pagamentos"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>

          {/* Eventos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Eventos
            </label>
            <div className="grid grid-cols-2 gap-3">
              {AVAILABLE_EVENTS.map((event) => (
                <label
                  key={event.id}
                  className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={form.events.includes(event.id)}
                    onChange={() => toggleEvent(event.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span className="ml-3 text-sm text-gray-700">{event.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span className="ml-3 text-sm text-gray-700">Webhook ativo</span>
            </label>
          </div>

          {/* Instruções */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Formato do Payload</h4>
            <pre className="text-xs bg-white bg-opacity-50 p-2 rounded overflow-x-auto">
{`{
  "event": "event.name",
  "timestamp": "2024-03-19T10:30:00Z",
  "data": {
    // Dados específicos do evento
  }
}`}
            </pre>
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
              {webhook ? 'Atualizar' : 'Criar'} Webhook
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}