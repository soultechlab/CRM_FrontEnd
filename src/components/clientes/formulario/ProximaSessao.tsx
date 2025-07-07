import React from 'react';
import { Calendar } from 'lucide-react';
import { Cliente } from '../../../types';

interface ProximaSessaoProps {
  form: Partial<Cliente>;
  onChange: (values: Partial<Cliente>) => void;
}

export default function ProximaSessao({ form, onChange }: ProximaSessaoProps) {
  const handleChange = (proximoAgendamento: string) => {
    onChange({
      historico: {
        ...form.historico,
        proximoAgendamento
      }
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
        <Calendar className="h-5 w-5 text-gray-400" />
        Próxima Sessão
      </h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Data Prevista
        </label>
        <input
          type="date"
          value={form.historico?.proximoAgendamento || ''}
          onChange={(e) => handleChange(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
        <p className="mt-1 text-sm text-gray-500">
          Defina uma data prevista para o próximo ensaio ou sessão
        </p>
      </div>
    </div>
  );
}