import React from 'react';
import { Calendar, Users } from 'lucide-react';
import CardResumo from '../CardResumo';

export default function SecaoIndicadores() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <CardResumo
        titulo="Agendamentos"
        valor={24}
        icone={Calendar}
        corIcone="text-blue-500"
        formatoValor="numero"
      />
      
      <CardResumo
        titulo="Clientes Ativos"
        valor={156}
        icone={Users}
        corIcone="text-purple-500"
        formatoValor="numero"
      />
    </div>
  );
}