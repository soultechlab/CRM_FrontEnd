import React, { useState, useRef } from 'react';
import { Upload, FileText, X, AlertCircle, Edit3, FilePlus, Plus, Users } from 'lucide-react';
import { Modal } from './Modal';
import { useNavigate } from 'react-router-dom';
import { AddClientInline } from './AddClientInline';
import { obterClientes, Cliente } from '../../../services/apiService';
import { useAuth } from '../../../contexts/AuthContext';

type ModelCategory = 'contratos' | 'permuta' | 'eventos' | 'ensaios' | 'outros';

interface NewModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (modelData: {
    name: string;
    category: ModelCategory;
    description?: string;
    file: File;
  }) => void;
  currentTemplateCount: number;
  templateLimit: number;
  templateLimitReached: boolean;
  userPlan: string;
}

const categories: { key: ModelCategory; label: string }[] = [
  { key: 'contratos', label: 'Contratos' },
  { key: 'permuta', label: 'Permuta' },
  { key: 'eventos', label: 'Eventos' },
  { key: 'ensaios', label: 'Ensaios' },
  { key: 'outros', label: 'Outros' },
];

export function NewModelModal({
  isOpen,
  onClose,
  onSubmit,
  currentTemplateCount,
  templateLimit,
  templateLimitReached,
  userPlan
}: NewModelModalProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ModelCategory>('contratos');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [creationMethod, setCreationMethod] = useState<'upload' | 'create' | null>(null);
  const [errors, setErrors] = useState<{
    name?: string;
    file?: string;
    general?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para clientes e campos
  const [selectedClientes, setSelectedClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddClientForm, setShowAddClientForm] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carregar clientes quando necessário
  const loadClientes = async () => {
    if (clientes.length > 0) return;
    
    setLoadingClientes(true);
    try {
      const response = await obterClientes(user);
      setClientes(response);
    } catch (error) {
      setErrors({ general: 'Erro ao carregar clientes' });
    } finally {
      setLoadingClientes(false);
    }
  };

  const handleAddCliente = (cliente: Cliente) => {
    if (!selectedClientes.find(c => c.id === cliente.id)) {
      setSelectedClientes([...selectedClientes, cliente]);
    }
    setSearchTerm('');
  };

  const handleRemoveCliente = (clienteId: number) => {
    setSelectedClientes(selectedClientes.filter(c => c.id !== clienteId));
  };

  const handleClientAdded = (cliente: Cliente) => {
    setClientes([...clientes, cliente]);
    handleAddCliente(cliente);
    setShowAddClientForm(false);
  };

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(cliente => !selectedClientes.find(sc => sc.id === cliente.id));

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelection = (selectedFile: File) => {
    setErrors(prev => ({ ...prev, file: undefined }));
    
    // Validar tipo de arquivo
    if (selectedFile.type !== 'application/pdf') {
      setErrors(prev => ({ ...prev, file: 'Apenas arquivos PDF são aceitos' }));
      return;
    }
    
    // Validar tamanho (máximo 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, file: 'O arquivo deve ter no máximo 5MB' }));
      return;
    }
    
    setFile(selectedFile);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Nome do modelo é obrigatório';
    }
    
    if (!creationMethod) {
      newErrors.general = 'Selecione como criar o modelo';
      return false;
    }
    
    if (creationMethod === 'upload' && !file) {
      newErrors.file = 'Arquivo PDF é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateDocument = () => {
    if (!name.trim()) {
      setErrors({ name: 'Nome do modelo é obrigatório' });
      return;
    }
    
    // Navegar para página de criação de documento com parâmetros
    const queryParams = new URLSearchParams({
      name: name.trim(),
      category,
      description: description.trim(),
      isModel: 'true'
    });
    
    // Adicionar clientes selecionados se houver
    if (selectedClientes.length > 0) {
      queryParams.set('clientes', JSON.stringify(selectedClientes.map(c => c.id)));
    }
    
    navigate(`/criar-modelo?${queryParams.toString()}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (creationMethod === 'create') {
      handleCreateDocument();
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      await onSubmit({
        name: name.trim(),
        category,
        description: description.trim() || undefined,
        file: file!,
      });
      
      // Reset form
      setName('');
      setCategory('contratos');
      setDescription('');
      setFile(null);
      setCreationMethod(null);
      onClose();
    } catch (error) {
      setErrors({
        general: 'Erro ao criar modelo. Tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setName('');
      setCategory('contratos');
      setDescription('');
      setFile(null);
      setCreationMethod(null);
      setErrors({});
      setSelectedClientes([]);
      setSearchTerm('');
      setShowAddClientForm(false);
      onClose();
    }
  };

  // Mensagem e feedback visual de limite
  const planoNome =
    userPlan === 'free'
      ? 'Gratuito'
      : userPlan === 'monthly'
      ? 'Mensal'
      : userPlan === 'annual'
      ? 'Anual'
      : 'Outro';

  const limiteAtingidoMsg = `Limite de templates atingido para seu plano (${planoNome}). Exclua um template para criar outro ou faça upgrade de plano.`;
  const usoMsg = `Você já criou ${currentTemplateCount}/${templateLimit} template${templateLimit > 1 ? 's' : ''} (${planoNome})`;

  // Cores: amarelo/laranja se >= 80% do limite, vermelho se atingido
  const percent = (currentTemplateCount / templateLimit) * 100;
  let barColor = 'bg-blue-500';
  if (templateLimitReached) barColor = 'bg-red-600';
  else if (percent >= 80) barColor = 'bg-yellow-500';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Novo Modelo" maxWidth="max-w-6xl">
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{usoMsg}</span>
          <span
            className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
              templateLimitReached
                ? 'bg-red-100 text-red-700'
                : percent >= 80
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-blue-100 text-blue-700'
            }`}
          >
            {templateLimitReached
              ? 'Limite atingido'
              : percent >= 80
              ? 'Próximo do limite'
              : 'Dentro do limite'}
          </span>
        </div>
        <div className="w-full h-2 mt-2 bg-gray-200 rounded">
          <div
            className={`h-2 rounded transition-all ${barColor}`}
            style={{ width: `${Math.min(percent, 100)}%` }}
          ></div>
        </div>
        {templateLimitReached && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{limiteAtingidoMsg}</span>
            <a
              href="/planos"
              className="ml-auto px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-semibold"
            >
              Fazer upgrade
            </a>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 px-2 sm:px-0">
        {/* Nome do modelo */}
        <div>
          <label htmlFor="modelName" className="block text-sm font-medium text-gray-700 mb-2">
            Nome do modelo *
          </label>
          <input
            id="modelName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Digite o nome do modelo"
            className={`w-full px-2 py-1 sm:px-3 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            } text-sm sm:text-base`}
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.name}
            </p>
          )}
        </div>

        {/* Categoria */}
        <div>
          <label htmlFor="modelCategory" className="block text-sm font-medium text-gray-700 mb-2">
            Categoria *
          </label>
          <select
            id="modelCategory"
            value={category}
            onChange={(e) => setCategory(e.target.value as ModelCategory)}
            className="w-full px-2 py-1 sm:px-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            disabled={isSubmitting}
          >
            {categories.map((cat) => (
              <option key={cat.key} value={cat.key}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Descrição (opcional) */}
        <div>
          <label htmlFor="modelDescription" className="block text-sm font-medium text-gray-700 mb-2">
            Descrição (opcional)
          </label>
          <textarea
            id="modelDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva o modelo e quando utilizá-lo"
            rows={3}
            className="w-full px-2 py-1 sm:px-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            disabled={isSubmitting}
          />
        </div>

        {/* Método de criação */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Como você quer criar o modelo? *
          </label>
          <div className="grid grid-cols-1 gap-2 sm:gap-3 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setCreationMethod('upload')}
              className={`p-2 sm:p-4 border-2 rounded-lg text-left transition-all ${
                creationMethod === 'upload'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              disabled={isSubmitting}
            >
              <div className="flex items-center mb-2">
                <Upload className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-medium text-gray-900">Fazer Upload</span>
              </div>
              <p className="text-sm text-gray-600">
                Enviar um arquivo PDF já existente
              </p>
            </button>
            
            <button
              type="button"
              onClick={() => setCreationMethod('create')}
              className={`p-2 sm:p-4 border-2 rounded-lg text-left transition-all ${
                creationMethod === 'create'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              disabled={isSubmitting}
            >
              <div className="flex items-center mb-2">
                <Edit3 className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-medium text-gray-900">Criar Documento</span>
              </div>
              <p className="text-sm text-gray-600">
                Criar um novo documento com editor
              </p>
            </button>
          </div>
        </div>

        {/* Seleção de clientes - apenas se método create for selecionado */}
        {creationMethod === 'create' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Assinantes do modelo (opcional)
            </label>
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Buscar clientes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={loadClientes}
                    className="w-full px-2 py-1 sm:px-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    disabled={isSubmitting}
                  />
                  {loadingClientes && (
                    <div className="text-sm text-gray-500 mt-1">Carregando clientes...</div>
                  )}
                  {searchTerm && filteredClientes.length > 0 && (
                    <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                      {filteredClientes.slice(0, 5).map((cliente) => (
                        <button
                          key={cliente.id}
                          type="button"
                          onClick={() => handleAddCliente(cliente)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-b-0"
                          disabled={isSubmitting}
                        >
                          <div className="font-medium text-gray-900">{cliente.nome}</div>
                          <div className="text-sm text-gray-500">{cliente.email}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddClientForm(true)}
                  className="px-2 py-1 sm:px-3 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm sm:text-base"
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

              {selectedClientes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Assinantes Selecionados ({selectedClientes.length})
                  </h4>
                  {selectedClientes.map((cliente) => (
                    <div
                      key={cliente.id}
                      className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-gray-900">{cliente.nome}</div>
                        <div className="text-sm text-gray-500">{cliente.email}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCliente(cliente.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        disabled={isSubmitting}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {selectedClientes.length > 0 && (
                <div className="mt-2 sm:mt-4 p-2 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Definição de campos</p>
                      <p>
                        Após criar o modelo, você poderá definir os campos de assinatura para cada assinante 
                        diretamente no editor de documentos.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upload de arquivo - apenas se método upload for selecionado */}
        {creationMethod === 'upload' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Arquivo do modelo *
            </label>
          <div
            className={`border-2 border-dashed rounded-lg p-3 sm:p-6 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : errors.file
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileInputChange}
              className="hidden"
              disabled={isSubmitting}
            />
            
            {file ? (
              <div className="flex items-center justify-center space-x-2">
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div>
                <Upload className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-xs sm:text-sm text-gray-600">
                  Arraste um arquivo PDF aqui ou{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-500 font-medium"
                    disabled={isSubmitting}
                  >
                    selecione um arquivo
                  </button>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Apenas arquivos PDF, máximo 5MB
                </p>
              </div>
            )}
          </div>
            {errors.file && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.file}
              </p>
            )}
          </div>
        )}

        {/* Erro geral */}
        {errors.general && (
          <div className="p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs sm:text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.general}
            </p>
          </div>
        )}

        {/* Botões */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2 sm:pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-3 py-1 sm:px-4 sm:py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-3 py-1 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            disabled={
              isSubmitting ||
              !name.trim() ||
              !creationMethod ||
              (creationMethod === 'upload' && !file) ||
              templateLimitReached
            }
          >
            {isSubmitting
              ? 'Processando...'
              : templateLimitReached
              ? 'Limite atingido'
              : creationMethod === 'create'
              ? 'Abrir Editor'
              : creationMethod === 'upload'
              ? 'Criar Modelo'
              : 'Continuar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
