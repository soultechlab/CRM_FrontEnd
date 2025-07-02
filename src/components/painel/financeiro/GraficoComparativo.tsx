import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ResumoFinanceiro } from '../../../types/financeiro';

interface GraficoComparativoProps {
  resumo: ResumoFinanceiro;
}

export default function GraficoComparativo({ resumo }: GraficoComparativoProps) {
  const dados = [
    {
      mes: 'Mês Anterior',
      receitas: Number(resumo.comparativoMesAnterior.receitas),
      despesas: Number(resumo.comparativoMesAnterior.despesas)
    },
    {
      mes: 'Mês Atual',
      receitas: Number(resumo.receitaTotal),
      despesas: Number(resumo.despesaTotal)
    }
  ];

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dados}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mes" />
          <YAxis />
          <Tooltip 
            formatter={(value) => formatarMoeda(Number(value))}
            labelStyle={{ color: '#374151' }}
          />
          <Bar dataKey="receitas" name="Receitas" fill="#4F46E5" />
          <Bar dataKey="despesas" name="Despesas" fill="#EF4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}