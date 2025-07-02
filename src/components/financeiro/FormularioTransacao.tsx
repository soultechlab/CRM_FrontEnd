import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { useFinanceiro } from '../../contexts/FinanceiroContext';
import { Transacao, Parcela } from '../../types/financeiro';
import { Cliente } from '../../types';
import { obterClientes } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import { TIPOS, TIPOS_DESPESAS } from '../../constants/tipos';
import { User } from '../../services/auth/types';

interface FormularioTransacaoProps {
  transacaoId?: string;
  onClose: () => void;
}

export default function FormularioTransacao({ transacaoId, onClose }: FormularioTransacaoProps) {
  const { transacoes, adicionarTransacao, atualizarTransacao } = useFinanceiro();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [showClientList, setShowClientList] = useState(false);
  const [tipoTransacao, setTipoTransacao] = useState<'unico' | 'parcelado'>('unico');
  const [valorEntrada, setValorEntrada] = useState<number>(0);
  const [numeroParcelas, setNumeroParcelas] = useState<number>(1);
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const { user } = useAuth();
  
  const [form, setForm] = useState<Partial<Transacao>>({
    tipo: 'receita',
    categoria: '',
    descricao: '',
    valor: 0,
    data: new Date().toISOString().split('T')[0],
    status: 'pendente',
    formaPagamento: ''
  });

  // Load existing transaction data if editing
  useEffect(() => {
    if (transacaoId) {
      const transacao = transacoes.find(t => t.id === transacaoId);
      if (transacao) {
        setForm(transacao);
        if (transacao.cliente?.id) {
          setSelectedClient(transacao.cliente.id);
          const cliente = clientes.find(c => c.id === transacao.cliente?.id);
          if (cliente) {
            setSearchTerm(cliente.nome);
          }
        }
        
        // Check if it's part of an installment plan
        if (transacao.parcelaInfo) {
          setTipoTransacao('parcelado');
          // Load all related installments
          const todasParcelas = transacoes.filter(t => 
            t.parcelaInfo?.transacaoOriginalId === transacao.parcelaInfo?.transacaoOriginalId
          );
          
          // Convert to parcelas format
          const parcelasExistentes = todasParcelas.map(t => ({
            numero: t.parcelaInfo!.numero,
            valor: t.valor,
            dataVencimento: t.data,
            status: t.status,
            transacaoId: t.id
          }));
          
          setParcelas(parcelasExistentes);
          setNumeroParcelas(todasParcelas.length);
          
          // Find entrada if exists
          const entrada = transacoes.find(t => 
            t.descricao.includes('Entrada') && 
            t.parcelaInfo?.transacaoOriginalId === transacao.parcelaInfo?.transacaoOriginalId
          );
          if (entrada) {
            setValorEntrada(entrada.valor);
          }
        }
      }
    }
  }, []);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const dadosClientes = await obterClientes(user);
        setClientes(dadosClientes);
      } catch (err) {
        console.log(err);
      }
    };

    fetchClientes();
  }, []);

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.instagram?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.telefone?.includes(searchTerm)
  );

  const calcularParcelas = () => {
    if (!form.valor) return;

    const valorParcelado = form.valor - valorEntrada;
    const valorParcela = valorParcelado / numeroParcelas;
    const novasParcelas: Parcela[] = [];
    let dataBase = new Date(form.data || new Date());

    for (let i = 1; i <= numeroParcelas; i++) {
      dataBase.setMonth(dataBase.getMonth() + 1);
      novasParcelas.push({
        numero: i,
        valor: valorParcela,
        dataVencimento: dataBase.toISOString().split('T')[0],
        status: 'pendente'
      });
    }

    setParcelas(novasParcelas);
  };

  const mapearDadosTransacao = (dados: any, user: User|null) => {
    return {
      id: dados.id,
      user_id: user?.id,
      transaction_type: dados.tipo,
      category: dados.categoria,
      client_id: dados.clienteId,
      description: dados.descricao,
      amount: dados.valor,
      date: dados.data,
      recurring_transaction: false,
      frequency: dados.frequencia,
      status: dados.status,
      payment_method: dados.formaPagamento,
      installments_info: dados.parcelaInfo
    };
  };

  const handleParcelaStatusChange = (index: number, novoStatus: 'pendente' | 'pago') => {
    const novasParcelas = [...parcelas];
    novasParcelas[index].status = novoStatus;
    setParcelas(novasParcelas);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.tipo === 'receita' && !selectedClient && !transacaoId) {
      alert('Selecione um cliente para registrar uma receita');
      return;
    }

    if(!form.tipo) {
      alert('Selecione o tipo da transação!');
      return;
    }

    if(!form.valor) {
      alert('Indique o valor da transação!');
      return;
    }

    if(!form.data) {
      alert('Indique a data da transação!');
      return;
    }

    if(!form.status) {
      alert('Indique o status da transação!');
      return;
    }

    if(!form.descricao) {
      alert('Indique uma descrição para a transação!');
      return;
    }

    if(!form.formaPagamento) {
      alert('Indique a forma de pagamento!');
      return;
    }

    const transacaoBase = {
      ...form,
      id: transacaoId || Date.now().toString(),
      clienteId: form.tipo === 'receita' ? selectedClient : undefined,
      cliente: form.tipo === 'receita' ? clientes.find(c => c.id === selectedClient) : undefined
    };

    if (tipoTransacao === 'parcelado') {
      // Criar entrada se houver
      if (valorEntrada > 0) {
        const transacaoEntrada = {
          ...transacaoBase,
          id: Date.now().toString(),
          valor: valorEntrada,
          descricao: `${form.descricao} - Entrada`,
          status: form.status
        } as Transacao;

        const dadosTransacao = mapearDadosTransacao(transacaoEntrada, user);

        if (transacaoId) {
          atualizarTransacao(transacaoId, dadosTransacao);
        } else {
          adicionarTransacao(dadosTransacao, transacaoEntrada);
        }
      }

      // Criar ou atualizar parcelas
      parcelas.forEach((parcela, index) => {
        const transacaoParcela = {
          ...transacaoBase,
          id: parcela.transacaoId || Date.now().toString() + index,
          valor: parcela.valor,
          data: parcela.dataVencimento,
          descricao: `${form.descricao} - Parcela ${parcela.numero}/${parcelas.length}`,
          status: parcela.status,
          parcelaInfo: {
            total: numeroParcelas,
            numero: parcela.numero,
            transacaoOriginalId: transacaoBase.id
          }
        } as Transacao;

        const dadosTransacao = mapearDadosTransacao(transacaoParcela, user);

        if (parcela.transacaoId) {
          atualizarTransacao(parcela.transacaoId, dadosTransacao);
        } else {
          adicionarTransacao(dadosTransacao, transacaoParcela);
        }
      });
    } else {
      // Transação única
      const dadosTransacao = mapearDadosTransacao(transacaoBase, user);

      if (transacaoId) {
        atualizarTransacao(transacaoId, transacaoBase, dadosTransacao);
      } else {
        adicionarTransacao(dadosTransacao, transacaoBase);
      }
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {transacaoId ? 'Editar Transação' : 'Nova Transação'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tipo de Transação */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                value={form.tipo}
                onChange={(e) => {
                  setForm({ 
                    ...form, 
                    tipo: e.target.value as 'receita' | 'despesa',
                    clienteId: e.target.value === 'despesa' ? undefined : form.clienteId
                  });
                  if (e.target.value === 'despesa') {
                    setSelectedClient(null);
                    setSearchTerm('');
                    setTipoTransacao('unico');
                  }
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-3 bg-white"
              >
                <option value="receita">Receita</option>
                <option value="despesa">Despesa</option>
              </select>
            </div>

            {form.tipo === 'receita' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Forma de Pagamento
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTipoTransacao('unico')}
                    className={`flex-1 px-3 py-2 rounded-lg border ${
                      tipoTransacao === 'unico'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Único
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoTransacao('parcelado')}
                    className={`flex-1 px-3 py-2 rounded-lg border ${
                      tipoTransacao === 'parcelado'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Parcelado
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Cliente - apenas para receitas */}
          {form.tipo === 'receita' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowClientList(true);
                  }}
                  onFocus={() => setShowClientList(true)}
                  placeholder="Buscar por nome, email, Instagram ou telefone..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
                
                {showClientList && searchTerm && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    {clientesFiltrados.map(cliente => (
                      <button
                        key={cliente.id}
                        type="button"
                        onClick={() => {
                          setSelectedClient(cliente.id);
                          setSearchTerm(cliente.nome);
                          setShowClientList(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        <div className="font-medium">{cliente.nome}</div>
                        <div className="text-sm text-gray-500">
                          {cliente.email && <span className="mr-2">{cliente.email}</span>}
                          {cliente.instagram && <span className="mr-2">{cliente.instagram}</span>}
                          {cliente.telefone && <span>{cliente.telefone}</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-3 bg-white"
            >
              <option value="">Selecione...</option>
              {form.tipo === 'receita' ? (
                TIPOS.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.label}
                  </option>
                ))
              ) : (
                TIPOS_DESPESAS.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.label}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <input
              type="text"
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>

          {/* Valor e Data */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor Total
              </label>
              <input
                type="number"
                value={form.valor}
                onChange={(e) => setForm({ ...form, valor: Number(e.target.value) })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data
              </label>
              <input
                type="date"
                value={form.data}
                onChange={(e) => setForm({ ...form, data: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
          </div>

          {/* Configuração de Parcelamento */}
          {tipoTransacao === 'parcelado' && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium">Configuração de Parcelas</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor de Entrada
                  </label>
                  <input
                    type="number"
                    value={valorEntrada}
                    onChange={(e) => setValorEntrada(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status da Entrada
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as 'pendente' | 'pago' })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-3 bg-white"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="pago">Pago</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Parcelas
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={numeroParcelas}
                    onChange={(e) => setNumeroParcelas(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={calcularParcelas}
                    className="w-full px-4 py-2 bg-blue-100 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-200"
                  >
                    Calcular Parcelas
                  </button>
                </div>
              </div>

              {parcelas.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-700">Parcelas:</h4>
                  {parcelas.map((parcela, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span>Parcela {parcela.numero}/{parcelas.length}</span>
                      <span>{new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(parcela.valor)}</span>
                      <input
                        type="date"
                        value={parcela.dataVencimento}
                        onChange={(e) => {
                          const novasParcelas = [...parcelas];
                          novasParcelas[index].dataVencimento = e.target.value;
                          setParcelas(novasParcelas);
                        }}
                        className="border rounded px-2 py-1"
                      />
                      <select
                        value={parcela.status}
                        onChange={(e) => handleParcelaStatusChange(index, e.target.value as 'pendente' | 'pago')}
                        className="border rounded px-2 py-1"
                      >
                        <option value="pendente">Pendente</option>
                        <option value="pago">Pago</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Forma de Pagamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Forma de Pagamento
            </label>
            <select
              value={form.formaPagamento}
              onChange={(e) => setForm({ ...form, formaPagamento: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-3 bg-white"
            >
              <option value="">Selecione...</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="pix">PIX</option>
              <option value="cartao">Cartão</option>
              <option value="transferencia">Transferência</option>
            </select>
          </div>

          {/* Status - apenas para pagamento único */}
          {tipoTransacao === 'unico' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as 'pendente' | 'pago' })}
                className="w-full rounded-lg border border-gray-300 px-3 py-3 bg-white"
              >
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
              </select>
            </div>
          )}

          {/* Botões */}
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
              {transacaoId ? 'Salvar Alterações' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}