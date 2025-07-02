import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { Cliente } from '../utils/localStorage';

interface ClienteFormProps {
  initialData?: Cliente;
  onSubmit: (cliente: Cliente) => void;
}

export function ClienteForm({ initialData, onSubmit }: ClienteFormProps) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpf: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        nome: initialData.nome,
        email: initialData.email,
        cpf: initialData.cpf
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const cliente: Cliente = {
      id: initialData?.id || crypto.randomUUID(),
      ...formData,
      created_at: initialData?.created_at || new Date().toISOString()
    };

    onSubmit(cliente);
    
    if (!initialData) {
      setFormData({ nome: '', email: '', cpf: '' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nome</label>
        <input
          type="text"
          value={formData.nome}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">CPF</label>
        <input
          type="text"
          value={formData.cpf}
          onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {initialData ? 'Salvar Alterações' : 'Cadastrar Cliente'}
      </button>
    </form>
  );
}