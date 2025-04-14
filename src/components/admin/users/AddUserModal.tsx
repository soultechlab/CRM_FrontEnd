import React, { useState } from 'react';
import { X } from 'lucide-react';
import SocialFields from './form/SocialFields';
import { validateInstagram, formatWhatsApp } from '../../../utils/socialUtils';

interface AddUserModalProps {
  onClose: () => void;
  onAdd: (user: {
    name: string;
    email: string;
    password: string;
    plan: string;
    role: string;
    instagram?: string;
    whatsapp?: string;
  }) => void;
}

export default function AddUserModal({ onClose, onAdd }: AddUserModalProps) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    plan: 'free',
    role: 'user',
    instagram: '',
    whatsapp: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (form.instagram && !validateInstagram(form.instagram)) {
      alert('Nome de usuário do Instagram inválido');
      return;
    }

    onAdd({
      ...form,
      whatsapp: formatWhatsApp(form.whatsapp)
    });
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Adicionar Novo Usuário</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Existing fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>

          {/* Social Media Fields */}
          <SocialFields
            instagram={form.instagram}
            whatsapp={form.whatsapp}
            onChange={handleInputChange}
          />

          {/* Role and Plan */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plano</label>
              <select
                value={form.plan}
                onChange={(e) => handleInputChange('plan', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="free">Free</option>
                <option value="monthly">Mensal</option>
                <option value="annual">Anual</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Função</label>
              <select
                value={form.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="user">Usuário</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Adicionar Usuário
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}