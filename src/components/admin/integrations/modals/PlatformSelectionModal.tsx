import React from 'react';
import { X } from 'lucide-react';
import { EmailPlatform } from '../../../../types/integrations';

interface PlatformSelectionModalProps {
  platforms: EmailPlatform[];
  onSelect: (platform: EmailPlatform) => void;
  onClose: () => void;
}

export default function PlatformSelectionModal({
  platforms,
  onSelect,
  onClose
}: PlatformSelectionModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Selecionar Plataforma</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            {platforms.map((platform) => (
              <button
                key={platform.id}
                onClick={() => onSelect(platform)}
                className="flex items-center gap-4 p-4 border rounded-lg hover:border-blue-500 transition-colors text-left"
              >
                <img
                  src={platform.logo}
                  alt={platform.name}
                  className="h-8 w-auto"
                />
                <div>
                  <h3 className="font-medium text-gray-900">{platform.name}</h3>
                  <p className="text-sm text-gray-500">{platform.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}