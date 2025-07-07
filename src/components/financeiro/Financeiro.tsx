import React, { useState } from 'react';
import { Plus, Download, Lock } from 'lucide-react';
import ResumoMobile from './mobile/ResumoMobile';
import ListaTransacoes from './ListaTransacoes';
import FormularioTransacao from './FormularioTransacao';
import ResumoTransacoes from './ResumoTransacoes';
import { useFinanceiro } from '../../contexts/FinanceiroContext';
import { exportarRelatorioFinanceiro } from '../../utils/relatorioUtils';
import FiltrosFinanceiro from './FiltrosFinanceiro';
import { useAuth } from '../../contexts/AuthContext';

export default function Financeiro() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const { resumoFinanceiro, transacoes } = useFinanceiro();
  const [periodoRelatorio, setPeriodoRelatorio] = useState('mes');
  const { user } = useAuth();
  const [filtros, setFiltros] = useState({
    busca: '',
    tipoPagamento: 'todos',
    categoria: 'todas',
    mes: 'todos',
    ano: 'atual',
    status: 'todos',
    periodoPersonalizado: false,
    dataInicio: '',
    dataFim: ''
  });

  const hasAccess = user?.role === 'admin' || user?.limits?.hasFinancialAccess;

  const handleExportarRelatorio = () => {
    exportarRelatorioFinanceiro(transacoes, resumoFinanceiro, periodoRelatorio);
  };

  const faturamentoAnual = transacoes
  .filter(t => {
    const dataTransacao = new Date(`${t.data}T00:00:00`);
    return dataTransacao.getFullYear() === new Date().getFullYear() && 
           t.tipo === 'receita' && 
           t.status === 'pago';
  })
  .reduce((total, t) => total + Number(t.valor), 0);

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Lock className="h-8 w-8 text-gray-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Bloqueado</h2>
          <p className="text-gray-600 mb-6">
            O controle financeiro está disponível apenas para assinantes dos planos Mensal e Anual.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              Para acessar esta funcionalidade, faça upgrade do seu plano ou entre em contato com o suporte.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Financeiro</h1>
          <p className="text-sm text-gray-600 mt-1">
            Gerencie suas receitas e despesas
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <div className="flex gap-2">
            <select
              value={periodoRelatorio}
              onChange={(e) => setPeriodoRelatorio(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="mes">Relatório do Mês</option>
              <option value="ano">Relatório do Ano</option>
              <option value="total">Relatório Total</option>
            </select>
            <button
              onClick={handleExportarRelatorio}
              className="bg-green-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 text-sm"
            >
              <Download className="h-4 w-4" />
              Exportar PDF
            </button>
          </div>
          <button
            onClick={() => setMostrarFormulario(true)}
            className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 text-sm justify-center"
          >
            <Plus className="h-4 w-4" />
            Nova Transação
          </button>
        </div>
      </div>

      {/* Resumo Mobile */}
      <div className="md:hidden">
        <ResumoMobile resumo={resumoFinanceiro} faturamentoAnual={faturamentoAnual} />
      </div>

      {/* Resumo Desktop */}
      <div className="hidden md:block">
        <ResumoTransacoes resumo={resumoFinanceiro} faturamentoAnual={faturamentoAnual} />
      </div>

      <div className="bg-white rounded-lg shadow">
        <FiltrosFinanceiro
          filtros={filtros}
          onChange={setFiltros}
        />
        <ListaTransacoes filtros={filtros} />
      </div>

      {mostrarFormulario && (
        <FormularioTransacao
          onClose={() => setMostrarFormulario(false)}
        />
      )}
    </div>
  );
}