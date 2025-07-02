import React, { useEffect, useRef } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Cliente } from '../../types';

interface MenuAcoesProps {
  cliente: Cliente;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function MenuAcoes({ cliente, onEdit, onDelete, onClose }: MenuAcoesProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
    >
      <div className="py-1">
        <button
          onClick={() => {
            onEdit();
            onClose();
          }}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <Edit2 className="h-4 w-4 mr-2" />
          Editar
        </button>
        <button
          onClick={() => {
            onDelete();
            onClose();
          }}
          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir
        </button>
      </div>
    </div>
  );
}