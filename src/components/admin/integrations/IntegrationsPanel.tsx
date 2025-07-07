import React, { useState } from 'react';
import DomainSettings from './sections/DomainSettings';
import PaymentGateways from './sections/PaymentGateways';
import EmailMarketing from './sections/EmailMarketing';
import WebhookManager from './sections/WebhookManager';
import IntegrationLogs from './sections/IntegrationLogs';
import ApiKeyManager from './sections/ApiKeyManager';

export default function IntegrationsPanel() {
  const [activeTab, setActiveTab] = useState('domain');

  const tabs = [
    { id: 'domain', label: 'Domínio & DNS' },
    { id: 'payments', label: 'Gateways de Pagamento' },
    { id: 'email', label: 'Email Marketing' },
    { id: 'webhooks', label: 'Webhooks' },
    { id: 'api', label: 'API Keys' },
    { id: 'logs', label: 'Logs' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Integrações</h2>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-4" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'domain' && <DomainSettings />}
        {activeTab === 'payments' && <PaymentGateways />}
        {activeTab === 'email' && <EmailMarketing />}
        {activeTab === 'webhooks' && <WebhookManager />}
        {activeTab === 'api' && <ApiKeyManager />}
        {activeTab === 'logs' && <IntegrationLogs />}
      </div>
    </div>
  );
}