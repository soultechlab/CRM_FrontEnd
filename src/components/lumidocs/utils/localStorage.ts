// Storage service - preparado para migração futura para API
export const storage = {
  // Clientes
  getClientes: async (): Promise<Cliente[]> => {
    // TODO: Substituir por API call quando backend estiver pronto
    // return fetch('/api/clientes').then(res => res.json());
    const clientes = localStorage.getItem('lumidocs_clientes');
    return clientes ? JSON.parse(clientes) : [];
  },

  setClientes: async (clientes: Cliente[]): Promise<void> => {
    // TODO: Substituir por API call quando backend estiver pronto
    // return fetch('/api/clientes', { method: 'POST', body: JSON.stringify(clientes) });
    localStorage.setItem('lumidocs_clientes', JSON.stringify(clientes));
  },

  addCliente: async (cliente: Cliente): Promise<Cliente> => {
    // TODO: Substituir por API call quando backend estiver pronto
    // return fetch('/api/clientes', { method: 'POST', body: JSON.stringify(cliente) });
    const clientes = await storage.getClientes();
    clientes.push(cliente);
    await storage.setClientes(clientes);
    return cliente;
  },

  // Documentos
  getDocumentos: async (): Promise<Documento[]> => {
    // TODO: Substituir por API call quando backend estiver pronto
    // return fetch('/api/documentos').then(res => res.json());
    const documentos = localStorage.getItem('lumidocs_documentos');
    return documentos ? JSON.parse(documentos) : [];
  },

  setDocumentos: async (documentos: Documento[]): Promise<void> => {
    // TODO: Substituir por API call quando backend estiver pronto
    // return fetch('/api/documentos', { method: 'POST', body: JSON.stringify(documentos) });
    localStorage.setItem('lumidocs_documentos', JSON.stringify(documentos));
  },

  addDocumento: async (documento: Documento): Promise<Documento> => {
    // TODO: Substituir por API call quando backend estiver pronto
    // return fetch('/api/documentos', { method: 'POST', body: JSON.stringify(documento) });
    const documentos = await storage.getDocumentos();
    documentos.push(documento);
    await storage.setDocumentos(documentos);
    return documento;
  },

  updateDocumento: async (id: string, documento: Partial<Documento>): Promise<Documento> => {
    // TODO: Substituir por API call quando backend estiver pronto
    // return fetch(`/api/documentos/${id}`, { method: 'PUT', body: JSON.stringify(documento) });
    const documentos = await storage.getDocumentos();
    const index = documentos.findIndex(d => d.id === id);
    if (index !== -1) {
      documentos[index] = { ...documentos[index], ...documento };
      await storage.setDocumentos(documentos);
      return documentos[index];
    }
    throw new Error('Documento não encontrado');
  },

  // Modelos
  getModelos: async (): Promise<Modelo[]> => {
    // TODO: Substituir por API call quando backend estiver pronto
    // return fetch('/api/modelos').then(res => res.json());
    const modelos = localStorage.getItem('lumidocs_modelos');
    return modelos ? JSON.parse(modelos) : [];
  },

  setModelos: async (modelos: Modelo[]): Promise<void> => {
    // TODO: Substituir por API call quando backend estiver pronto
    // return fetch('/api/modelos', { method: 'POST', body: JSON.stringify(modelos) });
    localStorage.setItem('lumidocs_modelos', JSON.stringify(modelos));
  },

  addModelo: async (modelo: Modelo): Promise<Modelo> => {
    // TODO: Substituir por API call quando backend estiver pronto
    // return fetch('/api/modelos', { method: 'POST', body: JSON.stringify(modelo) });
    const modelos = await storage.getModelos();
    modelos.push(modelo);
    await storage.setModelos(modelos);
    return modelo;
  }
};

// Funções síncronas para compatibilidade (serão removidas quando migrar para API)
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
  type: 'assinatura' | 'nome' | 'email' | 'cpf';
  position: {
    x: number;
    y: number;
    page: number;
  };
  width: number;
  height: number;
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