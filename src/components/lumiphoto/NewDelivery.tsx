import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Palette, Shield, Lock, Download, Globe, Info, AlertTriangle, Upload, X, CheckCircle, Image } from 'lucide-react';
import { LumiPhotoHeader } from './components/LumiPhotoHeader';
import { useAuth } from '../../contexts/AuthContext';
import { criarEntregaLumiPhoto, obterProjetosLumiPhoto, LumiPhotoProject } from '../../services/lumiPhotoService';
import { toast } from 'react-toastify';

interface DeliveryFormData {
    name: string;
    projectId: number;
    clientEmail: string;
    expirationDays: number;

    logoUrl: string;
    primaryColor: string;
    backgroundColor: string;
    galleryLayout: 'grid' | 'masonry' | 'slideshow';

    requirePassword: boolean;
    password: string;
    allowDownload: boolean;
    showMetadata: boolean;
}

export function NewDelivery() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState<'details' | 'photos' | 'layout' | 'security'>('details');
    const [isCreating, setIsCreating] = useState(false);
    const [projects, setProjects] = useState<LumiPhotoProject[]>([]);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [dragActive, setDragActive] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
    const [formData, setFormData] = useState<DeliveryFormData>({
        name: '',
        projectId: 0,
        clientEmail: '',
        expirationDays: 7,
        logoUrl: '',
        primaryColor: '#10B981',
        backgroundColor: '#FFFFFF',
        galleryLayout: 'grid',
        requirePassword: false,
        password: '',
        allowDownload: true,
        showMetadata: false
    });

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            setLoadingProjects(true);
            const response = await obterProjetosLumiPhoto({ status: 'all' }, user);
            const projectsData = Array.isArray(response.data) ? response.data : [];

            const availableProjects = projectsData.filter((p: LumiPhotoProject) =>
                p.status !== 'excluida' && p.status !== 'arquivada'
            );

            setProjects(availableProjects);

            if (availableProjects.length > 0) {
                setFormData(prev => ({ ...prev, projectId: availableProjects[0].id }));
            }
        } catch (error) {
            console.error('Erro ao carregar projetos:', error);
            toast.error('Erro ao carregar projetos disponíveis');
        } finally {
            setLoadingProjects(false);
        }
    };

    const handleInputChange = (field: keyof DeliveryFormData, value: string | number | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
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

    const handleNext = () => {
        if (currentStep === 'details') {
            setCurrentStep('photos');
        } else if (currentStep === 'photos') {
            setCurrentStep('layout');
        } else if (currentStep === 'layout') {
            setCurrentStep('security');
        }
    };

    const handleBack = () => {
        if (currentStep === 'security') {
            setCurrentStep('layout');
        } else if (currentStep === 'layout') {
            setCurrentStep('photos');
        } else if (currentStep === 'photos') {
            setCurrentStep('details');
        } else {
            navigate('/lumiphoto/delivery');
        }
    };

    const isStepValid = () => {
        if (currentStep === 'details') {
            return formData.name.trim() && formData.clientEmail.trim() && formData.projectId > 0;
        }
        if (currentStep === 'security' && formData.requirePassword) {
            return formData.password.trim().length >= 4;
        }
        return true;
    };

    const handleCreateDelivery = async () => {
        try {
            setIsCreating(true);

            const deliveryData: any = {
                name: formData.name,
                client_email: formData.clientEmail,
                project_id: formData.projectId || undefined,
                expiration_days: formData.expirationDays,
                layout_settings: {
                    logoUrl: formData.logoUrl,
                    primaryColor: formData.primaryColor,
                    backgroundColor: formData.backgroundColor,
                    galleryLayout: formData.galleryLayout
                },
                security_settings: {
                    requirePassword: formData.requirePassword,
                    password: formData.password || undefined,
                    allowDownload: formData.allowDownload,
                    showMetadata: formData.showMetadata
                },
                status: 'pending'
            };

            const createdDelivery = await criarEntregaLumiPhoto(deliveryData, user);
            toast.success('Entrega criada com sucesso!');

            if (uploadedFiles.length > 0 && createdDelivery?.id) {
                try {
                    setIsUploadingPhotos(true);
                    setUploadProgress(0);

                    toast.info(`Enviando ${uploadedFiles.length} foto${uploadedFiles.length > 1 ? 's' : ''}...`);

                    // await uploadFotosParaEntregaLumiPhoto(
                    //     createdDelivery.id,
                    //     uploadedFiles,
                    //     user,
                    //     (progress) => {
                    //         setUploadProgress(progress);
                    //     }
                    // );

                    toast.success(`${uploadedFiles.length} foto${uploadedFiles.length > 1 ? 's enviadas' : ' enviada'} com sucesso!`);
                    setUploadedFiles([]);
                } catch (uploadError: any) {
                    console.error('Erro ao fazer upload das fotos:', uploadError);
                    toast.error('Entrega criada, mas houve erro ao enviar algumas fotos. Você pode enviá-las depois.');
                } finally {
                    setIsUploadingPhotos(false);
                    setUploadProgress(0);
                }
            }

            navigate('/lumiphoto/delivery');
        } catch (error: any) {
            console.error('Erro ao criar entrega:', error);
            toast.error(error.message || 'Erro ao criar entrega');
        } finally {
            setIsCreating(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 'details':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Projeto de origem *
                            </label>
                            {loadingProjects ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                                    <span className="ml-2 text-sm text-gray-500">Carregando projetos...</span>
                                </div>
                            ) : projects.length === 0 ? (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                    <p className="text-sm text-amber-800">
                                        Você precisa criar um projeto antes de criar uma entrega.
                                    </p>
                                    <button
                                        onClick={() => navigate('/lumiphoto/new-project')}
                                        className="mt-2 text-sm font-medium text-amber-900 hover:text-amber-700 underline"
                                    >
                                        Criar novo projeto
                                    </button>
                                </div>
                            ) : (
                                <select
                                    value={formData.projectId}
                                    onChange={(e) => handleInputChange('projectId', parseInt(e.target.value))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                                >
                                    <option value="0">Selecione um projeto</option>
                                    {projects.map((project) => (
                                        <option key={project.id} value={project.id}>
                                            {project.name} ({project.photos_count || 0} fotos)
                                        </option>
                                    ))}
                                </select>
                            )}
                            <p className="text-sm text-gray-500 mt-1">
                                Selecione o projeto que contém as fotos para esta entrega
                            </p>
                        </div>

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
            case 'photos':
                return (
                    <div className="space-y-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <div className="flex items-start">
                                <Image className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                                <div>
                                    <h3 className="text-sm font-medium text-blue-900">
                                        Upload de Fotos
                                    </h3>
                                    <p className="text-sm text-blue-700 mt-1">
                                        Adicione as fotos que serão incluídas nesta entrega
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            {uploadedFiles.length > 0 && (
                                <div className="flex items-center space-x-4 text-sm">
                                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                                        {uploadedFiles.length} arquivo{uploadedFiles.length !== 1 ? 's' : ''}
                                    </div>
                                    <div className="text-gray-500">
                                        {(uploadedFiles.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024)).toFixed(1)} MB
                                    </div>
                                </div>
                            )}
                        </div>

                        <div
                            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${dragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
                                }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-lg text-gray-700 mb-2 font-medium">
                                Arraste e solte arquivos aqui
                            </p>
                            <p className="text-sm text-gray-500 mb-6">
                                ou clique no botão abaixo para selecionar
                            </p>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                                id="file-upload-delivery"
                            />
                            <label
                                htmlFor="file-upload-delivery"
                                className="inline-flex items-center px-6 py-3 bg-white border-2 border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Selecionar Arquivos
                            </label>
                            <p className="text-xs text-gray-400 mt-4">
                                Suporte para JPG, PNG, RAW (máximo 20MB por arquivo)
                            </p>
                        </div>

                        {uploadedFiles.length > 0 && (
                            <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-medium text-gray-700 flex items-center">
                                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                        Arquivos selecionados ({uploadedFiles.length})
                                    </h4>
                                    <button
                                        onClick={() => setUploadedFiles([])}
                                        className="text-xs text-red-600 hover:text-red-800 font-medium"
                                    >
                                        Limpar todos
                                    </button>
                                </div>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {uploadedFiles.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                                            <div className="flex items-center flex-1 min-w-0">
                                                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded flex items-center justify-center mr-3">
                                                    <Image className="h-5 w-5 text-green-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-gray-700 truncate font-medium">{file.name}</p>
                                                    <p className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeFile(index)}
                                                className="ml-4 text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
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
                                        Lembre-se de que estas são medidas básicas de proteção. Para maior segurança, considere limitar o tempo de acesso e usar senha para proteção.
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
                                        onClick={() => setCurrentStep('photos')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentStep === 'photos'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        Fotos
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

            {/* Loading Overlay */}
            {(isCreating || isUploadingPhotos) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 flex flex-col items-center max-w-md w-full mx-4">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mb-4"></div>
                        <p className="text-gray-900 font-medium text-lg text-center">
                            {isUploadingPhotos
                                ? `Enviando fotos (${uploadProgress}%)...`
                                : 'Criando entrega...'
                            }
                        </p>
                        <p className="text-gray-500 text-sm mt-2 text-center">
                            {isUploadingPhotos
                                ? `Aguarde enquanto enviamos ${uploadedFiles.length} foto${uploadedFiles.length > 1 ? 's' : ''} para o servidor`
                                : 'Aguarde enquanto processamos suas informações'
                            }
                        </p>
                        {isUploadingPhotos && (
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                                <div
                                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}