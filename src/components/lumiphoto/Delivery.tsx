import { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import {
    FolderPlus, Eye, Trash2,
    Archive, Send, Pencil, Filter, Image,
    ArrowDownToLine,
    Timer,
    Download,
    Clock,
} from 'lucide-react';
import { Modal } from './components/Modal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { PhotoUpload } from './components/PhotoUpload';
import { PhotoViewer } from './components/PhotoViewer';
import { LumiPhotoHeader } from './components/LumiPhotoHeader';
import { DeliveryDetailsOffcanvas } from './components/DeliveryDetailsOffcanvas';
import { useAuth } from '../../contexts/AuthContext';

const MOCK_PROJECTS = [
    { id: 1, name: "Casamento Ana & Pedro", date: "10/06/2023", photos: 254, downloads: 128, status: "enviada" as const, clientEmail: "ana.pedro@gmail.com" },
    { id: 2, name: "Ensaio Pré-Wedding Carla", date: "22/05/2023", photos: 89, downloads: 76, status: "criado" as const, clientEmail: "carla@exemplo.com" },
    { id: 3, name: "Festa de 15 anos - Maria", date: "03/04/2023", photos: 320, downloads: 187, status: "baixada" as const, clientEmail: "maria15@exemplo.com" },
    { id: 4, name: "Formatura João", date: "15/03/2023", photos: 150, downloads: 90, status: "expirada" as const, clientEmail: "joao@exemplo.com" },
    { id: 5, name: "Ensaio Gestante Júlia", date: "20/02/2023", photos: 75, downloads: 60, status: "expirada" as const, clientEmail: "julia@exemplo.com" },
    { id: 6, name: "Aniversário 1 ano - Pedro", date: "10/01/2023", photos: 200, downloads: 0, status: "excluida" as const, clientEmail: "pedro@exemplo.com" },
];

type ProjectStatus = "all" | "criado" | "enviada" | "baixada" | "expirada" | "excluida";

interface Project {
    id: number;
    name: string;
    date: string;
    photos: number;
    downloads: number;
    status: ProjectStatus;
    clientEmail: string;
}

interface Photo {
    id: string;
    name: string;
    url: string;
    thumbnail: string;
    size: number;
    type: string;
    uploadDate: string;
    tags?: string[];
    isFavorite?: boolean;
    isDeleted?: boolean;
}

export function Delivery() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [projects, setProjects] = useState(MOCK_PROJECTS);
    const [selectedStatus, setSelectedStatus] = useState<ProjectStatus>("enviada");
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isDetailsOffcanvasOpen, setIsDetailsOffcanvasOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isPhotosViewModalOpen, setIsPhotosViewModalOpen] = useState(false);
    const [isAllProjectsModalOpen, setIsAllProjectsModalOpen] = useState(false);
    const [isAllActivitiesModalOpen, setIsAllActivitiesModalOpen] = useState(false);
    const [isPermanentDelete, setIsPermanentDelete] = useState(false);
    const [showFilters, setShowFilters] = useState(true);
    const [totalUploads, setTotalUploads] = useState(0);

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);

    useEffect(() => {
        const uploadsCount = projects.reduce((total, project) => {
            if (project.status !== "excluida") {
                return total + project.photos;
            }
            return total;
        }, 0);

        setTotalUploads(uploadsCount);
    }, [projects]);

    const filteredProjects = projects.filter(project => {
        if (selectedStatus !== "all" && project.status !== selectedStatus) {
            return false;
        }
        return true;
    });

    const findSelectedProject = () => {
        if (selectedProjectId === null) return null;
        return projects.find(project => project.id === selectedProjectId) || null;
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

    const handleDeleteProject = () => {
        if (selectedProjectId === null) return;

        if (isPermanentDelete) {
            setProjects(projects.filter(project => project.id !== selectedProjectId));
        } else {
            setProjects(projects.map(project =>
                project.id === selectedProjectId
                    ? { ...project, status: "excluida" as const }
                    : project
            ));
        }

        setIsDeleteModalOpen(false);
    };

    const handleRestoreProject = (projectId: number) => {
        setProjects(projects.map(project =>
            project.id === projectId
                ? { ...project, status: "criado" as const }
                : project
        ));
    };

    const handleSendProject = (projectId: number) => {
        setProjects(projects.map(project =>
            project.id === projectId
                ? { ...project, status: "enviada" as const }
                : project
        ));
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

    const handlePhotoUpload = (newPhoto: Photo) => {
        setPhotos(prev => [newPhoto, ...prev]);
        setIsUploadModalOpen(false);
    };

    const handlePhotoDelete = (photoId: string) => {
        setPhotos(prev => prev.map(photo =>
            photo.id === photoId
                ? { ...photo, isDeleted: true }
                : photo
        ));
    };

    const handlePhotoRestore = (photoId: string) => {
        setPhotos(prev => prev.map(photo =>
            photo.id === photoId
                ? { ...photo, isDeleted: false }
                : photo
        ));
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
                    <button
                        onClick={() => openProjectDetails(project.id)}
                        className="px-3 py-1 me-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                    >
                        Ver detalhes
                    </button>
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
                            <p className="text-2xl font-bold text-gray-900 mt-1">{projects.filter(p => p.status !== 'excluida' && p.status !== 'expirada').length}</p>
                            <p className="text-xs text-gray-600">+1 este mês</p>
                        </div>

                        <div className="bg-white border rounded-lg p-4">
                            <div className="flex items-center">
                                <Download className="h-5 w-5 text-green-600 mr-2" />
                                <span className="text-sm font-medium text-green-900">Downloads</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{projects.reduce((acc, p) => acc + p.downloads, 0).toLocaleString()}</p>
                            <p className="text-xs text-gray-600">+28 na última semana</p>
                        </div>

                        <div className="bg-white border rounded-lg p-4">
                            <div className="flex items-center">
                                <Clock className="h-5 w-5 text-green-600 mr-2" />
                                <span className="text-sm font-medium text-green-900">Expirados</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 mt-1">1</p>
                            <p className="text-xs text-gray-600">1 este mês</p>
                        </div>

                        <div className="bg-white border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-green-900">Uso da Plataforma</span>
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                    Espaço Disponível
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                                <span>504 fotos</span>
                                <span>5.000 máximo</span>
                            </div>

                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-green-600 h-2 rounded-full"
                                    style={{ width: `${(888 / 5000) * 100}%` }}
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
                                                ? projects.length
                                                : projects.filter((p) => p.status === option.value).length}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    }

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {filteredProjects.length === 0 ? (
                            <div className="text-center py-12">
                                <FolderPlus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma entrega encontrada</h3>
                                <p className="text-gray-500 mb-4">Crie sua primeira entrega para começar</p>
                                <button
                                    onClick={handleNewProject}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 mx-auto"
                                >
                                    <FolderPlus className="h-4 w-4" />
                                    Nova Entrega
                                </button>
                            </div>
                        ) : (
                            filteredProjects.map((project) => {
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
                                    {projects
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
                    </div>

                    <div className="bg-white rounded-xl border p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">Atividade de Downloads</h2>
                            <button className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 border rounded-lg shadow-sm text-sm font-medium text-gray-900 bg-white hover:bg-gray-100 transition-colors">
                                Ver Todas as Atividades
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                            Últimas entregas e interações dos clientes
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <ArrowDownToLine className="h-6 w-6 text-green-500" />
                                <div>
                                    <p className="font-medium text-gray-900">Ana & Pedro baixaram 95 fotos</p>
                                    <p className="text-sm text-gray-500">
                                        Da entrega "Casamento Ana & Pedro – Editadas" • Há 2 dias
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Timer className="h-6 w-6 text-yellow-500" />
                                <div>
                                    <p className="font-medium text-gray-900">Entrega expirada</p>
                                    <p className="text-sm text-gray-500">
                                        O link de "Ensaio Pré-Wedding Carla – Finais" expirou • Há 1 semana
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Send className="h-6 w-6 text-green-500" />
                                <div>
                                    <p className="font-medium text-gray-900">Nova entrega enviada</p>
                                    <p className="text-sm text-gray-500">
                                        Fotos de "Ensaio Gestante Júlia – HDR" enviadas • Há 1 semana
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)}>
                <PhotoUpload
                    onUpload={handlePhotoUpload}
                    onClose={() => setIsUploadModalOpen(false)}
                />
            </Modal>

            {selectedPhoto && (
                <PhotoViewer
                    photo={selectedPhoto}
                    isOpen={isViewerOpen}
                    onClose={() => {
                        setIsViewerOpen(false);
                        setSelectedPhoto(null);
                    }}
                    onDelete={() => handlePhotoDelete(selectedPhoto.id)}
                    onRestore={() => handlePhotoRestore(selectedPhoto.id)}
                />
            )}

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

            <Modal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                title="Detalhes do Projeto"
                size="lg"
            >
                {findSelectedProject() && (
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-gray-900">{findSelectedProject()?.name}</h4>
                            <p className="text-gray-600">{findSelectedProject()?.clientEmail}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Data</label>
                                <p className="text-gray-900">{findSelectedProject()?.date}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Status</label>
                                <p className="text-gray-900">
                                    {statusOptions.find(s => s.value === findSelectedProject()?.status)?.label}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Fotos</label>
                                <p className="text-gray-900">{findSelectedProject()?.photos}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Downloads</label>
                                <p className="text-gray-900">{findSelectedProject()?.downloads}</p>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={isPhotosViewModalOpen}
                onClose={() => setIsPhotosViewModalOpen(false)}
                title="Fotos do Projeto"
                size="xl"
            >
                {findSelectedProject() && (
                    <div>
                        <div className="mb-4">
                            <h4 className="font-semibold text-gray-900">{findSelectedProject()?.name}</h4>
                            <p className="text-gray-600">{findSelectedProject()?.photos} fotos disponíveis</p>
                        </div>
                        <div className="text-center py-8">
                            <Image className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">Visualizador de fotos em desenvolvimento</p>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={isAllProjectsModalOpen}
                onClose={() => setIsAllProjectsModalOpen(false)}
                title="Todos os Projetos"
                size="xl"
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {projects.map((project) => (
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
        </div>
    );
}