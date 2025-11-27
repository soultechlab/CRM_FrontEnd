import { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, Upload, Copy, X, Calendar, Camera, Eye, Star, Info, CheckCircle, AlertCircle, Palette, Shield, Clock, DollarSign, HelpCircle, Save, Droplets } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { LumiPhotoHeader } from './components/LumiPhotoHeader';
import {
  criarProjetoLumiPhoto,
  obterProjetoLumiPhoto,
  atualizarProjetoLumiPhoto,
  uploadFotoLumiPhoto,
  configurarMarcaDaguaFoto,
  WatermarkConfig,
} from '../../services/lumiPhotoService';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { buildPublicGalleryShareUrl } from '../../utils/lumiphotoPublic';
import { WatermarkConfigModal } from './components/WatermarkConfigModal';

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
  projectDate: string;
  projectType: string;
  clientPhone: string;
  deliveryDate: string;
  allowDownload: boolean;
}

type WatermarkPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';

interface UploadWatermarkConfig {
  enabled: boolean;
  text: string;
  position: WatermarkPosition;
  fontSize: number;
  opacity: number;
}

interface UploadItem {
  id: string;
  file: File;
  previewUrl: string;
  watermark: UploadWatermarkConfig;
}

export function NewProject() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projectId } = useParams<{ projectId: string }>();
  const isEditMode = !!projectId;

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
    projectDate: '',
    projectType: '',
    clientPhone: '',
    deliveryDate: '',
    allowDownload: true,
  });

  const [shareLink, setShareLink] = useState('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadItem[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [watermarkModalItem, setWatermarkModalItem] = useState<UploadItem | null>(null);

  const buildPublicGalleryUrl = (shareLink?: string | null, shareToken?: string | null) =>
    buildPublicGalleryShareUrl(shareToken, shareLink);

  const createUploadItem = (file: File): UploadItem => ({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    file,
    previewUrl: URL.createObjectURL(file),
    watermark: {
      enabled: true,
      text: '© Meu Estúdio',
      position: 'bottom-right',
      fontSize: 300, // MUITO MAIOR - era 150
      opacity: 0.5,  // Mais visível - era 0.35
    },
  });

  // Carregar dados do projeto se estiver em modo de edição
  useEffect(() => {
    const loadProject = async () => {
      if (!isEditMode || !projectId || !user) {
        return;
      }

      try {
        setIsLoadingProject(true);
        const project = await obterProjetoLumiPhoto(parseInt(projectId), user);

        // Preencher o formulário com os dados do projeto e o share_link
        const resolvedLink = buildPublicGalleryUrl(project.share_link, project.share_token);
        if (resolvedLink) {
          setShareLink(resolvedLink);
        }

        setFormData({
          projectName: project.name || '',
          description: project.description || '',
          clientName: project.client_name || '',
          clientEmail: project.client_email || '',
          contractedPhotos: project.contracted_photos || 50,
          maxSelections: project.max_selections || 50,
          allowExtraPhotos: project.allow_extra_photos || false,
          extraPhotosType: project.extra_photos_type || 'individual',
          extraPhotoPrice: project.extra_photo_price || 20,
          requirePassword: project.require_password || false,
          password: project.access_password || '',
          linkExpiration: project.link_expiration || 30,
          projectDate: project.project_date || '',
          projectType: project.project_type || '',
          clientPhone: project.client_phone || '',
          deliveryDate: project.delivery_date || '',
          allowDownload: project.allow_download !== undefined ? project.allow_download : true,
        });

      } catch (error: any) {
        console.error('Erro ao carregar projeto:', error);
        toast.error('Erro ao carregar dados do projeto');
        navigate('/lumiphoto');
      } finally {
        setIsLoadingProject(false);
      }
    };

    loadProject();
  }, [isEditMode, projectId, user, navigate]);

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
      const items = files.map(createUploadItem);
      setUploadedFiles(prev => [...prev, ...items]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const items = files.map(createUploadItem);
      setUploadedFiles(prev => [...prev, ...items]);
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => {
      const found = prev.find((item) => item.id === id);
      if (found) {
        URL.revokeObjectURL(found.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const updateWatermark = (id: string, updater: (config: UploadWatermarkConfig) => UploadWatermarkConfig) => {
    setUploadedFiles((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, watermark: updater(item.watermark) }
          : item
      )
    );
  };

  const openWatermarkModal = (item: UploadItem) => {
    setWatermarkModalItem(item);
  };

  const closeWatermarkModal = () => {
    setWatermarkModalItem(null);
  };

  const handleSaveWatermarkModal = async (config: WatermarkConfig) => {
    if (!watermarkModalItem) return;

    // Sempre ativa a marca d'água ao salvar configuração
    updateWatermark(watermarkModalItem.id, () => ({
      enabled: true,
      text: config.text,
      position: config.position,
      fontSize: config.font_size ?? 300, // MUITO MAIOR - era 150
      opacity: config.opacity ?? 0.5,    // Mais visível - era 0.35
    }));

    toast.success('Marca d\'água configurada!');
    closeWatermarkModal();
  };

  const generateShareLink = () => {
    if (!isEditMode || !projectId) {
      toast.warning('Salve o projeto primeiro para gerar o link de compartilhamento');
      return;
    }

    setIsGeneratingLink(true);

    // Recarregar dados do projeto para obter o share_link atualizado
    obterProjetoLumiPhoto(parseInt(projectId), user)
      .then((project) => {
        const resolvedLink = buildPublicGalleryUrl(project.share_link, project.share_token);
        if (resolvedLink) {
          setShareLink(resolvedLink);
          toast.success('Link gerado com sucesso!');
        } else {
          toast.error('Projeto ainda não possui link de compartilhamento. O link será gerado automaticamente ao criar/atualizar o projeto.');
        }
        setIsGeneratingLink(false);
      })
      .catch((error) => {
        console.error('Erro ao obter link:', error);
        toast.error('Erro ao gerar link de compartilhamento');
        setIsGeneratingLink(false);
      });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
  };

  const handleCreateProject = async () => {
    // Validar campos obrigatórios
    if (!formData.projectName.trim()) {
      toast.error('Nome do projeto é obrigatório');
      return;
    }
    if (!formData.clientEmail.trim()) {
      toast.error('Email do cliente é obrigatório');
      return;
    }
    if (!validateEmail(formData.clientEmail)) {
      toast.error('Email do cliente inválido');
      return;
    }
    if (!formData.projectType) {
      toast.error('Tipo de projeto é obrigatório');
      return;
    }
    if (!formData.projectDate) {
      toast.error('Data do projeto é obrigatória');
      return;
    }
    if (!formData.contractedPhotos || formData.contractedPhotos < 1) {
      toast.error('Número de fotos contratadas é obrigatório e deve ser maior que 0');
      return;
    }
    if (!formData.maxSelections || formData.maxSelections < 1) {
      toast.error('Número máximo de seleções é obrigatório e deve ser maior que 0');
      return;
    }
    if (!formData.linkExpiration || formData.linkExpiration < 1) {
      toast.error('Expiração do link é obrigatória e deve ser maior que 0');
      return;
    }

    // Validar preço de foto extra se venda de fotos extras estiver ativada
    if (formData.allowExtraPhotos && (!formData.extraPhotoPrice || formData.extraPhotoPrice < 0)) {
      toast.error('Preço por foto extra é obrigatório quando venda de fotos extras está ativada');
      return;
    }

    // Validar senha se proteção estiver ativada
    if (formData.requirePassword && !formData.password.trim()) {
      toast.error('Senha de acesso é obrigatória quando a proteção com senha está ativada');
      return;
    }

    if (!user || !user.token) {
      toast.error('Você precisa estar logado para criar um projeto');
      return;
    }

    try {
      setIsCreatingProject(true);

      const projectData = {
        name: formData.projectName,
        client_email: formData.clientEmail,
        client_name: formData.clientName || undefined,
        client_phone: formData.clientPhone || undefined,
        description: formData.description || undefined,
        project_type: formData.projectType || undefined,
        project_date: formData.projectDate || undefined,
        delivery_date: formData.deliveryDate || undefined,
        contracted_photos: formData.contractedPhotos,
        max_selections: formData.maxSelections,
        allow_extra_photos: formData.allowExtraPhotos,
        extra_photos_type: formData.extraPhotosType,
        extra_photo_price: formData.extraPhotoPrice,
        require_password: formData.requirePassword,
        access_password: formData.password || undefined,
        link_expiration: formData.linkExpiration,
        allow_download: formData.allowDownload,
      };

      let createdOrUpdatedProject;

      if (isEditMode && projectId) {
        // Atualizar projeto existente
        createdOrUpdatedProject = await atualizarProjetoLumiPhoto(parseInt(projectId), projectData, user);
        toast.success('Projeto atualizado com sucesso!');
      } else {
        // Criar novo projeto
        createdOrUpdatedProject = await criarProjetoLumiPhoto(projectData, user);
        toast.success('Projeto criado com sucesso!');
      }

      // Obter e exibir o share_link gerado pelo backend
      if (createdOrUpdatedProject?.share_link || createdOrUpdatedProject?.share_token) {
        const resolvedLink = buildPublicGalleryUrl(
          createdOrUpdatedProject.share_link,
          createdOrUpdatedProject.share_token
        );
        if (resolvedLink) {
          setShareLink(resolvedLink);
        }
      }

      // Upload de fotos se houver arquivos selecionados
      if (uploadedFiles.length > 0 && createdOrUpdatedProject?.id) {
        try {
          setIsUploadingPhotos(true);
          setUploadProgress(0);

          toast.info(`Enviando ${uploadedFiles.length} foto${uploadedFiles.length > 1 ? 's' : ''}...`);

          let successful = 0;

          for (let i = 0; i < uploadedFiles.length; i++) {
            const item = uploadedFiles[i];
            const wmText = item.watermark.enabled
              ? (item.watermark.text || '').trim() || '© Meu Estúdio'
              : '';

            console.log('🎨 [UPLOAD] Foto:', item.file.name);
            console.log('🎨 [UPLOAD] Marca d\'água habilitada?', item.watermark.enabled);
            console.log('🎨 [UPLOAD] Config:', {
              text: wmText,
              position: item.watermark.position,
              fontSize: item.watermark.fontSize,
              opacity: item.watermark.opacity
            });

            try {
              const uploadedPhoto = await uploadFotoLumiPhoto(
                createdOrUpdatedProject.id,
                item.file,
                user,
                item.watermark.enabled
                  ? {
                      applyWatermark: true,
                      watermarkText: wmText,
                      watermarkPosition: item.watermark.position,
                      watermarkFontSize: item.watermark.fontSize,
                      watermarkOpacity: item.watermark.opacity,
                    }
                  : undefined
              );

              console.log('✅ [UPLOAD] Foto enviada:', uploadedPhoto);
              console.log('✅ [UPLOAD] URLs recebidas:', {
                digital_ocean_url: uploadedPhoto.digital_ocean_url,
                thumbnail_url: uploadedPhoto.thumbnail_url,
                watermarked_url: uploadedPhoto.watermarked_url,
                has_watermark: uploadedPhoto.has_watermark
              });

              if (item.watermark.enabled) {
                const watermarkPayload: WatermarkConfig = {
                  text: wmText,
                  position: item.watermark.position,
                };

                if (Number.isFinite(item.watermark.fontSize)) {
                  watermarkPayload.font_size = item.watermark.fontSize;
                }
                if (Number.isFinite(item.watermark.opacity)) {
                  watermarkPayload.opacity = item.watermark.opacity;
                }

                console.log('🔧 [WATERMARK] Aplicando configuração customizada:', watermarkPayload);

                try {
                  const result = await configurarMarcaDaguaFoto(
                    createdOrUpdatedProject.id,
                    uploadedPhoto.id,
                    watermarkPayload,
                    user
                  );
                  console.log('✅ [WATERMARK] Configuração aplicada:', result);
                } catch (wmError: any) {
                  console.error("❌ [WATERMARK] Erro ao aplicar marca d'água:", wmError?.response?.data || wmError);
                  toast.warn(`Foto ${item.file.name} enviada, mas falhou ao aplicar marca d'água.`);
                }
              }

              successful += 1;
            } catch (singleError: any) {
              console.error('Erro ao enviar foto:', singleError);
              toast.error(`Erro ao enviar ${item.file.name}: ${singleError?.message || 'tente novamente'}`);
            } finally {
              setUploadProgress(Math.round(((i + 1) / uploadedFiles.length) * 100));
            }
          }

          if (successful > 0) {
            toast.success(`${successful} foto${successful > 1 ? 's enviadas' : ' enviada'} com sucesso!`);
          }

          if (successful === 0) {
            toast.error('Nenhuma foto foi enviada. Tente novamente.');
          }

          uploadedFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
          setUploadedFiles([]); // Limpar arquivos após upload
        } catch (uploadError: any) {
          console.error('Erro ao fazer upload das fotos:', uploadError);
          toast.error('Projeto criado, mas houve erro ao enviar algumas fotos. Você pode enviá-las depois.');
        } finally {
          setIsUploadingPhotos(false);
          setUploadProgress(0);
        }
      }

      // Redirecionar para o dashboard do LumiPhoto
      navigate('/lumiphoto');

    } catch (error: any) {
      toast.error(error.message || `Erro ao ${isEditMode ? 'atualizar' : 'criar'} projeto`);
    } finally {
      setIsCreatingProject(false);
    }
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

      {isLoadingProject ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-900 font-medium text-lg">Carregando projeto...</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isEditMode ? 'Editar Projeto' : 'Novo Projeto'}
            </h1>
            <p className="text-gray-600">
              {isEditMode ? 'Atualize as informações do seu projeto' : 'Crie um novo álbum para compartilhar com seu cliente'}
            </p>
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
                    Tipo de Projeto <span className="text-red-500">*</span>
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
                    Data do Projeto <span className="text-red-500">*</span>
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
                      {(uploadedFiles.reduce((acc, item) => acc + item.file.size, 0) / (1024 * 1024)).toFixed(1)} MB
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
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {uploadedFiles.map((item) => (
                      <div key={item.id} className="bg-white p-3 rounded border hover:border-gray-400 transition-colors space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-gray-700 truncate block">{item.file.name}</span>
                            <span className="text-xs text-gray-500">{(item.file.size / (1024 * 1024)).toFixed(2)} MB</span>
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            <button
                              onClick={() => removeFile(item.id)}
                              className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-colors"
                              title="Remover foto"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-start flex-1">
                            <Droplets className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium text-gray-900 block">Marca d'água</span>
                              {item.watermark.enabled ? (
                                <p className="text-xs text-gray-500 truncate">
                                  {item.watermark.text} • {item.watermark.position}
                                </p>
                              ) : (
                                <p className="text-xs text-gray-400">Desativada</p>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => openWatermarkModal(item)}
                            className="flex-shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                          >
                            {item.watermark.enabled ? 'Configurar' : 'Adicionar'}
                          </button>
                        </div>
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
                  Número de fotos contratadas <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.contractedPhotos}
                  onChange={(e) => handleInputChange('contractedPhotos', parseInt(e.target.value) || 0)}
                />
                <p className="text-xs text-gray-500 mt-1">Número de fotos inclusas no contrato original</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número máximo de seleções <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.maxSelections}
                  onChange={(e) => handleInputChange('maxSelections', parseInt(e.target.value) || 0)}
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
                        Preço por foto extra (R$) <span className="text-red-500">*</span>
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
                      Senha de acesso <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Digite uma senha"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                    />
                    {formData.requirePassword && !formData.password.trim() && (
                      <p className="text-xs text-red-500 mt-1">Este campo é obrigatório</p>
                    )}
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
            </div>
          </div>
        </div>
      </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
          {!isEditMode && (
            <button
              type="button"
              onClick={handleSaveAsDraft}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Salvar como rascunho
            </button>
          )}
          <button
            type="button"
            onClick={handleCreateProject}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2 rounded-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
          >
            {isEditMode ? 'Atualizar projeto' : 'Criar projeto'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Cancelar
          </button>
        </div>
      </div>

      {(isCreatingProject || isUploadingPhotos) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center max-w-md w-full mx-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-900 font-medium text-lg text-center">
              {isUploadingPhotos
                ? 'Enviando fotos...'
                : isEditMode ? 'Atualizando projeto...' : 'Criando projeto...'}
            </p>
            <p className="text-gray-500 text-sm mt-2 text-center">
              {isUploadingPhotos
                ? `Aguarde enquanto enviamos ${uploadedFiles.length} foto${uploadedFiles.length > 1 ? 's' : ''} para o servidor`
                : 'Aguarde enquanto processamos suas informações'}
            </p>
            {isUploadingPhotos && (
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </div>
        </div>
      )}

      <WatermarkConfigModal
        isOpen={!!watermarkModalItem}
        onClose={closeWatermarkModal}
        onSave={handleSaveWatermarkModal}
        currentConfig={
          watermarkModalItem
            ? {
                text: watermarkModalItem.watermark.text,
                position: watermarkModalItem.watermark.position,
                font_size: watermarkModalItem.watermark.fontSize,
                opacity: watermarkModalItem.watermark.opacity,
              }
            : undefined
        }
        photoName={watermarkModalItem?.file.name}
        photoPreviewUrl={watermarkModalItem?.previewUrl}
      />
    </div>
  );
}
