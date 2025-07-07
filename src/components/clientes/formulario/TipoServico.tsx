import React from 'react';
import { Cliente } from '../../../types';

interface TipoServicoProps {
  form: Partial<Cliente>;
  onChange: (values: Partial<Cliente>) => void;
}

const TIPOS_SERVICO = [
  { id: 'unico', label: 'Serviço Único' },
  { id: 'recorrente', label: 'Recorrente' },
  { id: 'trimestral', label: 'Trimestral' },
  { id: 'semestral', label: 'Semestral' },
  { id: 'anual', label: 'Anual' }
];

export default function TipoServico({ form, onChange }: TipoServicoProps) {
  const handleTipoServicoChange = (tipo: string) => {
    onChange({ tiposServico: [tipo] });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Tipo de Serviço</h3>
      
      <div className="flex flex-wrap gap-2">
        {TIPOS_SERVICO.map(tipo => (
          <button
            key={tipo.id}
            type="button"
            onClick={() => handleTipoServicoChange(tipo.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${form.tiposServico?.[0] === tipo.id
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            {tipo.label}
          </button>
        ))}
      </div>
    </div>
  );
}