import React from 'react';
import { X, Calendar, DollarSign, Instagram, Phone, Mail, Clock, TrendingUp, Camera } from 'lucide-react';
import { Cliente } from '../../../types';
import { useClienteFinanceiro } from '../../../hooks/useClienteFinanceiro';
import { useAgendamentos } from '../../../contexts/AgendamentoContext';
import { formatarMoeda, formatarData } from '../../../utils/formatters';
import { isAniversariante } from '../../../utils/clienteUtils';
import { TIPOS } from '../../../constants/tipos';

interface ClienteDetalhesModalProps {
  cliente: Cliente;
  onClose: () => void;
}

export default function ClienteDetalhesModal({ cliente, onClose }: ClienteDetalhesModalProps) {
  const { resumoCliente } = useClienteFinanceiro(cliente.id);
  const { agendamentos } = useAgendamentos();
  const aniversarianteHoje = isAniversariante(cliente);

  const proximosAgendamentos = agendamentos
    .filter(a => a.cliente.id === cliente.id && new Date(a.data) >= new Date())
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

  const agendamentosPassados = agendamentos
    .filter(a => a.cliente.id === cliente.id && new Date(a.data) < new Date())
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              {cliente.nome}
              {aniversarianteHoje && (
                <span className="px-2 py-0.5 text-xs bg-pink-100 text-pink-800 rounded-full">
                  Aniversário hoje! 🎉
                </span>
              )}
            </h2>
            {cliente.profissao && (
              <p className="text-sm text-gray-600 mt-1">{cliente.profissao}</p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contatos */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Informações de Contato</h3>
              {cliente.email && (
                <a href={`mailto:${cliente.email}`} className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                  <Mail className="h-5 w-5" />
                  {cliente.email}
                </a>
              )}
              {cliente.telefone && (
                <a href={`tel:${cliente.telefone}`} className="flex items-center gap-2 text-gray-600 hover:text-green-600">
                  <Phone className="h-5 w-5" />
                  {cliente.telefone}
                </a>
              )}
              {cliente.instagram && (
                <a href={`https://instagram.com/${cliente.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-600 hover:text-pink-600">
                  <Instagram className="h-5 w-5" />
                  {cliente.instagram}
                </a>
              )}
            </div>

            {/* Dados do Cliente */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Dados do Cliente</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-5 w-5" />
                  <span>Cliente desde: {formatarData(cliente.dataCadastro)}</span>
                </div>
                {cliente.dataNascimento && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-5 w-5" />
                    <span>Aniversário: {formatarData(cliente.dataNascimento)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <Camera className="h-5 w-5" />
                  <span>Total de sessões: {resumoCliente?.agendamentosPassados?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Métricas Financeiras */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Total Investido</p>
                  <p className="text-xl font-bold text-blue-700">
                    {formatarMoeda(resumoCliente?.totalGasto || 0)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Média por Sessão</p>
                  <p className="text-xl font-bold text-green-700">
                    {formatarMoeda(resumoCliente?.mediaGastoPorSessao || 0)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </div>

            {/* <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600">LTV (Lifetime Value)</p>
                  <p className="text-xl font-bold text-purple-700">
                    {formatarMoeda(resumoCliente?.ltv || 0)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-500" />
              </div>
            </div> */}
          </div>

          {/* Próximos Agendamentos */}
          {proximosAgendamentos.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Próximos Agendamentos</h3>
              <div className="space-y-3">
                {proximosAgendamentos.map((agendamento) => (
                  <div key={agendamento.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-blue-800">{agendamento.tipo}</p>
                      <p className="text-sm text-blue-600">{agendamento.local}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-blue-800">{formatarData(agendamento.data)}</p>
                      <p className="text-sm text-blue-600">{agendamento.hora}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Histórico de Sessões */}
          {agendamentosPassados.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Histórico de Sessões</h3>
              <div className="space-y-3">
                {agendamentosPassados.map((agendamento) => {
                  const tipoAgendamento = TIPOS.find((tipo) => tipo.id === agendamento.tipo);

                  return (
                    <div
                      key={agendamento.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{tipoAgendamento?.label || agendamento.tipo}</p>
                        <p className="text-sm text-gray-500">{agendamento.local}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatarData(agendamento.data)}</p>
                        <p className="text-sm text-gray-500">{formatarMoeda(agendamento.valor || 0)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Origem e Observações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cliente.origem?.filter(origem => origem !== null).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Origem do Cliente</h3>
                <div className="flex flex-wrap gap-2">
                  {cliente.origem.map((origem) => (
                    <span key={origem} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {origem.charAt(0).toUpperCase() + origem.slice(1)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {cliente.observacoes && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Observações</h3>
                <p className="text-gray-600">{cliente.observacoes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}