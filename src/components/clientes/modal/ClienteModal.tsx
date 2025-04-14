import React from 'react';
import { X, Calendar, DollarSign, TrendingUp, Clock } from 'lucide-react';
import { Cliente } from '../../../types';
import { useClienteFinanceiro } from '../../../hooks/useClienteFinanceiro';
import { useAgendamentos } from '../../../contexts/AgendamentoContext';
import InfoBasica from './InfoBasica';
import HistoricoSessoes from './HistoricoSessoes';
import AnaliseFinanceira from './AnaliseFinanceira';
import ProximosAgendamentos from './ProximosAgendamentos';

interface ClienteModalProps {
  cliente: Cliente;
  onClose: () => void;
}

export default function ClienteModal({ cliente, onClose }: ClienteModalProps) {
  const { resumoCliente } = useClienteFinanceiro(cliente.id);
  const { agendamentos } = useAgendamentos();

  const agendamentosCliente = agendamentos.filter(a => a.clienteId === cliente.id);
  const agendamentosFuturos = agendamentosCliente.filter(
    a => new Date(a.data) > new Date()
  );
  const agendamentosPassados = agendamentosCliente.filter(
    a => new Date(a.data) <= new Date()
  );

  // Cálculo do LTV (Lifetime Value)
  const ltv = resumoCliente?.totalGasto || 0;
  const mediaGastoPorSessao = ltv / (agendamentosPassados.length || 1);
  const frequenciaMedia = agendamentosPassados.length / 
    (((new Date().getTime() - new Date(cliente.dataCadastro).getTime()) / 
    (1000 * 60 * 60 * 24 * 30)) || 1); // Média mensal

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-900">{cliente.nome}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Cliente desde</p>
                  <p className="text-lg font-semibold">
                    {new Date(cliente.dataCadastro).toLocaleDateString()}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Total Investido</p>
                  <p className="text-lg font-semibold">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(ltv)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600">Sessões Realizadas</p>
                  <p className="text-lg font-semibold">{agendamentosPassados.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600">LTV Mensal</p>
                  <p className="text-lg font-semibold">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(mediaGastoPorSessao * frequenciaMedia)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Informações Detalhadas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InfoBasica cliente={cliente} />
            <AnaliseFinanceira 
              ltv={ltv}
              mediaGastoPorSessao={mediaGastoPorSessao}
              frequenciaMedia={frequenciaMedia}
              totalSessoes={agendamentosPassados.length}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProximosAgendamentos agendamentos={agendamentosFuturos} />
            <HistoricoSessoes agendamentos={agendamentosPassados} />
          </div>
        </div>
      </div>
    </div>
  );
}