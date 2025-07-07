import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext'; // Importação do AppContext

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const currentDate = new Date();

export default function Calendar() {
  const { agenda } = useAppContext(); // Dados da Agenda do contexto

  // Exibir eventos baseados na agenda
  const eventosPorDia = agenda.reduce((acc, evento) => {
    const date = new Date(evento.data).getDate();
    acc[date] = acc[date] ? [...acc[date], evento] : [evento];
    return acc;
  }, {} as Record<number, any[]>);

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow">
        {/* Header com mês e ano */}
        <div className="flex items-center justify-between p-4 border-b">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Grid com dias da semana */}
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {days.map((day) => (
            <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}

          {/* Dias do calendário com eventos */}
          {Array.from({ length: 35 }).map((_, i) => {
            const day = i + 1; // Dia atual no loop
            const eventos = eventosPorDia[day] || []; // Eventos para o dia

            return (
              <div
                key={i}
                className="bg-white p-2 h-32 border-t border-l hover:bg-gray-50 cursor-pointer relative"
              >
                <span className="text-sm">{day}</span>
                {eventos.map((evento, index) => (
                  <div
                    key={index}
                    className="text-xs bg-blue-100 text-blue-800 rounded px-1 py-0.5 mt-1"
                  >
                    {evento.descricao}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
