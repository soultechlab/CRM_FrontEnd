export const storage = {
  getClientes: async (): Promise<Cliente[]> => {
    const clientes = localStorage.getItem('lumidocs_clientes');
    return clientes ? JSON.parse(clientes) : [];
  },

  setClientes: async (clientes: Cliente[]): Promise<void> => {
    localStorage.setItem('lumidocs_clientes', JSON.stringify(clientes));
  },

  addCliente: async (cliente: Cliente): Promise<Cliente> => {
    const clientes = await storage.getClientes();
    clientes.push(cliente);
    await storage.setClientes(clientes);
    return cliente;
  },

  getDocumentos: async (): Promise<Documento[]> => {
    const documentos = localStorage.getItem('lumidocs_documentos');
    return documentos ? JSON.parse(documentos) : [];
  },

  setDocumentos: async (documentos: Documento[]): Promise<void> => {
    localStorage.setItem('lumidocs_documentos', JSON.stringify(documentos));
  },

  addDocumento: async (documento: Documento): Promise<Documento> => {
    const documentos = await storage.getDocumentos();
    documentos.push(documento);
    await storage.setDocumentos(documentos);
    return documento;
  },

  updateDocumento: async (id: string, documento: Partial<Documento>): Promise<Documento> => {
    const documentos = await storage.getDocumentos();
    const index = documentos.findIndex(d => d.id === id);
    if (index !== -1) {
      documentos[index] = { ...documentos[index], ...documento };
      await storage.setDocumentos(documentos);
      return documentos[index];
    }
    throw new Error('Documento não encontrado');
  },

  getModelos: async (): Promise<Modelo[]> => {
    const modelos = localStorage.getItem('lumidocs_modelos');
    return modelos ? JSON.parse(modelos) : [];
  },

  setModelos: async (modelos: Modelo[]): Promise<void> => {
    localStorage.setItem('lumidocs_modelos', JSON.stringify(modelos));
  },

  addModelo: async (modelo: Modelo): Promise<Modelo> => {
    const modelos = await storage.getModelos();
    modelos.push(modelo);
    await storage.setModelos(modelos);
    return modelo;
  }
};

export const syncStorage = {
  getClientes: (): Cliente[] => {
    const clientes = localStorage.getItem('lumidocs_clientes');
    return clientes ? JSON.parse(clientes) : [];
  },
  getDocumentos: (): Documento[] => {
    const documentos = localStorage.getItem('lumidocs_documentos');
    return documentos ? JSON.parse(documentos) : [];
  },
  getModelos: (): Modelo[] => {
    const modelos = localStorage.getItem('lumidocs_modelos');
    return modelos ? JSON.parse(modelos) : [];
  }
};

export type Cliente = {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  created_at: string;
};

export type SignatureField = {
  type: 'assinatura' | 'nome' | 'email' | 'cpf' | 'customizado';
  position: {
    x: number;
    y: number;
    page: number;
  };
  width: number;
  height: number;
  customText?: string; // Para campos customizados
};

export type Documento = {
  id: string;
  nome: string;
  arquivo_url: string;
  status: 'aguardando_envio' | 'aguardando_assinatura' | 'assinado';
  created_at: string;
  assinantes: Cliente[];
  signatureFields?: Record<string, SignatureField[]>;
};

export type Modelo = {
  id: string;
  nome: string;
  categoria: 'contrato' | 'permuta' | 'eventos' | 'ensaios' | 'outros';
  arquivo_url: string;
  created_at: string;
};