import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
    Download, Lock, Eye, X, ChevronLeft, ChevronRight,
    Image as ImageIcon, AlertCircle, Loader2, ZoomIn
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_KODA_DESENVOLVIMENTO || "http://localhost:8080";

interface DeliveryPhoto {
    id: number;
    filename: string;
    original_name: string;
    digital_ocean_url: string;
    thumbnail_url: string | null;
    file_size: number;
    width: number | null;
    height: number | null;
    metadata?: {
        camera?: string;
        iso?: string;
        aperture?: string;
        shutter_speed?: string;
    };
}

interface DeliveryData {
    id: number;
    name: string;
    client_email: string;
    expires_at: string | null;
    total_photos: number;
    layout_settings: {
        logo_url?: string;
        primary_color?: string;
        background_color?: string;
        gallery_layout?: 'grid' | 'masonry' | 'slideshow';
        show_logo?: boolean;
        show_photographer_name?: boolean;
    };
    security_settings: {
        require_password?: boolean;
        allow_download?: boolean;
        allow_individual_download?: boolean;
        allow_zip_download?: boolean;
        show_metadata?: boolean;
        disable_right_click?: boolean;
    };
    photos: DeliveryPhoto[];
    zip_url?: string | null;
}

export function PublicDeliveryGallery() {
    const { deliveryToken } = useParams<{ deliveryToken: string }>();
    const [searchParams] = useSearchParams();

    const [delivery, setDelivery] = useState<DeliveryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [passwordRequired, setPasswordRequired] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [validatingPassword, setValidatingPassword] = useState(false);

    const [selectedPhoto, setSelectedPhoto] = useState<DeliveryPhoto | null>(null);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [downloadingZip, setDownloadingZip] = useState(false);

    useEffect(() => {
        loadDelivery();
    }, [deliveryToken]);

    useEffect(() => {
        // Registrar visualização
        if (delivery && !passwordRequired) {
            trackView();
        }
    }, [delivery, passwordRequired]);

    const loadDelivery = async (pwd?: string) => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (pwd) params.append('password', pwd);
            else if (searchParams.get('password')) params.append('password', searchParams.get('password')!);

            const response = await axios.get(
                `${API_BASE_URL}/api/v1/public/lumiphoto/delivery/${deliveryToken}?${params.toString()}`
            );

            setDelivery(response.data.data || response.data);
            setPasswordRequired(false);
        } catch (err: any) {
            if (err.response?.status === 403) {
                setPasswordRequired(true);
                setPasswordError('');
            } else if (err.response?.status === 404) {
                setError('Entrega não encontrada ou link expirado.');
            } else {
                setError('Erro ao carregar a entrega. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setValidatingPassword(true);
        setPasswordError('');

        try {
            await loadDelivery(password);
        } catch (err) {
            setPasswordError('Senha incorreta. Tente novamente.');
        } finally {
            setValidatingPassword(false);
        }
    };

    const trackView = async () => {
        try {
            await axios.post(
                `${API_BASE_URL}/api/v1/public/lumiphoto/delivery/${deliveryToken}/view`,
                { password: searchParams.get('password') || password }
            );
        } catch (err) {
            console.error('Erro ao registrar visualização:', err);
        }
    };

    const extractFilename = (contentDisposition?: string | null, fallback?: string) => {
        if (!contentDisposition) return fallback;
        const match = /filename[^;=\n]*=(?:UTF-8'')?"?([^";]+)/i.exec(contentDisposition);
        if (match && match[1]) {
            return decodeURIComponent(match[1].trim());
        }
        return fallback;
    };

    const handleDownloadPhoto = async (photo: DeliveryPhoto) => {
        if (!delivery?.security_settings.allow_individual_download) {
            toast.error('Downloads individuais não estão permitidos');
            return;
        }

        try {
            toast.info('Preparando download...');

            const response = await axios.get(
                `${API_BASE_URL}/api/v1/public/lumiphoto/delivery/${deliveryToken}/download/${photo.id}`,
                {
                    params: password ? { password } : undefined,
                    responseType: 'blob',
                }
            );

            const filename = extractFilename(response.headers['content-disposition'], photo.original_name || photo.filename);
            const blobUrl = window.URL.createObjectURL(response.data);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename || `foto-${photo.id}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);

            await axios.post(
                `${API_BASE_URL}/api/v1/public/lumiphoto/delivery/${deliveryToken}/download-track`,
                { photo_id: photo.id, password }
            );

            toast.success('Download iniciado!');
        } catch (err) {
            toast.error('Erro ao fazer download');
        }
    };

    const handleDownloadZip = async () => {
        if (!delivery?.security_settings.allow_zip_download) {
            toast.error('Download em lote não está permitido');
            return;
        }

        try {
            setDownloadingZip(true);
            toast.info('Preparando arquivo ZIP...');

            const response = await axios.get(
                `${API_BASE_URL}/api/v1/public/lumiphoto/delivery/${deliveryToken}/download/zip`,
                {
                    params: password ? { password } : undefined,
                    responseType: 'blob',
                }
            );

            const filename = extractFilename(
                response.headers['content-disposition'],
                `${delivery?.name || 'fotos'}-completo.zip`
            );
            const blobUrl = window.URL.createObjectURL(response.data);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename || `${delivery?.name || 'fotos'}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);

            await axios.post(
                `${API_BASE_URL}/api/v1/public/lumiphoto/delivery/${deliveryToken}/download-track`,
                { password }
            );

            toast.success('Download do ZIP iniciado!');
        } catch (err) {
            toast.error('Erro ao baixar ZIP');
        } finally {
            setDownloadingZip(false);
        }
    };
    const openPhotoModal = (photo: DeliveryPhoto, index: number) => {
        setSelectedPhoto(photo);
        setCurrentPhotoIndex(index);
    };

    const closePhotoModal = () => {
        setSelectedPhoto(null);
    };

    const navigatePhoto = (direction: 'prev' | 'next') => {
        if (!delivery) return;

        let newIndex = currentPhotoIndex;
        if (direction === 'prev') {
            newIndex = currentPhotoIndex > 0 ? currentPhotoIndex - 1 : delivery.photos.length - 1;
        } else {
            newIndex = currentPhotoIndex < delivery.photos.length - 1 ? currentPhotoIndex + 1 : 0;
        }

        setCurrentPhotoIndex(newIndex);
        setSelectedPhoto(delivery.photos[newIndex]);
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Carregando galeria...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                    <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Ops!</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    // Password required state
    if (passwordRequired) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
                    <div className="text-center mb-6">
                        <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                            <Lock className="h-8 w-8 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Galeria Protegida</h2>
                        <p className="text-gray-600">Esta galeria requer uma senha para acesso</p>
                    </div>

                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Senha de Acesso
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Digite a senha"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                required
                                autoFocus
                            />
                            {passwordError && (
                                <p className="text-sm text-red-600 mt-2">{passwordError}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={validatingPassword}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                        >
                            {validatingPassword ? (
                                <>
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                    Validando...
                                </>
                            ) : (
                                'Acessar Galeria'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    if (!delivery) return null;

    const primaryColor = delivery.layout_settings.primary_color || '#10B981';
    const backgroundColor = delivery.layout_settings.background_color || '#FFFFFF';
    const galleryLayout = delivery.layout_settings.gallery_layout || 'grid';

    return (
        <div
            className="min-h-screen"
            style={{ backgroundColor }}
            onContextMenu={delivery.security_settings.disable_right_click ? (e) => e.preventDefault() : undefined}
        >
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="text-center md:text-left">
                            {delivery.layout_settings.show_logo && delivery.layout_settings.logo_url && (
                                <img
                                    src={delivery.layout_settings.logo_url}
                                    alt="Logo"
                                    className="h-12 mx-auto md:mx-0 mb-4 object-contain"
                                />
                            )}
                            <h1
                                className="text-3xl font-bold mb-2"
                                style={{ color: primaryColor }}
                            >
                                {delivery.name}
                            </h1>
                            <p className="text-gray-600 flex items-center justify-center md:justify-start">
                                <ImageIcon className="h-4 w-4 mr-2" />
                                {delivery.total_photos} foto{delivery.total_photos !== 1 ? 's' : ''}
                            </p>
                        </div>

                        {delivery.security_settings.allow_download && delivery.security_settings.allow_zip_download && (
                            <button
                                onClick={handleDownloadZip}
                                disabled={downloadingZip}
                                className="mt-4 md:mt-0 px-6 py-3 rounded-lg font-medium text-white transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                style={{ backgroundColor: primaryColor }}
                            >
                                {downloadingZip ? (
                                    <>
                                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                        Preparando...
                                    </>
                                ) : (
                                    <>
                                        <Download className="h-5 w-5 mr-2" />
                                        Baixar Todas
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Gallery Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {delivery.photos.length === 0 ? (
                    <div className="text-center py-16">
                        <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Nenhuma foto disponível ainda</p>
                    </div>
                ) : galleryLayout === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {delivery.photos.map((photo, index) => (
                            <div
                                key={photo.id}
                                className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105 shadow-md hover:shadow-xl"
                                onClick={() => openPhotoModal(photo, index)}
                            >
                                <img
                                    src={photo.thumbnail_url || photo.digital_ocean_url}
                                    alt={photo.original_name}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                                    <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : galleryLayout === 'masonry' ? (
                    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
                        {delivery.photos.map((photo, index) => (
                            <div
                                key={photo.id}
                                className="group relative mb-4 bg-gray-100 rounded-lg overflow-hidden cursor-pointer break-inside-avoid transition-transform hover:scale-105 shadow-md hover:shadow-xl"
                                onClick={() => openPhotoModal(photo, index)}
                            >
                                <img
                                    src={photo.thumbnail_url || photo.digital_ocean_url}
                                    alt={photo.original_name}
                                    className="w-full"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                                    <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto">
                        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-2xl">
                            <img
                                src={delivery.photos[currentPhotoIndex]?.digital_ocean_url}
                                alt={delivery.photos[currentPhotoIndex]?.original_name}
                                className="w-full h-full object-contain"
                            />

                            <button
                                onClick={() => navigatePhoto('prev')}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all"
                            >
                                <ChevronLeft className="h-6 w-6" style={{ color: primaryColor }} />
                            </button>

                            <button
                                onClick={() => navigatePhoto('next')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all"
                            >
                                <ChevronRight className="h-6 w-6" style={{ color: primaryColor }} />
                            </button>

                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 px-4 py-2 rounded-full">
                                <span className="text-sm font-medium">
                                    {currentPhotoIndex + 1} / {delivery.photos.length}
                                </span>
                            </div>
                        </div>

                        {/* Thumbnails */}
                        <div className="mt-6 grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                            {delivery.photos.map((photo, index) => (
                                <button
                                    key={photo.id}
                                    onClick={() => {
                                        setCurrentPhotoIndex(index);
                                    }}
                                    className={`aspect-square rounded overflow-hidden transition-all ${
                                        currentPhotoIndex === index
                                            ? 'ring-4 ring-offset-2'
                                            : 'opacity-60 hover:opacity-100'
                                    }`}
                                    style={currentPhotoIndex === index ? { ringColor: primaryColor } : {}}
                                >
                                    <img
                                        src={photo.thumbnail_url || photo.digital_ocean_url}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Photo Modal */}
            {selectedPhoto && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                    <button
                        onClick={closePhotoModal}
                        className="absolute top-5 right-5 text-white hover:text-gray-300 transition-colors"
                    >
                        <X className="h-8 w-8" />
                    </button>

                    <button
                        onClick={() => navigatePhoto('prev')}
                        className="absolute left-6 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
                    >
                        <ChevronLeft className="h-12 w-12" />
                    </button>

                    <button
                        onClick={() => navigatePhoto('next')}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
                    >
                        <ChevronRight className="h-12 w-12" />
                    </button>

                    <div className="w-full max-w-4xl">
                        <div className="bg-white/95 rounded-[32px] shadow-2xl p-6 sm:p-10">
                            <div className="bg-white rounded-[28px] border border-gray-100 shadow-lg p-4 sm:p-6 mb-6">
                                <div className="bg-gray-50 rounded-2xl border border-gray-100 shadow-inner p-4 flex items-center justify-center">
                                    <img
                                        src={selectedPhoto.digital_ocean_url}
                                        alt={selectedPhoto.original_name}
                                        className="max-h-[65vh] w-auto object-contain"
                                    />
                                </div>
                                <div className="mt-5 h-4 rounded-full bg-gray-100 shadow-inner w-3/4 mx-auto"></div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <p className="text-lg font-semibold text-gray-900">{selectedPhoto.original_name}</p>
                                    <p className="text-sm text-gray-500">
                                        {Math.round((selectedPhoto.file_size / 1024 / 1024) * 10) / 10} MB • {selectedPhoto.mime_type}
                                    </p>
                                </div>

                                {delivery.security_settings.allow_individual_download && (
                                    <button
                                        onClick={() => handleDownloadPhoto(selectedPhoto)}
                                        className="inline-flex items-center justify-center px-5 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Baixar Foto
                                    </button>
                                )}
                            </div>

                            {delivery.security_settings.show_metadata && selectedPhoto.metadata && (
                                <div className="mt-6 border-t border-gray-100 pt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                                    {selectedPhoto.metadata.camera && <span>📷 {selectedPhoto.metadata.camera}</span>}
                                    {selectedPhoto.metadata.iso && <span>ISO {selectedPhoto.metadata.iso}</span>}
                                    {selectedPhoto.metadata.aperture && <span>ƒ/{selectedPhoto.metadata.aperture}</span>}
                                    {selectedPhoto.metadata.shutter_speed && <span>{selectedPhoto.metadata.shutter_speed}s</span>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="bg-white border-t mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-600 text-sm">
                    <p>Galeria criada com LumiPhoto</p>
                    {delivery.expires_at && (
                        <p className="mt-1">Link expira em: {new Date(delivery.expires_at).toLocaleDateString('pt-BR')}</p>
                    )}
                </div>
            </footer>
        </div>
    );
}
