import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { exportarRelatorioFinanceiro } from '../../utils/relatorioUtils';
import { useFinanceiro } from '../../contexts/FinanceiroContext';

interface ExportButtonProps {
  onExport: () => void;
}

export default function ExportButton({ onExport }: ExportButtonProps) {
  const [showFilters, setShowFilters] = useState(false);
  const { transacoes, resumoFinanceiro } = useFinanceiro();
  const [filtro, setFiltro] = useState('mes');

  const handleExport = () => {
    exportarRelatorioFinanceiro(transacoes, resumoFinanceiro, filtro);
    setShowFilters(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
      >
        <Download className="h-5 w-5" />
        Exportar PDF
      </button>

      {showFilters && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4 z-50">
          <h3 className="text-sm font-medium mb-3">Selecione o período:</h3>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="period"
                value="mes"
                checked={filtro === 'mes'}
                onChange={(e) => setFiltro(e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">Mês Atual</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="period"
                value="ano"
                checked={filtro === 'ano'}
                onChange={(e) => setFiltro(e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">Ano Atual</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="period"
                value="receitas"
                checked={filtro === 'receitas'}
                onChange={(e) => setFiltro(e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">Apenas Receitas</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="period"
                value="despesas"
                checked={filtro === 'despesas'}
                onChange={(e) => setFiltro(e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">Apenas Despesas</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="period"
                value="saldo"
                checked={filtro === 'saldo'}
                onChange={(e) => setFiltro(e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">Apenas Saldo Líquido</span>
            </label>
          </div>
          <button
            onClick={handleExport}
            className="mt-4 w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
          >
            Gerar PDF
          </button>
        </div>
      )}
    </div>
  );
}