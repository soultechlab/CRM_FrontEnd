import { Cliente } from '../types';

export const filtrarAniversariantes = (clientes: Cliente[], filtro: string) => {
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const proximoMes = (mesAtual + 1) % 12;
  const anoAtual = hoje.getFullYear();

  return clientes.filter(cliente => {
    if (!cliente.dataNascimento) return false;
    
    const dataNascimento = new Date(cliente.dataNascimento);
    const mesNascimento = dataNascimento.getMonth();

    switch (filtro) {
      case 'mes':
        return mesNascimento === mesAtual;
      case 'proximo':
        return mesNascimento === proximoMes;
      case 'ano':
        return true;
      default:
        return false;
    }
  }).sort((a, b) => {
    const dataA = new Date(a.dataNascimento!);
    const dataB = new Date(b.dataNascimento!);
    return dataA.getDate() - dataB.getDate();
  });
};

export const isAniversariante = (cliente: Cliente) => {
  if (!cliente.dataNascimento) return false;
  
  const hoje = new Date();
  const dataNascimento = new Date(cliente.dataNascimento);
  
  return hoje.getMonth() === dataNascimento.getMonth() &&
         hoje.getDate() === dataNascimento.getDate();
};