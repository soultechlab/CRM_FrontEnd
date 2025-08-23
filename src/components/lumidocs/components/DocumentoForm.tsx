import React, { useState, useEffect } from 'react';
import { Search, X, FileText, Plus } from 'lucide-react';
import { Cliente as LocalCliente, SignatureField } from '../utils/localStorage';
import { BackendDocument } from '../../../types';
import '../utils/pdfConfig';
import { PdfViewer } from './PdfViewer';
import { criarDocumento, CreateDocumentData, SignerData, obterClientes, Cliente, testarConectividadeAPI } from '../../../services/apiService';
import { fillPdfWithData, loadPdfFromUrl, createFileFromBlob, createBlobFromUint8Array } from '../utils/pdfRenderer';

interface TemplateFile extends File {
  isTemplate?: boolean;
  templateUrl?: string;
}
import { useAuth } from '../../../contexts/AuthContext';
import { AddClientInline } from './AddClientInline';

interface DocumentoFormProps {
  initialData?: BackendDocument;
  initialFile?: File;
  onSubmit: (documento: BackendDocument) => void;
}

export function DocumentoForm({ initialData, initialFile, onSubmit }: DocumentoFormProps) {
  const { user } = useAuth();
  const [nome, setNome] = useState(initialData?.name || '');
  const [arquivo, setArquivo] = useState<TemplateFile | null>(initialFile || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientes, setSelectedClientes] = useState<Array<{
    cliente: Cliente;
    fields: SignatureField[];
  }>>([]);
  const [previewUrl, setPreviewUrl] = useState<string>(initialData?.storage_url || '');
  const [currentClienteIndex, setCurrentClienteIndex] = useState<number | null>(null);
  const [fieldType, setFieldType] = useState<'nome' | 'email' | 'cpf' | 'customizado'>('nome');
  const [customText, setCustomText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isUniversal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddClientForm, setShowAddClientForm] = useState(false);

  useEffect(() => {
    const loadClientes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!user) {
          setError('Usuário não autenticado');
          return;
        }
        
        const clientesData = await obterClientes(user);
        setClientes(clientesData);
        
        if (initialData?.signers) {
          const initialSigners = initialData.signers.map(signer => ({
            cliente: {
              id: signer.id.toString(),
              nome: signer.signer_name,
              email: signer.signer_email,
              cpf: signer.signer_cpf || '',
              telefone: '',
              endereco: '',
              observacoes: '',
              ativo: true,
              data_nascimento: '',
              tipo_servico: '',
              valor_sessao: 0,
              created_at: ''
            },
            fields: []
          }));
          setSelectedClientes(initialSigners);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar clientes';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadClientes();
    } else {
      setLoading(false);
      setError('Aguardando autenticação...');
    }
  }, [user, initialData]);

  useEffect(() => {
    if (initialFile) {
      setArquivo(initialFile);
    }
  }, [initialFile]);

  useEffect(() => {
    if (initialData?.storage_url && !initialFile && !arquivo) {
      const fileName = `${initialData.name.replace(/[^a-zA-Z0-9\s]/g, '_')}.pdf`;
      const mockFile = new File([''], fileName, { type: 'application/pdf' }) as TemplateFile;
      mockFile.isTemplate = true;
      mockFile.templateUrl = initialData.storage_url;
      setArquivo(mockFile);
    }
  }, [initialData, initialFile, arquivo]);

  const filteredClientes = clientes.filter(cliente => 
    !selectedClientes.find(sc => sc.cliente.id === cliente.id) &&
    (cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
     cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (cliente.cpf && cliente.cpf.includes(searchTerm)))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const submitter = (e.nativeEvent as SubmitEvent)?.submitter as HTMLButtonElement;
    
    if (!submitter || submitter.id !== 'submit-document-button') {
      return;
    }
    
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      if (!nome.trim()) {
        setError('Por favor, insira o nome do documento');
        return;
      }

      if (!arquivo && !previewUrl) {
        setError('Por favor, selecione um arquivo PDF');
        return;
      }

      if (selectedClientes.length === 0) {
        setError('Por favor, adicione pelo menos um assinante');
        return;
      }

      // Validação específica para campos não preenchidos
      const clientesSemCampos = selectedClientes.filter(sc => sc.fields.length === 0);
      if (clientesSemCampos.length > 0) {
        const nomesClientes = clientesSemCampos.map(sc => sc.cliente.nome).join(', ');
        setError(`Os seguintes clientes precisam ter campos definidos: ${nomesClientes}. Clique em "Definir Campos" para cada cliente e posicione os campos no documento antes de salvar.`);
        return;
      }

      const apiConnected = await testarConectividadeAPI(user);
      if (!apiConnected) {
        setError('Não foi possível conectar com o servidor. Verifique se a API está rodando em http://localhost:8080');
        return;
      }

      // Preparar dados dos assinantes para preenchimento do PDF
      const signersForPdfFill = selectedClientes.map(sc => ({
        nome: sc.cliente.nome,
        email: sc.cliente.email,
        cpf: sc.cliente.cpf || '',
        fields: sc.fields.map(field => ({
          ...field,
          value: field.type === 'nome' ? sc.cliente.nome : 
                 field.type === 'email' ? sc.cliente.email :
                 field.type === 'cpf' ? sc.cliente.cpf || '' :
                 field.type === 'customizado' ? (field as any).customText || '' : ''
        }))
      }));

      // Dados para envio ao backend (excluir campos customizados, pois já foram processados no PDF)
      const signersData: SignerData[] = selectedClientes
        .map(sc => ({
          name: sc.cliente.nome,
          email: sc.cliente.email,
          cpf: sc.cliente.cpf || undefined,
          fields: sc.fields
            .filter(field => field.type !== 'customizado') // Excluir campos customizados (já processados no PDF)
            .map(field => ({
              type: field.type,
              page: field.position.page,
              x: field.position.x,
              y: field.position.y,
              width: field.width,
              height: field.height
            }))
        }))
        .filter(signer => signer.fields.length > 0); // Remover assinantes sem campos válidos

      let finalFile = arquivo;
      
      try {
        let pdfBuffer: ArrayBuffer;
        
        if (arquivo && arquivo.isTemplate && arquivo.templateUrl) {
          pdfBuffer = await loadPdfFromUrl(arquivo.templateUrl);
        } else if (arquivo) {
          pdfBuffer = await arquivo.arrayBuffer();
        } else {
          throw new Error('Nenhum arquivo PDF disponível');
        }
        
        // Preencher PDF com dados dos campos dinâmicos
        const filledPdfData = await fillPdfWithData(pdfBuffer, signersForPdfFill);
        const filledPdfBlob = createBlobFromUint8Array(filledPdfData);
        
        // Criar arquivo final com dados preenchidos
        const fileName = arquivo?.name || `${nome.replace(/[^a-zA-Z0-9\s]/g, '_')}.pdf`;
        finalFile = createFileFromBlob(filledPdfBlob, fileName);
        
      } catch (pdfError) {
        setError(`Erro ao processar PDF: ${pdfError instanceof Error ? pdfError.message : 'Erro desconhecido'}`);
        return;
      }

      const documentData: CreateDocumentData = {
        name: nome.trim(),
        client_id: selectedClientes[0]?.cliente?.id ? parseInt(selectedClientes[0].cliente.id) : undefined,
        file: finalFile!,
        is_active: true,
        is_universal: false,
        signers: signersData.length > 0 ? signersData : undefined // Não enviar array vazio
      };
      
      if (finalFile) {
        // Verificar se o arquivo não está corrompido
        if (finalFile.size === 0) {
          setError('Arquivo PDF processado está vazio. Tente novamente.');
          return;
        }
        
        if (finalFile.size > 10 * 1024 * 1024) { // 10MB
          setError('Arquivo PDF muito grande após processamento (>10MB). Simplifique o documento.');
          return;
        }
        
        // Testar se o arquivo é um PDF válido lendo os primeiros bytes
        try {
          const firstBytes = await finalFile.slice(0, 8).arrayBuffer();
          const bytes = new Uint8Array(firstBytes);
          const pdfHeader = Array.from(bytes.slice(0, 4)).map(b => String.fromCharCode(b)).join('');
          
          if (pdfHeader !== '%PDF') {
            setError('Arquivo processado não é um PDF válido. Tente novamente.');
            return;
          }
        } catch (headerError) {
          setError('Erro ao validar arquivo processado. Tente novamente.');
          return;
        }
        
        try {
          const createdDocument = await criarDocumento(documentData, user);
          onSubmit(createdDocument);
        } catch (apiError) {
          throw apiError;
        }
      } else {
        setError('Arquivo é obrigatório para criar documento');
        return;
      }

    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('HTML')) {
          setError('Erro no servidor. A API pode não estar funcionando corretamente. Contate o suporte.');
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          setError('Erro de conexão. Verifique sua internet e tente novamente.');
        } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
          setError('Sessão expirada. Faça login novamente.');
        } else if (error.message.includes('400') || error.message.includes('validation')) {
          setError('Dados inválidos. Verifique os campos e tente novamente.');
        } else if (error.message.includes('413') || error.message.includes('size')) {
          setError('Arquivo muito grande. Tamanho máximo: 5MB.');
        } else if (error.message.includes('500')) {
          setError('Erro interno do servidor. Tente novamente em alguns minutos.');
        } else if (error.message.includes('404')) {
          setError('Endpoint não encontrado. Verifique se a API está configurada corretamente.');
        } else {
          setError(`Erro ao salvar documento: ${error.message}`);
        }
      } else {
        setError('Erro inesperado ao salvar documento. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('O arquivo deve ter no máximo 5MB');
        e.target.value = '';
        return;
      }
      if (file.type !== 'application/pdf') {
        setError('Apenas arquivos PDF são permitidos');
        e.target.value = '';
        return;
      }
      setArquivo(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setError(null);
    }
  };

  const handleAddCliente = (cliente: Cliente) => {
    setSelectedClientes([...selectedClientes, { cliente, fields: [] }]);
    setSearchTerm('');
  };

  const handleClientAdded = async (novoCliente: LocalCliente) => {
    setClientes(prev => {
      const clienteExiste = prev.some(c => c.id === novoCliente.id);
      if (clienteExiste) {
        return prev;
      }
      return [...prev, novoCliente];
    });
    
    setTimeout(async () => {
      try {
        const clientesAtualizados = await obterClientes(user);
        setClientes(clientesAtualizados);
      } catch (error) {
        setError('Erro ao recarregar lista de clientes');
      }
    }, 1000);
    
    handleAddCliente(novoCliente);
    setShowAddClientForm(false);
  };

  const handleRemoveCliente = (clienteId: string) => {
    setSelectedClientes(selectedClientes.filter(sc => sc.cliente.id !== clienteId));
    if (currentClienteIndex !== null) {
      const newIndex = selectedClientes.findIndex(sc => sc.cliente.id === clienteId);
      if (newIndex === currentClienteIndex) {
        setCurrentClienteIndex(null);
      } else if (newIndex < currentClienteIndex) {
        setCurrentClienteIndex(currentClienteIndex - 1);
      }
    }
  };

  const handleAddField = (position: { x: number; y: number; page: number }) => {
    if (currentClienteIndex === null || !selectedClientes[currentClienteIndex]) return;
    
    const newSelectedClientes = [...selectedClientes];
    const fieldWidth = 20;
    const fieldHeight = 5;
    
    const margin = 3;
    const allFields = newSelectedClientes.flatMap((sc, index) => 
      sc.fields.map(field => ({ ...field, signerIndex: index }))
    );
    
    const isOverlapping = allFields.some(field => {
      if (field.position.page !== position.page) return false;
      
      const fieldRight = field.position.x + field.width + margin;
      const fieldBottom = field.position.y + field.height + margin;
      const newFieldRight = position.x + fieldWidth + margin;
      const newFieldBottom = position.y + fieldHeight + margin;
      const fieldLeft = field.position.x - margin;
      const fieldTop = field.position.y - margin;
      const newFieldLeft = position.x - margin;
      const newFieldTop = position.y - margin;

      return !(newFieldLeft > fieldRight ||
               newFieldRight < fieldLeft ||
               newFieldTop > fieldBottom ||
               newFieldBottom < fieldTop);
    });

    if (isOverlapping) {
      setError('Os campos precisam ter um espaçamento mínimo entre si. Por favor, escolha outra posição.');
      return;
    }

    let adjustedPosition = { ...position };
    if (position.x + fieldWidth > 100) {
      adjustedPosition.x = 100 - fieldWidth;
    }
    if (position.y + fieldHeight > 100) {
      adjustedPosition.y = 100 - fieldHeight;
    }


    const newField: SignatureField = {
      type: fieldType,
      position: adjustedPosition,
      width: fieldWidth,
      height: fieldHeight
    };

    // Adicionar texto customizado se for campo customizado
    if (fieldType === 'customizado') {
      (newField as any).customText = customText;
    }

    newSelectedClientes[currentClienteIndex].fields.push(newField);
    
    setSelectedClientes(newSelectedClientes);
  };

  const getSuggestedPosition = (basePosition: { x: number; y: number }, index: number, fieldWidth: number, fieldHeight: number) => {
    const margin = 3;
    const positions = [
      { x: basePosition.x, y: basePosition.y + fieldHeight + margin },
      { x: basePosition.x + fieldWidth + margin, y: basePosition.y },
      { x: basePosition.x, y: basePosition.y - 5 - margin },
      { x: basePosition.x - 20 - margin, y: basePosition.y }
    ];

    return positions[index % positions.length];
  };

  const isPositionOverlapping = (position: { x: number; y: number }, width: number, height: number, allFields: any[], page: number, margin: number) => {
    return allFields.some(field => {
      if (field.position.page !== page) return false;
      
      const fieldRight = field.position.x + field.width + margin;
      const fieldBottom = field.position.y + field.height + margin;
      const newFieldRight = position.x + width + margin;
      const newFieldBottom = position.y + height + margin;
      const fieldLeft = field.position.x - margin;
      const fieldTop = field.position.y - margin;
      const newFieldLeft = position.x - margin;
      const newFieldTop = position.y - margin;

      return !(newFieldLeft > fieldRight ||
               newFieldRight < fieldLeft ||
               newFieldTop > fieldBottom ||
               newFieldBottom < fieldTop);
    });
  };

  const handleDeleteField = (fieldIndex: number) => {
    if (currentClienteIndex === null || !selectedClientes[currentClienteIndex]) return;
    
    const newSelectedClientes = [...selectedClientes];
    if (newSelectedClientes[currentClienteIndex]?.fields) {
      newSelectedClientes[currentClienteIndex].fields.splice(fieldIndex, 1);
      setSelectedClientes(newSelectedClientes);
    }
  };

  const handleMoveField = (fieldIndex: number, newPosition: { x: number; y: number }) => {
    if (currentClienteIndex === null || !selectedClientes[currentClienteIndex]) return;
    
    const newSelectedClientes = [...selectedClientes];
    const field = newSelectedClientes[currentClienteIndex]?.fields?.[fieldIndex];
    if (field) {
      field.position = { ...field.position, x: newPosition.x, y: newPosition.y };
      setSelectedClientes(newSelectedClientes);
    }
  };

  const getFieldColor = (clienteIndex: number) => {
    const colors = [
      'rgb(239 68 68)',
      'rgb(34 197 94)',
      'rgb(59 130 246)',
      'rgb(168 85 247)',
      'rgb(234 179 8)',
      'rgb(236 72 153)',
      'rgb(14 165 233)',
      'rgb(99 102 241)'
    ];
    return colors[clienteIndex % colors.length];
  };

  const getAllSignerFields = () => {
    return selectedClientes.map((sc, index) => ({
      fields: sc.fields,
      color: getFieldColor(index),
      assinanteIndex: index
    }));
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Erro</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Documento</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Digite o nome do documento"
            required
          />
        </div>

        {!initialData && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Arquivo (PDF até 5MB)</label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required={!initialData}
            />
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">Adicionar Assinantes</label>
            {!showAddClientForm && (
              <button
                type="button"
                onClick={() => setShowAddClientForm(true)}
                className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
              >
                <Plus className="h-4 w-4 mr-1" />
                Novo Cliente
              </button>
            )}
          </div>
          
          {!showAddClientForm && (
            <>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nome, email ou CPF..."
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              </div>
              
              {searchTerm && (
                <div className="mt-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md bg-white shadow-sm">
                  {filteredClientes.map((cliente) => (
                    <button
                      key={cliente.id}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddCliente(cliente);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">{cliente.nome}</div>
                      <div className="text-sm text-gray-500">{cliente.email}</div>
                      <div className="text-sm text-gray-500">CPF: {cliente.cpf}</div>
                    </button>
                  ))}
                  {filteredClientes.length === 0 && (
                    <div className="p-4 text-center text-gray-500">
                      Nenhum cliente encontrado
                      <button
                        type="button"
                        onClick={() => setShowAddClientForm(true)}
                        className="block mt-2 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        + Adicionar novo cliente
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
          
          {showAddClientForm && (
            <AddClientInline
              onClientAdded={handleClientAdded}
              onCancel={() => setShowAddClientForm(false)}
            />
          )}
        </div>

        {selectedClientes.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Assinantes Selecionados</h3>
            {selectedClientes.map((sc, index) => (
              <div
                key={sc.cliente.id}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  currentClienteIndex === index
                    ? 'border-blue-500 bg-blue-50'
                    : sc.fields.length === 0
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getFieldColor(index) }}
                    />
                    <div>
                      <div className="font-medium text-gray-900">{sc.cliente.nome}</div>
                      <div className="text-sm text-gray-500">{sc.cliente.email}</div>
                      <div className="text-sm flex items-center">
                        <span className={sc.fields.length === 0 ? 'text-red-600' : 'text-gray-500'}>
                          Campos definidos: {sc.fields.length}
                        </span>
                        {sc.fields.length > 0 ? (
                          <span className="ml-2 text-green-600">✓ Configurado</span>
                        ) : (
                          <span className="ml-2 text-red-600 font-medium">⚠ Necessário definir campos</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentClienteIndex(
                          currentClienteIndex === index ? null : index
                        );
                      }}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        currentClienteIndex === index
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {currentClienteIndex === index ? 'Concluir' : 'Definir Campos'}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemoveCliente(sc.cliente.id);
                      }}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {previewUrl && currentClienteIndex !== null && selectedClientes[currentClienteIndex] && (
          <div className="border-t pt-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Definir campos para{' '}
                <span style={{ color: getFieldColor(currentClienteIndex) }}>
                  {selectedClientes[currentClienteIndex]?.cliente?.nome || 'Cliente'}
                </span>
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                
                <button
                  type="button"
                  onClick={() => setFieldType('nome')}
                  disabled={!selectedClientes[currentClienteIndex]?.cliente?.nome}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    fieldType === 'nome'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${!selectedClientes[currentClienteIndex]?.cliente?.nome ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Nome (Auto-preenchido)
                </button>
                <button
                  type="button"
                  onClick={() => setFieldType('email')}
                  disabled={!selectedClientes[currentClienteIndex]?.cliente?.email}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    fieldType === 'email'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${!selectedClientes[currentClienteIndex]?.cliente?.email ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Email (Auto-preenchido)
                </button>
                <button
                  type="button"
                  onClick={() => setFieldType('cpf')}
                  disabled={!selectedClientes[currentClienteIndex]?.cliente?.cpf}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    fieldType === 'cpf'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${!selectedClientes[currentClienteIndex]?.cliente?.cpf ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  CPF (Auto-preenchido)
                </button>
                <button
                  type="button"
                  onClick={() => setFieldType('customizado')}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    fieldType === 'customizado'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Texto Customizado
                </button>
              </div>
              
              {fieldType === 'customizado' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texto Customizado
                  </label>
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Digite o texto que aparecerá no PDF"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Este texto será inserido diretamente no PDF na posição que você clicar
                  </p>
                </div>
              )}
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Como funciona:</strong> Clique no documento para adicionar campos. Os campos de nome, email e CPF (caso exista no cadastro do cliente) são preenchidos automaticamente. Use "Texto Customizado" para inserir qualquer texto fixo no documento. A Autentique adiciona a assinatura digital automaticamente no final.
                </p>
              </div>
            </div>

            <div 
              className="relative bg-gray-50 rounded-lg p-4"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
            >
              <PdfViewer
                pdfUrl={previewUrl}
                onPositionSelect={handleAddField}
                onDeleteField={handleDeleteField}
                onMoveField={handleMoveField}
                fields={selectedClientes[currentClienteIndex]?.fields?.map(field => ({
                  ...field,
                  color: getFieldColor(currentClienteIndex)
                })) || []}
                allSignerFields={getAllSignerFields()}
                previewData={{
                  nome: selectedClientes[currentClienteIndex]?.cliente?.nome || '',
                  email: selectedClientes[currentClienteIndex]?.cliente?.email || '',
                  cpf: selectedClientes[currentClienteIndex]?.cliente?.cpf || '',
                  assinatura: '',
                  assinanteIndex: currentClienteIndex
                }}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-6 border-t">
          <button
            id="submit-document-button"
            type="submit"
            disabled={
              isSubmitting || 
              selectedClientes.some(sc => sc.fields.length === 0)
            }
            className={`px-6 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 font-medium transition-colors ${
              selectedClientes.some(sc => sc.fields.length === 0) && selectedClientes.length > 0
                ? 'bg-red-100 text-red-700 border-red-300 cursor-not-allowed border'
                : isSubmitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
            }`}
            title={
              selectedClientes.some(sc => sc.fields.length === 0) && selectedClientes.length > 0
                ? 'Defina os campos para todos os clientes antes de salvar'
                : ''
            }
          >
            {isSubmitting ? 'Salvando...' : 
             selectedClientes.some(sc => sc.fields.length === 0) && selectedClientes.length > 0 ? 'Definir Campos Primeiro' :
             (initialData ? 'Salvar Alterações' : 'Cadastrar Documento')}
          </button>
        </div>
      </form>
    </div>
  );
}
