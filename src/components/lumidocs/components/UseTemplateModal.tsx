import React, { useState, useEffect } from 'react';
import { Search, X, FileText, Plus, Send, AlertCircle, User } from 'lucide-react';
import { Cliente as LocalCliente, SignatureField } from '../utils/localStorage';
import { DocumentTemplate } from '../../../types';
// Importar configuração do PDF antes do PdfViewer
import '../utils/pdfConfig';
import { PdfViewer } from './PdfViewer';
import { criarDocumento, CreateDocumentData, SignerData, obterClientes, Cliente } from '../../../services/apiService';
import { useAuth } from '../../../contexts/AuthContext';
import { AddClientInline } from './AddClientInline';

interface UseTemplateModalProps {
  template: DocumentTemplate;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (documento: any) => void;
}

export function UseTemplateModal({ template, isOpen, onClose, onConfirm }: UseTemplateModalProps) {
  const { user } = useAuth();
  const [nome, setNome] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientes, setSelectedClientes] = useState<Array<{
    cliente: Cliente;
    fields: SignatureField[];
  }>>([]);
  const [previewUrl, setPreviewUrl] = useState<string>(template.storage_url || template.file_path || '');
  const [currentClienteIndex, setCurrentClienteIndex] = useState<number | null>(null);
  const [fieldType, setFieldType] = useState<'assinatura' | 'nome' | 'email' | 'cpf'>('assinatura');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddClientForm, setShowAddClientForm] = useState(false);
  const [showClientList, setShowClientList] = useState(false);

  const loadPdfWithAuth = async (url: string) => {
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/pdf',
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Arquivo não encontrado');
        } else if (response.status === 403) {
          throw new Error('Sem permissão para acessar o arquivo');
        } else {
          throw new Error(`Erro HTTP: ${response.status}`);
        }
      }
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      setPreviewUrl(blobUrl);
    } catch (error) {
      console.error('Error loading PDF with auth:', error);
      setError(`Erro ao carregar PDF: ${error.message}`);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      let fullUrl = template.storage_url || template.file_path || '';
      
      if (fullUrl && !fullUrl.startsWith('http')) {
        const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
        fullUrl = `${baseUrl}${fullUrl.startsWith('/') ? '' : '/'}${fullUrl}`;
      }
      
      if (fullUrl && (fullUrl.includes('localhost:8080') || fullUrl.includes('/api/'))) {
        loadPdfWithAuth(fullUrl);
      } else {
        setPreviewUrl(fullUrl);
      }
      
      setNome(`${template.name} - ${new Date().toLocaleDateString()}`);
      loadClientes();
    }
  }, [isOpen, template, user]);

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
    } catch (err: any) {
      console.error('Erro ao carregar clientes:', err);
      setError(err.message || 'Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCliente = (cliente: Cliente) => {
    if (!selectedClientes.find(sc => sc.cliente.id === cliente.id)) {
      setSelectedClientes([...selectedClientes, { cliente, fields: [] }]);
    }
    setSearchTerm('');
  };

  const handleRemoveCliente = (clienteId: number) => {
    const newSelectedClientes = selectedClientes.filter(sc => sc.cliente.id !== clienteId);
    setSelectedClientes(newSelectedClientes);
    
    // Se o cliente removido estava sendo editado, limpar o índice
    if (currentClienteIndex !== null && selectedClientes[currentClienteIndex]?.cliente.id === clienteId) {
      setCurrentClienteIndex(null);
    }
  };

  const handleClientAdded = (cliente: Cliente) => {
    setClientes([...clientes, cliente]);
    handleAddCliente(cliente);
    setShowAddClientForm(false);
  };

  const getFieldColor = (index: number) => {
    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#F97316'];
    return colors[index % colors.length];
  };

  const isPositionOverlapping = (
    newPos: { x: number; y: number },
    width: number,
    height: number,
    existingFields: SignatureField[],
    page: number,
    margin: number = 1
  ) => {
    return existingFields.some(field => {
      if (field.position.page !== page) return false;
      
      return (
        newPos.x < field.position.x + field.width + margin &&
        newPos.x + width + margin > field.position.x &&
        newPos.y < field.position.y + field.height + margin &&
        newPos.y + height + margin > field.position.y
      );
    });
  };

  const handlePdfClick = (position: { x: number; y: number; page: number }) => {
    if (currentClienteIndex === null) return;

    const newSelectedClientes = [...selectedClientes];
    
    const fieldWidth = fieldType === 'assinatura' ? 15 : 12; // Percentual da largura da página
    const fieldHeight = fieldType === 'assinatura' ? 4 : 3; // Percentual da altura da página
    
    let adjustedPosition = { ...position };
    const margin = 3;
    const allFields = newSelectedClientes.flatMap((sc, index) => 
      sc.fields.map(field => ({ ...field, signerIndex: index }))
    );
    
    if (isPositionOverlapping(position, fieldWidth, fieldHeight, allFields, position.page, margin)) {
      for (let attempt = 0; attempt < 20; attempt++) {
        const offsetX = (attempt % 4) * (fieldWidth + margin);
        const offsetY = Math.floor(attempt / 4) * (fieldHeight + margin);
        const suggestedPosition = {
          x: position.x + offsetX,
          y: position.y + offsetY
        };
        
        if (
          suggestedPosition.x + fieldWidth <= 100 &&
          suggestedPosition.y + fieldHeight <= 100 &&
          !isPositionOverlapping(suggestedPosition, fieldWidth, fieldHeight, allFields, position.page, margin)
        ) {
          newSelectedClientes[currentClienteIndex].fields.push({
            type: fieldType,
            position: { ...suggestedPosition, page: position.page },
            width: fieldWidth,
            height: fieldHeight
          });
          setSelectedClientes(newSelectedClientes);
          return;
        }
      }
    }

    newSelectedClientes[currentClienteIndex].fields.push({
      type: fieldType,
      position: adjustedPosition,
      width: fieldWidth,
      height: fieldHeight
    });
    
    setSelectedClientes(newSelectedClientes);
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

  const getAllSignerFields = () => {
    return selectedClientes.map((sc, index) => ({
      fields: sc.fields,
      color: getFieldColor(index),
      assinanteIndex: index
    }));
  };

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(cliente => !selectedClientes.find(sc => sc.cliente.id === cliente.id));

  const handleSubmit = async () => {
    if (!nome.trim()) {
      setError('Nome do documento é obrigatório');
      return;
    }

    if (selectedClientes.length === 0) {
      setError('Pelo menos um cliente deve ser selecionado');
      return;
    }

    if (selectedClientes.some(sc => sc.fields.length === 0)) {
      setError('Todos os assinantes precisam ter pelo menos um campo de assinatura definido');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const signers: SignerData[] = selectedClientes.map(sc => ({
        name: sc.cliente.nome,
        email: sc.cliente.email,
        cpf: sc.cliente.cpf || undefined,
        fields: sc.fields.map(field => ({
          type: field.type,
          page: field.position.page,
          x: field.position.x,
          y: field.position.y,
          width: field.type === 'assinatura' ? 100 : 80,
          height: field.type === 'assinatura' ? 30 : 20
        }))
      }));

      const documentData: CreateDocumentData = {
        name: nome,
        template_id: template.id, // Usar o template ID
        signers
      };

      const response = await criarDocumento(documentData, user);
      
      if (response.success) {
        onConfirm(response.document);
        onClose();
      } else {
        setError(response.error || 'Erro ao criar documento');
      }
    } catch (err: any) {
      console.error('Erro ao criar documento:', err);
      setError(err.message || 'Erro ao criar documento');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex">
        {/* PDF Preview Side */}
        <div className="w-1/2 bg-gray-100 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h4 className="text-sm font-medium text-gray-900">Preview do Template</h4>
            <p className="text-xs text-gray-500 mt-1">{template.name}</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {previewUrl && (
              <PdfViewer
                pdfUrl={previewUrl}
                onPositionSelect={handlePdfClick}
                onDeleteField={handleDeleteField}
                onMoveField={handleMoveField}
                fields={selectedClientes[currentClienteIndex]?.fields || []}
                allSignerFields={getAllSignerFields()}
                previewData={currentClienteIndex !== null ? {
                  nome: '',
                  email: '',
                  cpf: '',
                  assinatura: '',
                  assinanteIndex: currentClienteIndex
                } : undefined}
              />
            )}
          </div>
        </div>

        {/* Form Side */}
        <div className="w-1/2 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <FileText className="w-6 h-6 text-blue-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Criar Documento
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  A partir do modelo: {template.name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 flex-1 overflow-y-auto">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center">
                  <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              </div>
            )}

            {/* Nome do documento */}
            <div className="mb-6">
              <label htmlFor="documentName" className="block text-sm font-medium text-gray-700 mb-2">
                Nome do documento <span className="text-red-500">*</span>
              </label>
              <input
                id="documentName"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Digite o nome do documento"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              />
            </div>

            {/* Seção de assinantes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Assinantes <span className="text-red-500">*</span>
              </label>
              
              <div className="flex gap-2 mb-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Buscar clientes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setShowClientList(true)}
                    onBlur={() => setTimeout(() => setShowClientList(false), 200)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSubmitting || loading}
                  />
                  {loading && (
                    <div className="text-sm text-gray-500 mt-1">Carregando clientes...</div>
                  )}
                  {!loading && showClientList && filteredClientes.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 max-h-40 overflow-y-auto border border-gray-200 rounded-lg bg-white shadow-lg z-50">
                      {filteredClientes.slice(0, 10).map((cliente) => (
                        <button
                          key={cliente.id}
                          type="button"
                          onClick={() => {
                            handleAddCliente(cliente);
                            setShowClientList(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-b-0"
                          disabled={isSubmitting}
                        >
                          <div className="font-medium text-gray-900">{cliente.nome}</div>
                          <div className="text-sm text-gray-500">{cliente.email}</div>
                        </button>
                      ))}
                    </div>
                  )}
                  {!loading && showClientList && filteredClientes.length === 0 && searchTerm && (
                    <div className="absolute top-full left-0 right-0 mt-1 text-center py-4 text-gray-500 text-sm border border-gray-200 rounded-lg bg-white shadow-lg z-50">
                      Nenhum cliente encontrado
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddClientForm(true)}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  disabled={isSubmitting}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Novo
                </button>
              </div>

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
                      Nome
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
                      Email
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
                      CPF
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">
                    Clique no PDF à esquerda para posicionar os campos de{' '}
                    <span className="font-medium">{fieldType}</span> para{' '}
                    <span className="font-medium">{selectedClientes[currentClienteIndex].cliente.nome}</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !nome.trim() || selectedClientes.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Criando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Criar Documento
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}