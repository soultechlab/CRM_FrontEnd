import { Agendamento } from '../types';

export const contarAgendamentosMes = (agendamentos: Agendamento[]) => {
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  return agendamentos.filter(agendamento => {
    const dataAgendamento = new Date(agendamento.data);
    return dataAgendamento.getMonth() === mesAtual && 
           dataAgendamento.getFullYear() === anoAtual;
  }).length;
};