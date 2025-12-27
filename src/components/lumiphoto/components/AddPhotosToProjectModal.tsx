import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Settings2, Upload as UploadIcon, CheckCircle2, Image as ImageIcon, X, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import { Modal } from './Modal';
import { WatermarkConfigModal } from './WatermarkConfigModal';
import { useAuth } from '../../../contexts/AuthContext';
import { uploadFotosEmLoteLumiPhoto } from '../../../services/lumiPhotoService';

interface WatermarkConfig {
  text: string;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  font?: string;
  font_size?: number;
  opacity?: number;
}

interface UploadItem {
  id: string;
  file: File;
  previewUrl: string;
  watermark: WatermarkConfig | null;
}

interface AddPhotosToProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  onUploadComplete?: () => void;
}

const DEFAULT_WATERMARK: WatermarkConfig = {
  text: '© Meu Estúdio',
  position: 'bottom-right',
  font: 'poppins',
  font_size: 120,
  opacity: 0.5,
};

export function AddPhotosToProjectModal({
  isOpen,
  onClose,
  projectId,
  onUploadComplete
}: AddPhotosToProjectModalProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState<'select' | 'watermark'>('select');
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [currentWatermarkItem, setCurrentWatermarkItem] = useState<UploadItem | null>(null);
  const [isWatermarkModalOpen, setIsWatermarkModalOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [lastWatermarkConfig, setLastWatermarkConfig] = useState<WatermarkConfig>(DEFAULT_WATERMARK);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('select');
      setUploadItems([]);
      setCurrentWatermarkItem(null);
      setIsWatermarkModalOpen(false);
      setUploading(false);
      setUploadProgress(0);
    }
  }, [isOpen]);

  const createUploadItem = (file: File): UploadItem => ({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    file,
    previewUrl: URL.createObjectURL(file),
    watermark: null,
  });

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
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const rawExtensions = ['.cr2', '.cr3', '.nef', '.arw', '.dng', '.raf', '.orf', '.rw2', '.pef'];

    const imageFiles = files.filter(file => {
      const fileName = file.name.toLowerCase();
      const isRaw = rawExtensions.some(ext => fileName.endsWith(ext));
      const isImage = file.type.startsWith('image/');
      return isImage || isRaw;
    });

    if (imageFiles.length === 0) {
      toast.error('Nenhum arquivo de imagem válido foi selecionado');
      return;
    }

    const newItems = imageFiles.map(file => createUploadItem(file));
    setUploadItems(prev => [...prev, ...newItems]);
  };

  const removeFile = (id: string) => {
    setUploadItems(prev => {
      const item = prev.find(i => i.id === id);
      if (item) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter(i => i.id !== id);
    });
  };

  const clearAllFiles = () => {
    uploadItems.forEach(item => URL.revokeObjectURL(item.previewUrl));
    setUploadItems([]);
  };

  const openWatermarkModal = (item: UploadItem) => {
    setCurrentWatermarkItem(item);
    setIsWatermarkModalOpen(true);
  };

  const handleWatermarkSave = async (config: WatermarkConfig) => {
    if (!currentWatermarkItem) return;

    // Atualiza a foto específica
    setUploadItems(prev =>
      prev.map(item =>
        item.id === currentWatermarkItem.id
          ? { ...item, watermark: config }
          : item
      )
    );

    // Salva como última configuração para uso futuro
    setLastWatermarkConfig(config);

    setIsWatermarkModalOpen(false);
    setCurrentWatermarkItem(null);
    toast.success('Marca d\'água configurada!');
  };

  const handleApplyToAll = () => {
    if (uploadItems.length === 0) return;

    // Pega a configuração da primeira foto que tem marca d'água
    const firstWithWatermark = uploadItems.find(item => item.watermark);
    const configToApply = firstWithWatermark?.watermark || lastWatermarkConfig;

    setUploadItems(prev =>
      prev.map(item => ({
        ...item,
        watermark: configToApply
      }))
    );

    toast.success('Marca d\'água aplicada em todas as fotos!');
  };

  const handleRemoveWatermark = (id: string) => {
    setUploadItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, watermark: null }
          : item
      )
    );
  };

  const handleRemoveAllWatermarks = () => {
    setUploadItems(prev =>
      prev.map(item => ({
        ...item,
        watermark: null
      }))
    );
    toast.info('Marcas d\'água removidas de todas as fotos');
  };

  const handleProceedToWatermark = () => {
    if (uploadItems.length === 0) {
      toast.error('Selecione pelo menos uma foto');
      return;
    }
    setCurrentStep('watermark');
  };

  const handleUpload = async () => {
    if (uploadItems.length === 0) {
      toast.error('Nenhuma foto selecionada');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Upload foto por foto para aplicar marca d'água individual
      const uploadPromises = uploadItems.map(async (item) => {
        const options: any = {};

        if (item.watermark) {
          options.applyWatermark = true;
          options.watermarkText = item.watermark.text;
          options.watermarkPosition = item.watermark.position;
          if (item.watermark.font) options.watermarkFont = item.watermark.font;
          if (item.watermark.font_size) options.watermarkFontSize = item.watermark.font_size;
          if (item.watermark.opacity) options.watermarkOpacity = item.watermark.opacity;
        }

        return uploadFotosEmLoteLumiPhoto(
          projectId,
          [item.file],
          user,
          (progress) => {
            // Atualiza progresso geral
            const itemIndex = uploadItems.findIndex(i => i.id === item.id);
            const baseProgress = (itemIndex / uploadItems.length) * 100;
            const itemProgress = (progress / uploadItems.length);
            setUploadProgress(baseProgress + itemProgress);
          },
          options
        );
      });

      const results = await Promise.all(uploadPromises);

      const totalSuccess = results.reduce((sum, r) => sum + r.photos.length, 0);
      const totalFailed = results.reduce((sum, r) => sum + (r.failed?.length || 0), 0);

      if (totalFailed > 0) {
        toast.warning(`${totalSuccess} fotos enviadas com sucesso. ${totalFailed} falharam.`);
      } else {
        toast.success(`${totalSuccess} foto${totalSuccess !== 1 ? 's' : ''} adicionada${totalSuccess !== 1 ? 's' : ''} com sucesso!`);
      }

      // Call parent callback to refresh photos
      if (onUploadComplete) {
        onUploadComplete();
      }

      // Close modal after short delay
      setTimeout(() => {
        handleClose();
      }, 1500);

    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao fazer upload das fotos');
      setUploading(false);
    }
  };

  const handleClose = () => {
    // Cleanup preview URLs
    uploadItems.forEach(item => URL.revokeObjectURL(item.previewUrl));

    // Reset all state
    setCurrentStep('select');
    setUploadItems([]);
    setCurrentWatermarkItem(null);
    setIsWatermarkModalOpen(false);
    setUploading(false);
    setUploadProgress(0);
    onClose();
  };

  const handleBackToSelect = () => {
    setCurrentStep('select');
  };

  if (!isOpen) return null;

  const photosWithWatermark = uploadItems.filter(item => item.watermark).length;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        size="lg"
        title="Adicionar Mais Fotos ao Projeto"
      >
        {/* Step Indicator */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            currentStep === 'select'
              ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
              : 'bg-green-100 text-green-700 border-2 border-green-300'
          }`}>
            {currentStep === 'select' ? (
              <UploadIcon className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            <span>Selecionar Fotos</span>
          </div>

          <ChevronRight className={`h-5 w-5 transition-colors ${
            currentStep === 'watermark' ? 'text-blue-600' : 'text-gray-400'
          }`} />

          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            currentStep === 'watermark'
              ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
              : 'bg-gray-100 text-gray-500 border-2 border-gray-300'
          }`}>
            <Settings2 className="h-4 w-4" />
            <span>Marca d'água & Upload</span>
          </div>
        </div>

        {/* Content */}
        {currentStep === 'select' ? (
          <div className="space-y-5">
            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <UploadIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">
                    Selecione as fotos que deseja adicionar
                  </h4>
                  <p className="text-sm text-blue-800">
                    Arraste e solte as fotos ou clique para selecionar. Você poderá configurar a marca d'água individualmente na próxima etapa.
                  </p>
                </div>
              </div>
            </div>

            {/* Drag & Drop Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.cr2,.cr3,.nef,.arw,.dng,.raf,.orf,.rw2,.pef"
                onChange={handleChange}
                className="hidden"
              />
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-700 font-medium mb-2">
                Arraste e solte as fotos aqui
              </p>
              <p className="text-sm text-gray-500 mb-4">
                ou clique para selecionar arquivos
              </p>
              <p className="text-xs text-gray-400">
                Formatos suportados: JPG, PNG, GIF, WebP, RAW (CR2, NEF, ARW, etc.)
              </p>
            </div>

            {/* Selected Files Preview */}
            {uploadItems.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900">
                    {uploadItems.length} foto{uploadItems.length !== 1 ? 's' : ''} selecionada{uploadItems.length !== 1 ? 's' : ''}
                  </h4>
                  <button
                    onClick={clearAllFiles}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Limpar todas
                  </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {uploadItems.map((item) => (
                    <div key={item.id} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={item.previewUrl}
                          alt={item.file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(item.id);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                        title="Remover"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <p className="text-xs text-gray-600 mt-1 truncate" title={item.file.name}>
                        {item.file.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleProceedToWatermark}
                disabled={uploadItems.length === 0}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
              >
                <span>Próximo: Marca d'água</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : (
          // Watermark & Upload Step
          <div className="space-y-5">
            {/* Summary */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-green-900 mb-1">
                    {uploadItems.length} foto{uploadItems.length !== 1 ? 's' : ''} pronta{uploadItems.length !== 1 ? 's' : ''} para upload
                  </h4>
                  <p className="text-sm text-green-800">
                    Configure a marca d'água individualmente em cada foto ou aplique em todas de uma vez.
                  </p>
                </div>
              </div>
            </div>

            {/* Bulk Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleApplyToAll}
                disabled={uploading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
              >
                <Settings2 className="h-4 w-4" />
                Aplicar em Todas ({photosWithWatermark > 0 ? `${photosWithWatermark} configuradas` : 'usar padrão'})
              </button>
              {photosWithWatermark > 0 && (
                <button
                  onClick={handleRemoveAllWatermarks}
                  disabled={uploading}
                  className="px-3 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                >
                  Remover Todas
                </button>
              )}
            </div>

            {/* Photos Grid with Individual Watermark Config */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900">
                Fotos Selecionadas
              </h4>
              <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {uploadItems.map((item) => (
                  <div key={item.id} className="relative bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors">
                    <div className="flex gap-3">
                      {/* Thumbnail */}
                      <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded overflow-hidden">
                        <img
                          src={item.previewUrl}
                          alt={item.file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info & Actions */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-900 truncate" title={item.file.name}>
                            {item.file.name}
                          </p>
                          {item.watermark ? (
                            <div className="flex items-center gap-1 mt-1">
                              <Check className="h-3 w-3 text-green-600" />
                              <span className="text-xs text-green-700">Com marca d'água</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500 mt-1 block">Sem marca d'água</span>
                          )}
                        </div>

                        <div className="flex gap-1 mt-2">
                          <button
                            onClick={() => openWatermarkModal(item)}
                            disabled={uploading}
                            className="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors disabled:opacity-50"
                          >
                            {item.watermark ? 'Ajustar' : 'Configurar'}
                          </button>
                          {item.watermark && (
                            <button
                              onClick={() => handleRemoveWatermark(item.id)}
                              disabled={uploading}
                              className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium rounded transition-colors disabled:opacity-50"
                            >
                              Remover
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">Fazendo upload...</span>
                  <span className="text-blue-600 font-medium">{Math.round(uploadProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleBackToSelect}
                disabled={uploading}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors disabled:opacity-50"
              >
                Voltar
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <UploadIcon className="h-5 w-5" />
                    <span>Fazer Upload ({photosWithWatermark}/{uploadItems.length} com marca d'água)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Watermark Configuration Modal (nested) */}
      {isWatermarkModalOpen && currentWatermarkItem && (
        <WatermarkConfigModal
          key={currentWatermarkItem.id}
          isOpen={isWatermarkModalOpen}
          onClose={() => {
            setIsWatermarkModalOpen(false);
            setCurrentWatermarkItem(null);
          }}
          onSave={handleWatermarkSave}
          currentConfig={currentWatermarkItem.watermark || lastWatermarkConfig}
          photoName={currentWatermarkItem.file.name}
          photoPreviewUrl={currentWatermarkItem.previewUrl}
        />
      )}
    </>
  );
}
