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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      await onSave(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar cliente');
    } finally {
      setIsSubmitting(false);
    }
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

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isSubmitting 
                ? 'Salvando...' 
                : (cliente ? 'Salvar Alterações' : 'Cadastrar Cliente')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
