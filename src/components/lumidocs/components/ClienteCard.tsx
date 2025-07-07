import React, { useState } from 'react';
import { UserCircle, Edit2, Trash2 } from 'lucide-react';
import { Cliente } from '../utils/localStorage';
import { Modal } from './Modal';
import { ClienteForm } from './ClienteForm';

interface ClienteCardProps {
  cliente: Cliente;
  onDelete: (id: string) => void;
  onEdit: (cliente: Cliente) => void;
}

export function ClienteCard({ cliente, onDelete, onEdit }: ClienteCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <>
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <UserCircle className="h-10 w-10 text-gray-400" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">{cliente.nome}</h3>
            <p className="text-sm text-gray-500">{cliente.email}</p>
            <p className="text-sm text-gray-500">CPF: {cliente.cpf}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="p-1 text-gray-400 hover:text-blue-500"
          >
            <Edit2 className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(cliente.id)}
            className="p-1 text-gray-400 hover:text-red-500"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Cliente"
      >
        <ClienteForm
          initialData={cliente}
          onSubmit={(data) => {
            onEdit(data);
            setIsEditModalOpen(false);
          }}
        />
      </Modal>
    </>
  );
}