import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AnaliseFinanceiraProps {
  ltv: number;
  mediaGastoPorSessao: number;
  frequenciaMedia: number;
  totalSessoes: number;
}

export default function AnaliseFinanceira({ 
  ltv, 
  mediaGastoPorSessao, 
  frequenciaMedia,
  totalSessoes 
}: AnaliseFinanceiraProps) {
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const dados = [
    {
      nome: 'Média por Sessão',
      valor: mediaGastoPorSessao
    },
    {
      nome: 'LTV Mensal',
      valor: mediaGastoPorSessao * frequenciaMedia
    },
    {
      nome: 'LTV Total',
      valor: ltv
    }
  ];

  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="text-lg font-semibold mb-4">Análise Financeira</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Média por Sessão</p>
            <p className="text-lg font-semibold">{formatarMoeda(mediaGastoPorSessao)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Frequência Média</p>
            <p className="text-lg font-semibold">
              {frequenciaMedia.toFixed(1)} sessões/mês
            </p>
          </div>
        </div>

        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dados}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome" />
              <YAxis />
              <Tooltip formatter={(value) => formatarMoeda(Number(value))} />
              <Bar dataKey="valor" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}