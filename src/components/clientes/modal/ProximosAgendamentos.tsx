import React from 'react';
import { Calendar } from 'lucide-react';
import { Agendamento } from '../../../types';
import { TIPOS } from '../../../constants/tipos';

interface ProximosAgendamentosProps {
  agendamentos: Agendamento[];
}

export default function ProximosAgendamentos({ agendamentos }: ProximosAgendamentosProps) {
  
  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="text-lg font-semibold mb-4">Próximos Agendamentos</h3>
      
      <div className="space-y-4">
        {agendamentos.length > 0 ? (
          agendamentos.map((agendamento) => (
            <div 
              key={agendamento.id}
              className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg"
            >
              <Calendar className="h-5 w-5 text-gray-400 mt-1" />
              <div>
                <p className="font-medium">
                  {
                    TIPOS.find((tipo) => tipo.id === agendamento.tipo)?.label ||
                    "Tipo não encontrado"
                  }
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(`${agendamento.data}T00:00:00`).toLocaleDateString()} às {agendamento.hora}
                </p>
                <p className="text-sm text-gray-500">{agendamento.local}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">
            Nenhum agendamento futuro
          </p>
        )}
      </div>
    </div>
  );
}