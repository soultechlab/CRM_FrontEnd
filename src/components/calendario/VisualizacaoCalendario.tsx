import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useAgendamentos } from '../../contexts/AgendamentoContext';
import GradeCalendario from './GradeCalendario';
import FormularioAgendamento from './FormularioAgendamento';
import { Agendamento } from '../../types';
import ConfirmationModal from '../shared/ConfirmationModal';
import { excluirAgendamento } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import GoogleLoginButton from './GoogleLoginButton';

export default function VisualizacaoCalendario() {
  const { agendamentos, adicionarAgendamento, atualizarAgendamento, removerAgendamento } = useAgendamentos();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [dataSelecionada, setDataSelecionada] = useState<Date | null>(null);
  const [visualizacao, setVisualizacao] = useState<'mes' | 'semana'>('mes');
  const [dataAtual, setDataAtual] = useState(new Date());
  const [agendamentoEmEdicao, setAgendamentoEmEdicao] = useState<Agendamento | null>(null);
  const [agendamentoParaExcluir, setAgendamentoParaExcluir] = useState<Agendamento | null>(null);
  const { user } = useAuth();
  
  const notifySuccess = (message: string) => toast.success(message);
  const notifyError = (message: string) => toast.error(message);

  const handleNovoAgendamento = (data?: Date) => {
    // if (!user?.limits?.maxSchedules || agendamentos.length >= user.limits.maxSchedules) {
    //   alert(`Você atingiu o limite máximo de ${user?.limits.maxSchedules} agendamentos do seu plano atual.`);
    //   return;
    // }

    // Create a new Date object to avoid reference issues
    const selectedDate = data ? new Date(data) : new Date();
    // Set time to midnight to ensure consistent date handling
    selectedDate.setHours(0, 0, 0, 0);
    setDataSelecionada(selectedDate);
    setMostrarFormulario(true);
    setAgendamentoEmEdicao(null);
  };

  const handleEditarAgendamento = (agendamento: Agendamento) => {
    setDataSelecionada(new Date(agendamento.data));
    setAgendamentoEmEdicao(agendamento);
    setMostrarFormulario(true);
  };

  const getAgendamentosNoMes = (agendamentos: any) => {
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
  
    return agendamentos.filter(agendamento => {
      const dataCadastro = new Date(agendamento.dataCadastro);
      return dataCadastro.getMonth() === mesAtual && dataCadastro.getFullYear() === anoAtual;
    });
  }

  const handleSalvarAgendamento = (agendamento: Agendamento) => {
    if (agendamentoEmEdicao) {
      atualizarAgendamento(agendamentoEmEdicao.id, agendamento);
    } else {
      let userSchedulesLimit = user?.limits?.maxSchedules;

      if(userSchedulesLimit != Infinity) {
        if(getAgendamentosNoMes(agendamentos)?.length >= (userSchedulesLimit ?? 0)) {
          notifyError("Você chegou ao limite de agendamentos deste mês!");
          return;
        }
      }

      const novoAgendamento = {
        ...agendamento,
      } as Agendamento;
      
      adicionarAgendamento(novoAgendamento);
    }
    setMostrarFormulario(false);
    setAgendamentoEmEdicao(null);
  }

  const navegar = (delta: number) => {
    const novaData = new Date(dataAtual);
    if (visualizacao === 'mes') {
      novaData.setMonth(dataAtual.getMonth() + delta);
    } else {
      novaData.setDate(dataAtual.getDate() + (delta * 7));
    }
    setDataAtual(novaData);
  };

  const handleExcluirAgendamento = (agendamento: any) => {
    if(agendamento) {
      setAgendamentoEmEdicao(null);
      setMostrarFormulario(false);

      setAgendamentoParaExcluir(agendamento);
    }
  }

  const handleDeleteAgendamento = async (agendamentoId: string | number) => {
      if (agendamentoParaExcluir) {
        try {
          await excluirAgendamento(agendamentoParaExcluir.id, user);
          removerAgendamento(agendamentoId);
          setAgendamentoParaExcluir(null);
          notifySuccess('Agendamento excluído com sucesso');
        } catch (exception) {
          notifyError('Falha ao excluir agendamento!');
        }
      }
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Agenda</h1>
          <p className="text-sm text-gray-600 mt-1">
            {getAgendamentosNoMes(agendamentos)?.length} de {user?.limits?.maxSchedules || 'Infinitos'} agendamentos / mês

          </p>
          <div className="mt-2 flex items-center gap-4">
            <button
              onClick={() => setVisualizacao('mes')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                visualizacao === 'mes'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Mês
            </button>
            <button
              onClick={() => setVisualizacao('semana')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                visualizacao === 'semana'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Semana
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navegar(-1)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold">
              {dataAtual.toLocaleString('pt-BR', {
                month: 'long',
                year: 'numeric'
              })}
            </h2>
            <button
              onClick={() => navegar(1)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <GoogleLoginButton />

          <button
            onClick={() => handleNovoAgendamento()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            Novo Agendamento
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <GradeCalendario
          dataAtual={dataAtual}
          visualizacao={visualizacao}
          agendamentos={agendamentos}
          onDiaClick={handleNovoAgendamento}
          onEditAgendamento={handleEditarAgendamento}
        />
      </div>

      {mostrarFormulario && dataSelecionada && (
        <FormularioAgendamento
          data={dataSelecionada}
          onClose={() => {
            setMostrarFormulario(false);
            setDataSelecionada(null);
          }}
          onSave={handleSalvarAgendamento}
          onDelete={handleExcluirAgendamento}
          agendamento={agendamentoEmEdicao}
        />
      )}

      {agendamentoParaExcluir && (
        <ConfirmationModal
          isOpen={true}
          title="Excluir Agendamento"
          message="Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita."
          confirmLabel="Excluir"
          cancelLabel="Cancelar"
          onConfirm={() => handleDeleteAgendamento(agendamentoParaExcluir.id)}
          onCancel={() => setAgendamentoParaExcluir(null)}
        />
      )}
    </div>
  );
}