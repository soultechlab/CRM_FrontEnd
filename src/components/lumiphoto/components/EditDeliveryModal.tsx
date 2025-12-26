import { useState, useEffect, useCallback } from 'react';
import { X, Palette, Shield, Clock, Image as ImageIcon, Save, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Modal } from './Modal';
import { useAuth } from '../../../contexts/AuthContext';
import { atualizarEntregaLumiPhoto, uploadLogoEntregaLumiPhoto } from '../../../services/lumiPhotoService';
import { toast } from 'react-toastify';

interface DeliveryData {
  id: number;
  name: string;
  expirationDays?: number | null;
  layout_settings?: {
    logo_url?: string | null;
    primary_color?: string;
    background_color?: string;
    gallery_layout?: 'grid' | 'masonry' | 'slideshow';
  };
  security_settings?: {
    require_password?: boolean;
    password?: string;
    allow_download?: boolean;
    allow_individual_download?: boolean;
    allow_zip_download?: boolean;
    show_metadata?: boolean;
  };
  photosList?: Array<{
    id: number;
    thumbnail_url?: string;
    digital_ocean_url?: string;
  }>;
}

interface EditDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  delivery: DeliveryData | null;
  onSaved: () => void;
}

export function EditDeliveryModal({ isOpen, onClose, delivery, onSaved }: EditDeliveryModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'layout' | 'security' | 'expiration'>('layout');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const [formData, setFormData] = useState({
    logoUrl: '',
    primaryColor: '#10B981',
    backgroundColor: '#FFFFFF',
    galleryLayout: 'grid' as 'grid' | 'masonry' | 'slideshow',
    requirePassword: false,
    password: '',
    allowDownload: true,
    allowIndividualDownload: true,
    allowZipDownload: true,
    showMetadata: false,
    expirationDays: 7,
  });

  useEffect(() => {
    if (delivery && isOpen) {
      setFormData({
        logoUrl: delivery.layout_settings?.logo_url || '',
        primaryColor: delivery.layout_settings?.primary_color || '#10B981',
        backgroundColor: delivery.layout_settings?.background_color || '#FFFFFF',
        galleryLayout: delivery.layout_settings?.gallery_layout || 'grid',
        requirePassword: delivery.security_settings?.require_password || false,
        password: delivery.security_settings?.password || '',
        allowDownload: delivery.security_settings?.allow_download ?? true,
        allowIndividualDownload: delivery.security_settings?.allow_individual_download ?? true,
        allowZipDownload: delivery.security_settings?.allow_zip_download ?? true,
        showMetadata: delivery.security_settings?.show_metadata || false,
        expirationDays: delivery.expirationDays || 7,
      });
      setCurrentSlideIndex(0);
    }
  }, [delivery, isOpen]);

  // Funções de navegação do slideshow
  const handlePreviousSlide = useCallback(() => {
    const photoCount = delivery?.photosList?.length || 0;
    setCurrentSlideIndex(prev =>
      prev === 0 ? photoCount - 1 : prev - 1
    );
  }, [delivery?.photosList?.length]);

  const handleNextSlide = useCallback(() => {
    const photoCount = delivery?.photosList?.length || 0;
    setCurrentSlideIndex(prev =>
      prev === photoCount - 1 ? 0 : prev + 1
    );
  }, [delivery?.photosList?.length]);

  // Navegação com teclado no slideshow
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (formData.galleryLayout === 'slideshow' && delivery?.photosList && delivery.photosList.length > 1) {
        if (e.key === 'ArrowLeft') {
          handlePreviousSlide();
        } else if (e.key === 'ArrowRight') {
          handleNextSlide();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, formData.galleryLayout, delivery?.photosList, handlePreviousSlide, handleNextSlide]);

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Resetar índice do slideshow ao mudar o layout
    if (field === 'galleryLayout') {
      setCurrentSlideIndex(0);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) {
      return;
    }

    const file = e.target.files[0];

    try {
      setIsUploadingLogo(true);
      const result = await uploadLogoEntregaLumiPhoto(file, user);
      setFormData(prev => ({
        ...prev,
        logoUrl: result.url,
      }));
      toast.success('Logo enviada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao enviar logo:', error);
      toast.error(error.response?.data?.message || 'Erro ao enviar logo');
    } finally {
      setIsUploadingLogo(false);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    if (!delivery) return;

    try {
      setIsSaving(true);

      const updateData = {
        expiration_days: formData.expirationDays,
        layout_settings: {
          logo_url: formData.logoUrl || null,
          primary_color: formData.primaryColor,
          background_color: formData.backgroundColor,
          gallery_layout: formData.galleryLayout,
        },
        security_settings: {
          require_password: formData.requirePassword,
          password: formData.requirePassword ? formData.password : undefined,
          allow_download: formData.allowDownload,
          allow_individual_download: formData.allowIndividualDownload,
          allow_zip_download: formData.allowZipDownload,
          show_metadata: formData.showMetadata,
        },
      };

      await atualizarEntregaLumiPhoto(delivery.id, updateData, user);
      toast.success('Configurações atualizadas com sucesso!');
      onSaved();
      onClose();
    } catch (error: any) {
      console.error('Erro ao atualizar entrega:', error);
      toast.error(error.response?.data?.message || 'Erro ao atualizar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  if (!delivery) return null;

  const renderLayoutTab = () => {
    const photos = delivery?.photosList || [];
    const photoUrls = photos.map(p => p.thumbnail_url || p.digital_ocean_url).filter(Boolean) as string[];

    return (
      <div className="space-y-6">
        {/* Preview da Galeria */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Palette className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-sm font-semibold text-blue-900">
                Preview da Galeria
              </h3>
            </div>
            {photoUrls.length === 0 && (
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                Nenhuma foto nesta entrega
              </span>
            )}
          </div>
          <div
            className="rounded-lg overflow-hidden shadow-lg"
            style={{
              backgroundColor: formData.backgroundColor,
              minHeight: '200px'
            }}
          >
            <div className="p-6">
              {formData.logoUrl && (
                <div className="mb-4 text-center">
                  <img
                    src={formData.logoUrl}
                    alt="Logo Preview"
                    className="h-12 mx-auto object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div
                className="text-center py-8"
                style={{ color: formData.primaryColor }}
              >
                <h3 className="text-2xl font-bold mb-2" style={{ color: formData.primaryColor }}>
                  {delivery?.name || 'Nome da Entrega'}
                </h3>
                <p className="text-sm opacity-75">
                  Layout: {formData.galleryLayout === 'grid' ? 'Grade' : formData.galleryLayout === 'masonry' ? 'Mosaico' : 'Slideshow'}
                </p>
              </div>

              {/* Simulação do layout */}
              <div className="mt-4">
                {formData.galleryLayout === 'grid' && (
                  <div className="grid grid-cols-3 gap-2">
                    {photoUrls.length > 0 ? (
                      photoUrls.slice(0, 6).map((url, i) => (
                        <div
                          key={i}
                          className="aspect-square rounded overflow-hidden"
                          style={{ borderColor: formData.primaryColor }}
                        >
                          <img
                            src={url}
                            alt={`Preview ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))
                    ) : (
                      [1, 2, 3, 4, 5, 6].map(i => (
                        <div
                          key={i}
                          className="aspect-square rounded bg-white/20 backdrop-blur-sm flex items-center justify-center"
                          style={{ borderColor: formData.primaryColor }}
                        >
                          <ImageIcon className="h-8 w-8 text-gray-400 opacity-50" />
                        </div>
                      ))
                    )}
                  </div>
                )}
                {formData.galleryLayout === 'masonry' && (
                  <div className="grid grid-cols-3 gap-2">
                    {photoUrls.length > 0 ? (
                      <>
                        {photoUrls[0] && (
                          <div className="aspect-[3/4] rounded overflow-hidden">
                            <img src={photoUrls[0]} alt="Preview 1" className="w-full h-full object-cover" />
                          </div>
                        )}
                        {photoUrls[1] && (
                          <div className="aspect-square rounded overflow-hidden">
                            <img src={photoUrls[1]} alt="Preview 2" className="w-full h-full object-cover" />
                          </div>
                        )}
                        {photoUrls[2] && (
                          <div className="aspect-[4/3] rounded overflow-hidden">
                            <img src={photoUrls[2]} alt="Preview 3" className="w-full h-full object-cover" />
                          </div>
                        )}
                        {photoUrls[3] && (
                          <div className="aspect-square rounded overflow-hidden">
                            <img src={photoUrls[3]} alt="Preview 4" className="w-full h-full object-cover" />
                          </div>
                        )}
                        {photoUrls[4] && (
                          <div className="aspect-[3/4] rounded overflow-hidden">
                            <img src={photoUrls[4]} alt="Preview 5" className="w-full h-full object-cover" />
                          </div>
                        )}
                        {photoUrls[5] && (
                          <div className="aspect-square rounded overflow-hidden">
                            <img src={photoUrls[5]} alt="Preview 6" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="aspect-[3/4] rounded bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-gray-400 opacity-50" />
                        </div>
                        <div className="aspect-square rounded bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-gray-400 opacity-50" />
                        </div>
                        <div className="aspect-[4/3] rounded bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-gray-400 opacity-50" />
                        </div>
                        <div className="aspect-square rounded bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-gray-400 opacity-50" />
                        </div>
                        <div className="aspect-[3/4] rounded bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-gray-400 opacity-50" />
                        </div>
                        <div className="aspect-square rounded bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-gray-400 opacity-50" />
                        </div>
                      </>
                    )}
                  </div>
                )}
                {formData.galleryLayout === 'slideshow' && (
                  <div className="aspect-video rounded overflow-hidden bg-white/20 backdrop-blur-sm flex items-center justify-center relative group">
                    {photoUrls.length > 0 ? (
                      <>
                        <img
                          src={photoUrls[currentSlideIndex]}
                          alt={`Preview slideshow ${currentSlideIndex + 1}`}
                          className="w-full h-full object-contain transition-opacity duration-300"
                          key={currentSlideIndex}
                        />

                        {/* Botões de navegação */}
                        {photoUrls.length > 1 && (
                          <>
                            <button
                              onClick={handlePreviousSlide}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                              style={{ color: 'white' }}
                            >
                              <ChevronLeft className="h-6 w-6" />
                            </button>
                            <button
                              onClick={handleNextSlide}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                              style={{ color: 'white' }}
                            >
                              <ChevronRight className="h-6 w-6" />
                            </button>

                            {/* Indicador de posição */}
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
                              <div className="bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium">
                                {currentSlideIndex + 1} / {photoUrls.length}
                              </div>
                              <div className="bg-black/50 text-white/75 px-2 py-0.5 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                                Use ← → para navegar
                              </div>
                            </div>

                            {/* Indicadores de pontos */}
                            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5 items-center">
                              {photoUrls.slice(0, 10).map((_, index) => (
                                <button
                                  key={index}
                                  onClick={() => setCurrentSlideIndex(index)}
                                  className={`rounded-full transition-all ${
                                    index === currentSlideIndex
                                      ? 'w-6 h-2 bg-white'
                                      : 'w-2 h-2 bg-white/50 hover:bg-white/75'
                                  }`}
                                />
                              ))}
                              {photoUrls.length > 10 && (
                                <span className="text-white/75 text-xs ml-1">+{photoUrls.length - 10}</span>
                              )}
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="text-center" style={{ color: formData.primaryColor }}>
                        <ImageIcon className="h-16 w-16 mx-auto mb-2 opacity-50" />
                        <p className="text-sm opacity-75">Modo Slideshow</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Palette className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">
                Identidade Visual
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                Personalize as cores e o logo da galeria
              </p>
            </div>
          </div>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cor Primária
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={formData.primaryColor}
              onChange={(e) => handleInputChange('primaryColor', e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={formData.primaryColor}
              onChange={(e) => handleInputChange('primaryColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
              placeholder="#10B981"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cor de Fundo
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={formData.backgroundColor}
              onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={formData.backgroundColor}
              onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
              placeholder="#FFFFFF"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Logo da galeria
        </label>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
            id="edit-delivery-logo-upload"
          />
          <label
            htmlFor="edit-delivery-logo-upload"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <ImageIcon className="h-4 w-4 mr-2 text-gray-500" />
            {isUploadingLogo ? 'Enviando...' : 'Alterar logo'}
          </label>
          {formData.logoUrl && (
            <button
              type="button"
              onClick={() => handleInputChange('logoUrl', '')}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Remover
            </button>
          )}
        </div>
        {formData.logoUrl && (
          <div className="mt-4 flex items-center gap-4 bg-white border border-gray-200 rounded-lg p-3">
            <img
              src={formData.logoUrl}
              alt="Logo preview"
              className="h-16 object-contain"
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Layout da Galeria
        </label>
        <div className="grid grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => handleInputChange('galleryLayout', 'grid')}
            className={`p-4 border-2 rounded-lg text-center transition-colors ${formData.galleryLayout === 'grid'
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-gray-300 hover:border-gray-400'
              }`}
          >
            <div className="grid grid-cols-2 gap-1 w-8 h-8 mx-auto mb-2">
              <div className="bg-current opacity-20 rounded"></div>
              <div className="bg-current opacity-20 rounded"></div>
              <div className="bg-current opacity-20 rounded"></div>
              <div className="bg-current opacity-20 rounded"></div>
            </div>
            <span className="text-sm font-medium">Grade</span>
          </button>

          <button
            type="button"
            onClick={() => handleInputChange('galleryLayout', 'masonry')}
            className={`p-4 border-2 rounded-lg text-center transition-colors ${formData.galleryLayout === 'masonry'
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-gray-300 hover:border-gray-400'
              }`}
          >
            <div className="grid grid-cols-2 gap-1 w-8 h-8 mx-auto mb-2">
              <div className="bg-current opacity-20 rounded h-4"></div>
              <div className="bg-current opacity-20 rounded h-2"></div>
              <div className="bg-current opacity-20 rounded h-2"></div>
              <div className="bg-current opacity-20 rounded h-4"></div>
            </div>
            <span className="text-sm font-medium">Mosaico</span>
          </button>

          <button
            type="button"
            onClick={() => handleInputChange('galleryLayout', 'slideshow')}
            className={`p-4 border-2 rounded-lg text-center transition-colors ${formData.galleryLayout === 'slideshow'
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-gray-300 hover:border-gray-400'
              }`}
          >
            <div className="w-8 h-8 mx-auto mb-2 bg-current opacity-20 rounded"></div>
            <span className="text-sm font-medium">Slideshow</span>
          </button>
        </div>
      </div>
    </div>
    );
  };

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">
              Proteção de Conteúdo
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              Configure as opções de segurança para proteger suas fotos
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-900">Proteger com senha</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Exige senha para acessar a galeria
            </p>
          </div>
          <input
            type="checkbox"
            checked={formData.requirePassword}
            onChange={(e) => handleInputChange('requirePassword', e.target.checked)}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
        </div>

        {formData.requirePassword && (
          <div className="ml-6 pl-4 border-l-2 border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha de acesso
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Digite uma senha"
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1">
              Mínimo de 4 caracteres
            </p>
          </div>
        )}

        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-900">Permitir downloads</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Clientes podem baixar as fotos
            </p>
          </div>
          <input
            type="checkbox"
            checked={formData.allowDownload}
            onChange={(e) => handleInputChange('allowDownload', e.target.checked)}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-900">Download individual</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Permite baixar fotos uma por vez
            </p>
          </div>
          <input
            type="checkbox"
            checked={formData.allowIndividualDownload}
            onChange={(e) => handleInputChange('allowIndividualDownload', e.target.checked)}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-900">Download em ZIP</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Permite baixar todas as fotos de uma vez
            </p>
          </div>
          <input
            type="checkbox"
            checked={formData.allowZipDownload}
            onChange={(e) => handleInputChange('allowZipDownload', e.target.checked)}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-900">Exibir metadados</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Mostra informações técnicas das fotos
            </p>
          </div>
          <input
            type="checkbox"
            checked={formData.showMetadata}
            onChange={(e) => handleInputChange('showMetadata', e.target.checked)}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
        </div>
      </div>

      {formData.requirePassword && (!formData.password || formData.password.length < 4) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-amber-900">
                Atenção
              </h3>
              <p className="text-sm text-amber-700 mt-1">
                A senha deve ter no mínimo 4 caracteres para proteger adequadamente a entrega.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderExpirationTab = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Clock className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">
              Validade da Entrega
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              Configure por quanto tempo o link ficará disponível
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dias para expiração
        </label>
        <input
          type="number"
          value={formData.expirationDays}
          onChange={(e) => handleInputChange('expirationDays', parseInt(e.target.value) || 7)}
          min="1"
          max="365"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
        />
        <p className="text-sm text-gray-500 mt-1">
          Após este período, o link expira e o cliente não poderá mais acessar as fotos
        </p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">
          Informação
        </h4>
        <p className="text-sm text-gray-600">
          A contagem de dias começa quando a entrega é enviada ao cliente. Se a entrega ainda não foi enviada, a data de expiração será calculada automaticamente após o envio.
        </p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'layout':
        return renderLayoutTab();
      case 'security':
        return renderSecurityTab();
      case 'expiration':
        return renderExpirationTab();
      default:
        return renderLayoutTab();
    }
  };

  const canSave = () => {
    if (formData.requirePassword && (!formData.password || formData.password.length < 4)) {
      return false;
    }
    return true;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Editar: ${delivery.name}`} size="xl">
      <div className="flex flex-col h-full">
        {/* Tabs */}
        <div className="flex-shrink-0 border-b border-gray-200 bg-white px-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('layout')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === 'layout'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Layout
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === 'security'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Segurança
            </button>
            <button
              onClick={() => setActiveTab('expiration')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === 'expiration'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Validade
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave() || isSaving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
