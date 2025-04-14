import React, { useState } from 'react';
import { Send, AlertCircle } from 'lucide-react';

interface EmailConfig {
  email: string;
  platform: string;
}

const EmailMarketingSection: React.FC = () => {
  const [config, setConfig] = useState<EmailConfig>({
    email: '',
    platform: ''
  });
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Simulate sending data
    setStatus('success');
    setTimeout(() => setStatus('idle'), 3000);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Configurações de E-mail Marketing</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">E-mail do Cliente</label>
          <input
            type="email"
            value={config.email}
            onChange={(e) => setConfig((prev) => ({ ...prev, email: e.target.value }))}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
            placeholder="cliente@exemplo.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Senha Padrão</label>
          <input
            type="text"
            value="123456"
            readOnly
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Plataforma de E-mail Marketing</label>
          <select
            value={config.platform}
            onChange={(e) => setConfig((prev) => ({ ...prev, platform: e.target.value }))}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
            required
          >
            <option value="">Selecione uma plataforma</option>
            <option value="activecampaign">ActiveCampaign</option>
            <option value="mailchimp">Mailchimp</option>
            <option value="rdstation">RD Station</option>
          </select>
        </div>

        {status === 'success' && (
          <div className="p-3 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Dados enviados com sucesso!
          </div>
        )}

        {status === 'error' && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Erro ao enviar dados. Tente novamente.
          </div>
        )}

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Send className="h-4 w-4" />
          Enviar Dados
        </button>
      </form>
    </div>
  );
};

export default EmailMarketingSection;
