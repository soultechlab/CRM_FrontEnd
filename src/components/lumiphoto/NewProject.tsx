import { useState, useCallback } from 'react';
import { ChevronLeft, Upload, Copy, X, Calendar, Camera, Eye, Star, Info, CheckCircle, AlertCircle, Palette, Shield, Clock, DollarSign, HelpCircle, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LumiPhotoHeader } from './components/LumiPhotoHeader';

interface FormData {
  projectName: string;
  description: string;
  clientName: string;
  clientEmail: string;
  contractedPhotos: number;
  maxSelections: number;
  allowExtraPhotos: boolean;
  extraPhotosType: 'individual' | 'packages' | 'both';
  extraPhotoPrice: number;
  requirePassword: boolean;
  password: string;
  linkExpiration: number;
  addWatermark: boolean;
  watermarkText: string;
  watermarkPosition: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  projectDate: string;
  projectType: string;
  clientPhone: string;
  deliveryDate: string;
  allowDownload: boolean;
}

export function NewProject() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    projectName: '',
    description: '',
    clientName: '',
    clientEmail: '',
    contractedPhotos: 50,
    maxSelections: 50,
    allowExtraPhotos: false,
    extraPhotosType: 'individual',
    extraPhotoPrice: 20,
    requirePassword: false,
    password: '',
    linkExpiration: 30,
    addWatermark: false,
    watermarkText: '',
    watermarkPosition: 'bottom-right',
    projectDate: '',
    projectType: '',
    clientPhone: '',
    deliveryDate: '',
    allowDownload: true,
  });

  const [shareLink, setShareLink] = useState('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateField = (field: keyof FormData, value: string | number | boolean): string => {
    switch (field) {
      case 'projectName':
        return !value || (value as string).trim().length === 0 ? 'Nome do projeto é obrigatório' : '';
      case 'clientName':
        return !value || (value as string).trim().length === 0 ? 'Nome do cliente é obrigatório' : '';
      case 'clientEmail':
        const email = value as string;
        if (!email || email.trim().length === 0) return 'Email é obrigatório';
        if (!validateEmail(email)) return 'Email inválido';
        return '';
      case 'contractedPhotos':
        return (value as number) < 1 ? 'Número deve ser maior que 0' : '';
      case 'maxSelections':
        return (value as number) < 1 ? 'Número deve ser maior que 0' : '';
      case 'extraPhotoPrice':
        return formData.allowExtraPhotos && (value as number) < 0 ? 'Preço deve ser maior ou igual a 0' : '';
      case 'password':
        return formData.requirePassword && (!value || (value as string).trim().length === 0) ? 'Senha é obrigatória' : '';
      default:
        return '';
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Real-time validation
    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));

    setHasUnsavedChanges(true);

    // Auto-save after 2 seconds of inactivity
    setTimeout(() => {
      if (!isAutoSaving) {
        setIsAutoSaving(true);
        setTimeout(() => setIsAutoSaving(false), 1000);
      }
    }, 2000);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      setUploadedFiles(prev => [...prev, ...files]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const generateShareLink = () => {
    setIsGeneratingLink(true);
    setTimeout(() => {
      setShareLink(`https://lumiphoto.com/project/${Date.now()}`);
      setIsGeneratingLink(false);
    }, 1000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
  };

  const handleCreateProject = () => {
    console.log('Creating project with data:', formData);
    console.log('Uploaded files:', uploadedFiles);
  };

  const handleSaveAsDraft = () => {
    console.log('Saving as draft:', formData);
  };

  const handleCancel = () => {
    navigate('/lumiphoto');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <LumiPhotoHeader delivery={true} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Novo Projeto</h1>
          <p className="text-gray-600">Crie um novo álbum para compartilhar com seu cliente</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Informações do Projeto</h2>
            <p className="text-gray-500 text-sm mb-6">Detalhes básicos sobre o novo álbum</p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Projeto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Casamento Ana & Pedro"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.projectName}
                  onChange={(e) => handleInputChange('projectName', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  placeholder="Uma breve descrição sobre este projeto"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Cliente <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Nome completo"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.clientName}
                    onChange={(e) => handleInputChange('clientName', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email do Cliente <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="email@exemplo.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.clientEmail}
                    onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                  />
                </div>
              </div>

              {/* Additional Client Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone do Cliente
                  </label>
                  <input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.clientPhone}
                    onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Projeto
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.projectType}
                    onChange={(e) => handleInputChange('projectType', e.target.value)}
                  >
                    <option value="">Selecione o tipo</option>
                    <option value="casamento">Casamento</option>
                    <option value="pre-wedding">Pré-Wedding</option>
                    <option value="aniversario">Aniversário</option>
                    <option value="formatura">Formatura</option>
                    <option value="gestante">Ensaio Gestante</option>
                    <option value="newborn">Newborn</option>
                    <option value="familia">Família</option>
                    <option value="corporativo">Corporativo</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>
              </div>

              {/* Project Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data do Projeto
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.projectDate}
                    onChange={(e) => handleInputChange('projectDate', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Entrega Prevista
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.deliveryDate}
                    onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                  />
                </div>
              </div>

            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <h3 className="text-lg font-medium text-gray-900">Upload de Fotos</h3>
                </div>
                {uploadedFiles.length > 0 && (
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {uploadedFiles.length} arquivo{uploadedFiles.length !== 1 ? 's' : ''}
                    </div>
                    <div className="text-gray-500">
                      {(uploadedFiles.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024)).toFixed(1)} MB
                    </div>
                  </div>
                )}
              </div>
              <p className="text-gray-500 text-sm mb-4">Selecione as fotos para este projeto</p>

              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  Arraste e solte arquivos aqui ou clique para selecionar
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Suporte JPG, PNG, RAW (máximo 20MB por arquivo)
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Selecionar Arquivos
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      Arquivos selecionados ({uploadedFiles.length})
                    </h4>
                    <button
                      onClick={() => setUploadedFiles([])}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Limpar todos
                    </button>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-3 rounded border">
                        <div className="flex items-center flex-1 min-w-0">
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-gray-700 truncate block">{file.name}</span>
                            <span className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="ml-2 text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Configurações</h2>
            <p className="text-gray-500 text-sm mb-6">Personalize as opções do projeto</p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de fotos contratadas
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.contractedPhotos}
                  onChange={(e) => handleInputChange('contractedPhotos', parseInt(e.target.value))}
                />
                <p className="text-xs text-gray-500 mt-1">Número de fotos inclusas no contrato original</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número máximo de seleções
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.maxSelections}
                  onChange={(e) => handleInputChange('maxSelections', parseInt(e.target.value))}
                />
                <p className="text-xs text-gray-500 mt-1">Limite quantas fotos o cliente pode selecionar</p>
              </div>


              {/* Additional Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Venda de fotos extras</span>
                      <p className="text-xs text-gray-500">Permite que o cliente compre fotos adicionais</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.allowExtraPhotos}
                      onChange={(e) => handleInputChange('allowExtraPhotos', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {formData.allowExtraPhotos && (
                  <div className="ml-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Tipo de venda de fotos extras
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="extraPhotosType"
                            value="individual"
                            checked={formData.extraPhotosType === 'individual'}
                            onChange={(e) => handleInputChange('extraPhotosType', e.target.value)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Por foto individual</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="extraPhotosType"
                            value="packages"
                            checked={formData.extraPhotosType === 'packages'}
                            onChange={(e) => handleInputChange('extraPhotosType', e.target.value)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Por pacotes de fotos</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="extraPhotosType"
                            value="both"
                            checked={formData.extraPhotosType === 'both'}
                            onChange={(e) => handleInputChange('extraPhotosType', e.target.value)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Ambas opções</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preço por foto extra (R$)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.extraPhotoPrice}
                        onChange={(e) => handleInputChange('extraPhotoPrice', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 text-gray-500 mr-2" />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Proteger com senha</span>
                      <p className="text-xs text-gray-500">Exige senha para visualizar as fotos</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.requirePassword}
                      onChange={(e) => handleInputChange('requirePassword', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {formData.requirePassword && (
                  <div className="ml-6 mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Senha de acesso
                    </label>
                    <input
                      type="text"
                      placeholder="Digite uma senha"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 text-gray-500 mr-2" />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Permitir downloads</span>
                      <p className="text-xs text-gray-500">Permite que o cliente faça download das fotos</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.allowDownload}
                      onChange={(e) => handleInputChange('allowDownload', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiração do link (dias)
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.linkExpiration}
                  onChange={(e) => handleInputChange('linkExpiration', parseInt(e.target.value))}
                />
                <p className="text-xs text-gray-500 mt-1">Define por quantos dias o link de seleção ficará ativo</p>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-200">
                <div className="flex items-center mb-3">
                  <h3 className="text-lg font-medium text-gray-900">Link de Seleção</h3>
                </div>
                <p className="text-gray-500 text-sm mb-4">Gera um link para compartilhar</p>

                {!shareLink ? (
                  <button
                    onClick={generateShareLink}
                    disabled={isGeneratingLink}
                    className="w-full flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {isGeneratingLink ? 'Gerando...' : 'Gerar Link'}
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {shareLink && (
                  <p className="text-xs text-gray-600 mt-2">
                    Link para compartilhar com o cliente para seleção de fotos
                  </p>
                )}
              </div>

              {/* Watermark Options */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center mb-3">
                  <h3 className="text-lg font-medium text-gray-900">Opções de Marca d'água</h3>
                </div>
                <p className="text-gray-500 text-sm mb-4">Configure texto e posição da marca d'água nas imagens</p>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Adicionar marca d'água</span>
                    <p className="text-xs text-gray-500">Aplica texto como marca d'água nas fotos</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.addWatermark}
                      onChange={(e) => handleInputChange('addWatermark', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {formData.addWatermark && (
                  <div className="space-y-4 pt-4 border-t border-purple-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Texto da marca d'água
                      </label>
                      <input
                        type="text"
                        placeholder="© Seu Nome - 2024"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.watermarkText}
                        onChange={(e) => handleInputChange('watermarkText', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Posição da marca d'água
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.watermarkPosition}
                        onChange={(e) => handleInputChange('watermarkPosition', e.target.value)}
                      >
                        <option value="bottom-right">Canto inferior direito</option>
                        <option value="bottom-left">Canto inferior esquerdo</option>
                        <option value="top-right">Canto superior direito</option>
                        <option value="top-left">Canto superior esquerdo</option>
                        <option value="center">Centro</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-8">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <X className="h-4 w-4 inline mr-1" />
            Cancelar
          </button>
          <button
            onClick={handleSaveAsDraft}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
          >
            Salvar como Rascunho
          </button>
          <button
            onClick={handleCreateProject}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Criar Projeto
          </button>
        </div>
      </div>
    </div>
  );
}