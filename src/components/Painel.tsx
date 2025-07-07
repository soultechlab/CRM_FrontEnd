import React from 'react';
import { DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { useFinanceiro } from '../contexts/FinanceiroContext';
import { useAgendamentos } from '../contexts/AgendamentoContext';
import { calcularCrescimento } from '../utils/crescimentoUtils';
import { contarAgendamentosMes } from '../utils/agendamentoUtils';
import CardResumo from './painel/CardResumo';
import CardCrescimento from './painel/CardCrescimento';
import CardAgendamentos from './painel/CardAgendamentos';
import VisaoGeralFinanceira from './painel/VisaoGeralFinanceira';
import ProximosAgendamentos from './painel/ProximosAgendamentos';
import GraficoReceitas from './painel/GraficoReceitas';
import EstatisticasClientes from './painel/EstatisticasClientes';

export default function Painel() {
  const { resumoFinanceiro, transacoes } = useFinanceiro();
  const { agendamentos } = useAgendamentos();
  const crescimento = calcularCrescimento(transacoes);
  const totalAgendamentosMes = contarAgendamentosMes(agendamentos);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Painel de Controle</h1>
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CardResumo
          titulo="Receita Líquida Mensal"
          valor={resumoFinanceiro.saldoLiquido}
          icone={DollarSign}
          corCondicional={true}
          subtitulo={
            resumoFinanceiro.receitasPendentes > 0
              ? `${new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(resumoFinanceiro.receitasPendentes)} pendente`
              : undefined
          }
        />
        
        <CardCrescimento crescimento={crescimento} />
        
        <CardAgendamentos 
          quantidade={totalAgendamentosMes} 
          icone={Calendar}
          corIcone="text-blue-500"
        />
      </div>

      {/* Gráficos e Relatórios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VisaoGeralFinanceira />
        <ProximosAgendamentos />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GraficoReceitas />
        <EstatisticasClientes />
      </div>
    </div>
  );
}