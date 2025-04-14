import React from 'react';
import { Filter } from 'lucide-react';

interface FiltrosMobileProps {
  filtros: {
    tipo: string;
    periodo: string;
    status: string;
  };
  onChange: (filtros: any) => void;
}

export default function FiltrosMobile({ filtros, onChange }: FiltrosMobileProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Filter className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Filtros</span>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <select
          value={filtros.tipo}
          onChange={(e) => onChange({ ...filtros, tipo: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="todos">Todos os tipos</option>
          <option value="receita">Receitas</option>
          <option value="despesa">Despesas</option>
        </select>

        <select
          value={filtros.status}
          onChange={(e) => onChange({ ...filtros, status: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="todos">Todos os status</option>
          <option value="pago">Pagos</option>
          <option value="pendente">Pendentes</option>
        </select>
      </div>

      <select
        value={filtros.periodo}
        onChange={(e) => onChange({ ...filtros, periodo: e.target.value })}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
      >
        <option value="mes-atual">Mês Atual</option>
        <option value="todos">Todos os períodos</option>
      </select>
    </div>
  );
}