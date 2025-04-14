import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transacao, ResumoFinanceiro } from '../types/financeiro';
import { calcularReceitaLiquida } from '../utils/financeiroUtils';
import { alterarTransacao, excluirTransacao, obterTransacoes, salvarTransacao } from '../services/apiService';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

interface FinanceiroContextData {
  transacoes: Transacao[];
  adicionarTransacao: (transacao: Transacao, dadosOriginais: Transacao) => void;
  removerTransacao: (id: string) => void;
  atualizarTransacao: (id: string, transacao: Partial<Transacao>) => void;
  resumoFinanceiro: ResumoFinanceiro;
  getTransacoesCliente: (clienteId: string) => Transacao[];
}

const initialResumo: ResumoFinanceiro = {
  receitaTotal: 0,
  despesaTotal: 0,
  saldoLiquido: 0,
  receitasPendentes: 0,
  despesasPendentes: 0,
  comparativoMesAnterior: {
    receitas: 0,
    despesas: 0,
    percentualVariacao: 0
  }
};

const FinanceiroContext = createContext<FinanceiroContextData>({} as FinanceiroContextData);

export function FinanceiroProvider({ children }: { children: React.ReactNode }) {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [resumoFinanceiro, setResumoFinanceiro] = useState<ResumoFinanceiro>(initialResumo);
  const { user } = useAuth();
  const notifySuccess = (message: string) => toast.success(message);
  const notifyError = (message: string) => toast.error(message);

  useEffect(() => {
    atualizarResumoFinanceiro();
  }, [transacoes]);

  useEffect(() => {
    const fetchTransacoes = async () => {
      try {
        const dadosTransacoes = await obterTransacoes(user);
        setTransacoes(dadosTransacoes);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTransacoes();
  }, []); 

  const atualizarResumoFinanceiro = () => {
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    const transacoesMesAtual = transacoes.filter(t => {
      const dataTransacao = new Date(`${t.data}T00:00:00`);
      return dataTransacao.getMonth() === mesAtual && 
             dataTransacao.getFullYear() === anoAtual;
    });

    const receitaTotal = transacoesMesAtual
      .filter(t => t.tipo === 'receita' && t.status === 'pago')
      .reduce((acc, t) => acc + Number(t.valor), 0);

    const despesaTotal = transacoesMesAtual
      .filter(t => t.tipo === 'despesa' && t.status === 'pago')
      .reduce((acc, t) => acc + Number(t.valor), 0);

    const receitasPendentes = transacoesMesAtual
      .filter(t => t.tipo === 'receita' && t.status === 'pendente')
      .reduce((acc, t) => acc + Number(t.valor), 0);

    const despesasPendentes = transacoesMesAtual
      .filter(t => t.tipo === 'despesa' && t.status === 'pendente')
      .reduce((acc, t) => acc + Number(t.valor), 0);

    const saldoLiquido = calcularReceitaLiquida(transacoes);

    setResumoFinanceiro({
      receitaTotal,
      despesaTotal,
      saldoLiquido,
      receitasPendentes,
      despesasPendentes,
      comparativoMesAnterior: calcularComparativoMesAnterior()
    });
  };

  const calcularComparativoMesAnterior = () => {
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1;
    const anoAnterior = mesAtual === 0 ? anoAtual - 1 : anoAtual;

    const transacoesMesAnterior = transacoes.filter(t => {
      const dataTransacao = new Date(`${t.data}T00:00:00`);
      return dataTransacao.getMonth() === mesAnterior && 
             dataTransacao.getFullYear() === anoAnterior;
    });

    const receitasAnterior = transacoesMesAnterior
      .filter(t => t.tipo === 'receita' && t.status === 'pago')
      .reduce((acc, t) => acc + Number(t.valor), 0);

    const despesasAnterior = transacoesMesAnterior
      .filter(t => t.tipo === 'despesa' && t.status === 'pago')
      .reduce((acc, t) => acc + Number(t.valor), 0);

    const saldoAnterior = receitasAnterior - despesasAnterior;
    const saldoAtual = resumoFinanceiro.receitaTotal - resumoFinanceiro.despesaTotal;
    
    const percentualVariacao = saldoAnterior === 0 ? 100 :
      ((saldoAtual - saldoAnterior) / Math.abs(saldoAnterior)) * 100;

    return {
      receitas: receitasAnterior,
      despesas: despesasAnterior,
      percentualVariacao
    };
  };

  const adicionarTransacao = async (transacao: any, transacaoOriginal: any | null) => {
    try {
      const dadosTransacao = await salvarTransacao(transacao, user);
      const transacaoId = dadosTransacao.data.id;

      setTransacoes(prev => [...prev, {...transacaoOriginal, id: transacaoId}]);
      notifySuccess('Transação cadastrada com sucesso!');
    } catch (err) {
      notifyError('Falha ao cadastrar transação! Motivo: ' + err.message);
    }
  };

  const removerTransacao = (id: string) => {
    excluirTransacao(id, user);
    setTransacoes(prev => prev.filter(t => t.id !== id));
  };

  const atualizarTransacao = (id: string, transacaoOriginal: any,novosDados: Partial<Transacao>) => {
    try {
      alterarTransacao(novosDados, id, user);
      setTransacoes(prev => prev.map(t => 
        t.id === id ? { ...t, ...transacaoOriginal } : t
      ));
      notifySuccess('Transação atualizada com sucesso!');
    } catch (err) {
      notifyError('Falha ao atualizar transação! Motivo: ' + err.message);
    }
  };

  const getTransacoesCliente = (clienteId: string) => {
    return transacoes.filter(t => t.cliente?.id === clienteId);
  };

  return (
    <FinanceiroContext.Provider value={{
      transacoes,
      adicionarTransacao,
      removerTransacao,
      atualizarTransacao,
      resumoFinanceiro,
      getTransacoesCliente
    }}>
      {children}
    </FinanceiroContext.Provider>
  );
}

export function useFinanceiro() {
  const context = useContext(FinanceiroContext);
  if (!context) {
    throw new Error('useFinanceiro must be used within a FinanceiroProvider');
  }
  return context;
}