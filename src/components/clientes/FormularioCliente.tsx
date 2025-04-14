// src/components/clientes/FormularioCliente.tsx
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Cliente } from '../../types';
import InformacoesBasicas from './formulario/InformacoesBasicas';
import InformacoesContato from './formulario/InformacoesContato';
import Observacoes from './formulario/Observacoes';
import TipoServico from './formulario/TipoServico';
import InformacoesFinanceiras from './formulario/InformacoesFinanceiras';
import { useClienteFinanceiro } from '../../hooks/useClienteFinanceiro';

interface FormularioClienteProps {
  cliente?: Cliente;
  onClose: () => void;
  onSave: (cliente: Partial<Cliente>) => void;
}

export default function FormularioCliente({ cliente, onClose, onSave }: FormularioClienteProps) {
  const { resumoCliente } = useClienteFinanceiro(cliente?.id);
  const [form, setForm] = useState<Partial<Cliente>>({
    nome: cliente?.nome || '',
    email: cliente?.email || '',
    telefone: cliente?.telefone || '',
    instagram: cliente?.instagram || '',
    facebook: cliente?.facebook || '',
    indicadoPor: cliente?.indicadoPor || '',
    profissao: cliente?.profissao || '',
    dataNascimento: cliente?.dataNascimento || '',
    origem: cliente?.origem || [],
    observacoes: cliente?.observacoes || '',
    status: cliente?.status || 'prospecto',
    dataCadastro: cliente?.dataCadastro || new Date().toISOString().split('T')[0],
    tiposServico: cliente?.tiposServico || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {cliente ? 'Editar Cliente' : 'Novo Cliente'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <InformacoesBasicas
            form={form}
            onChange={(values) => setForm({ ...form, ...values })}
          />

          <InformacoesContato
            form={form}
            onChange={(values) => setForm({ ...form, ...values })}
          />

          <InformacoesFinanceiras
            form={form}
            onChange={(values) => setForm({ ...form, ...values })}
            resumoCliente={resumoCliente}
          />

          <TipoServico
            form={form}
            onChange={(values) => setForm({ ...form, ...values })}
          />

          <Observacoes
            form={form}
            onChange={(values) => setForm({ ...form, ...values })}
          />

          <div className="flex justify-end gap-4 pt-4">
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
              {cliente ? 'Salvar Alterações' : 'Cadastrar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
