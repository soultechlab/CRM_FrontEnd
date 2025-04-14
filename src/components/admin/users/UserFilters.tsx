import React from 'react';
import { Search, Filter } from 'lucide-react';

interface UserFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters: {
    plan: string;
    status: string;
    role: string;
  };
  onFilterChange: (key: string, value: string) => void;
}

const UserFilters: React.FC<UserFiltersProps> = ({ 
  searchTerm, 
  onSearchChange, 
  filters,
  onFilterChange 
}) => {
  return (
    <div className="p-4 border-b space-y-4">
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, email..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button 
          className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          onClick={() => alert('Função de filtros adicionais em construção!')}
        >
          <Filter className="h-5 w-5" />
          Filtros
        </button>
      </div>

      <div className="flex gap-4">
        <select
          value={filters.plan}
          onChange={(e) => onFilterChange('plan', e.target.value)}
          className="border rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">Todos os planos</option>
          <option value="free">Free</option>
          <option value="monthly">Mensal</option>
          <option value="annual">Anual</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => onFilterChange('status', e.target.value)}
          className="border rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">Todos os status</option>
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
        </select>

        <select
          value={filters.role}
          onChange={(e) => onFilterChange('role', e.target.value)}
          className="border rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">Todas as funções</option>
          <option value="user">Usuário</option>
          <option value="admin">Administrador</option>
        </select>
      </div>
    </div>
  );
};

export default UserFilters;
