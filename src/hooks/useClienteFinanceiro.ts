import { useMemo } from 'react';
import { useFinanceiro } from '../contexts/FinanceiroContext';
import { useAgendamentos } from '../contexts/AgendamentoContext';
import { Cliente } from '../types';

export function useClienteFinanceiro(clienteId?: string) {
  const { transacoes, getTransacoesCliente } = useFinanceiro();
  const { getAgendamentosCliente } = useAgendamentos();

  const resumoCliente = useMemo(() => {
    if (!clienteId) return null;

    const transacoesCliente = getTransacoesCliente(clienteId);
    const agendamentosCliente = getAgendamentosCliente(clienteId);

    const totalGasto = transacoesCliente
      .filter(t => t.tipo === 'receita' && t.status === 'pago')
      .reduce((acc, t) => acc + Number(t.valor), 0);

    const totalPendente = transacoesCliente
      .filter(t => t.tipo === 'receita' && t.status === 'pendente')
      .reduce((acc, t) => acc + Number(t.valor), 0);

    const ultimaTransacao = transacoesCliente
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0];

    const agendamentosPassados = agendamentosCliente.filter(a => new Date(a.data) <= new Date());
    const agendamentosFuturos = agendamentosCliente.filter(a => new Date(a.data) > new Date());

    // Calculate average spending per session and frequency
    const mediaGastoPorSessao = totalGasto / (agendamentosPassados.length || 1);
    const primeiroAgendamento = agendamentosPassados[agendamentosPassados.length - 1];
    
    let frequenciaMedia = 0;
    if (primeiroAgendamento) {
      const mesesAtivo = (new Date().getTime() - new Date(primeiroAgendamento.data).getTime()) / 
        (1000 * 60 * 60 * 24 * 30);
      frequenciaMedia = agendamentosPassados.length / (mesesAtivo || 1);
    }

    return {
      totalGasto,
      totalPendente,
      ultimaTransacao,
      quantidadeTransacoes: transacoesCliente.length,
      mediaGastoPorSessao,
      frequenciaMedia,
      ltv: totalGasto,
      agendamentosFuturos,
      agendamentosPassados
    };
  }, [clienteId, transacoes]);

  const atualizarHistoricoFinanceiro = (cliente: Cliente) => {
    if (!resumoCliente) return cliente;

    return {
      ...cliente,
      historico: {
        ...cliente.historico,
        valorTotalGasto: resumoCliente.totalGasto,
        ultimaSessao: resumoCliente.agendamentosPassados[0]?.data,
        totalSessoes: resumoCliente.agendamentosPassados.length
      }
    };
  };

  return {
    resumoCliente,
    atualizarHistoricoFinanceiro
  };
}