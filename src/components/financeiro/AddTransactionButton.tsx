import React from 'react';
import { Plus } from 'lucide-react';

interface AddTransactionButtonProps {
  onClick: () => void;
}

export default function AddTransactionButton({ onClick }: AddTransactionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
    >
      <Plus className="h-5 w-5" />
      Nova Transação
    </button>
  );
}