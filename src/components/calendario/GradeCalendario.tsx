import React from 'react';
import { Edit2, Plus } from 'lucide-react';
import { getDiasDoMes, getDiasDaSemana } from '../../utils/dataUtils';
import { Agendamento } from '../../types';
import AgendamentoCard from './AgendamentoCard';

interface GradeCalendarioProps {
  dataAtual: Date;
  visualizacao?: 'mes' | 'semana';
  agendamentos?: Agendamento[];
  onDiaClick?: (data: Date) => void;
  onEdit?: (agendamento: Agendamento) => void;
  onEditAgendamento: (agendamento: Agendamento) => void;
}

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function GradeCalendario({ 
  dataAtual,
  visualizacao = 'mes',
  agendamentos = [],
  onDiaClick,
  onEditAgendamento,
  onEdit
}: GradeCalendarioProps) {
  const dias = visualizacao === 'mes' 
    ? getDiasDoMes(dataAtual) 
    : getDiasDaSemana(dataAtual);

  const getAgendamentosDoDia = (data: Date) => {
    return agendamentos.filter(agendamento => {
      const dataAgendamento = new Date(`${agendamento.data}T00:00:00`);
      return (
        dataAgendamento.getDate() === data.getDate() &&
        dataAgendamento.getMonth() === data.getMonth() &&
        dataAgendamento.getFullYear() === data.getFullYear()
      );
    });
  };

  return (
    <div className="grid grid-cols-7 gap-px bg-gray-200">
      {DIAS_SEMANA.map((dia) => (
        <div key={dia} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-500">
          {dia}
        </div>
      ))}
      
      {dias.map((data, index) => {
        const agendamentosDoDia = getAgendamentosDoDia(data);
        const isHoje = new Date().toDateString() === data.toDateString();
        const isMesAtual = data.getMonth() === dataAtual.getMonth();

        return (
          <div
            key={index}
            className={`bg-white p-2 min-h-32 hover:bg-gray-50 relative ${
              !isMesAtual ? 'text-gray-400' : ''
            } ${isHoje ? 'ring-2 ring-blue-500' : ''}`}
          >
            <div className="flex justify-between items-start">
              <span className="font-medium">{data.getDate()}</span>
              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDiaClick?.(new Date(data));
                  }}
                  className="p-1 text-gray-400 hover:text-green-600 rounded-full"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="space-y-1 mt-1">
              {agendamentosDoDia.map((agendamento, idx) => (
                <AgendamentoCard
                  key={idx}
                  agendamento={agendamento}
                  onEdit={() => onEditAgendamento(agendamento)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}