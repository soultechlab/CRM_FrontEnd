import React from 'react';
import { Instagram, Phone, Globe, Facebook, Twitter, Youtube } from 'lucide-react';

interface SocialMediaProps {
  form: {
    instagram: string;
    whatsapp: string;
    website: string;
    facebook: string;
    twitter: string;
    youtube: string;
  };
  onChange: (field: string, value: string) => void;
}

export default function SocialMedia({ form, onChange }: SocialMediaProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <h2 className="text-lg font-semibold">Redes Sociais</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-400" />
            WhatsApp
          </div>
        </label>
        <input
          type="tel"
          value={form.whatsapp}
          onChange={(e) => onChange('whatsapp', e.target.value)}
          placeholder="(00) 00000-0000"
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
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
          value={form.instagram}
          onChange={(e) => onChange('instagram', e.target.value)}
          placeholder="@usuario"
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-gray-400" />
            Website
          </div>
        </label>
        <input
          type="url"
          value={form.website}
          onChange={(e) => onChange('website', e.target.value)}
          placeholder="https://seusite.com"
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center gap-2">
            <Facebook className="h-4 w-4 text-gray-400" />
            Facebook
          </div>
        </label>
        <input
          type="text"
          value={form.facebook}
          onChange={(e) => onChange('facebook', e.target.value)}
          placeholder="username ou URL completa"
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center gap-2">
            <Twitter className="h-4 w-4 text-gray-400" />
            Twitter
          </div>
        </label>
        <input
          type="text"
          value={form.twitter}
          onChange={(e) => onChange('twitter', e.target.value)}
          placeholder="@usuario"
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center gap-2">
            <Youtube className="h-4 w-4 text-gray-400" />
            YouTube
          </div>
        </label>
        <input
          type="text"
          value={form.youtube}
          onChange={(e) => onChange('youtube', e.target.value)}
          placeholder="URL do canal"
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>
    </div>
  );
}