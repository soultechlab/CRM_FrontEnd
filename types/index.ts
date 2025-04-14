export interface Cliente {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  instagram?: string;
  facebook?: string;
  indicadoPor?: string;
  profissao?: string;
  dataNascimento?: string;
  origem: string[];
  canalPrincipal?: string;
  endereco?: {
    rua?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
  };
  preferencias?: {
    tiposFotografia?: string[];
    locaisPreferidos?: string[];
    melhorHorario?: string;
    restricoesHorario?: string;
  };
  historico?: {
    ultimaSessao?: string;
    totalSessoes?: number;
    proximoAgendamento?: string;
    valorTotalGasto?: number;
  };
  observacoes?: string;
  tiposServico?: string[];
  dataCadastro: string;
  proximoAgendamento?: Agendamento;
  ultimoAgendamento?: Agendamento;
  totalGasto?: number;
  status: 'ativo' | 'inativo' | 'prospecto';
}

export interface Agendamento {
  id: string | number,
  clienteId: string | number;
  cliente: Cliente;
  data: string;
  hora: string;
  tipo: string;
  local: string;
  valor: number | null;
  observacoes: string | null;
  dataCadastro: string | null;
}