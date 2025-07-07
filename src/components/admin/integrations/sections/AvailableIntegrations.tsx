import React, { useState } from 'react';
import { Link2, AlertCircle } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  category: string;
  connected: boolean;
}

const INTEGRATIONS: Integration[] = [
  // Plataformas de Vendas
  { id: 'hotmart', name: 'Hotmart', category: 'sales', connected: false },
  { id: 'greenn', name: 'Greenn', category: 'sales', connected: false },
  { id: 'kiwify', name: 'Kiwify', category: 'sales', connected: false },
  { id: 'ticto', name: 'Ticto', category: 'sales', connected: false },
  
  // Email Marketing
  { id: 'activecampaign', name: 'ActiveCampaign', category: 'email', connected: false },
  { id: 'mailchimp', name: 'Mailchimp', category: 'email', connected: false },
  { id: 'rdstation', name: 'RD Station', category: 'email', connected: false },
  
  // Automação
  { id: 'googlesheets', name: 'Google Sheets', category: 'automation', connected: false },
  { id: 'make', name: 'Make (Integromat)', category: 'automation', connected: false },
  { id: 'zapier', name: 'Zapier', category: 'automation', connected: false }
];

export default function AvailableIntegrations() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [integrations, setIntegrations] = useState(INTEGRATIONS);

  const handleConnect = (integrationId: string) => {
    setIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === integrationId
          ? { ...integration, connected: !integration.connected }
          : integration
      )
    );
  };

  const filteredIntegrations = selectedCategory === 'all'
    ? integrations
    : integrations.filter((i) => i.category === selectedCategory);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Integrações Disponíveis</h3>

      {/* Filtro de Categorias */}
      <div className="mb-4">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        >
          <option value="all">Todas as Integrações</option>
          <option value="sales">Plataformas de Vendas</option>
          <option value="email">E-mail Marketing</option>
          <option value="automation">Ferramentas de Automação</option>
        </select>
      </div>

      {/* Lista de Integrações */}
      <div className="space-y-3">
        {filteredIntegrations.map((integration) => (
          <div
            key={integration.id}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <Link2 className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium">{integration.name}</p>
                <p className="text-sm text-gray-500">
                  {integration.connected ? 'Conectado' : 'Não conectado'}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleConnect(integration.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                integration.connected
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              {integration.connected ? 'Desconectar' : 'Conectar'}
            </button>
          </div>
        ))}
      </div>

      {/* Caso Não Haja Integrações na Categoria Selecionada */}
      {filteredIntegrations.length === 0 && (
        <div className="flex items-center justify-center gap-2 p-4 text-gray-500">
          <AlertCircle className="h-5 w-5" />
          <p>Nenhuma integração encontrada nesta categoria</p>
        </div>
      )}
    </div>
  );
}
