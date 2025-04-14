import React from 'react';
import { Cliente } from '../../../types';

interface ObservacoesProps {
  form: Partial<Cliente>;
  onChange: (values: Partial<Cliente>) => void;
}

export default function Observacoes({ form, onChange }: ObservacoesProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Observações</h3>
      
      <div>
        <textarea
          value={form.observacoes}
          onChange={(e) => onChange({ observacoes: e.target.value })}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
          placeholder="Adicione observações importantes sobre o cliente..."
        />
      </div>
    </div>
  );
}