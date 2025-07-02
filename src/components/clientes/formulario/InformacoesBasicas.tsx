import React from 'react';
import { Cliente } from '../../../types';

const ORIGENS = [
  { id: 'facebook', label: 'Facebook' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'indicacao', label: 'Indicação' },
  { id: 'anuncio', label: 'Anúncio' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'outros', label: 'Outros' }
];

interface InformacoesBasicasProps {
  form: Partial<Cliente>;
  onChange: (values: Partial<Cliente>) => void;
}

export default function InformacoesBasicas({ form, onChange }: InformacoesBasicasProps) {
  const handleOrigemChange = (origem: string) => {
    const origens = form.origem || [];
    const novasOrigens = origens.includes(origem)
      ? origens.filter(o => o !== origem)
      : [...origens, origem];
    onChange({ origem: novasOrigens });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Informações Básicas</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome
          </label>
          <input
            type="text"
            value={form.nome || ''}
            onChange={(e) => onChange({ nome: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data de Nascimento
          </label>
          <input
            type="date"
            value={form.dataNascimento || ''}
            onChange={(e) => onChange({ dataNascimento: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Profissão
          </label>
          <input
            type="text"
            value={form.profissao || ''}
            onChange={(e) => onChange({ profissao: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={form.status || 'prospecto'}
            onChange={(e) => onChange({ status: e.target.value as 'ativo' | 'inativo' | 'prospecto' })}
            className="w-full rounded-lg border border-gray-300 px-3 py-3 focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="prospecto">Prospecto</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Origem do Cliente
        </label>
        <div className="flex flex-wrap gap-2">
          {ORIGENS.map(origem => (
            <button
              key={origem.id}
              type="button"
              onClick={() => handleOrigemChange(origem.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                (form.origem || []).includes(origem.id)
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {origem.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}