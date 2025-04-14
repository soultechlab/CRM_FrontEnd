import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react';
import { useFinanceiro } from '../../contexts/FinanceiroContext';
import { formatarMoeda } from '../../utils/formatters';

export default function ResumoFinanceiro() {
  const { resumoFinanceiro } = useFinanceiro();

  if (!resumoFinanceiro) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Receitas */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Receitas do Mês</p>
            <p className="text-2xl font-bold text-green-600">
              {formatarMoeda(resumoFinanceiro.receitaTotal)}
            </p>
            {resumoFinanceiro.receitasPendentes > 0 && (
              <p className="text-sm text-orange-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-4 w-4" />
                {formatarMoeda(resumoFinanceiro.receitasPendentes)} pendente
              </p>
            )}
          </div>
          <TrendingUp className="h-8 w-8 text-green-500" />
        </div>
      </div>

      {/* Despesas */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Despesas do Mês</p>
            <p className="text-2xl font-bold text-red-600">
              {formatarMoeda(resumoFinanceiro.despesaTotal)}
            </p>
            {resumoFinanceiro.despesasPendentes > 0 && (
              <p className="text-sm text-orange-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-4 w-4" />
                {formatarMoeda(resumoFinanceiro.despesasPendentes)} pendente
              </p>
            )}
          </div>
          <TrendingDown className="h-8 w-8 text-red-500" />
        </div>
      </div>

      {/* Saldo */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Saldo Líquido</p>
            <p className={`text-2xl font-bold ${
              resumoFinanceiro.saldoLiquido >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatarMoeda(resumoFinanceiro.saldoLiquido)}
            </p>
            {resumoFinanceiro.comparativoMesAnterior.percentualVariacao !== 0 && (
              <p className={`text-sm flex items-center gap-1 mt-1 ${
                resumoFinanceiro.comparativoMesAnterior.percentualVariacao >= 0 
                  ? 'text-green-500' 
                  : 'text-red-500'
              }`}>
                {resumoFinanceiro.comparativoMesAnterior.percentualVariacao >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {Math.abs(resumoFinanceiro.comparativoMesAnterior.percentualVariacao).toFixed(1)}% vs. mês anterior
              </p>
            )}
          </div>
          <DollarSign className="h-8 w-8 text-blue-500" />
        </div>
      </div>
    </div>
  );
}