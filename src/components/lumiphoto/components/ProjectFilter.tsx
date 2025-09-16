import React from 'react';
import { Search, Filter } from 'lucide-react';

interface ProjectFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  statusOptions: Array<{
    value: string;
    label: string;
    color: string;
  }>;
  projects: any[];
}

export function ProjectFilter({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  statusOptions,
  projects
}: ProjectFilterProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar projetos ou clientes..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onStatusChange(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === option.value
                  ? `${option.color} text-gray-800 border-2 border-gray-400`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.label}
              {option.value !== 'all' && (
                <span className="ml-2 bg-white text-gray-600 px-2 py-1 rounded-full text-xs">
                  {projects.filter(p => p.status === option.value).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}