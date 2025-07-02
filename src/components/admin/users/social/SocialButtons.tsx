import React from 'react';
import { Instagram, Phone } from 'lucide-react';
import { createWhatsAppLink, createInstagramLink } from '../../../../utils/socialUtils';

interface SocialButtonsProps {
  whatsapp?: string;
  instagram?: string;
}

export default function SocialButtons({ whatsapp, instagram }: SocialButtonsProps) {
  if (!whatsapp && !instagram) return null;

  return (
    <div className="flex gap-2">
      {whatsapp && (
        <a
          href={createWhatsAppLink(whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 text-green-600 hover:bg-green-50 rounded-full transition-colors"
          title="Contato via WhatsApp"
        >
          <Phone className="h-4 w-4" />
        </a>
      )}
      {instagram && (
        <a
          href={createInstagramLink(instagram)}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 text-pink-600 hover:bg-pink-50 rounded-full transition-colors"
          title="Perfil do Instagram"
        >
          <Instagram className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}