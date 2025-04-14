import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle, Calendar } from 'lucide-react';
import { ResumoFinanceiro } from '../../types/financeiro';
import { formatarMoeda } from '../../utils/formatters';

interface ResumoTransacoesProps {
  resumo: ResumoFinanceiro;
  faturamentoAnual: number;
}

export default function ResumoTransacoes({ resumo, faturamentoAnual }: ResumoTransacoesProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Receitas */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Receitas do Mês</p>
            <p className="text-2xl font-bold text-green-600">
              {formatarMoeda(resumo.receitaTotal)}
            </p>
            {resumo.receitasPendentes > 0 && (
              <p className="text-sm text-orange-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-4 w-4" />
                {formatarMoeda(resumo.receitasPendentes)} pendente
              </p>
            )}
          </div>
          <TrendingUp className="h-8 w-8 text-green-500" />
        </div>
      </div>

      {/* Despesas */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Despesas do Mês</p>
            <p className="text-2xl font-bold text-red-600">
              {formatarMoeda(resumo.despesaTotal)}
            </p>
            {resumo.despesasPendentes > 0 && (
              <p className="text-sm text-orange-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-4 w-4" />
                {formatarMoeda(resumo.despesasPendentes)} pendente
              </p>
            )}
          </div>
          <TrendingDown className="h-8 w-8 text-red-500" />
        </div>
      </div>

      {/* Saldo */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Saldo Líquido</p>
            <p className={`text-2xl font-bold ${
              resumo.saldoLiquido >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatarMoeda(resumo.saldoLiquido)}
            </p>
          </div>
          <DollarSign className={`h-8 w-8 ${
            resumo.saldoLiquido >= 0 ? 'text-green-500' : 'text-red-500'
          }`} />
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
          <Calendar className="h-8 w-8 text-purple-500" />
        </div>
      </div>
    </div>
  );
}