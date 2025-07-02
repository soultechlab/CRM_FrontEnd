import React from 'react';
import { Instagram, Phone, Globe, Facebook, Twitter, Youtube } from 'lucide-react';
import { createWhatsAppLink, createInstagramLink } from '../../../../utils/socialUtils';

interface SocialLinksProps {
  whatsapp?: string;
  instagram?: string;
  website?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
}

export default function SocialLinks(props: SocialLinksProps) {
  const hasSocialLinks = Object.values(props).some(value => value);

  if (!hasSocialLinks) return null;

  return (
    <div className="bg-gray-50 rounded-lg p-4 mt-4">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Redes Sociais</h4>
      <div className="space-y-2">
        {props.whatsapp && (
          <a
            href={createWhatsAppLink(props.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
          >
            <Phone className="h-4 w-4" />
            <span className="text-sm">{props.whatsapp}</span>
          </a>
        )}

        {props.instagram && (
          <a
            href={createInstagramLink(props.instagram)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors"
          >
            <Instagram className="h-4 w-4" />
            <span className="text-sm">{props.instagram}</span>
          </a>
        )}

        {props.website && (
          <a
            href={props.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <Globe className="h-4 w-4" />
            <span className="text-sm">{props.website}</span>
          </a>
        )}

        {props.facebook && (
          <a
            href={props.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <Facebook className="h-4 w-4" />
            <span className="text-sm">{props.facebook}</span>
          </a>
        )}

        {props.twitter && (
          <a
            href={props.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <Twitter className="h-4 w-4" />
            <span className="text-sm">{props.twitter}</span>
          </a>
        )}

        {props.youtube && (
          <a
            href={props.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
          >
            <Youtube className="h-4 w-4" />
            <span className="text-sm">{props.youtube}</span>
          </a>
        )}
      </div>
    </div>
  );
}