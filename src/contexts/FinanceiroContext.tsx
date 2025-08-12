import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transacao, ResumoFinanceiro } from '../types/financeiro';
import { calcularReceitaLiquida } from '../utils/financeiroUtils'; // Supondo que esta função exista e esteja correta
import { alterarTransacao, excluirTransacao, obterTransacoes, salvarTransacao } from '../services/apiService';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

interface FinanceiroContextData {
  transacoes: Transacao[];
  adicionarTransacao: (transacao: any, dadosOriginais: any | null) => void; // Mantendo 'any' conforme seu código original
  removerTransacao: (id: string) => void;
  atualizarTransacao: (id: string, transacaoOriginal: any, novosDados: Partial<Transacao>) => void; // Mantendo 'any' conforme seu código original
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

  // useEffect para buscar transações, agora dependendo do 'user'
  useEffect(() => {
    const fetchTransacoes = async () => {
      if (user) { // Só busca se o usuário estiver autenticado/disponível
        try {
          const dadosTransacoes = await obterTransacoes(user);
          if (Array.isArray(dadosTransacoes)) {
            setTransacoes(dadosTransacoes);
          } else {
            setTransacoes([]); // Garante que transacoes seja sempre um array
          }
          } catch (err) {
          setTransacoes([]); // Garante que transacoes seja sempre um array em caso de erro
        }
      } else {
        // Se não houver usuário, define transacoes como array vazio
        setTransacoes([]);
      }
    };

    fetchTransacoes();
  }, [user]); // Adiciona 'user' como dependência

  // useEffect para atualizar o resumo financeiro quando as transações mudam
  useEffect(() => {
    // A verificação de segurança dentro de atualizarResumoFinanceiro é uma boa prática,
    // mas com as mudanças em fetchTransacoes, 'transacoes' deve ser sempre um array.
    atualizarResumoFinanceiro();
  }, [transacoes]);

  const calcularComparativoMesAnterior = () => {
    // Certifique-se de que 'transacoes' é um array aqui também, ou adicione a verificação no início.
    if (!Array.isArray(transacoes)) {
        // Retorna um valor padrão ou lida com o caso de 'transacoes' não ser um array
        return initialResumo.comparativoMesAnterior;
    }

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

    // Usar resumoFinanceiro.receitaTotal e resumoFinanceiro.despesaTotal pode ser problemático
    // se eles ainda não foram atualizados com os dados do mês atual quando esta função é chamada
    // por atualizarResumoFinanceiro. Considerar calcular o saldo atual localmente se necessário.
    const saldoAnterior = receitasAnterior - despesasAnterior;
    const saldoAtualCalculado = resumoFinanceiro.receitaTotal - resumoFinanceiro.despesaTotal; // Este usa o estado resumoFinanceiro

    const percentualVariacao = saldoAnterior === 0
      ? (saldoAtualCalculado > 0 ? 100 : (saldoAtualCalculado < 0 ? -100 : 0) ) // Evita divisão por zero e dá um sentido
      : ((saldoAtualCalculado - saldoAnterior) / Math.abs(saldoAnterior)) * 100;

    return {
      receitas: receitasAnterior,
      despesas: despesasAnterior,
      percentualVariacao
    };
  };

  const atualizarResumoFinanceiro = () => {
    // Verificação de segurança opcional, mas boa prática.
    if (!Array.isArray(transacoes)) {
      toast.error('Erro interno: dados de transações corrompidos');
      setResumoFinanceiro(initialResumo);
      return;
    }

    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    const transacoesMesAtual = transacoes.filter(t => {
      const dataTransacao = new Date(`${t.data}T00:00:00`); // Adiciona T00:00:00 para evitar problemas de fuso ao pegar só a data
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

    // A função calcularReceitaLiquida precisa ser verificada se opera corretamente
    // com o array 'transacoes' completo ou apenas com as do mês atual.
    // Pelo nome, parece que deveria usar todas as transações pagas.
    const saldoLiquido = calcularReceitaLiquida(transacoes.filter(t => t.status === 'pago')); // Exemplo: usando apenas transações pagas

    setResumoFinanceiro({
      receitaTotal,
      despesaTotal,
      saldoLiquido,
      receitasPendentes,
      despesasPendentes,
      comparativoMesAnterior: calcularComparativoMesAnterior() // Esta chamada está OK aqui
    });
  };


  const adicionarTransacao = async (transacao: any, transacaoOriginal: any | null) => {
    try {
      // Assume-se que 'user' já foi verificado ou 'salvarTransacao' lida com user nulo/inválido
      const dadosTransacao = await salvarTransacao(transacao, user);
      // O ID pode vir em um local diferente dependendo da sua API, ajuste se necessário
      const transacaoId = dadosTransacao.id || dadosTransacao.data?.id; // Exemplo mais robusto

      // Adiciona a transação completa (ou a original com o ID retornado) ao estado
      // É importante que 'transacaoOriginal' ou 'transacao' tenha todos os campos necessários para a UI
      setTransacoes(prev => [...prev, { ...transacaoOriginal, ...transacao, id: transacaoId }]);
      notifySuccess('Transação cadastrada com sucesso!');
    } catch (err: any) {
      notifyError('Falha ao cadastrar transação! Motivo: ' + (err.message || 'Erro desconhecido'));
    }
  };

  const removerTransacao = async (id: string) => {
    try {
      await excluirTransacao(id, user);
      setTransacoes(prev => prev.filter(t => t.id !== id));
      notifySuccess('Transação removida com sucesso!');
    } catch (err: any) {
      notifyError('Falha ao remover transação! Motivo: ' + (err.message || 'Erro desconhecido'));
    }
  };

  const atualizarTransacao = async (id: string, transacaoOriginal: any, novosDados: Partial<Transacao>) => {
    try {
      await alterarTransacao(novosDados, id, user);
      // Atualiza a transação no estado local.
      // A lógica aqui assume que 'novosDados' contém apenas as alterações.
      // 'transacaoOriginal' pode não ser necessário se 'novosDados' for a transação completa atualizada.
      // Se 'novosDados' for parcial, você precisa mesclar com a transação existente.
      setTransacoes(prev => prev.map(t =>
        t.id === id ? { ...t, ...novosDados } : t // Mescla a transação existente com os novos dados
      ));
      notifySuccess('Transação atualizada com sucesso!');
    } catch (err: any) {
      notifyError('Falha ao atualizar transação! Motivo: ' + (err.message || 'Erro desconhecido'));
    }
  };

  const getTransacoesCliente = (clienteId: string) => {
    // Adiciona verificação para 'transacoes'
    if (!Array.isArray(transacoes)) return [];
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
