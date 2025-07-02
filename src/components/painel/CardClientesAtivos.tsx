import React from 'react';
import { Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import CardResumo from './CardResumo';

interface CardClientesAtivosProps {
  quantidade: number;
}

export default function CardClientesAtivos({ quantidade }: CardClientesAtivosProps) {
  return (
    <Link to="/clientes" className="block">
      <CardResumo
        titulo="Clientes Recorrentes"
        valor={quantidade}
        icone={Users}
        corIcone="text-purple-500"
        formatoValor="numero"
      />
    </Link>
  );
}