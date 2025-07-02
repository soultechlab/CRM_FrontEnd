import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Download, Upload, Search, Calendar, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Cliente } from '../../types';
import FormularioCliente from './FormularioCliente';
import TabelaClientes from './TabelaClientes';
import ClienteDetalhesModal from './modal/ClienteDetalhesModal';
import ConfirmationModal from '../shared/ConfirmationModal';
import { exportarClientesCSV } from '../../utils/exportUtils';
import ImportarClientesModal from './modal/ImportarClientesModal';
import { atualizarCliente, excluirCliente, obterClientes, salvarCliente } from '../../services/apiService';
import { toast } from 'react-toastify';

export default function ListaClientes() {
  const { user } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarImportacao, setMostrarImportacao] = useState(false);
  const [clienteEmEdicao, setClienteEmEdicao] = useState<Cliente | null>(null);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [clienteParaExcluir, setClienteParaExcluir] = useState<Cliente | null>(null);
  const [termoBusca, setTermoBusca] = useState('');
  const [filtros, setFiltros] = useState({
    status: 'todos',
    aniversariantes: 'todos',
    origem: 'todas',
    mes: 'todos',
    ano: new Date().getFullYear().toString(),
    dataInicio: '',
    dataFim: '',
    periodoPersonalizado: false
  });

  const notifySuccess = (message: string) => toast.success(message);
  const notifyError = (message: string) => toast.error(message);

  const [showFilters, setShowFilters] = useState(() => {
    const saved = localStorage.getItem('showClientFilters');
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    const fetchClientes = async () => {
      const clientesObtidos = await obterClientes(user);
      setClientes(clientesObtidos);
    };
  
    fetchClientes();
  }, [user]);

  useEffect(() => {
    localStorage.setItem('showClientFilters', JSON.stringify(showFilters));
  }, [showFilters]);

  useEffect(() => {
    localStorage.setItem('clientes', JSON.stringify(clientes));
  }, [clientes]);

  const mapearDadosCliente = (dados: any, user: User|null) => {
    return {
      name: dados.nome,
      email: dados.email,
      phone: dados.telefone,
      instagram: dados.instagram,
      facebook: dados.facebook,
      referred_by: dados.indicadoPor,
      profession: dados.profissao,
      birth_date: dados.dataNascimento,
      origin: dados.origem,
      notes: dados.observacoes,
      status: dados.status || 'prospecto',
      service_type: dados.tiposServico ? dados.tiposServico[0] : '',
      user_id: user?.id,
    };
  };

  const getClientesNoMes = (clientes: any) => {
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
  
    return clientes.filter(cliente => {
      const dataCadastro = new Date(cliente.dataCadastro);
      return dataCadastro.getMonth() === mesAtual && dataCadastro.getFullYear() === anoAtual;
    });
  }

  const handleSalvarCliente = async (dadosCliente: Partial<Cliente>) => {
    try {
      const dadosMapeados = mapearDadosCliente(dadosCliente, user);
      let cliente;

      if(clienteEmEdicao) {
        cliente = await atualizarCliente(dadosMapeados, clienteEmEdicao.id, user);
      } else {
        let userClientLimit = user?.limits?.maxClients;

        if (userClientLimit !== Infinity) {
          const clientesDoMes = getClientesNoMes(clientes);
        
          if (clientesDoMes.length >= (userClientLimit ?? 0)) {
            notifyError("Você chegou ao limite de clientes deste mês!");
            return;
          }
        }
        
        cliente = await salvarCliente(dadosMapeados, user);
      }
  
      if (!clienteEmEdicao) {
        setClientes(prev => [
          ...prev,
          {
            ...cliente,
            dataCadastro: new Date().toISOString().split('T')[0],
            status: cliente.status || 'prospecto',
          },
        ]);

        notifySuccess('Cliente cadastrado com sucesso');
      } else {
        setClientes(prev =>
          prev.map(c =>
            c.id === cliente.id
              ? { ...c, ...cliente }
              : c
          )
        );

        notifySuccess('Cliente atualizado com sucesso');
      }

      setMostrarFormulario(false);
      setClienteEmEdicao(null);
    } catch (error) {
      notifyError('Erro ao salvar cliente');
    }
  };

  const handleDeleteCliente = async (id: string) => {
    if (clienteParaExcluir) {
      await excluirCliente(clienteParaExcluir.id, user);
      setClientes(prev => prev.filter(c => c.id !== clienteParaExcluir.id));
      setClienteParaExcluir(null);
      notifySuccess('Cliente excluído com sucesso');
    }

    setClientes(prev => prev.filter(cliente => cliente.id !== id));
    setClienteParaExcluir(null);
  };

  const handleExportarCSV = () => {
    exportarClientesCSV(clientesFiltrados);
  };

  const handleClientesImportados = (clientes: any) => {
    try {
      clientes.forEach(async (cliente: any) => {
        if(cliente) {
          const dadosMapeados = mapearDadosCliente(cliente, user);

          const [dia, mes, ano] = dadosMapeados.birth_date.split("/");
          dadosMapeados.birth_date = `${ano}-${mes}-${dia}`;
  
          const novoCliente = await salvarCliente(dadosMapeados, user);
  
          setClientes(prev => [
            ...prev,
            {
              ...cliente,
              id: novoCliente.id,
              dataCadastro: new Date().toISOString(),
              status: cliente.status || 'prospecto',
            },
          ]);
        }
      });

      notifySuccess('Clientes cadastrados com sucesso!');
    } catch (err) {
      notifyError('Erro ao salvar clientes importados! Verifique o arquivo e os dados e tente novamente!');
    }
  }

  const handleEditCliente = (cliente: Cliente) => {
    setClienteEmEdicao(cliente);
    setMostrarFormulario(true);
  };

  const clientesFiltrados = useMemo(() => {
    return clientes.filter(cliente => {
      if (termoBusca) {
        const termo = termoBusca.toLowerCase();
        const matchBusca = 
          cliente.nome.toLowerCase().includes(termo) ||
          cliente.email?.toLowerCase().includes(termo) ||
          cliente.telefone?.includes(termo);
        if (!matchBusca) return false;
      }

      if (filtros.status !== 'todos' && cliente.status !== filtros.status) {
        return false;
      }

      if (filtros.origem !== 'todas' && !cliente.origem.includes(filtros.origem)) {
        return false;
      }

      if (filtros.aniversariantes !== 'todos' && cliente.dataNascimento) {
        const hoje = new Date();
        const dataNascimento = new Date(cliente.dataNascimento);
        const mesNascimento = dataNascimento.getMonth();
        const diaNascimento = dataNascimento.getDate();

        switch (filtros.aniversariantes) {
          case 'proximos7':
            const dataAniversario = new Date(hoje.getFullYear(), mesNascimento, diaNascimento);
            if (dataAniversario < hoje) {
              dataAniversario.setFullYear(hoje.getFullYear() + 1);
            }
            const diffTime = dataAniversario.getTime() - hoje.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays < 0 || diffDays > 7) return false;
            break;

          case 'mes':
            if (mesNascimento !== hoje.getMonth()) return false;
            break;

          case 'proximo':
            const proximoMes = (hoje.getMonth() + 1) % 12;
            if (mesNascimento !== proximoMes) return false;
            break;

          case 'janeiro':
            if (mesNascimento !== 0) return false;
            break;
          case 'fevereiro':
            if (mesNascimento !== 1) return false;
            break;
          case 'marco':
            if (mesNascimento !== 2) return false;
            break;
          case 'abril':
            if (mesNascimento !== 3) return false;
            break;
          case 'maio':
            if (mesNascimento !== 4) return false;
            break;
          case 'junho':
            if (mesNascimento !== 5) return false;
            break;
          case 'julho':
            if (mesNascimento !== 6) return false;
            break;
          case 'agosto':
            if (mesNascimento !== 7) return false;
            break;
          case 'setembro':
            if (mesNascimento !== 8) return false;
            break;
          case 'outubro':
            if (mesNascimento !== 9) return false;
            break;
          case 'novembro':
            if (mesNascimento !== 10) return false;
            break;
          case 'dezembro':
            if (mesNascimento !== 11) return false;
            break;
        }
      }

      if (filtros.periodoPersonalizado) {
        if (filtros.dataInicio || filtros.dataFim) {
          const dataCadastro = new Date(cliente.dataCadastro);
          if (filtros.dataInicio && dataCadastro < new Date(filtros.dataInicio)) return false;
          if (filtros.dataFim && dataCadastro > new Date(filtros.dataFim)) return false;
        }
      } else {
        const dataCadastro = new Date(cliente.dataCadastro);
        const anoSelecionado = parseInt(filtros.ano);
        
        if (filtros.mes === 'atual') {
          const hoje = new Date();
          if (dataCadastro.getMonth() !== hoje.getMonth() || 
              dataCadastro.getFullYear() !== hoje.getFullYear()) {
            return false;
          }
        } else if (filtros.mes !== 'todos') {
          const mesSelecionado = parseInt(filtros.mes);
          if (dataCadastro.getMonth() !== mesSelecionado || 
              dataCadastro.getFullYear() !== anoSelecionado) {
            return false;
          }
        } else if (filtros.ano !== 'todos') {
          if (dataCadastro.getFullYear() !== anoSelecionado) return false;
        }
      }

      return true;
    });
  }, [clientes, termoBusca, filtros]);

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-sm text-gray-600 mt-1">
            {getClientesNoMes(clientes)?.length} de {user?.limits?.maxClients || 'Infinitos'} clientes / mês
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportarCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="h-5 w-5" />
            <span className="hidden md:inline">Exportar CSV</span>
            <span className="md:hidden">Exportar</span>
          </button>
          {user?.plan != 'free' && (
            <button
              onClick={() => setMostrarImportacao(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Upload className="h-5 w-5" />
              <span className="hidden md:inline">Clientes em Massa</span>
              <span className="md:hidden">Importar</span>
            </button>
          )}

          <button
            onClick={() => setMostrarFormulario(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden md:inline">Novo Cliente</span>
            <span className="md:hidden">Novo</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome, email ou telefone..."
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <Filter className="h-5 w-5" />
              <span className="hidden md:inline">
                {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
              </span>
              <span className="md:hidden">Filtros</span>
              {showFilters ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="p-4 border-b space-y-4 transition-all duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <select
                value={filtros.status}
                onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="todos">Todos os status</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="prospecto">Prospecto</option>
              </select>

              <select
                value={filtros.aniversariantes}
                onChange={(e) => setFiltros({ ...filtros, aniversariantes: e.target.value })}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="todos">Todos os aniversários</option>
                <option value="proximos7">Próximos 7 dias</option>
                <option value="mes">Deste mês</option>
                <option value="proximo">Próximo mês</option>
                <optgroup label="Meses">
                  <option value="janeiro">Janeiro</option>
                  <option value="fevereiro">Fevereiro</option>
                  <option value="marco">Março</option>
                  <option value="abril">Abril</option>
                  <option value="maio">Maio</option>
                  <option value="junho">Junho</option>
                  <option value="julho">Julho</option>
                  <option value="agosto">Agosto</option>
                  <option value="setembro">Setembro</option>
                  <option value="outubro">Outubro</option>
                  <option value="novembro">Novembro</option>
                  <option value="dezembro">Dezembro</option>
                </optgroup>
              </select>

              <select
                value={filtros.origem}
                onChange={(e) => setFiltros({ ...filtros, origem: e.target.value })}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="todas">Todas as origens</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="indicacao">Indicação</option>
                <option value="anuncio">Anúncio</option>
                <option value="tiktok">TikTok</option>
                <option value="outros">Outros</option>
              </select>

              <select
                value={filtros.mes}
                onChange={(e) => setFiltros({ ...filtros, mes: e.target.value })}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                disabled={filtros.periodoPersonalizado}
              >
                <option value="todos">Todos os meses</option>
                <option value="atual">Mês Atual</option>
                <option value="0">Janeiro</option>
                <option value="1">Fevereiro</option>
                <option value="2">Março</option>
                <option value="3">Abril</option>
                <option value="4">Maio</option>
                <option value="5">Junho</option>
                <option value="6">Julho</option>
                <option value="7">Agosto</option>
                <option value="8">Setembro</option>
                <option value="9">Outubro</option>
                <option value="10">Novembro</option>
                <option value="11">Dezembro</option>
              </select>

              <select
                value={filtros.ano}
                onChange={(e) => setFiltros({ ...filtros, ano: e.target.value })}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                disabled={filtros.periodoPersonalizado}
              >
                <option value="todos">Todos os anos</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
              </select>

              {!filtros.periodoPersonalizado ? (
                <button
                  onClick={() => setFiltros(prev => ({
                    ...prev,
                    periodoPersonalizado: true,
                    mes: 'todos',
                    ano: 'todos'
                  }))}
                  className="text-sm rounded-lg px-2 py-2 border flex items-center gap-1 border-gray-200 hover:bg-gray-50"
                >
                  <Calendar className="h-4 w-4" />
                  <span className="hidden md:inline">Período Personalizado</span>
                  <span className="md:hidden">Período</span>
                </button>
              ) : (
                <div className="col-span-full md:col-span-2 flex items-center gap-2">
                  <input
                    type="date"
                    value={filtros.dataInicio}
                    onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                  <span className="text-gray-500">até</span>
                  <input
                    type="date"
                    value={filtros.dataFim}
                    onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
              )}
            </div>

            {Object.values(filtros).some(v => v !== 'todos' && v !== '') && (
              <div className="flex justify-end">
                <button
                  onClick={() => setFiltros({
                    status: 'todos',
                    aniversariantes: 'todos',
                    origem: 'todas',
                    mes: 'todos',
                    ano: new Date().getFullYear().toString(),
                    dataInicio: '',
                    dataFim: '',
                    periodoPersonalizado: false
                  })}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Limpar Filtros
                </button>
              </div>
            )}
          </div>
        )}

        <TabelaClientes
          clientes={clientesFiltrados}
          onEdit={handleEditCliente}
          onDelete={setClienteParaExcluir}
          onClienteClick={setClienteSelecionado}
        />
      </div>

      {mostrarFormulario && (
        <FormularioCliente
          cliente={clienteEmEdicao}
          onClose={() => {
            setMostrarFormulario(false);
            setClienteEmEdicao(null);
          }}
          onSave={handleSalvarCliente}
        />
      )}

      {mostrarImportacao && (
        <ImportarClientesModal
          onClose={() => setMostrarImportacao(false)}
          onImport={(clientes) => {
            handleClientesImportados(clientes);
            setMostrarImportacao(false);
          }}
        />
      )}

      {clienteSelecionado && (
        <ClienteDetalhesModal
          cliente={clienteSelecionado}
          onClose={() => setClienteSelecionado(null)}
        />
      )}

      {clienteParaExcluir && (
        <ConfirmationModal
          isOpen={true}
          title="Excluir Cliente"
          message={`Tem certeza que deseja excluir o cliente ${clienteParaExcluir.nome}? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          cancelLabel="Cancelar"
          onConfirm={() => handleDeleteCliente(clienteParaExcluir.id)}
          onCancel={() => setClienteParaExcluir(null)}
        />
      )}
    </div>
  );
}