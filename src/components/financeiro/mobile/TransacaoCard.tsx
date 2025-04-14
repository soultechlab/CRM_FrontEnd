import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Transacao } from '../../../types/financeiro';
import { formatarMoeda, formatarData } from '../../../utils/formatters';

interface TransacaoCardProps {
  transacao: Transacao;
  onEdit: () => void;
  onDelete: (id: string) => void;
}

export default function TransacaoCard({ transacao, onEdit, onDelete }: TransacaoCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-medium">{transacao.descricao}</div>
          <div className="text-sm text-gray-500">{formatarData(transacao.data)}</div>
          <div className="mt-1">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              transacao.status === 'pago'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {transacao.status}
            </span>
            <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
              {transacao.categoria}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-lg font-medium ${
            transacao.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
          }`}>
            {transacao.tipo === 'despesa' ? '-' : '+'}{formatarMoeda(transacao.valor)}
          </span>
          <div className="mt-2 flex gap-2">
            <button
              onClick={onEdit}
              className="p-1 text-gray-600 hover:text-blue-600"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(transacao.id)}
              className="p-1 text-gray-600 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}