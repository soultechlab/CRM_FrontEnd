import React from 'react';
import { X } from 'lucide-react';

interface FiltrosAvancadosProps {
  filtros: {
    status: string[];
    tiposServico: string[];
    dataInicio: string;
    dataFim: string;
    aniversariantes: string;
    origem: string[];
  };
  onChange: (filtros: any) => void;
  onClose: () => void;
}

export default function FiltrosAvancados({ filtros, onChange, onClose }: FiltrosAvancadosProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      const array = filtros[name as keyof typeof filtros] as string[];
      onChange({
        ...filtros,
        [name]: checkbox.checked
          ? [...array, value]
          : array.filter(item => item !== value)
      });
    } else {
      onChange({ ...filtros, [name]: value });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* ... existing filters ... */}

      {/* Aniversariantes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Aniversariantes
        </label>
        <select
          name="aniversariantes"
          value={filtros.aniversariantes}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        >
          <option value="">Todos</option>
          <option value="mes">Deste mês</option>
          <option value="proximo">Próximo mês</option>
          <option value="ano">Deste ano</option>
        </select>
      </div>

      {/* ... rest of the component ... */}
    </div>
  );
}