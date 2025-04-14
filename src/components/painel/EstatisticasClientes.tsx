import React, { useEffect, useState } from 'react';
import { Users, UserPlus, TrendingUp } from 'lucide-react';
import { clientesMock } from '../../mocks/clientesMock';
import { analisarOrigensClientes, contarClientesNovosMes, contarClientesAno } from '../../utils/clienteAnalytics';
import { obterClientes } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import { Cliente } from '../../types';

export default function EstatisticasClientes() {
  const { user } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const { total: novosClientesMes, percentualCrescimento } = contarClientesNovosMes(clientes);
  const totalClientesAno = contarClientesAno(clientes);
  const origensStats = analisarOrigensClientes(clientes);

    useEffect(() => {
      const fetchClientes = async () => {
        try {
          const dadosClientes = await obterClientes(user);
          setClientes(dadosClientes);
        } catch (err) {
  
        }
      };
  
      fetchClientes();
    }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Análise de Clientes</h2>
        <Users className="h-5 w-5 text-gray-500" />
      </div>
      
      <div className="space-y-6">
        {/* Top 3 Origens */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Principais Origens de Clientes
          </h3>
          <div className="space-y-3">
            {origensStats.map((stat, index) => (
              <div key={stat.origem} className="flex items-center gap-4">
                <div className={`p-3 rounded-full bg-white ${
                  index === 0 ? 'text-yellow-500 bg-yellow-50' :
                  index === 1 ? 'text-blue-500 bg-blue-50' :
                  'text-green-500 bg-green-50'
                }`}>
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{stat.origem}</p>
                    <p className="text-sm text-gray-500">
                      {stat.quantidade} clientes
                    </p>
                  </div>
                  <div className="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-blue-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${stat.percentual}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Métricas de Clientes */}
        <div className="space-y-4">
          {/* Novos Clientes no Mês */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-white text-blue-500">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Novos Clientes no Mês</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-bold">{novosClientesMes}</p>
                  {percentualCrescimento !== 0 && (
                    <span className={`text-sm ${
                      percentualCrescimento > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {percentualCrescimento > 0 ? '+' : ''}{percentualCrescimento.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Total de Clientes no Ano */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-white text-purple-500">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Clientes no Ano</p>
                <p className="text-lg font-bold">{totalClientesAno}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}