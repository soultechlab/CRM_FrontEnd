import { Cliente } from '../types';

interface OrigemStats {
  origem: string;
  quantidade: number;
  percentual: number;
}

const ORIGEM_LABELS: Record<string, string> = {
  'facebook': 'Facebook',
  'instagram': 'Instagram',
  'google': 'Google',
  'indicacao': 'Indicação',
  'site': 'Site',
  'outros': 'Outros'
};

export const analisarOrigensClientes = (clientes: Cliente[]): OrigemStats[] => {
  // Contar clientes por origem
  const contagem = clientes.reduce((acc, cliente) => {
    cliente.origem.forEach(origem => {
      acc[origem] = (acc[origem] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  // Calcular percentuais e ordenar
  const total = clientes.length;
  const stats = Object.entries(contagem).map(([origem, quantidade]) => ({
    origem: ORIGEM_LABELS[origem] || origem,
    quantidade,
    percentual: (quantidade / total) * 100
  }));

  // Ordenar por quantidade e pegar os top 3
  return stats.sort((a, b) => b.quantidade - a.quantidade).slice(0, 3);
};

export const contarClientesNovosMes = (clientes: Cliente[]) => {
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();
  const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1;
  const anoAnterior = mesAtual === 0 ? anoAtual - 1 : anoAtual;

  // Clientes do mês atual
  const clientesMesAtual = clientes.filter(cliente => {
    const data = new Date(cliente.dataCadastro);
    return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
  });

  // Clientes do mês anterior
  const clientesMesAnterior = clientes.filter(cliente => {
    const data = new Date(cliente.dataCadastro);
    return data.getMonth() === mesAnterior && data.getFullYear() === anoAnterior;
  });

  // Calcular crescimento percentual
  const percentualCrescimento = clientesMesAnterior.length === 0 ? 0 :
    ((clientesMesAtual.length - clientesMesAnterior.length) / clientesMesAnterior.length) * 100;

  return {
    total: clientesMesAtual.length,
    percentualCrescimento
  };
};

export const contarClientesAno = (clientes: Cliente[]): number => {
  const anoAtual = new Date().getFullYear();
  return clientes.filter(cliente => {
    const data = new Date(cliente.dataCadastro);
    return data.getFullYear() === anoAtual;
  }).length;
};