import React from 'react';
import { Lock } from 'lucide-react';

interface PasswordChangeProps {
  onChange: (field: string, value: string) => void;
}

export default function PasswordChange({ 
  onChange 
}: PasswordChangeProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Lock className="h-5 w-5 text-gray-500" />
        Alterar Senha
      </h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Senha Atual
        </label>
        <input
          type="password"
          onChange={(e) => onChange('current_password', e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nova Senha
        </label>
        <input
          type="password"
          onChange={(e) => onChange('new_password', e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Confirmar Nova Senha
        </label>
        <input
          type="password"
          onChange={(e) => onChange('confirm_new_password', e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>
    </div>
  );
}