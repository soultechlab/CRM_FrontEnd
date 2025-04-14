import React, { useMemo, useState } from 'react';
import { useFinanceiro } from '../../contexts/FinanceiroContext';
import FormularioTransacao from './FormularioTransacao';
import TransacaoCard from './mobile/TransacaoCard';
import FiltrosMobile from './mobile/FiltrosMobile';
import TabelaTransacoes from './TabelaTransacoes';
import { Transacao } from '../../types/financeiro';
import ConfirmationModal from '../shared/ConfirmationModal';
import { toast } from 'react-toastify';

export default function ListaTransacoes({ filtros }: { filtros: any }) {
  const { transacoes, removerTransacao } = useFinanceiro();
  const [transacaoEmEdicao, setTransacaoEmEdicao] = useState<Transacao | null>(null);
  const [transacaoParaExcluir, setTransacaoParaExcluir] = useState<Transacao | null>(null);
  const notifySuccess = (message: string) => toast.success(message);

  const transacoesFiltradas = useMemo(() => {
    return transacoes.filter(transacao => {
      // Filtro por busca
      if (filtros.busca) {
        const termoBusca = filtros.busca.toLowerCase();
        const matchBusca = 
          transacao.descricao.toLowerCase().includes(termoBusca) ||
          transacao.cliente?.nome.toLowerCase().includes(termoBusca);
        if (!matchBusca) return false;
      }

      // Filtro por tipo de pagamento
      if (filtros.tipoPagamento !== 'todos' && transacao.formaPagamento !== filtros.tipoPagamento) {
        return false;
      }

      // Filtro por categoria
      if (filtros.categoria !== 'todas' && transacao.categoria !== filtros.categoria) {
        return false;
      }

      // Filtro por status
      if (filtros.status !== 'todos' && transacao.status !== filtros.status) {
        return false;
      }

      // Filtro por data personalizada
      if (filtros.periodoPersonalizado) {
        const dataTransacao = new Date(`${transacao.data}T00:00:00`);
        const dataInicio = filtros.dataInicio ? new Date(filtros.dataInicio) : null;
        const dataFim = filtros.dataFim ? new Date(filtros.dataFim) : null;

        if (dataInicio && dataTransacao < dataInicio) return false;
        if (dataFim && dataTransacao > dataFim) return false;
      } else {
        // Filtro por mês/ano
        const dataTransacao = new Date(`${transacao.data}T00:00:00`);
        const hoje = new Date();

        if (filtros.mes === 'atual') {
          if (dataTransacao.getMonth() !== hoje.getMonth()) return false;
        } else if (filtros.mes !== 'todos') {
          if (dataTransacao.getMonth() !== Number(filtros.mes)) return false;
        }

        if (filtros.ano === 'atual') {
          if (dataTransacao.getFullYear() !== hoje.getFullYear()) return false;
        } else if (filtros.ano !== 'personalizado') {
          if (dataTransacao.getFullYear() !== Number(filtros.ano)) return false;
        }
      }

      return true;
    });
  }, [transacoes, filtros]);

  const handleExcluirTransacao = (id: string) => {
    const transacao = transacoes.find(c => c.id === id);
    if(transacao) {
      setTransacaoParaExcluir(transacao);
    }
  }

  const confirmarExclusao = async () => {
    if (transacaoParaExcluir) {
      removerTransacao(transacaoParaExcluir.id);
      setTransacaoParaExcluir(null);
      notifySuccess('Transação excluída com sucesso');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        {/* Filtros Mobile */}
        <div className="md:hidden">
          <FiltrosMobile
            filtros={filtros}
          />
        </div>

        {/* Filtros Desktop */}
        {/* <div className="hidden md:flex items-center gap-4">
          <select
            value={filtros.tipo}
            onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
            className="rounded-lg border border-gray-300 px-3 py-2 bg-white"
          >
            <option value="todos">Todos os tipos</option>
            <option value="receita">Receitas</option>
            <option value="despesa">Despesas</option>
          </select>

          <select
            value={filtros.periodo}
            onChange={(e) => setFiltros({ ...filtros, periodo: e.target.value })}
            className="rounded-lg border border-gray-300 px-3 py-2 bg-white"
          >
            <option value="mes-atual">Mês Atual</option>
            <option value="todos">Todos os períodos</option>
          </select>

          <select
            value={filtros.status}
            onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
            className="rounded-lg border border-gray-300 px-3 py-2 bg-white"
          >
            <option value="todos">Todos os status</option>
            <option value="pago">Pagos</option>
            <option value="pendente">Pendentes</option>
          </select>
        </div> */}
      </div>

      {/* Lista Mobile */}
      <div className="md:hidden p-4 space-y-4">
        {transacoesFiltradas.map((transacao) => (
          <TransacaoCard
            key={transacao.id}
            transacao={transacao}
            onEdit={() => setTransacaoEmEdicao(transacao.id)}
            onDelete={handleExcluirTransacao}
          />
        ))}
      </div>

      {/* Tabela Desktop */}
      <div className="hidden md:block">
        <TabelaTransacoes
          transacoes={transacoesFiltradas}
          onEdit={(id) => setTransacaoEmEdicao(id)}
          onDelete={handleExcluirTransacao}
        />
      </div>

      {transacaoEmEdicao && (
        <FormularioTransacao
          transacaoId={transacaoEmEdicao}
          onClose={() => setTransacaoEmEdicao(null)}
        />
      )}

      {transacaoParaExcluir && (
        <ConfirmationModal
          isOpen={true}
          title="Excluir Transação"
          message={`Tem certeza que deseja excluir a transação "${transacaoParaExcluir.descricao}"? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          cancelLabel="Cancelar"
          onConfirm={confirmarExclusao}
          onCancel={() => setTransacaoParaExcluir(null)}
        />
      )}
    </div>
  );
}