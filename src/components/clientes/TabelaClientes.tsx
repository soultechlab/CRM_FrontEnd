import React, { useState } from 'react';
import { Edit2, Trash2, ArrowUp, ArrowDown, Gift } from 'lucide-react';
import { Cliente } from '../../types';
import { formatarMoeda, formatarData } from '../../utils/formatters';
import SocialButtons from './social/SocialButtons';

interface TabelaClientesProps {
  clientes: Cliente[];
  onEdit: (cliente: Cliente) => void;
  onDelete: (cliente: Cliente) => void;
  onClienteClick: (cliente: Cliente) => void;
}

type SortField = 'nome' | 'dataCadastro' | 'status' | 'dataNascimento' | 'ultimaSessao' | 'valorTotalGasto';
type SortDirection = 'asc' | 'desc';

export default function TabelaClientes({ 
  clientes, 
  onEdit, 
  onDelete,
  onClienteClick 
}: TabelaClientesProps) {
  const [itensPorPagina, setItensPorPagina] = useState(() => {
    const saved = localStorage.getItem('clientesItensPorPagina');
    return saved ? Number(saved) : 30;
  });
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [sortField, setSortField] = useState<SortField>('dataCadastro');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Ordenar clientes
  const clientesOrdenados = [...clientes].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    switch (sortField) {
      case 'nome':
        return a.nome.localeCompare(b.nome) * direction;
      case 'dataCadastro':
        return (new Date(a.dataCadastro).getTime() - new Date(b.dataCadastro).getTime()) * direction;
      case 'status':
        return a.status.localeCompare(b.status) * direction;
      case 'dataNascimento':
        if (!a.dataNascimento || !b.dataNascimento) return 0;
        return (new Date(a.dataNascimento).getTime() - new Date(b.dataNascimento).getTime()) * direction;
      case 'ultimaSessao':
        const ultimaA = a.historico?.ultimaSessao ? new Date(a.historico.ultimaSessao).getTime() : 0;
        const ultimaB = b.historico?.ultimaSessao ? new Date(b.historico.ultimaSessao).getTime() : 0;
        return (ultimaA - ultimaB) * direction;
      case 'valorTotalGasto':
        return ((a.historico?.valorTotalGasto || 0) - (b.historico?.valorTotalGasto || 0)) * direction;
      default:
        return 0;
    }
  });

  // Paginação
  const totalPaginas = Math.ceil(clientesOrdenados.length / itensPorPagina);
  const clientesPaginados = clientesOrdenados.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleItensPorPaginaChange = (valor: number) => {
    setItensPorPagina(valor);
    setPaginaAtual(1);
    localStorage.setItem('clientesItensPorPagina', valor.toString());
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ArrowUp className="h-4 w-4" /> : 
      <ArrowDown className="h-4 w-4" />;
  };

  // Mobile Card Component
  const ClienteCard = ({ cliente }: { cliente: Cliente }) => {
    const isAniversariante = cliente.dataNascimento && 
      new Date(cliente.dataNascimento).getDate() === new Date().getDate() &&
      new Date(cliente.dataNascimento).getMonth() === new Date().getMonth();

    return (
      <div 
        className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-3"
        onClick={() => onClienteClick(cliente)}
      >
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-blue-600">{cliente.nome}</h3>
              {isAniversariante && (
                <Gift className="h-4 w-4 text-pink-500" />
              )}
            </div>
            {cliente.profissao && (
              <p className="text-sm text-gray-500">{cliente.profissao}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(cliente);
              }}
              className="p-1 text-gray-400 hover:text-blue-600"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(cliente);
              }}
              className="p-1 text-gray-400 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            cliente.status === 'ativo' ? 'bg-green-100 text-green-800' :
            cliente.status === 'inativo' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {cliente.status}
          </span>
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
            Cadastro: {formatarData(cliente.dataCadastro)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <SocialButtons
            whatsapp={cliente.telefone}
            instagram={cliente.instagram}
            email={cliente.email}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-500">Última Sessão</p>
            <p className="font-medium">
              {cliente.historico?.ultimaSessao ? 
                formatarData(cliente.historico.ultimaSessao) : 
                'Nenhuma'
              }
            </p>
          </div>
          <div>
            <p className="text-gray-500">Total Pago</p>
            <p className="font-medium">
              {cliente.totalGasto
                ? formatarMoeda(cliente.totalGasto)
                : 'R$ 0,00'
              }
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Controles de paginação */}
      <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Itens por página:</span>
          <select
            value={itensPorPagina}
            onChange={(e) => handleItensPorPaginaChange(Number(e.target.value))}
            className="text-sm border rounded-lg px-2 py-1"
          >
            <option value={30}>30</option>
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

      {/* Mobile View */}
      <div className="md:hidden p-4 space-y-4">
        {clientesPaginados.map(cliente => (
          <ClienteCard key={cliente.id} cliente={cliente} />
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('nome')}
              >
                <div className="flex items-center gap-1">
                  Cliente
                  <SortIcon field="nome" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('dataCadastro')}
              >
                <div className="flex items-center gap-1">
                  Cadastro
                  <SortIcon field="dataCadastro" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Contato
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
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('ultimaSessao')}
              >
                <div className="flex items-center gap-1">
                  Última Sessão
                  <SortIcon field="ultimaSessao" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Próxima Sessão
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('valorTotalGasto')}
              >
                <div className="flex items-center gap-1">
                  Total Pago
                  <SortIcon field="valorTotalGasto" />
                </div>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clientesPaginados.map((cliente) => (
              <tr 
                key={cliente.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onClienteClick(cliente)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-blue-600 hover:text-blue-800">
                      {cliente.nome}
                    </div>
                    {cliente.profissao && (
                      <div className="text-sm text-gray-500">
                        {cliente.profissao}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatarData(cliente.dataCadastro)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <SocialButtons
                    whatsapp={cliente.telefone}
                    instagram={cliente.instagram}
                    email={cliente.email}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    cliente.status === 'ativo' ? 'bg-green-100 text-green-800' :
                    cliente.status === 'inativo' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {cliente.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {cliente.ultimoAgendamento?.data ? 
                    formatarData(cliente.ultimoAgendamento.data) : 
                    'Nenhuma'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {cliente.proximoAgendamento?.data ? 
                    formatarData(cliente.proximoAgendamento.data) : 
                    'Nenhuma'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {cliente.totalGasto
                      ? formatarMoeda(cliente.totalGasto)
                      : 'R$ 0,00'
                    }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(cliente);
                      }}
                      className="text-gray-600 hover:text-blue-600"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(cliente);
                      }}
                      className="text-gray-600 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}