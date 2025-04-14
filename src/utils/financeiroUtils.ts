import { Transacao } from '../types/financeiro';
import { Agendamento } from '../types';

export const calcularReceitaLiquida = (transacoes: Transacao[]) => {
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  const transacoesMesAtual = transacoes.filter(t => {
    const dataTransacao = new Date(`${t.data}T00:00:00`);
    return dataTransacao.getMonth() === mesAtual && 
           dataTransacao.getFullYear() === anoAtual &&
           t.status === 'pago';
  });


  const receitas = transacoesMesAtual
    .filter(t => t.tipo === 'receita')
    .reduce((acc, t) => acc + Number(t.valor), 0);

  const despesas = transacoesMesAtual
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => acc + Number(t.valor), 0);

  return receitas - despesas;
};

export const calcularReceitaMensal = (transacoes: Transacao[], agendamentos: Agendamento[]) => {
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  // Receitas do financeiro
  const receitasFinanceiro = transacoes.filter(t => {
    const dataTransacao = new Date(`${t.data}T00:00:00`);
    return t.tipo === 'receita' &&
           t.status === 'pago' &&
           dataTransacao.getMonth() === mesAtual &&
           dataTransacao.getFullYear() === anoAtual;
  }).reduce((acc, t) => acc + Number(t.valor), 0);

  // Receitas dos agendamentos
  const receitasAgendamentos = agendamentos.filter(a => {
    const dataAgendamento = new Date(`${a.data}T00:00:00`);
    return dataAgendamento.getMonth() === mesAtual &&
           dataAgendamento.getFullYear() === anoAtual;
  }).reduce((acc, a) => acc + (Number(a.valor) || 0), 0);

  return receitasFinanceiro + receitasAgendamentos;
};

export const calcularComparativoMensal = (
  transacoes: Transacao[], 
  agendamentos: Agendamento[]
) => {
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();
  const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1;
  const anoAnterior = mesAtual === 0 ? anoAtual - 1 : anoAtual;

  const receitaMesAtual = calcularReceitaMensal(transacoes, agendamentos);

  // Cálculo do mês anterior
  const receitaMesAnterior = [
    ...transacoes.filter(t => {
      const dataTransacao = new Date(`${t.data}T00:00:00`);
      return t.tipo === 'receita' &&
             t.status === 'pago' &&
             dataTransacao.getMonth() === mesAnterior &&
             dataTransacao.getFullYear() === anoAnterior;
    }),
    ...agendamentos.filter(a => {
      const dataAgendamento = new Date(`${a.data}T00:00:00`);
      return dataAgendamento.getMonth() === mesAnterior &&
             dataAgendamento.getFullYear() === anoAnterior;
    })
  ].reduce((acc, item) => acc + ('valor' in item ? Number(item.valor) : 0), 0);

  const variacao = receitaMesAnterior === 0 ? 100 :
    ((receitaMesAtual - receitaMesAnterior) / receitaMesAnterior) * 100;

  return {
    atual: receitaMesAtual,
    anterior: receitaMesAnterior,
    variacao
  };
};

export const calcularFaturamentoAnual = (
  transacoes: Transacao[], 
  agendamentos: Agendamento[]
) => {
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();

  const meses = Array.from({ length: 12 }, (_, i) => i);
  
  return meses.map(mes => {
    const receitasFinanceiro = transacoes.filter(t => {
      const dataTransacao = new Date(`${t.data}T00:00:00`);
      return t.tipo === 'receita' &&
             t.status === 'pago' &&
             dataTransacao.getMonth() === mes &&
             dataTransacao.getFullYear() === anoAtual;
    }).reduce((acc, t) => acc + Number(t.valor), 0);

    return {
      mes: new Date(anoAtual, mes).toLocaleString('pt-BR', { month: 'short' }),
      valor: receitasFinanceiro
    };
  });
};