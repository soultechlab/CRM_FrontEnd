import React from 'react';
import { Filter, X, Calendar, Search } from 'lucide-react';
import { TIPOS } from '../../constants/tipos';

interface FiltrosFinanceiroProps {
  filtros: {
    busca: string;
    tipoPagamento: string;
    categoria: string;
    mes: string;
    ano: string;
    status: string;
    periodoPersonalizado: boolean;
    dataInicio: string;
    dataFim: string;
  };
  onChange: (filtros: any) => void;
}

export default function FiltrosFinanceiro({ filtros, onChange }: FiltrosFinanceiroProps) {
  const hasActiveFilters = 
    filtros.busca ||
    filtros.tipoPagamento !== 'todos' ||
    filtros.categoria !== 'todas' ||
    filtros.status !== 'todos' ||
    filtros.mes !== 'todos' ||
    filtros.ano !== 'atual' ||
    filtros.periodoPersonalizado;

  const resetFiltros = () => {
    onChange({
      busca: '',
      tipoPagamento: 'todos',
      categoria: 'todas',
      mes: 'todos',
      ano: 'atual',
      status: 'todos',
      periodoPersonalizado: false,
      dataInicio: '',
      dataFim: ''
    });
  };

  return (
    <div className="p-4 space-y-4">
      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={filtros.busca || ''}
          onChange={(e) => onChange({ ...filtros, busca: e.target.value })}
          placeholder="Buscar por nome, cliente ou descrição..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={filtros.tipoPagamento || 'todos'}
          onChange={(e) => onChange({ ...filtros, tipoPagamento: e.target.value })}
          className={`text-sm rounded-lg px-3 py-2 border ${
            filtros.tipoPagamento !== 'todos'
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'border-gray-200'
          }`}
        >
          <option value="todos">Todas Formas</option>
          <option value="dinheiro">Dinheiro</option>
          <option value="pix">PIX</option>
          <option value="cartao">Cartão</option>
          <option value="transferencia">Transferência</option>
        </select>

        <select
          value={filtros.categoria || 'todas'}
          onChange={(e) => onChange({ ...filtros, categoria: e.target.value })}
          className={`text-sm rounded-lg px-3 py-2 border ${
            filtros.categoria !== 'todas'
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'border-gray-200'
          }`}
        >
          <option value="todas">Todas Categorias</option>
          {/* Receitas */}
          <optgroup label="Receitas">
            {
              TIPOS.map(({ id, label }) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))
            }
          </optgroup>
          {/* Despesas */}
          <optgroup label="Despesas">
            <option value="equipamento">Equipamento</option>
            <option value="software">Software</option>
            <option value="marketing">Marketing</option>
            <option value="aluguel">Aluguel</option>
            <option value="servicos">Serviços</option>
            <option value="impostos">Impostos</option>
            <option value="outros">Outros</option>
          </optgroup>
        </select>

        <select
          value={filtros.status || 'todos'}
          onChange={(e) => onChange({ ...filtros, status: e.target.value })}
          className={`text-sm rounded-lg px-3 py-2 border ${
            filtros.status !== 'todos'
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'border-gray-200'
          }`}
        >
          <option value="todos">Todos Status</option>
          <option value="pendente">Pendente</option>
          <option value="pago">Pago</option>
          <option value="parcelado">Parcelado</option>
        </select>

        {!filtros.periodoPersonalizado && (
          <>
            <select
              value={filtros.mes || 'todos'}
              onChange={(e) => onChange({ ...filtros, mes: e.target.value })}
              className={`text-sm rounded-lg px-3 py-2 border ${
                filtros.mes !== 'todos'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'border-gray-200'
              }`}
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
              value={filtros.ano || 'atual'}
              onChange={(e) => onChange({ ...filtros, ano: e.target.value })}
              className={`text-sm rounded-lg px-3 py-2 border ${
                filtros.ano !== 'atual'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'border-gray-200'
              }`}
            >
              <option value="atual">Ano Atual</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </>
        )}

        <button
          onClick={() => onChange({ 
            ...filtros, 
            periodoPersonalizado: !filtros.periodoPersonalizado,
            mes: 'todos',
            ano: 'atual'
          })}
          className={`text-sm rounded-lg px-3 py-2 border flex items-center gap-1 ${
            filtros.periodoPersonalizado
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Calendar className="h-4 w-4" />
          Data Personalizada
        </button>

        {filtros.periodoPersonalizado && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filtros.dataInicio || ''}
              onChange={(e) => onChange({ ...filtros, dataInicio: e.target.value })}
              className="text-sm rounded-lg border px-2 py-2"
            />
            <span className="text-sm text-gray-500">até</span>
            <input
              type="date"
              value={filtros.dataFim || ''}
              onChange={(e) => onChange({ ...filtros, dataFim: e.target.value })}
              className="text-sm rounded-lg border px-2 py-2"
            />
          </div>
        )}

        {hasActiveFilters && (
          <button
            onClick={resetFiltros}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            Limpar Filtros
          </button>
        )}
      </div>
    </div>
  );
}