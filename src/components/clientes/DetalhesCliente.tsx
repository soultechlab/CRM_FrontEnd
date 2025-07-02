import React from 'react';
import { DollarSign, Clock, AlertCircle } from 'lucide-react';
import { Cliente } from '../../types';
import { useClienteFinanceiro } from '../../hooks/useClienteFinanceiro';

interface DetalhesClienteProps {
  cliente: Cliente;
}

export default function DetalhesCliente({ cliente }: DetalhesClienteProps) {
  const { resumoCliente } = useClienteFinanceiro(cliente.id);

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Histórico Financeiro</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Gasto</p>
              <p className="text-xl font-bold text-green-600">
                {formatarMoeda(resumoCliente?.totalGasto || 0)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>

        {resumoCliente?.totalPendente ? (
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pagamentos Pendentes</p>
                <p className="text-xl font-bold text-orange-600">
                  {formatarMoeda(resumoCliente.totalPendente)}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        ) : null}

        {resumoCliente?.ultimaTransacao ? (
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Última Transação</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatarData(resumoCliente.ultimaTransacao.data)}
                </p>
                <p className="text-sm text-gray-500">
                  {formatarMoeda(resumoCliente.ultimaTransacao.valor)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        ) : null}
      </div>

      {resumoCliente?.quantidadeTransacoes > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Total de {resumoCliente.quantidadeTransacoes} transações registradas
        </div>
      )}
    </div>
  );
}