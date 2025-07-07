import React, { useEffect, useState } from 'react';
import { X, Search, Calendar, Clock, MapPin, DollarSign, Trash2 } from 'lucide-react';
import { Agendamento, Cliente } from '../../types';
import { obterClientes } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import { TIPOS } from '../../constants/tipos';

interface FormularioAgendamentoProps {
  data: Date;
  onClose: () => void;
  onSave: (agendamento: any) => void;
  agendamento?: Agendamento | null;
  onDelete: (agendamento: any) => void;
}

export default function FormularioAgendamento({ data, onClose, onSave, agendamento, onDelete }: FormularioAgendamentoProps) {
  const { user } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [form, setForm] = useState({
    id: '',
    data: data.toISOString().split('T')[0],
    tipo: '',
    hora: '09:00',
    valor: 0,
    local: '',
    observacoes: '',
    clienteId: '',
    cliente: null as Cliente | null
  });
  const [buscarCliente, setBuscarCliente] = useState('');
  const [mostrarListaClientes, setMostrarListaClientes] = useState(false);

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(buscarCliente.toLowerCase()) ||
    cliente.email?.toLowerCase().includes(buscarCliente.toLowerCase())
  );

  useEffect(() => {
    if (agendamento) {
      setForm({
        ...agendamento
      });
      setClienteSelecionado(agendamento.cliente);
      setBuscarCliente(agendamento.cliente.nome);
    }
  }, [agendamento]);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const dadosClientes = await obterClientes(user);
        setClientes(dadosClientes);
      } catch (err) {
      }
    };

    fetchClientes();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.cliente) {
      alert('Selecione um cliente');
      return;
    }

    if (!form.local) {
      alert('Indique o local');
      return;
    }

    if(!form.tipo) {
      alert('Indique o tipo');
      return;
    }
    
    onSave({
      ...form,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Novo Agendamento</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cliente
            </label>
            <div className="relative">
              <input
                type="text"
                value={buscarCliente}
                onChange={(e) => {
                  setBuscarCliente(e.target.value);
                  setMostrarListaClientes(true);
                }}
                onFocus={() => setMostrarListaClientes(true)}
                placeholder="Buscar cliente..."
                className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            {mostrarListaClientes && buscarCliente && (
              <div className="absolute z-10 w-[625px] mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                {clientesFiltrados.map((cliente) => (
                  <button
                    key={cliente.id}
                    type="button"
                    onClick={() => {
                      setForm({ ...form, cliente, clienteId: cliente.id });
                      setBuscarCliente(cliente.nome);
                      setMostrarListaClientes(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    <div className="font-medium">{cliente.nome}</div>
                    <div className="text-sm text-gray-500">{cliente.email}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Data e Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                Data
              </label>
              <input
                type="date"
                value={form.data}
                onChange={(e) => setForm({ ...form, data: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                Hora
              </label>
              <input
                type="time"
                value={form.hora}
                onChange={(e) => setForm({ ...form, hora: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Tipo e Local */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Sessão
              </label>
              <select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-3 focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Selecione...</option>
                {TIPOS.map(({id, label}) => (
                  <option key={id} value={id}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                Local
              </label>
              <input
                type="text"
                value={form.local}
                onChange={(e) => setForm({ ...form, local: e.target.value })}
                placeholder="Local da sessão"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Valor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-400" />
              Valor
            </label>
            <input
              type="number"
              value={form.valor || ''}
              onChange={(e) => setForm({ ...form, valor: Number(e.target.value) })}
              placeholder="0,00"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações
            </label>
            <textarea
              value={form.observacoes}
              onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Botões */}
          <div className="flex justify-start gap-4 pt-4">
            { agendamento && 
              <button
                type="button"
                onClick={() => onDelete(agendamento)}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Excluir Agendamento
              </button>
            }
            <div className="ml-auto flex gap-4">
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
                Salvar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}