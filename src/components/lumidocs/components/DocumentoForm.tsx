import React, { useState, useEffect } from 'react';
import { Search, X, FileText } from 'lucide-react';
import { Cliente, SignatureField } from '../utils/localStorage';
// Importar configuração do PDF antes do PdfViewer
import '../utils/pdfConfig';
import { PdfViewer } from './PdfViewer';
import { criarDocumento, CreateDocumentData, SignerData, obterClientes } from '../../../services/apiService';
import { useAuth } from '../../../contexts/AuthContext';

interface BackendDocument {
  id: string;
  name: string;
  status: 'draft' | 'pending_signature' | 'signed' | 'rejected';
  storage_url: string;
  signed_document_url?: string;
  autentique_document_id?: string;
  created_at: string;
  updated_at: string;
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
    signer_status: string;
    signature_url?: string;
    autentique_signer_id?: string;
  }>;
}

interface DocumentoFormProps {
  initialData?: BackendDocument;
  onSubmit: (documento: BackendDocument) => void;
}

export function DocumentoForm({ initialData, onSubmit }: DocumentoFormProps) {
  const { user } = useAuth();
  const [nome, setNome] = useState(initialData?.name || '');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientes, setSelectedClientes] = useState<Array<{
    cliente: Cliente;
    fields: SignatureField[];
  }>>([]);
  const [previewUrl, setPreviewUrl] = useState<string>(initialData?.storage_url || '');
  const [currentClienteIndex, setCurrentClienteIndex] = useState<number | null>(null);
  const [fieldType, setFieldType] = useState<'assinatura' | 'nome' | 'email' | 'cpf'>('assinatura');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>(initialData?.client?.id?.toString() || '');
  const [isUniversal, setIsUniversal] = useState(!initialData?.client);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadClientes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Loading clients, user:', user ? 'authenticated' : 'not authenticated');
        console.log('User token exists:', !!user?.token);
        
        if (!user) {
          setError('Usuário não autenticado');
          return;
        }
        
        const clientesData = await obterClientes(user);
        console.log('Clients loaded successfully:', clientesData?.length);
        setClientes(clientesData);
        
        // Initialize signers if editing existing document
        if (initialData?.signers) {
          const initialSigners = initialData.signers.map(signer => ({
            cliente: {
              id: signer.id.toString(),
              nome: signer.signer_name,
              email: signer.signer_email,
              cpf: signer.signer_cpf || '',
              // Add other required Cliente fields with defaults
              telefone: '',
              endereco: '',
              observacoes: '',
              ativo: true,
              data_nascimento: '',
              tipo_servico: '',
              valor_sessao: 0,
              created_at: ''
            },
            fields: [] // Fields will be loaded from backend if needed
          }));
          setSelectedClientes(initialSigners);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar clientes';
        setError(errorMessage);
        console.error('Erro ao carregar clientes:', err);
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

  const filteredClientes = clientes.filter(cliente => 
    !selectedClientes.find(sc => sc.cliente.id === cliente.id) &&
    (cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
     cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (cliente.cpf && cliente.cpf.includes(searchTerm)))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      // Validate required fields
      if (!nome.trim()) {
        setError('Por favor, insira o nome do documento');
        return;
      }

      if (!initialData && !arquivo) {
        setError('Por favor, selecione um arquivo PDF');
        return;
      }

      if (selectedClientes.length === 0) {
        setError('Por favor, adicione pelo menos um assinante');
        return;
      }

      if (selectedClientes.some(sc => sc.fields.length === 0)) {
        setError('Todos os assinantes precisam ter pelo menos um campo de assinatura definido');
        return;
      }

      // Prepare signers data for backend
      const signersData: SignerData[] = selectedClientes.map(sc => ({
        signer_name: sc.cliente.nome,
        signer_email: sc.cliente.email,
        signer_cpf: sc.cliente.cpf || undefined,
        fields_definition: sc.fields.map(field => ({
          type: field.type,
          page: field.position.page,
          x: field.position.x,
          y: field.position.y,
          width: field.width,
          height: field.height,
          value: field.type === 'nome' ? sc.cliente.nome :
                 field.type === 'email' ? sc.cliente.email :
                 field.type === 'cpf' ? sc.cliente.cpf :
                 undefined
        }))
      }));

      // Prepare document data
      const documentData: CreateDocumentData = {
        name: nome.trim(),
        client_id: isUniversal ? undefined : selectedClientId,
        is_universal: isUniversal,
        signers: signersData
      };

      // Call backend API to create document
      if (arquivo) {
        const createdDocument = await criarDocumento(documentData, arquivo, user);
        onSubmit(createdDocument);
      } else {
        setError('Arquivo é obrigatório para criar documento');
        return;
      }

    } catch (error) {
      console.error('Erro ao salvar documento:', error);
      setError(error instanceof Error ? error.message : 'Erro ao salvar documento. Tente novamente.');
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
    if (currentClienteIndex === null) return;
    
    const newSelectedClientes = [...selectedClientes];
    const fieldWidth = fieldType === 'assinatura' ? 30 : 20;
    const fieldHeight = fieldType === 'assinatura' ? 10 : 5;
    
    // Check for overlapping fields with a margin
    const margin = 3; // 3% margin around fields
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
      alert('Os campos precisam ter um espaçamento mínimo entre si. Por favor, escolha outra posição.');
      return;
    }

    // Add field with adjusted position if needed
    let adjustedPosition = { ...position };
    if (position.x + fieldWidth > 100) {
      adjustedPosition.x = 100 - fieldWidth;
    }
    if (position.y + fieldHeight > 100) {
      adjustedPosition.y = 100 - fieldHeight;
    }

    // If this is a signature field, suggest positions for auto-filled fields
    if (fieldType === 'assinatura') {
      const autoFields = ['nome', 'email', 'cpf'] as const;
      autoFields.forEach((type, index) => {
        const suggestedPosition = getSuggestedPosition(adjustedPosition, index, fieldWidth, fieldHeight);
        if (
          suggestedPosition.x >= 0 && 
          suggestedPosition.x + 20 <= 100 &&
          suggestedPosition.y >= 0 && 
          suggestedPosition.y + 5 <= 100 &&
          !isPositionOverlapping(suggestedPosition, 20, 5, allFields, position.page, margin)
        ) {
          newSelectedClientes[currentClienteIndex].fields.push({
            type,
            position: { ...suggestedPosition, page: position.page },
            width: 20,
            height: 5
          });
        }
      });
    }

    newSelectedClientes[currentClienteIndex].fields.push({
      type: fieldType,
      position: adjustedPosition,
      width: fieldWidth,
      height: fieldHeight
    });
    
    setSelectedClientes(newSelectedClientes);
  };

  const getSuggestedPosition = (basePosition: { x: number; y: number }, index: number, fieldWidth: number, fieldHeight: number) => {
    const margin = 3;
    const positions = [
      { x: basePosition.x, y: basePosition.y + fieldHeight + margin }, // below
      { x: basePosition.x + fieldWidth + margin, y: basePosition.y }, // right
      { x: basePosition.x, y: basePosition.y - 5 - margin }, // above
      { x: basePosition.x - 20 - margin, y: basePosition.y }, // left
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
    if (currentClienteIndex === null) return;
    
    const newSelectedClientes = [...selectedClientes];
    newSelectedClientes[currentClienteIndex].fields.splice(fieldIndex, 1);
    setSelectedClientes(newSelectedClientes);
  };

  const handleMoveField = (fieldIndex: number, newPosition: { x: number; y: number }) => {
    if (currentClienteIndex === null) return;
    
    const newSelectedClientes = [...selectedClientes];
    const field = newSelectedClientes[currentClienteIndex].fields[fieldIndex];
    field.position = { ...field.position, x: newPosition.x, y: newPosition.y };
    setSelectedClientes(newSelectedClientes);
  };

  const getFieldColor = (clienteIndex: number) => {
    const colors = [
      'rgb(239 68 68)', // red
      'rgb(34 197 94)', // green
      'rgb(59 130 246)', // blue
      'rgb(168 85 247)', // purple
      'rgb(234 179 8)', // yellow
      'rgb(236 72 153)', // pink
      'rgb(14 165 233)', // sky
      'rgb(99 102 241)', // indigo
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

        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <input
              type="checkbox"
              id="isUniversal"
              checked={isUniversal}
              onChange={(e) => setIsUniversal(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isUniversal" className="text-sm font-medium text-gray-700">
              Documento Universal (sem cliente específico)
            </label>
          </div>

          {!isUniversal && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required={!isUniversal}
              >
                <option value="">Selecione um cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome} - {cliente.email}
                  </option>
                ))}
              </select>
            </div>
          )}
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
          <label className="block text-sm font-medium text-gray-700">Adicionar Assinantes</label>
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
                </div>
              )}
            </div>
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
                      <div className="text-sm text-gray-500">
                        Campos definidos: {sc.fields.length}
                        {sc.fields.length > 0 && (
                          <span className="ml-2 text-green-600">✓</span>
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

        {previewUrl && currentClienteIndex !== null && (
          <div className="border-t pt-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Definir campos para{' '}
                <span style={{ color: getFieldColor(currentClienteIndex) }}>
                  {selectedClientes[currentClienteIndex].cliente.nome}
                </span>
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setFieldType('assinatura')}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    fieldType === 'assinatura'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Assinatura Digital
                </button>
                <button
                  type="button"
                  onClick={() => setFieldType('nome')}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    fieldType === 'nome'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Nome (Auto-preenchido)
                </button>
                <button
                  type="button"
                  onClick={() => setFieldType('email')}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    fieldType === 'email'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Email (Auto-preenchido)
                </button>
                <button
                  type="button"
                  onClick={() => setFieldType('cpf')}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    fieldType === 'cpf'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  CPF (Auto-preenchido)
                </button>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Instruções:</strong> Clique no documento para adicionar campos. Os campos de nome, email e CPF serão preenchidos automaticamente com os dados do cliente. Apenas a assinatura digital precisará ser feita pelo assinante.
                </p>
              </div>
            </div>

            <div className="relative bg-gray-50 rounded-lg p-4">
              <PdfViewer
                pdfUrl={previewUrl}
                onPositionSelect={handleAddField}
                onDeleteField={handleDeleteField}
                onMoveField={handleMoveField}
                fields={selectedClientes[currentClienteIndex].fields.map(field => ({
                  ...field,
                  color: getFieldColor(currentClienteIndex)
                }))}
                allSignerFields={getAllSignerFields()}
                previewData={{
                  nome: selectedClientes[currentClienteIndex].cliente.nome,
                  email: selectedClientes[currentClienteIndex].cliente.email,
                  cpf: selectedClientes[currentClienteIndex].cliente.cpf,
                  assinatura: '',
                  assinanteIndex: currentClienteIndex
                }}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-6 border-t">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isSubmitting ? 'Salvando...' : (initialData ? 'Salvar Alterações' : 'Cadastrar Documento')}
          </button>
        </div>
      </form>
    </div>
  );
}