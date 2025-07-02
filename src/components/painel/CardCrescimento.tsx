import React from 'react';
import { TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import { CrescimentoMetricas } from '../../utils/crescimentoUtils';

interface CardCrescimentoProps {
  crescimento: CrescimentoMetricas;
}

export default function CardCrescimento({ crescimento }: CardCrescimentoProps) {
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarPercentual = (valor: number) => {
    return `${valor.toFixed(1)}%`;
  };

  const getCorIndicador = (valor: number) => {
    return valor >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const Indicador = ({ valor }: { valor: number }) => (
    valor >= 0 ? 
      <ArrowUp className="h-4 w-4 text-green-500" /> : 
      <ArrowDown className="h-4 w-4 text-red-500" />
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-600">Crescimento</p>
          <div className="flex items-center gap-2">
            <p className={`text-2xl font-bold ${getCorIndicador(crescimento.mensal.percentual)}`}>
              {formatarPercentual(crescimento.mensal.percentual)}
            </p>
            <Indicador valor={crescimento.mensal.percentual} />
          </div>
        </div>
        <TrendingUp className={`h-8 w-8 ${getCorIndicador(crescimento.mensal.percentual)}`} />
      </div>

      <div className="space-y-2 pt-2 border-t">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">vs. Mês Anterior</p>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${getCorIndicador(crescimento.mensal.valor)}`}>
              {formatarMoeda(crescimento.mensal.valor)}
            </span>
            <Indicador valor={crescimento.mensal.valor} />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">vs. Ano Anterior</p>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${getCorIndicador(crescimento.anual.valor)}`}>
              {formatarMoeda(crescimento.anual.valor)}
            </span>
            <Indicador valor={crescimento.anual.valor} />
          </div>
        </div>
      </div>
    </div>
  );
}