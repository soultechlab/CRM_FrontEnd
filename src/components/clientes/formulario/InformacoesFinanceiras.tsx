import React from 'react';
import { DollarSign } from 'lucide-react';
import { Cliente } from '../../../types';
import { formatarMoeda } from '../../../utils/formatters';

interface InformacoesFinanceirasProps {
  form: Partial<Cliente>;
  onChange: (values: Partial<Cliente>) => void;
  resumoCliente: any;
}

export default function InformacoesFinanceiras({ form, onChange, resumoCliente }: InformacoesFinanceirasProps) {
  const handleValorTotalChange = (valor: number) => {
    onChange({
      historico: {
        ...form.historico,
        valorTotalGasto: valor
      }
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Informações Financeiras</h3>
      
      {/* <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Valor Total Gasto
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="number"
            value={form.historico?.valorTotalGasto || ''}
            onChange={(e) => handleValorTotalChange(Number(e.target.value))}
            className="pl-10 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {resumoCliente?.totalGasto !== form.historico?.valorTotalGasto && (
          <p className="mt-1 text-sm text-orange-500">
            Valor diferente do calculado: {formatarMoeda(resumoCliente?.totalGasto || 0)}
          </p>
        )}
      </div> */}

      {resumoCliente?.totalGasto > 0 && (
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800">
            Total Investido: {formatarMoeda(resumoCliente.totalGasto)}
          </p>
        </div>
      )}

      {resumoCliente?.totalPendente > 0 && (
        <div className="p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800">
            Pagamentos pendentes: {formatarMoeda(resumoCliente.totalPendente)}
          </p>
        </div>
      )}
    </div>
  );
}