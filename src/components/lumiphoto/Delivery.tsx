import { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import {
    FolderPlus, Eye, Trash2,
    Archive, Send, Pencil, Filter,
    ArrowDownToLine,
    Timer,
    Download,
    Clock,
    Copy,
} from 'lucide-react';
import { Modal } from './components/Modal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { PhotosViewModal } from './components/PhotosViewModal';
import { LumiPhotoHeader } from './components/LumiPhotoHeader';
import { DeliveryDetailsOffcanvas } from './components/DeliveryDetailsOffcanvas';
import { EditDeliveryModal } from './components/EditDeliveryModal';
import { useAuth } from '../../contexts/AuthContext';
import {
    obterEntregasLumiPhoto,
    excluirEntregaLumiPhoto,
    enviarNotificacaoEntregaLumiPhoto,
    obterAtividadesLumiPhoto,
    LumiPhotoDelivery,
    LumiPhotoActivity,
    LumiPhotoPhoto
} from '../../services/lumiPhotoService';
import { toast } from 'react-toastify';
import { buildDeliveryShareUrl } from '../../utils/lumiphotoPublic';

type ProjectStatus = "all" | "criado" | "enviada" | "baixada" | "expirada" | "excluida";

interface Project {
    id: number;
    name: string;
    date: string;
    photos: number;
    downloads: number;
    status: ProjectStatus;
    rawStatus: string;
    clientEmail: string;
    deliveryToken?: string;
    projectId?: number | null;
    expiresAt?: string | null;
    expirationDays?: number | null;
    layout_settings?: LumiPhotoDelivery['layout_settings'];
    security_settings?: LumiPhotoDelivery['security_settings'];
    photosList?: LumiPhotoPhoto[];
    zip_url?: string | null;
}

export function Delivery() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [deliveries, setDeliveries] = useState<Project[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<ProjectStatus>("all");
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const [isDetailsOffcanvasOpen, setIsDetailsOffcanvasOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isPhotosViewModalOpen, setIsPhotosViewModalOpen] = useState(false);
    const [isAllProjectsModalOpen, setIsAllProjectsModalOpen] = useState(false);
    const [isAllActivitiesModalOpen, setIsAllActivitiesModalOpen] = useState(false);
    const [isPermanentDelete, setIsPermanentDelete] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [showFilters, setShowFilters] = useState(true);
    const [totalUploads, setTotalUploads] = useState(0);
    const [loading, setLoading] = useState(true);
    const [activities, setActivities] = useState<LumiPhotoActivity[]>([]);
    const [loadingActivities, setLoadingActivities] = useState(false);
    const [deliveryStats, setDeliveryStats] = useState({
        activeDeliveries: 0,
        totalDownloads: 0,
        expiredDeliveries: 0,
        totalPhotos: 0
    });

    // Carregar entregas da API
    useEffect(() => {
        loadDeliveries();
        loadActivities();
    }, []);

    const loadActivities = async () => {
        try {
            setLoadingActivities(true);
            const data = await obterAtividadesLumiPhoto(user);

            // Filtrar apenas atividades relacionadas a entregas
            const deliveryActivities = Array.isArray(data)
                ? data.filter((activity: LumiPhotoActivity) =>
                    activity.type.includes('delivery') ||
                    activity.type.includes('download') ||
                    activity.type.includes('view')
                  ).slice(0, 5) // Pegar apenas as 5 mais recentes
                : [];

            setActivities(deliveryActivities);
        } catch (error: any) {
            console.error('[DELIVERY] Erro ao carregar atividades:', error);
        } finally {
            setLoadingActivities(false);
        }
    };

    const loadDeliveries = async () => {
        try {
            setLoading(true);
            const response = await obterEntregasLumiPhoto(user);
            const deliveriesData = Array.isArray(response) ? response : response?.data || [];

            const normalizeDelivery = (delivery: LumiPhotoDelivery): Project => {
                const formattedDate = delivery.created_at
                    ? new Date(delivery.created_at).toLocaleDateString('pt-BR')
                    : 'Data não informada';

                const photosCount = typeof delivery.total_photos === 'number'
                    ? delivery.total_photos
                    : Array.isArray(delivery.photos)
                        ? delivery.photos.length
                        : 0;

                return {
                    id: delivery.id,
                    name: delivery.name,
                    date: formattedDate,
                    photos: photosCount,
                    downloads: delivery.total_downloads ?? 0,
                    status: mapDeliveryStatus(delivery.status),
                    rawStatus: delivery.status,
                    clientEmail: delivery.client_email || '',
                    deliveryToken: delivery.delivery_token,
                    projectId: delivery.project_id,
                    expiresAt: delivery.expires_at,
                    expirationDays: delivery.expiration_days,
                    layout_settings: delivery.layout_settings ?? {},
                    security_settings: delivery.security_settings ?? {},
                    photosList: delivery.photos ?? [],
                    zip_url: delivery.zip_url ?? null,
                };
            };

            const mappedDeliveries: Project[] = deliveriesData.map((delivery: LumiPhotoDelivery) => normalizeDelivery(delivery));

            setDeliveries(mappedDeliveries);

            const stats = {
                activeDeliveries: mappedDeliveries.filter(d =>
                    d.status !== 'excluida' && d.status !== 'expirada'
                ).length,
                totalDownloads: mappedDeliveries.reduce((acc, d) => acc + (d.downloads || 0), 0),
                expiredDeliveries: mappedDeliveries.filter(d => d.status === 'expirada').length,
                totalPhotos: mappedDeliveries.reduce((acc, d) => acc + (d.photos || 0), 0)
            };

            setDeliveryStats(stats);

            if (mappedDeliveries.length === 0) {
                toast.info('Nenhuma entrega encontrada. Crie sua primeira entrega!', {
                    autoClose: 3000
                });
            }
        } catch (error: any) {
            console.error('[DELIVERY] Erro ao carregar entregas:', error);
            console.error('Detalhes do erro:', error.response?.data || error.message);
            toast.error(`Erro ao carregar entregas: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const mapDeliveryStatus = (status: string): ProjectStatus => {
        const statusMap: Record<string, ProjectStatus> = {
            'pending': 'criado',
            'rascunho': 'criado',
            'enviada': 'enviada',
            'sent': 'enviada',
            'visualizada': 'enviada',
            'viewed': 'enviada',
            'baixada': 'baixada',
            'downloaded': 'baixada',
            'completed': 'baixada',
            'expirada': 'expirada',
            'excluida': 'excluida',
        };
        return statusMap[status] || 'criado';
    };

    useEffect(() => {
        const uploadsCount = deliveries.reduce((total, delivery) => {
            if (delivery.status !== "excluida") {
                return total + delivery.photos;
            }
            return total;
        }, 0);

        setTotalUploads(uploadsCount);
    }, [deliveries]);

    const filteredDeliveries = deliveries.filter(delivery => {
        if (selectedStatus !== "all" && delivery.status !== selectedStatus) {
            return false;
        }
        return true;
    });

    const findSelectedProject = () => {
        if (selectedProjectId === null) return null;
        return deliveries.find(delivery => delivery.id === selectedProjectId) || null;
    };

    const openProjectDetails = (projectId: number) => {
        setSelectedProjectId(projectId);
        setIsDetailsOffcanvasOpen(true);
    };

    const openDeleteConfirmation = (projectId: number, permanent: boolean = false) => {
        setSelectedProjectId(projectId);
        setIsPermanentDelete(permanent);
        setIsDeleteModalOpen(true);
    };

    const openPhotosViewModal = (projectId: number) => {
        setSelectedProjectId(projectId);
        setIsPhotosViewModalOpen(true);
    };

    const openEditModal = (projectId: number) => {
        setSelectedProjectId(projectId);
        setIsEditModalOpen(true);
    };

    const handleDeleteProject = async () => {
        if (selectedProjectId === null) return;

        try {
            await excluirEntregaLumiPhoto(selectedProjectId, user);
            setDeliveries(deliveries.filter(delivery => delivery.id !== selectedProjectId));
            toast.success('Entrega excluída com sucesso!');
            setIsDeleteModalOpen(false);
            await loadDeliveries(); // Recarregar lista
        } catch (error: any) {
            console.error('Erro ao excluir entrega:', error);
            toast.error(error.message || 'Erro ao excluir entrega');
        }
    };

    const handleRestoreProject = (projectId: number) => {
        // Não aplicável para entregas
        toast.info('Função de restauração não disponível para entregas');
    };

    const handleSendProject = async (deliveryId: number) => {
        try {
            await enviarNotificacaoEntregaLumiPhoto(deliveryId, user);
            toast.success('Notificação enviada com sucesso!');

            // Atualizar status local
            setDeliveries(deliveries.map(delivery =>
                delivery.id === deliveryId
                    ? { ...delivery, status: "enviada" as const }
                    : delivery
            ));
        } catch (error: any) {
            console.error('Erro ao enviar notificação:', error);
            toast.error(error.message || 'Erro ao enviar notificação');
        }
    };

    const checkUploadLimit = () => {
        const maxUploads = 5000;

        if (totalUploads >= maxUploads) {
            return false;
        }

        return true;
    };

    const handleNewProject = () => {
        if (checkUploadLimit()) {
            navigate("/lumiphoto/new-project");
        }
    };

    const handleCopyDeliveryLink = (delivery: Project) => {
        const publicLink = buildDeliveryShareUrl(delivery.deliveryToken);

        if (!publicLink) {
            toast.error('Não foi possível gerar o link da entrega');
            return;
        }

        navigator.clipboard.writeText(publicLink).then(() => {
            toast.success('Link copiado para a área de transferência!');
        }).catch(() => {
            toast.error('Erro ao copiar link');
        });
    };

    const statusOptions = [
        { value: "all" as const, label: "Todos", color: "bg-blue-200" },
        { value: "criado" as const, label: "Criados", color: "bg-gray-200" },
        { value: "enviada" as const, label: "Enviadas", color: "bg-green-200" },
        { value: "baixada" as const, label: "Baixadas", color: "bg-yellow-200" },
        { value: "expirada" as const, label: "Expiradas", color: "bg-amber-200" },
        { value: "excluida" as const, label: "Excluídas", color: "bg-red-200" }
    ];

    const renderProjectActions = (project: Project) => {
        const leftButtons = (
            <>
                {["criado", "enviada", "baixada", "expirada"].includes(project.status) && (
                    <>
                        <button
                            onClick={() => openProjectDetails(project.id)}
                            className="px-3 py-1 me-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                        >
                            Ver detalhes
                        </button>
                        <button
                            onClick={() => openEditModal(project.id)}
                            className="px-3 py-1 me-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
                        >
                            <Pencil className="h-4 w-4 inline mr-1" />
                            Editar
                        </button>
                    </>
                )}
            </>
        );

        const rightButtons = (
            <div className="flex items-center space-x-2">
                {project.status === "criado" && (
                    <>
                        <button
                            onClick={() => openDeleteConfirmation(project.id)}
                            className="px-3 py-1.5 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => handleSendProject(project.id)}
                            className="px-3 py-1.5 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded"
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    </>
                )}

                {["enviada", "baixada"].includes(project.status) && (
                    <>
                        <button
                            onClick={() => handleCopyDeliveryLink(project)}
                            className="px-3 py-1.5 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded flex items-center"
                            title="Copiar link público"
                        >
                            <Copy className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => openDeleteConfirmation(project.id)}
                            className="px-3 py-1.5 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </>
                )}

                {project.status === "expirada" && (
                    <>
                        <button
                            onClick={() => handleCopyDeliveryLink(project)}
                            className="px-3 py-1.5 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded flex items-center"
                            title="Copiar link público"
                        >
                            <Copy className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => handleRestoreProject(project.id)}
                            className="px-3 py-1 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded"
                        >
                            Restaurar
                        </button>
                        <button
                            onClick={() => openDeleteConfirmation(project.id, true)}
                            className="px-3 py-1.5 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </>
                )}

                {project.status === "excluida" && (
                    <>
                        <button
                            onClick={() => handleRestoreProject(project.id)}
                            className="px-3 py-1 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded"
                        >
                            Restaurar
                        </button>
                        <button
                            onClick={() => openDeleteConfirmation(project.id, true)}
                            className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded"
                        >
                            Excluir Permanente
                        </button>
                    </>
                )}

                {["enviada", "baixada", "expirada"].includes(project.status) && (
                    <button
                        onClick={() => openPhotosViewModal(project.id)}
                        className="px-3 py-1.5 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                )}
            </div>
        );

        return (
            <div className="flex justify-between items-center w-full">
                <div>{leftButtons}</div>
                {rightButtons}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <LumiPhotoHeader delivery={false} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center">
                    <div className="flex flex-col items-start">
                        <h1 className="text-2xl font-bold text-gray-900">Painel de Entrega</h1>
                        <p className="text-gray-600">Gerencie suas entregas e monitore os downloads</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link to="/lumiphoto/delivery/new"
                            className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 transition-colors">
                            <FolderPlus className="h-5 w-5 mr-2" />
                            Nova Entrega
                        </Link>
                    </div>
                </div>

                <div className="py-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white border rounded-lg p-4">
                            <div className="flex items-center">
                                <FolderPlus className="h-5 w-5 text-green-600 mr-2" />
                                <span className="text-sm font-medium text-green-900">Entregas Ativas</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{deliveryStats.activeDeliveries}</p>
                            <p className="text-xs text-gray-600">Entregas em andamento</p>
                        </div>

                        <div className="bg-white border rounded-lg p-4">
                            <div className="flex items-center">
                                <Download className="h-5 w-5 text-green-600 mr-2" />
                                <span className="text-sm font-medium text-green-900">Downloads</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{deliveryStats.totalDownloads.toLocaleString()}</p>
                            <p className="text-xs text-gray-600">Total de downloads</p>
                        </div>

                        <div className="bg-white border rounded-lg p-4">
                            <div className="flex items-center">
                                <Clock className="h-5 w-5 text-green-600 mr-2" />
                                <span className="text-sm font-medium text-green-900">Expirados</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{deliveryStats.expiredDeliveries}</p>
                            <p className="text-xs text-gray-600">Entregas expiradas</p>
                        </div>

                        <div className="bg-white border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-green-900">Uso da Plataforma</span>
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                    Espaço Disponível
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                                <span>{deliveryStats.totalPhotos} fotos</span>
                                <span>5.000 máximo</span>
                            </div>

                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-green-600 h-2 rounded-full"
                                    style={{ width: `${(deliveryStats.totalPhotos / 5000) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex flex-col items-start">
                            <h1 className="text-2xl font-bold text-gray-900">Status das Entregas</h1>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 border rounded-lg shadow-sm text-sm font-medium text-gray-900 bg-white hover:bg-gray-100 transition-colors"
                            >
                                <Filter
                                    className={`h-5 w-5 mr-2 ${showFilters ? "fill-current text-gray-900" : ""
                                        }`}
                                />
                                {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
                            </button>
                        </div>
                    </div>
                    {showFilters &&
                        <div className="flex flex-col lg:flex-row gap-4 mb-6">
                            <div className="flex flex-wrap gap-2">
                                {statusOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setSelectedStatus(option.value)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedStatus === option.value
                                            ? `${option.color} text-gray-800`
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            }`}
                                    >
                                        {option.label}
                                        <span className="ml-2 bg-white text-gray-600 px-2 py-1 rounded-full text-xs">
                                            {option.value === "all"
                                                ? deliveries.length
                                                : deliveries.filter((p) => p.status === option.value).length}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    }

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {loading ? (
                            <div className="col-span-3 text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                                <p className="text-gray-500">Carregando entregas...</p>
                            </div>
                        ) : filteredDeliveries.length === 0 ? (
                            <div className="col-span-3 text-center py-12">
                                <FolderPlus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma entrega encontrada</h3>
                                <p className="text-gray-500 mb-4">Crie sua primeira entrega para começar</p>
                                <Link
                                    to="/lumiphoto/delivery/new"
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 mx-auto inline-flex"
                                >
                                    <FolderPlus className="h-4 w-4" />
                                    Nova Entrega
                                </Link>
                            </div>
                        ) : (
                            filteredDeliveries.map((project) => {
                                return (
                                    <div
                                        key={project.id}
                                        className="p-6 rounded-xl border bg-white hover:shadow-md transition"
                                    >
                                        <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                                        <p className="text-sm text-gray-600">{project.date}</p>

                                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                            <span>{project.photos} fotos</span>
                                            <span>{project.downloads} downloads</span>
                                        </div>

                                        <div className="flex items-center justify-between mt-4">
                                            <div className="flex gap-2">
                                                {renderProjectActions(project)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    <div className="bg-white rounded-xl border p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                            Entregas Recentes
                        </h2>

                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-3"></div>
                                <p className="text-sm text-gray-500">Carregando entregas...</p>
                            </div>
                        ) : deliveries.filter((p) => p.status !== "excluida").length === 0 ? (
                            <div className="text-center py-8">
                                <FolderPlus className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500">Nenhuma entrega recente</p>
                                <p className="text-xs text-gray-400 mt-2">
                                    Suas entregas aparecerão aqui após criação
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full table-auto">
                                    <thead>
                                        <tr className="text-left text-sm text-gray-600">
                                            <th className="py-3 px-4 font-medium">Nome do Projeto</th>
                                            <th className="py-3 px-4 font-medium">Data</th>
                                            <th className="py-3 px-4 font-medium">Fotos</th>
                                            <th className="py-3 px-4 font-medium">Downloads</th>
                                            <th className="py-3 px-4 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {deliveries
                                            .filter((p) => p.status !== "excluida")
                                            .slice(0, 5)
                                            .map((p) => (
                                                <tr key={p.id} className="text-gray-900">
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-start gap-2">
                                                            <div className="leading-snug">
                                                                <div className="font-medium break-words">{p.name}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4 text-gray-700">{p.date}</td>
                                                    <td className="py-4 px-4 text-gray-700">{p.photos}</td>
                                                    <td className="py-4 px-4 text-gray-700">{p.downloads}</td>
                                                    <td className="py-4 px-4 text-gray-700">{p.status}</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-xl border p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">Atividade de Downloads</h2>
                            <button
                                onClick={() => setIsAllActivitiesModalOpen(true)}
                                className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 border rounded-lg shadow-sm text-sm font-medium text-gray-900 bg-white hover:bg-gray-100 transition-colors"
                            >
                                Ver Todas as Atividades
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                            Últimas entregas e interações dos clientes
                        </p>

                        {loadingActivities ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                                <p className="text-sm text-gray-500">Carregando atividades...</p>
                            </div>
                        ) : activities.length === 0 ? (
                            <div className="text-center py-8">
                                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500">Nenhuma atividade recente</p>
                                <p className="text-xs text-gray-400 mt-2">
                                    As atividades aparecerão aqui quando houver interações
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {activities.map((activity) => {
                                    const getActivityIcon = () => {
                                        if (activity.type.includes('download')) return <ArrowDownToLine className="h-6 w-6 text-green-500" />;
                                        if (activity.type.includes('delivery_sent')) return <Send className="h-6 w-6 text-green-500" />;
                                        if (activity.type.includes('expired')) return <Timer className="h-6 w-6 text-yellow-500" />;
                                        if (activity.type.includes('view')) return <Eye className="h-6 w-6 text-blue-500" />;
                                        return <Clock className="h-6 w-6 text-gray-500" />;
                                    };

                                    const getRelativeTime = (dateString: string) => {
                                        const date = new Date(dateString);
                                        const now = new Date();
                                        const diffMs = now.getTime() - date.getTime();
                                        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                                        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                                        const diffMinutes = Math.floor(diffMs / (1000 * 60));

                                        if (diffMinutes < 60) return `Há ${diffMinutes} minuto${diffMinutes !== 1 ? 's' : ''}`;
                                        if (diffHours < 24) return `Há ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
                                        if (diffDays === 1) return 'Há 1 dia';
                                        if (diffDays < 7) return `Há ${diffDays} dias`;
                                        if (diffDays < 30) return `Há ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) !== 1 ? 's' : ''}`;
                                        return date.toLocaleDateString('pt-BR');
                                    };

                                    return (
                                        <div key={activity.id} className="flex items-start gap-3">
                                            {getActivityIcon()}
                                            <div>
                                                <p className="font-medium text-gray-900">{activity.description}</p>
                                                <p className="text-sm text-gray-500">
                                                    {getRelativeTime(activity.created_at)}
                                                    {activity.ip_address && ` • IP: ${activity.ip_address}`}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                </div>
            </div>
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteProject}
                title={isPermanentDelete ? "Excluir Permanentemente" : "Mover para Lixeira"}
                message={isPermanentDelete
                    ? "Esta ação não pode ser desfeita. O projeto será excluído permanentemente."
                    : "O projeto será movido para a lixeira e excluído automaticamente após 30 dias."
                }
                confirmText={isPermanentDelete ? "Excluir Permanentemente" : "Mover para Lixeira"}
                cancelText="Cancelar"
                type={isPermanentDelete ? "danger" : "warning"}
            />

            <PhotosViewModal
                isOpen={isPhotosViewModalOpen}
                onClose={() => setIsPhotosViewModalOpen(false)}
                project={findSelectedProject()}
            />

            <Modal
                isOpen={isAllProjectsModalOpen}
                onClose={() => setIsAllProjectsModalOpen(false)}
                title="Todos os Projetos"
                size="xl"
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {deliveries.map((project) => (
                            <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900">{project.name}</h4>
                                <p className="text-sm text-gray-600">{project.clientEmail}</p>
                                <div className="flex items-center justify-between mt-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusOptions.find(s => s.value === project.status)?.color
                                        } text-gray-800`}>
                                        {statusOptions.find(s => s.value === project.status)?.label}
                                    </span>
                                    <span className="text-sm text-gray-500">{project.photos} fotos</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={isAllActivitiesModalOpen}
                onClose={() => setIsAllActivitiesModalOpen(false)}
                title="Todas as Atividades"
                size="xl"
            >
                <div className="space-y-4">
                    <div className="text-center py-8">
                        <Eye className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Log de atividades em desenvolvimento</p>
                        <p className="text-sm text-gray-400 mt-2">Aqui você verá todas as ações realizadas nos projetos</p>
                    </div>
                </div>
            </Modal>

            <DeliveryDetailsOffcanvas
                isOpen={isDetailsOffcanvasOpen}
                onClose={() => setIsDetailsOffcanvasOpen(false)}
                project={findSelectedProject()}
            />

            <EditDeliveryModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                delivery={findSelectedProject()}
                onSaved={() => {
                    loadDeliveries();
                }}
            />
        </div>
    );
}
