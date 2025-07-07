import React from 'react';
import { useFinanceiro } from '../../contexts/FinanceiroContext';
import GraficoComparativo from './financeiro/GraficoComparativo';
import ResumoMensal from './financeiro/ResumoMensal';
import IndicadoresFinanceiros from './financeiro/IndicadoresFinanceiros';

export default function VisaoGeralFinanceira() {
  const { resumoFinanceiro } = useFinanceiro();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Visão Geral Financeira</h2>
          <p className="text-sm text-gray-500">
            Comparativo mensal de receitas e despesas
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <ResumoMensal resumo={resumoFinanceiro} />
        <GraficoComparativo resumo={resumoFinanceiro} />
        <IndicadoresFinanceiros resumo={resumoFinanceiro} />
      </div>
    </div>
  );
}