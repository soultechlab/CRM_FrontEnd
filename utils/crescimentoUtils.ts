import { Transacao } from '../types/financeiro';

export interface CrescimentoMetricas {
  mensal: {
    valor: number;
    percentual: number;
  };
  anual: {
    valor: number;
    percentual: number;
  };
}

export const calcularCrescimento = (transacoes: Transacao[]): CrescimentoMetricas => {
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  // Filtrar transações por período
  const getTransacoesPeriodo = (mes: number, ano: number) => {
    return transacoes.filter(t => {
      const data = new Date(`${t.data}T00:00:00`);
      return data.getMonth() === mes && 
             data.getFullYear() === ano &&
             t.status === 'pago';
    });
  };

  // Calcular receita líquida (receitas - despesas)
  const calcularReceitaLiquida = (transacoes: Transacao[]) => {
    const receitas = transacoes
      .filter(t => t.tipo === 'receita')
      .reduce((acc, t) => acc + Number(t.valor), 0);
    
    const despesas = transacoes
      .filter(t => t.tipo === 'despesa')
      .reduce((acc, t) => acc + Number(t.valor), 0);

    return receitas - despesas;
  };

  // Dados do mês atual
  const transacoesMesAtual = getTransacoesPeriodo(mesAtual, anoAtual);
  const receitaMesAtual = calcularReceitaLiquida(transacoesMesAtual);

  // Dados do mês anterior
  const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1;
  const anoMesAnterior = mesAtual === 0 ? anoAtual - 1 : anoAtual;
  const transacoesMesAnterior = getTransacoesPeriodo(mesAnterior, anoMesAnterior);
  const receitaMesAnterior = calcularReceitaLiquida(transacoesMesAnterior);

  // Dados do ano anterior (mesmo mês)
  const transacoesAnoAnterior = getTransacoesPeriodo(mesAtual, anoAtual - 1);
  const receitaAnoAnterior = calcularReceitaLiquida(transacoesAnoAnterior);

  // Calcular crescimento mensal
  const crescimentoMensalValor = Number(receitaMesAtual) - receitaMesAnterior;
  const crescimentoMensalPercentual = receitaMesAnterior === 0 ? 100 :
    ((receitaMesAtual - receitaMesAnterior) / Math.abs(receitaMesAnterior)) * 100;

  // Calcular crescimento anual
  const crescimentoAnualValor = receitaMesAtual - receitaAnoAnterior;
  const crescimentoAnualPercentual = receitaAnoAnterior === 0 ? 100 :
    ((receitaMesAtual - receitaAnoAnterior) / Math.abs(receitaAnoAnterior)) * 100;

  return {
    mensal: {
      valor: crescimentoMensalValor,
      percentual: crescimentoMensalPercentual
    },
    anual: {
      valor: crescimentoAnualValor,
      percentual: crescimentoAnualPercentual
    }
  };
};