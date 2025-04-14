export const storage = {
  getClientes: (): Cliente[] => {
    const clientes = localStorage.getItem('clientes');
    return clientes ? JSON.parse(clientes) : [];
  },

  setClientes: (clientes: Cliente[]) => {
    localStorage.setItem('clientes', JSON.stringify(clientes));
  },

  getDocumentos: (): Documento[] => {
    const documentos = localStorage.getItem('documentos');
    return documentos ? JSON.parse(documentos) : [];
  },

  setDocumentos: (documentos: Documento[]) => {
    localStorage.setItem('documentos', JSON.stringify(documentos));
  },

  getModelos: (): Modelo[] => {
    const modelos = localStorage.getItem('modelos');
    return modelos ? JSON.parse(modelos) : [];
  },

  setModelos: (modelos: Modelo[]) => {
    localStorage.setItem('modelos', JSON.stringify(modelos));
  }
};

export type Cliente = {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  created_at: string;
};

export type Documento = {
  id: string;
  nome: string;
  arquivo_url: string;
  status: 'aguardando_envio' | 'aguardando_assinatura' | 'assinado';
  created_at: string;
  assinantes: Cliente[];
};

export type Modelo = {
  id: string;
  nome: string;
  categoria: 'contrato' | 'permuta' | 'eventos' | 'ensaios' | 'outros';
  arquivo_url: string;
  created_at: string;
};