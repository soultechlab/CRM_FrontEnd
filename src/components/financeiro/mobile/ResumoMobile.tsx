import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle, Calendar } from 'lucide-react';
import { ResumoFinanceiro } from '../../../types/financeiro';
import { formatarMoeda } from '../../../utils/formatters';

interface ResumoMobileProps {
  resumo: ResumoFinanceiro;
  faturamentoAnual: number;
}

export default function ResumoMobile({ resumo, faturamentoAnual }: ResumoMobileProps) {
  return (
    <div className="space-y-4">
      {/* Receitas */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Receitas do Mês</p>
            <p className="text-xl font-bold text-green-600">
              {formatarMoeda(resumo.receitaTotal)}
            </p>
            {resumo.receitasPendentes > 0 && (
              <p className="text-xs text-orange-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {formatarMoeda(resumo.receitasPendentes)} pendente
              </p>
            )}
          </div>
          <TrendingUp className="h-6 w-6 text-green-500" />
        </div>
      </div>

      {/* Despesas */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Despesas do Mês</p>
            <p className="text-xl font-bold text-red-600">
              {formatarMoeda(resumo.despesaTotal)}
            </p>
            {resumo.despesasPendentes > 0 && (
              <p className="text-xs text-orange-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {formatarMoeda(resumo.despesasPendentes)} pendente
              </p>
            )}
          </div>
          <TrendingDown className="h-6 w-6 text-red-500" />
        </div>
      </div>

      {/* Saldo */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Saldo Líquido</p>
            <p className={`text-xl font-bold ${
              resumo.saldoLiquido >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatarMoeda(resumo.saldoLiquido)}
            </p>
          </div>
          {resumo.saldoLiquido >= 0 ? (
            <TrendingUp className="h-6 w-6 text-green-500" />
          ) : (
            <TrendingDown className="h-6 w-6 text-red-500" />
          )}
        </div>
      </div>

      {/* Faturamento Anual */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Faturamento Anual</p>
            <p className="text-xl font-bold text-purple-600">
              {formatarMoeda(faturamentoAnual)}
            </p>
          </div>
          <Calendar className="h-6 w-6 text-purple-500" />
        </div>
      </div>
    </div>
  );
}