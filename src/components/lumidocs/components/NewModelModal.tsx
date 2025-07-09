import React, { useState, useRef } from 'react';
import { Upload, FileText, X, AlertCircle, Edit3, FilePlus } from 'lucide-react';
import { Modal } from './Modal';
import { useNavigate } from 'react-router-dom';

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
}

const categories: { key: ModelCategory; label: string }[] = [
  { key: 'contratos', label: 'Contratos' },
  { key: 'permuta', label: 'Permuta' },
  { key: 'eventos', label: 'Eventos' },
  { key: 'ensaios', label: 'Ensaios' },
  { key: 'outros', label: 'Outros' },
];

export function NewModelModal({ isOpen, onClose, onSubmit }: NewModelModalProps) {
  const navigate = useNavigate();
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
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      console.error('Erro ao criar modelo:', error);
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
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Novo Modelo" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
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
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          />
        </div>

        {/* Método de criação */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Como você quer criar o modelo? *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setCreationMethod('upload')}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
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
              className={`p-4 border-2 rounded-lg text-left transition-all ${
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

        {/* Upload de arquivo - apenas se método upload for selecionado */}
        {creationMethod === 'upload' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Arquivo do modelo *
            </label>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
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
                <FileText className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
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
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
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
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.general}
            </p>
          </div>
        )}

        {/* Botões */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting || !name.trim() || !creationMethod || (creationMethod === 'upload' && !file)}
          >
            {isSubmitting ? 'Processando...' : 
             creationMethod === 'create' ? 'Abrir Editor' :
             creationMethod === 'upload' ? 'Criar Modelo' : 'Continuar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}