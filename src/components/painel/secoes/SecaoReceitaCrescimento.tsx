import React from 'react';
import { DollarSign } from 'lucide-react';
import CardResumo from '../CardResumo';
import CardCrescimento from '../CardCrescimento';
import { ResumoFinanceiro } from '../../../types/financeiro';
import { CrescimentoMetricas } from '../../../utils/crescimentoUtils';

interface SecaoReceitaCrescimentoProps {
  resumoFinanceiro: ResumoFinanceiro;
  crescimento: CrescimentoMetricas;
}

export default function SecaoReceitaCrescimento({ 
  resumoFinanceiro, 
  crescimento 
}: SecaoReceitaCrescimentoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    </div>
  );
}