import React, { useState } from 'react';
import { Mail, Plus } from 'lucide-react';
import EmailPlatformList from '../lists/EmailPlatformList';
import PlatformSelectionModal from '../modals/PlatformSelectionModal';
import EmailPlatformModal from '../modals/EmailPlatformModal';
import { EmailPlatform } from '../../../../types/integrations';

const EMAIL_PLATFORMS: EmailPlatform[] = [
  {
    id: 'activecampaign',
    name: 'ActiveCampaign',
    logo: 'https://www.activecampaign.com/wp-content/themes/activecampaign/assets/images/logo-ac.svg',
    description: 'Automação de marketing e CRM',
    connected: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    logo: 'https://cdn-images.mailchimp.com/monkey_rewards/MC_MonkeyReward_15.png',
    description: 'Email marketing e automação',
    connected: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'rdstation',
    name: 'RD Station',
    logo: 'https://www.rdstation.com/wp-content/themes/rdstation/assets/images/rd-station-logo.svg',
    description: 'Marketing digital completo',
    connected: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'sendinblue',
    name: 'Sendinblue',
    logo: 'https://www.sendinblue.com/wp-content/themes/sendinblue2019/assets/images/common/logo.svg',
    description: 'Email marketing e SMS',
    connected: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'convertkit',
    name: 'ConvertKit',
    logo: 'https://convertkit.com/images/convertkit-mark.svg',
    description: 'Email marketing para criadores',
    connected: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'leadlovers',
    name: 'Leadlovers',
    logo: 'https://leadlovers.com/assets/img/logo.svg',
    description: 'Automação de marketing brasileira',
    connected: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'egoi',
    name: 'E-goi',
    logo: 'https://www.e-goi.com/wp-content/themes/egoi2019/assets/images/logo-egoi.svg',
    description: 'Marketing multicanal',
    connected: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'lahar',
    name: 'Lahar',
    logo: 'https://lahar.com.br/wp-content/uploads/2019/03/logo-lahar.svg',
    description: 'Marketing B2B',
    connected: false,
    createdAt: new Date().toISOString()
  }
];

export default function EmailMarketing() {
  const [platforms, setPlatforms] = useState<EmailPlatform[]>(EMAIL_PLATFORMS);
  const [showPlatformSelection, setShowPlatformSelection] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<EmailPlatform | null>(null);

  const handleUpdatePlatform = (id: string, updates: Partial<EmailPlatform>) => {
    setPlatforms(prev => prev.map(platform => 
      platform.id === id ? { ...platform, ...updates } : platform
    ));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Mail className="h-6 w-6 text-blue-500" />
            <h3 className="text-lg font-semibold">Email Marketing</h3>
          </div>
          <button
            onClick={() => setShowPlatformSelection(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Nova Integração
          </button>
        </div>

        <EmailPlatformList
          platforms={platforms}
          onPlatformClick={setSelectedPlatform}
        />
      </div>

      {showPlatformSelection && (
        <PlatformSelectionModal
          platforms={platforms.filter(p => !p.connected)}
          onSelect={(platform) => {
            setSelectedPlatform(platform);
            setShowPlatformSelection(false);
          }}
          onClose={() => setShowPlatformSelection(false)}
        />
      )}

      {selectedPlatform && (
        <EmailPlatformModal
          platform={selectedPlatform}
          onClose={() => setSelectedPlatform(null)}
          onSave={handleUpdatePlatform}
        />
      )}
    </div>
  );
}