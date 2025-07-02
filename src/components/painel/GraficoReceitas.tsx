import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useFinanceiro } from '../../contexts/FinanceiroContext';
import { useAgendamentos } from '../../contexts/AgendamentoContext';
import { calcularFaturamentoAnual } from '../../utils/financeiroUtils';

export default function GraficoReceitas() {
  const { transacoes } = useFinanceiro();
  const { agendamentos } = useAgendamentos();
  
  const dados = calcularFaturamentoAnual(transacoes, agendamentos);
  const totalAnual = dados.reduce((acc, item) => acc + item.valor, 0);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">Faturamento Anual</h2>
          <p className="text-sm text-gray-500">
            Total: {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(totalAnual)}
          </p>
        </div>
        <TrendingUp className="h-5 w-5 text-gray-500" />
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dados}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip 
              formatter={(value) => new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(Number(value))}
              labelStyle={{ color: '#374151' }}
            />
            <Line 
              type="monotone" 
              dataKey="valor" 
              stroke="#4F46E5" 
              strokeWidth={2}
              dot={{ fill: '#4F46E5' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}