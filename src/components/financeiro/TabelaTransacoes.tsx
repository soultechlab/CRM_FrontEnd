import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Edit2, Trash2 } from 'lucide-react';
import { Transacao } from '../../types/financeiro';
import { formatarMoeda, formatarData } from '../../utils/formatters';
import { TIPOS, TIPOS_DESPESAS } from '../../constants/tipos';

interface TabelaTransacoesProps {
  transacoes: Transacao[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

type SortField = 'data' | 'tipo' | 'valor' | 'status';
type SortDirection = 'asc' | 'desc';

export default function TabelaTransacoes({ transacoes, onEdit, onDelete }: TabelaTransacoesProps) {
  const [itensPorPagina, setItensPorPagina] = useState(() => {
    const saved = localStorage.getItem('itensPorPagina');
    return saved ? Number(saved) : 10;
  });
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [sortField, setSortField] = useState<SortField>('data');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Ordenar transações
  const transacoesOrdenadas = useMemo(() => {
    return [...transacoes].sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      
      switch (sortField) {
        case 'data':
          return (new Date(a.data).getTime() - new Date(b.data).getTime()) * direction;
        
        case 'tipo':
          if (a.tipo === b.tipo) {
            return (new Date(a.data).getTime() - new Date(b.data).getTime()) * direction;
          }
          return a.tipo.localeCompare(b.tipo) * direction;
        
        case 'valor':
          if (a.valor === b.valor) {
            return (new Date(a.data).getTime() - new Date(b.data).getTime()) * direction;
          }
          return (a.valor - b.valor) * direction;
        
        case 'status':
          if (a.status === b.status) {
            return (new Date(a.data).getTime() - new Date(b.data).getTime()) * direction;
          }
          return a.status.localeCompare(b.status) * direction;
        
        default:
          return 0;
      }
    });
  }, [transacoes, sortField, sortDirection]);

  // Calcular totais
  const totais = useMemo(() => {
    return transacoesOrdenadas.reduce((acc, transacao) => {
      if (transacao.tipo === 'receita') {
        acc.receitas += Number(transacao.valor);
      } else {
        acc.despesas += Number(transacao.valor);
      }
      return acc;
    }, { receitas: 0, despesas: 0 });
  }, [transacoesOrdenadas]);

  // Paginação
  const totalPaginas = Math.ceil(transacoesOrdenadas.length / itensPorPagina);
  const transacoesPaginadas = transacoesOrdenadas.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  const handleItensPorPaginaChange = (valor: number) => {
    setItensPorPagina(valor);
    setPaginaAtual(1);
    localStorage.setItem('itensPorPagina', valor.toString());
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ArrowDown className="h-4 w-4" /> : 
      <ArrowUp className="h-4 w-4" />;
  };

  return (
    <div className="overflow-x-auto">
      {/* Controles de paginação */}
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Itens por página:</span>
          <select
            value={itensPorPagina}
            onChange={(e) => handleItensPorPaginaChange(Number(e.target.value))}
            className="text-sm border rounded-lg px-2 py-1"
          >
            <option value={10}>10</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))}
            disabled={paginaAtual === 1}
            className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-sm">
            Página {paginaAtual} de {totalPaginas}
          </span>
          <button
            onClick={() => setPaginaAtual(prev => Math.min(prev + 1, totalPaginas))}
            disabled={paginaAtual === totalPaginas}
            className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      </div>

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
        <tr>
          <th 
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
            onClick={() => handleSort('data')}
          >
            <div className="flex items-center gap-1">
              Data
              <SortIcon field="data" />
            </div>
          </th>
          <th 
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
            onClick={() => handleSort('tipo')}
          >
            <div className="flex items-center gap-1">
              Tipo
              <SortIcon field="tipo" />
            </div>
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            Cliente
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            Descrição
          </th>
          <th 
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
            onClick={() => handleSort('valor')}
          >
            <div className="flex items-center gap-1">
              Valor
              <SortIcon field="valor" />
            </div>
          </th>
          <th 
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
            onClick={() => handleSort('status')}
          >
            <div className="flex items-center gap-1">
              Status
              <SortIcon field="status" />
            </div>
          </th>
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
            Ações
          </th>
        </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
            {transacoesPaginadas.map((transacao) => (
              <tr key={transacao.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatarData(transacao.data)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    transacao.tipo === 'receita' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {transacao.tipo === 'receita' ? 'Receita' : 'Despesa'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {transacao.cliente ? (
                    <div>
                      <p className="text-sm font-medium text-gray-900">{transacao.cliente.nome}</p>
                      {transacao.cliente.email && (
                        <p className="text-xs text-gray-500">{transacao.cliente.email}</p>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">-</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{transacao.descricao}</div>
                  {transacao.formaPagamento && (
                    <div className="text-xs text-gray-500 capitalize">
                      {
                         transacao.tipo === 'receita'
                         ? TIPOS.find((tipo) => tipo.id === transacao.categoria)?.label
                         : TIPOS_DESPESAS.find((tipo) => tipo.id === transacao.categoria)?.label
                      } - {transacao.formaPagamento}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-medium ${
                    transacao.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatarMoeda(transacao.valor)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    transacao.status === 'pago' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {transacao.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(transacao.id)}
                      className="text-gray-600 hover:text-blue-600"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(transacao.id)}
                      className="text-gray-600 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          {transacoes.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                Nenhuma transação encontrada
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Totais fixos */}
      <div className="sticky bottom-0 bg-gray-50 border-t">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="font-medium text-gray-900">Totais do período:</div>
          <div className="space-y-1 text-right">
            <p className="text-sm text-green-600">
              Receitas: {formatarMoeda(totais.receitas)}
            </p>
            <p className="text-sm text-red-600">
              Despesas: {formatarMoeda(totais.despesas)}
            </p>
            <p className="text-sm font-medium">
              Saldo: {formatarMoeda(totais.receitas - totais.despesas)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}