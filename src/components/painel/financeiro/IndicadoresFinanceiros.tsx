import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { ResumoFinanceiro } from '../../../types/financeiro';

interface IndicadoresFinanceirosProps {
  resumo: ResumoFinanceiro;
}

export default function IndicadoresFinanceiros({ resumo }: IndicadoresFinanceirosProps) {
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const calcularPorcentagemDespesas = () => {
    if (resumo.receitaTotal === 0) return 0;
    return (resumo.despesaTotal / resumo.receitaTotal) * 100;
  };

  return (
    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
      <div>
        <p className="text-sm text-gray-600">Saldo Líquido</p>
        <p className={`text-lg font-bold ${
          resumo.saldoLiquido >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {formatarMoeda(resumo.saldoLiquido)}
        </p>
      </div>

      <div>
        <p className="text-sm text-gray-600">% Despesas/Receitas</p>
        <div className="flex items-center gap-2">
          <p className="text-lg font-bold text-gray-700">
            {calcularPorcentagemDespesas().toFixed(1)}%
          </p>
          {calcularPorcentagemDespesas() > 70 ? (
            <ArrowUp className="h-4 w-4 text-red-500" />
          ) : (
            <ArrowDown className="h-4 w-4 text-green-500" />
          )}
        </div>
      </div>
    </div>
  );
}