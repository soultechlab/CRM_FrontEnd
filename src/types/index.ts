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

export interface BackendDocument {
  id: string | number;
  name: string;
  status: 'draft' | 'pending_signature' | 'signed' | 'rejected' | 'archived';
  storage_url: string;
  signed_document_url?: string;
  autentique_document_id?: string;
  autentique_document_url?: string;
  created_at: string;
  updated_at: string;
  send_status?: 'success' | 'failed' | 'pending';
  send_error_message?: string;
  last_send_attempt?: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  client?: {
    id: number;
    name: string;
    email: string;
  };
  signers: Array<{
    id: number;
    signer_name: string;
    signer_email: string;
    signer_cpf?: string;
    signer_status: 'signed' | 'pending' | 'rejected';
    signature_url?: string;
    autentique_signer_id?: string;
    signed_at?: string | null;
  }>;
}

export interface DocumentStatusResponse {
  success: boolean;
  data: {
    local_status: 'signed' | 'pending_signature' | 'draft' | 'rejected' | 'archived';
    autentique_status: 'completed' | 'pending' | 'signed' | 'in_progress';
    all_signed: boolean;
    document: BackendDocument;
    updated_signers: number;
    autentique_data: any;
  };
  message: string;
}