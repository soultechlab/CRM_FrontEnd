import React, { useState } from 'react';
import { Calendar, Clock, DollarSign, Edit2, List, MapPin, MessageCircle, X } from 'lucide-react';
import { Agendamento } from '../../types';
import { formatarDataBR } from '../../utils/dateUtils';
import { formatarMoeda } from '../../utils/formatters';
import { TIPOS } from '../../constants/tipos';

interface AgendamentoCardProps {
  agendamento: Agendamento;
  onEdit: () => void;
}

export default function AgendamentoCard({ agendamento, onEdit }: AgendamentoCardProps) {
  const [modalAberto, setModalAberto] = useState(false);
  const [agendamentoSelecionado, setAgendamentoSelecionado] =useState<Agendamento | null>(null);

  const tipoAgendamento = TIPOS.find(tipo => tipo.id === agendamento.tipo);

  const abrirModal = (agendamento: any) => {
    setAgendamentoSelecionado(agendamento);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setAgendamentoSelecionado(null);
    setModalAberto(false);
  };

  return (
    <div className="group relative cursor-pointer" onClick={() => abrirModal(agendamento)}>
      <div className="w-full text-left text-xs p-2 rounded bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors">
        <div className="font-medium truncate">
          {agendamento.hora} - {agendamento.cliente.nome}
        </div>
        <div className="text-xs truncate">
          {tipoAgendamento ? tipoAgendamento.label : 'Tipo não encontrado'}
        </div>
  
        <button
          onClick={(e) => {
            e.stopPropagation(); // Previne que o clique no botão dispare a função na div pai
            onEdit();
          }}
          className="absolute top-1 right-1 hidden group-hover:block p-1 rounded-full bg-white text-blue-600 hover:bg-blue-50"
          title="Editar agendamento"
        >
          <Edit2 className="h-3 w-3" />
        </button>
      </div>
  
      {modalAberto && agendamentoSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()} // Impede que o clique no modal feche ou abra algo
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-semibold text-gray-900">{agendamentoSelecionado.cliente.nome}</h2>
              <button onClick={fecharModal} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600">Data</p>
                      <p className="text-lg font-semibold">
                        {formatarDataBR(agendamentoSelecionado.data)}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-500" />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600">Hora</p>
                      <p className="text-lg font-semibold">
                        {agendamentoSelecionado.hora}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-500" />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600">Local</p>
                      <p className="text-lg font-semibold">
                        {agendamentoSelecionado.local}
                      </p>
                    </div>
                    <MapPin className="h-8 w-8 text-blue-500" />
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600">Tipo</p>
                      <p className="text-lg font-semibold">
                        {
                          TIPOS.find((tipo) => tipo.id === agendamentoSelecionado.tipo)?.label ||
                          "Tipo não encontrado"
                        }
                      </p>
                    </div>
                    <List className="h-8 w-8 text-purple-500" />
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600">Valor</p>
                      <p className="text-lg font-semibold">
                        {formatarMoeda(Number(agendamentoSelecionado.valor || 0))}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-500" />
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-600">Observações</p>
                      <p className="text-sm font-semibold">
                        {agendamentoSelecionado.observacoes}
                      </p>
                    </div>
                    <MessageCircle className="h-8 w-8 text-yellow-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}