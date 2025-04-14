import React from 'react';
import { Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import CardResumo from './CardResumo';

interface CardAgendamentosProps {
  quantidade: number;
  icone?: any;
  corIcone?: string;
}

export default function CardAgendamentos({ quantidade, icone = Calendar, corIcone = "text-blue-500" }: CardAgendamentosProps) {
  return (
    <Link to="/calendario" className="block">
      <CardResumo
        titulo="Agendamentos do Mês"
        valor={quantidade}
        icone={icone}
        corIcone={corIcone}
        formatoValor="numero"
      />
    </Link>
  );
}