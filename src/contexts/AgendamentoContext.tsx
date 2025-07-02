import React, { createContext, useContext, useEffect, useState } from 'react';
import { Agendamento } from '../types';
import { useFinanceiro } from './FinanceiroContext';
import { useAuth } from './AuthContext';
import { obterAgendamentos, salvarAgendamento, atualizarAgendamento as apiAtualizarAgendamento } from '../services/apiService';
import { toast } from 'react-toastify';
import { User } from '../services/auth/types';

interface AgendamentoContextData {
  agendamentos: Agendamento[];
  adicionarAgendamento: (agendamento: Agendamento) => void;
  atualizarAgendamento: (id: string|number, agendamento: Partial<Agendamento>) => void;
  removerAgendamento: (id: string|number) => void;
  getAgendamentosCliente: (clienteId: string) => Agendamento[];
  getProximosAgendamentos: () => Agendamento[];
}

const AgendamentoContext = createContext<AgendamentoContextData>({} as AgendamentoContextData);

export function AgendamentoProvider({ children }: { children: React.ReactNode }) {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const { adicionarTransacao } = useFinanceiro();
  const notifySuccess = (message: string) => toast.success(message);
  const {user} = useAuth();

    useEffect(() => {
      const fetchAgendamentos = async () => {
        try {
          const dadosAgendamento = await obterAgendamentos(user);
          setAgendamentos(dadosAgendamento);
        } catch (err) {
          console.error(err);
        }
      };
  
      fetchAgendamentos();
    }, []);

  const mapearDadosAgendamento = (agendamento: Agendamento) => {
    return {
      client_id: agendamento.clienteId,
      user_id: user?.id,
      date: agendamento.data,
      time: agendamento.hora,
      type: agendamento.tipo,
      location: agendamento.local,
      value: agendamento.valor,
      notes: agendamento.observacoes
    }
  }

  const mapearDadosTransacao = (dados: Agendamento, user: User|null) => {
    return {
      user_id: user?.id,
      transaction_type: 'receita',
      category: dados.tipo,
      client_id: dados.cliente.id,
      description: `Agendamento: ${dados.tipo} - Cliente: ${dados.cliente.nome}`,
      amount: dados.valor,
      date: new Date().toISOString().split('T')[0],
      recurring_transaction: false,
      frequency: 'unica',
      status: 'pendente',
      payment_method: 'pix'
    };
  };

  const mapearDadosTransacaoOriginal = (dados: Agendamento) => {
    return {
      user_id: user?.id,
      tipo: 'receita',
      categoria: dados.tipo,
      descricao: `Agendamento: ${dados.tipo} - Cliente: ${dados.cliente.nome}`,
      valor: dados.valor,
      data: new Date().toISOString().split('T')[0],
      recorrente: false,
      frequencia: 'unica',
      status: 'pendente',
      formaPagamento: 'pix',
      clienteId: dados.cliente.id,
      cliente: dados.cliente,
      agendamentoId: dados.id
    }
  }
    
  const adicionarAgendamento = async (agendamento: Agendamento) => {
      const dadosAgendamentoMapeados = mapearDadosAgendamento(agendamento);
      
      const novoAgendamento = await salvarAgendamento(dadosAgendamentoMapeados, user);

      agendamento.id = novoAgendamento.id;
      agendamento.dataCadastro = new Date().toISOString().split('T')[0];
      setAgendamentos(prev => [...prev, agendamento]);
      notifySuccess('Agendamento criado com sucesso!');

      // Criar transação financeira associada
      if (agendamento.valor) {
        const dadosTransacao = mapearDadosTransacao(agendamento, user);

        adicionarTransacao(dadosTransacao, mapearDadosTransacaoOriginal(agendamento));
      }
  };

  const atualizarAgendamento = async (id: any, novosDados: Agendamento) => {
    const dadosAgendamentoMapeados = mapearDadosAgendamento(novosDados);

    setAgendamentos(prev => prev.map(agendamento => {
      if (agendamento.id === id) {
        const agendamentoAtualizado = { ...agendamento, ...novosDados };
        
        // if (agendamentoAtualizado.valor) {
        //   atualizarTransacao(`trans-${id}`, {
        //     categoria: agendamentoAtualizado.tipo,
        //     descricao: `Agendamento: ${agendamentoAtualizado.tipo} - Cliente: ${agendamentoAtualizado.cliente.nome}`,
        //     valor: agendamentoAtualizado.valor,
        //     data: agendamentoAtualizado.data
        //   });
        // }
        
        return agendamentoAtualizado;
      }
      return agendamento;
    }));
    
    notifySuccess('Agendamento alterado com sucesso!');

    await apiAtualizarAgendamento(id, dadosAgendamentoMapeados, user);
  };

  const removerAgendamento = (id: string | number) => {
    setAgendamentos(prev => prev.filter(agendamento => agendamento.id !== id));
  };

  const getAgendamentosCliente = (clienteId: string) => {
    return agendamentos.filter(a => a.cliente.id === clienteId);
  };

  const getProximosAgendamentos = () => {
    const hoje = new Date();
    return agendamentos
      .filter(a => new Date(a.data) >= hoje)
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
      .slice(0, 5);
  };

  return (
    <AgendamentoContext.Provider value={{
      agendamentos,
      adicionarAgendamento,
      atualizarAgendamento,
      removerAgendamento,
      getAgendamentosCliente,
      getProximosAgendamentos
    }}>
      {children}
    </AgendamentoContext.Provider>
  );
}

export function useAgendamentos() {
  return useContext(AgendamentoContext);
}