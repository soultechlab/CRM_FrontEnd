export interface Transacao {
  id: string;
  tipo: 'receita' | 'despesa';
  categoria: string;
  descricao: string;
  valor: number;
  data: string;
  recorrente: boolean;
  frequencia?: 'mensal' | 'unica';
  status: 'pago' | 'pendente';
  formaPagamento?: string;
  clienteId?: string;
  cliente?: {
    id: string;
    nome: string;
    email?: string;
  };
  agendamentoId?: string;
  parcelaInfo?: {
    total: number;
    numero: number;
    transacaoOriginalId: string;
  };
}

export interface Parcela {
  numero: number;
  valor: number;
  dataVencimento: string;
  status: 'pendente' | 'pago';
  transacaoId?: string;
}

export interface CategoriaFinanceira {
  id: string;
  nome: string;
  tipo: 'receita' | 'despesa';
  cor: string;
}

export interface ResumoFinanceiro {
  receitaTotal: number;
  despesaTotal: number;
  saldoLiquido: number;
  receitasPendentes: number;
  despesasPendentes: number;
  comparativoMesAnterior: {
    receitas: number;
    despesas: number;
    percentualVariacao: number;
  };
}