import React, { useState } from 'react';
import { Calendar, ChevronDown, ChevronUp, Filter, Search } from 'lucide-react';

interface FiltrosClienteProps {
  termoBusca: string;
  onSearchChange: (value: string) => void;
  filtros: {
    status: string[];
    tiposServico: string[];
    origem: string[];
    ordenacao: string;
    aniversariantes: string;
  };
  onFiltroChange: (filtros: any) => void;
}

export default function FiltrosCliente() {
  const [showFilters, setShowFilters] = useState(() => {
    const saved = localStorage.getItem('showClientFilters');
    return saved ? JSON.parse(saved) : true;
  });

  const [termoBusca, setTermoBusca] = useState('');

  const [filtros, setFiltros] = useState({
    status: 'todos',
    aniversariantes: 'todos',
    origem: 'todas',
    mes: 'todos',
    ano: new Date().getFullYear().toString(),
    dataInicio: '',
    dataFim: '',
    periodoPersonalizado: false
  });

  return (
    <div className="bg-white rounded-lg shadow">
    <div className="p-4 border-b">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou telefone..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          <Filter className="h-5 w-5" />
          <span className="hidden md:inline">
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </span>
          <span className="md:hidden">Filtros</span>
          {showFilters ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
    {showFilters && (
      <div className="p-4 border-b space-y-4 transition-all duration-300">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <select
            value={filtros.status}
            onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="todos">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
            <option value="prospecto">Prospecto</option>
          </select>

          <select
            value={filtros.aniversariantes}
            onChange={(e) => setFiltros({ ...filtros, aniversariantes: e.target.value })}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="todos">Todos os aniversários</option>
            <option value="proximos7">Próximos 7 dias</option>
            <option value="mes">Deste mês</option>
            <option value="proximo">Próximo mês</option>
            <optgroup label="Meses">
              <option value="janeiro">Janeiro</option>
              <option value="fevereiro">Fevereiro</option>
              <option value="marco">Março</option>
              <option value="abril">Abril</option>
              <option value="maio">Maio</option>
              <option value="junho">Junho</option>
              <option value="julho">Julho</option>
              <option value="agosto">Agosto</option>
              <option value="setembro">Setembro</option>
              <option value="outubro">Outubro</option>
              <option value="novembro">Novembro</option>
              <option value="dezembro">Dezembro</option>
            </optgroup>
          </select>

          <select
            value={filtros.origem}
            onChange={(e) => setFiltros({ ...filtros, origem: e.target.value })}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="todas">Todas as origens</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="indicacao">Indicação</option>
            <option value="anuncio">Anúncio</option>
            <option value="tiktok">TikTok</option>
            <option value="outros">Outros</option>
          </select>

          <select
            value={filtros.mes}
            onChange={(e) => setFiltros({ ...filtros, mes: e.target.value })}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            disabled={filtros.periodoPersonalizado}
          >
            <option value="todos">Todos os meses</option>
            <option value="atual">Mês Atual</option>
            <option value="0">Janeiro</option>
            <option value="1">Fevereiro</option>
            <option value="2">Março</option>
            <option value="3">Abril</option>
            <option value="4">Maio</option>
            <option value="5">Junho</option>
            <option value="6">Julho</option>
            <option value="7">Agosto</option>
            <option value="8">Setembro</option>
            <option value="9">Outubro</option>
            <option value="10">Novembro</option>
            <option value="11">Dezembro</option>
          </select>

          <select
            value={filtros.ano}
            onChange={(e) => setFiltros({ ...filtros, ano: e.target.value })}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            disabled={filtros.periodoPersonalizado}
          >
            <option value="todos">Todos os anos</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>

          {!filtros.periodoPersonalizado ? (
            <button
              onClick={() => setFiltros(prev => ({
                ...prev,
                periodoPersonalizado: true,
                mes: 'todos',
                ano: 'todos'
              }))}
              className="text-sm rounded-lg px-3 py-2 border flex items-center gap-1 border-gray-200 hover:bg-gray-50"
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden md:inline">Data Personalizada</span>
              <span className="md:hidden">Período</span>
            </button>
          ) : (
            <div className="col-span-full md:col-span-2 flex items-center gap-2">
              <input
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              <span className="text-gray-500">até</span>
              <input
                type="date"
                value={filtros.dataFim}
                onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          )}
        </div>

        {Object.values(filtros).some(v => v !== 'todos' && v !== '') && (
          <div className="flex justify-end">
            <button
              onClick={() => setFiltros({
                status: 'todos',
                aniversariantes: 'todos',
                origem: 'todas',
                mes: 'todos',
                ano: new Date().getFullYear().toString(),
                dataInicio: '',
                dataFim: '',
                periodoPersonalizado: false
              })}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Limpar Filtros
            </button>
          </div>
        )}
      </div>
    )}
  </div>
  );
}