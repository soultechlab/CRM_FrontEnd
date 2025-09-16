import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Palette, Shield, Eye, Lock, Download, Globe, Activity, Info, AlertTriangle } from 'lucide-react';
import { LumiPhotoHeader } from './components/LumiPhotoHeader';

interface DeliveryFormData {
    name: string;
    clientEmail: string;
    expirationDays: number;

    // Layout settings
    logoUrl: string;
    primaryColor: string;
    backgroundColor: string;
    showWatermark: boolean;
    galleryLayout: 'grid' | 'masonry' | 'slideshow';

    // Security settings
    requirePassword: boolean;
    password: string;
    allowDownload: boolean;
    allowRightClick: boolean;
    showMetadata: boolean;
    trackDownloads: boolean;
}

export function NewDelivery() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState<'details' | 'layout' | 'security'>('details');
    const [formData, setFormData] = useState<DeliveryFormData>({
        name: '',
        clientEmail: '',
        expirationDays: 7,

        // Layout defaults
        logoUrl: '',
        primaryColor: '#10B981',
        backgroundColor: '#FFFFFF',
        showWatermark: true,
        galleryLayout: 'grid',

        // Security defaults
        requirePassword: false,
        password: '',
        allowDownload: true,
        allowRightClick: false,
        showMetadata: false,
        trackDownloads: true
    });

    const handleInputChange = (field: keyof DeliveryFormData, value: string | number | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleNext = () => {
        if (currentStep === 'details') {
            setCurrentStep('layout');
        } else if (currentStep === 'layout') {
            setCurrentStep('security');
        }
    };

    const handleBack = () => {
        if (currentStep === 'security') {
            setCurrentStep('layout');
        } else if (currentStep === 'layout') {
            setCurrentStep('details');
        } else {
            navigate('/lumiphoto/delivery');
        }
    };

    const isStepValid = () => {
        if (currentStep === 'details') {
            return formData.name.trim() && formData.clientEmail.trim();
        }
        if (currentStep === 'security' && formData.requirePassword) {
            return formData.password.trim().length >= 4;
        }
        return true;
    };

    const handleCreateDelivery = () => {
        // Here you would typically send the data to your API
        console.log('Creating delivery with data:', formData);
        // Navigate back to delivery list or show success message
        navigate('/lumiphoto/delivery');
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 'details':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nome da entrega
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="Ex: Casamento Ana & Pedro - Fotos Editadas"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                E-mail do cliente
                            </label>
                            <input
                                type="email"
                                value={formData.clientEmail}
                                onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                                placeholder="cliente@exemplo.com"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Um link para download será enviado para este e-mail
                            </p>
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
                                Após este período, o link expira e o cliente não poderá mais baixar as fotos
                            </p>
                        </div>
                    </div>
                );
            case 'layout':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Palette className="h-4 w-4 inline mr-1" />
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
                                    <Globe className="h-4 w-4 inline mr-1" />
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
                                URL do Logo (opcional)
                            </label>
                            <input
                                type="url"
                                value={formData.logoUrl}
                                onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                                placeholder="https://exemplo.com/logo.png"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Adicione seu logo personalizado à galeria
                            </p>
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

                        <div className="border-t pt-6">
                            <div className="flex items-center">
                                <input
                                    id="show-watermark"
                                    type="checkbox"
                                    checked={formData.showWatermark}
                                    onChange={(e) => handleInputChange('showWatermark', e.target.checked)}
                                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                />
                                <label htmlFor="show-watermark" className="ml-2 block text-sm text-gray-900">
                                    Exibir marca d'água nas imagens
                                </label>
                            </div>
                            <p className="text-sm text-gray-500 mt-1 ml-6">
                                Adiciona uma marca d'água sutil para proteger suas imagens
                            </p>
                        </div>
                    </div>
                );
            case 'security':
                return (
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
                                        <Lock className="h-4 w-4 text-gray-600 mr-2" />
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
                                </div>
                            )}

                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div>
                                    <div className="flex items-center">
                                        <Download className="h-4 w-4 text-gray-600 mr-2" />
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
                                        <Eye className="h-4 w-4 text-gray-600 mr-2" />
                                        <span className="text-sm font-medium text-gray-900">Desabilitar clique direito</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Impede salvamento via clique direito
                                    </p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={!formData.allowRightClick}
                                    onChange={(e) => handleInputChange('allowRightClick', !e.target.checked)}
                                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div>
                                    <div className="flex items-center">
                                        <Activity className="h-4 w-4 text-gray-600 mr-2" />
                                        <span className="text-sm font-medium text-gray-900">Rastrear downloads</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Monitora quais fotos foram baixadas
                                    </p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={formData.trackDownloads}
                                    onChange={(e) => handleInputChange('trackDownloads', e.target.checked)}
                                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div>
                                    <div className="flex items-center">
                                        <Info className="h-4 w-4 text-gray-600 mr-2" />
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

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-amber-900">
                                        Importante sobre a segurança
                                    </h3>
                                    <p className="text-sm text-amber-700 mt-1">
                                        Lembre-se de que estas são medidas básicas de proteção. Para maior segurança, considere usar marcas d'água e limitar o tempo de acesso.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <LumiPhotoHeader delivery={true} />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Nova Entrega</h1>
                    <p className="text-gray-600">Configure uma nova entrega para seus clientes</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border">
                    <div className="p-8">
                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Nova Entrega</h2>
                            <p className="text-gray-600">Configure os detalhes da sua nova entrega de fotos</p>
                        </div>

                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => setCurrentStep('details')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentStep === 'details'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        Detalhes
                                    </button>
                                    <button
                                        onClick={() => setCurrentStep('layout')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentStep === 'layout'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        Layout
                                    </button>
                                    <button
                                        onClick={() => setCurrentStep('security')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentStep === 'security'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        Segurança
                                    </button>
                                </div>
                            </div>
                        </div>

                        {renderStepContent()}

                        <div className="flex justify-end space-x-4 mt-8">
                            <button
                                onClick={handleBack}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                {currentStep === 'details' ? 'Voltar' : 'Anterior'}
                            </button>
                            <button
                                onClick={currentStep === 'security' ? handleCreateDelivery : handleNext}
                                disabled={!isStepValid()}
                                className="inline-flex items-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                {currentStep === 'security' ? 'Criar Entrega' : 'Próximo'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}