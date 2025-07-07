import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { ResumoFinanceiro } from '../../../types/financeiro';

interface ResumoMensalProps {
  resumo: ResumoFinanceiro;
}

export default function ResumoMensal({ resumo }: ResumoMensalProps) {
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="p-4 bg-green-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-green-600">Receitas</p>
            <p className="text-xl font-bold text-green-700">
              {formatarMoeda(resumo.receitaTotal)}
            </p>
            {resumo.receitasPendentes > 0 && (
              <p className="text-sm text-green-600">
                +{formatarMoeda(resumo.receitasPendentes)} pendente
              </p>
            )}
          </div>
          <TrendingUp className="h-8 w-8 text-green-500" />
        </div>
      </div>

      <div className="p-4 bg-red-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-red-600">Despesas</p>
            <p className="text-xl font-bold text-red-700">
              {formatarMoeda(resumo.despesaTotal)}
            </p>
            {resumo.despesasPendentes > 0 && (
              <p className="text-sm text-red-600">
                +{formatarMoeda(resumo.despesasPendentes)} pendente
              </p>
            )}
          </div>
          <TrendingDown className="h-8 w-8 text-red-500" />
        </div>
      </div>
    </div>
  );
}