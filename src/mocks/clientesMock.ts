import { Cliente } from "../types";

export const clientesMock: Cliente[] = [
  {
    id: '1',
    nome: 'Maria Silva',
    email: 'maria@email.com',
    telefone: '(11) 98765-4321',
    instagram: '@mariasilva',
    facebook: 'mariasilva',
    indicadoPor: 'João Santos',
    profissao: 'Empresária',
    origem: ['instagram', 'indicacao'],
    tiposServico: ['recorrente', 'trimestral'],
    dataCadastro: '2024-03-01',
    status: 'ativo',
    historico: {
      ultimaSessao: '2024-02-15',
      totalSessoes: 3,
      valorTotalGasto: 2500
    }
  },
  {
    id: '2',
    nome: 'João Santos',
    email: 'joao@email.com',
    telefone: '(11) 97654-3210',
    instagram: '@joaosantos',
    origem: ['facebook'],
    tiposServico: ['unico'],
    dataCadastro: '2024-02-15',
    status: 'ativo',
    historico: {
      ultimaSessao: '2024-02-20',
      totalSessoes: 1,
      valorTotalGasto: 800
    }
  },
  {
    id: '3',
    nome: 'Ana Oliveira',
    email: 'ana@email.com',
    telefone: '(11) 96543-2109',
    instagram: '@anaoliveira',
    origem: ['google'],
    tiposServico: ['anual'],
    dataCadastro: '2024-01-10',
    status: 'prospecto',
    historico: {
      totalSessoes: 0,
      valorTotalGasto: 0
    }
  }
];