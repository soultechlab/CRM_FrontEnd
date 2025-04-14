import React from 'react';
import { Mail, UserCog } from 'lucide-react';
import { formatarCPF } from '../../../utils/formatters';

interface BasicInfoProps {
  email: string;
  cpf?: string;
  currentName: string;
  newName: string;
  onNameChange: (value: string) => void;
  onCpfChange: (value: string) => void;
}

export default function BasicInfo({ email, currentName, newName, cpf, onNameChange, onCpfChange }: BasicInfoProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <h2 className="text-lg font-semibold">Informações Básicas</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nome Atual
        </label>
        <input
          type="text"
          value={currentName}
          disabled
          className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Novo Nome
        </label>
        <input
          type="text"
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
          placeholder="Digite o novo nome"
        />
      </div>

      <div>
        <div className="flex items-center gap-2">
          <UserCog className="h-4 w-4 text-gray-400" />
          CPF
        </div>
        <input
          type="text"
          value={cpf}
          onChange={(e) => onCpfChange(formatarCPF(e.target.value))}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
          placeholder="Digite seu CPF"
        />
      </div>

      <div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-400" />
            Email
          </div>
        <div className="flex items-center">
          <input
            type="email"
            value={email}
            disabled
            className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50"
          />
        </div>
      </div>
    </div>
  );
}