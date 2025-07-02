import React from 'react';
import { Cliente } from '../../../types';
import { formatarTelefone } from '../../../utils/formatters';

interface InformacoesContatoProps {
  form: Partial<Cliente>;
  onChange: (values: Partial<Cliente>) => void;
}

export default function InformacoesContato({ form, onChange }: InformacoesContatoProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Informações de Contato</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => onChange({ email: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefone
          </label>
          <input
            type="tel"
            value={form.telefone}
            onChange={(e) => onChange({ telefone: formatarTelefone(e.target.value) })}
            placeholder="(00) 00000-0000"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Instagram
          </label>
          <input
            type="text"
            value={form.instagram}
            onChange={(e) => onChange({ instagram: e.target.value })}
            placeholder="@usuario"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Facebook
          </label>
          <input
            type="text"
            value={form.facebook}
            onChange={(e) => onChange({ facebook: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}