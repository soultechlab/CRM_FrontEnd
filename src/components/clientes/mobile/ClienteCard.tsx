import React from 'react';
import { Calendar, Edit2, Trash2 } from 'lucide-react';
import { Cliente } from '../../../types';
import { formatarData } from '../../../utils/formatters';
import SocialButtons from '../social/SocialButtons';
import { isAniversariante } from '../../../utils/clienteUtils';

interface ClienteCardProps {
  cliente: Cliente;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
}

export default function ClienteCard({ cliente, onEdit, onDelete, onClick }: ClienteCardProps) {
  const aniversarianteHoje = isAniversariante(cliente);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-start">
        <button onClick={onClick} className="text-left flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-blue-600">{cliente.nome}</span>
            {aniversarianteHoje && (
              <span className="px-2 py-0.5 text-xs bg-pink-100 text-pink-800 rounded-full">
                Aniversário hoje!
              </span>
            )}
          </div>
          {cliente.profissao && (
            <div className="text-sm text-gray-500">{cliente.profissao}</div>
          )}
        </button>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="p-1 text-gray-600 hover:text-blue-600"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-gray-600 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-3">
        <SocialButtons
          whatsapp={cliente.telefone}
          instagram={cliente.instagram}
          email={cliente.email}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {cliente.dataNascimento && (
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Calendar className="h-3 w-3" />
            {formatarData(cliente.dataNascimento)}
          </div>
        )}
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
          cliente.status === 'ativo' ? 'bg-green-100 text-green-800' :
          cliente.status === 'inativo' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {cliente.status}
        </span>
      </div>
    </div>
  );
}