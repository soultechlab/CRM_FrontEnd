import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CardResumoProps {
  titulo: string;
  valor: number;
  icone: LucideIcon;
  corIcone?: string;
  subtitulo?: string;
  formatoValor?: 'moeda' | 'numero' | 'porcentagem';
  corCondicional?: boolean;
}

export default function CardResumo({
  titulo,
  valor,
  icone: Icone,
  corIcone,
  subtitulo,
  formatoValor = 'moeda',
  corCondicional = false
}: CardResumoProps) {
  const formatarValor = (valor: number) => {
    switch (formatoValor) {
      case 'moeda':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(valor);
      case 'porcentagem':
        return `${valor.toFixed(1)}%`;
      default:
        return valor.toLocaleString('pt-BR');
    }
  };

  const getCorValor = () => {
    if (!corCondicional) return 'text-gray-900';
    return valor >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getCorIcone = () => {
    if (!corCondicional) return corIcone;
    return valor >= 0 ? 'text-green-500' : 'text-red-500';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{titulo}</p>
          <p className={`text-2xl font-bold ${getCorValor()}`}>
            {formatarValor(valor)}
          </p>
          {subtitulo && (
            <p className="text-sm text-orange-500 mt-1">{subtitulo}</p>
          )}
        </div>
        <Icone className={`h-8 w-8 ${getCorIcone()}`} />
      </div>
    </div>
  );
}