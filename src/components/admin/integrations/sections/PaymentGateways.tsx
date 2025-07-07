import React, { useState } from 'react';
import { CreditCard, Link2 } from 'lucide-react';
import { Gateway } from '../../../../types/integrations';
import GatewayCard from '../cards/GatewayCard';
import GatewayConfigModal from '../modals/GatewayConfigModal';

const GATEWAYS: Gateway[] = [
  {
    id: 'hotmart',
    name: 'Hotmart',
    logo: 'https://cdn.hotmart.com/images/hotmart-logo.svg',
    type: 'digital_product',
    connected: true,
    webhookUrl: 'https://api.seusite.com/webhooks/hotmart',
    apiKey: 'ht_prod_...'
  },
  {
    id: 'kiwify',
    name: 'Kiwify',
    logo: 'https://kiwify.com.br/images/logo.svg',
    type: 'digital_product',
    connected: false
  },
  {
    id: 'ticto',
    name: 'Ticto',
    logo: 'https://ticto.com.br/wp-content/themes/ticto/assets/images/logo.svg',
    type: 'digital_product',
    connected: false
  },
  {
    id: 'stripe',
    name: 'Stripe',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg',
    type: 'payment',
    connected: true,
    webhookUrl: 'https://api.seusite.com/webhooks/stripe',
    apiKey: 'pk_test_...'
  },
  {
    id: 'asaas',
    name: 'Asaas',
    logo: 'https://asaas.com/images/logo.svg',
    type: 'payment',
    connected: false
  }
];

export default function PaymentGateways() {
  const [gateways, setGateways] = useState<Gateway[]>(GATEWAYS);
  const [selectedGateway, setSelectedGateway] = useState<Gateway | null>(null);

  const handleUpdateGateway = (id: string, updates: Partial<Gateway>) => {
    setGateways(prev => prev.map(gateway => 
      gateway.id === id ? { ...gateway, ...updates } : gateway
    ));
  };

  return (
    <div className="space-y-6">
      {/* Plataformas Digitais */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-6">
          <Link2 className="h-6 w-6 text-purple-500" />
          <h3 className="text-lg font-semibold">Plataformas Digitais</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gateways
            .filter(g => g.type === 'digital_product')
            .map((gateway) => (
              <GatewayCard
                key={gateway.id}
                gateway={gateway}
                onClick={setSelectedGateway}
              />
            ))}
        </div>
      </div>

      {/* Gateways de Pagamento */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-6">
          <CreditCard className="h-6 w-6 text-blue-500" />
          <h3 className="text-lg font-semibold">Gateways de Pagamento</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gateways
            .filter(g => g.type === 'payment')
            .map((gateway) => (
              <GatewayCard
                key={gateway.id}
                gateway={gateway}
                onClick={setSelectedGateway}
              />
            ))}
        </div>
      </div>

      {/* Modal de Configuração */}
      {selectedGateway && (
        <GatewayConfigModal
          gateway={selectedGateway}
          onClose={() => setSelectedGateway(null)}
          onSave={handleUpdateGateway}
        />
      )}
    </div>
  );
}