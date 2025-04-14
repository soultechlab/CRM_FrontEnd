// Update social fields component with validation
import React from 'react';
import { Instagram, Phone } from 'lucide-react';
import { validateInstagram } from '../../../../utils/socialUtils';

interface SocialFieldsProps {
  instagram: string;
  whatsapp: string;
  onChange: (field: string, value: string) => void;
}

export default function SocialFields({ instagram, whatsapp, onChange }: SocialFieldsProps) {
  const handleInstagramChange = (value: string) => {
    // Auto-format Instagram handle
    const formattedValue = value.startsWith('@') ? value : `@${value}`;
    onChange('instagram', formattedValue);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-400" />
            WhatsApp
          </div>
        </label>
        <input
          type="tel"
          value={whatsapp}
          onChange={(e) => onChange('whatsapp', e.target.value)}
          placeholder="(00) 00000-0000"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center gap-2">
            <Instagram className="h-4 w-4 text-gray-400" />
            Instagram
          </div>
        </label>
        <input
          type="text"
          value={instagram}
          onChange={(e) => handleInstagramChange(e.target.value)}
          placeholder="@usuario"
          className={`w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 ${
            instagram && !validateInstagram(instagram) 
              ? 'border-red-300 focus:border-red-500' 
              : 'border-gray-300'
          }`}
        />
        {instagram && !validateInstagram(instagram) && (
          <p className="mt-1 text-sm text-red-600">
            Nome de usuário do Instagram inválido
          </p>
        )}
      </div>
    </div>
  );
}