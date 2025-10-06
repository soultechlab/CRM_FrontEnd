import { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import {
  FolderPlus, Eye, Heart, Trash2,
  Archive, Send, Pencil, Filter, Image,
} from 'lucide-react';
import { Modal } from './components/Modal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { PhotoUpload } from './components/PhotoUpload';
import { PhotoViewer } from './components/PhotoViewer';
import { LumiPhotoHeader } from './components/LumiPhotoHeader';
import { ProjectDetailsOffcanvas } from './components/ProjectDetailsOffcanvas';
import { useAuth } from '../../contexts/AuthContext';
import {
  obterProjetosLumiPhoto,
  atualizarStatusProjetoLumiPhoto,
  excluirProjetoLumiPhoto,
  restaurarProjetoLumiPhoto,
  obterDashboardLumiPhoto,
  LumiPhotoProject as APILumiPhotoProject,
  LumiPhotoDashboardStats,
} from '../../services/apiService';

type ProjectStatus = "all" | "rascunho" | "enviada" | "em_selecao" | "finalizada" | "arquivada" | "excluida";

interface Project {
  id: number;
  name: string;
  date: string;
  photos: number;
  views: number;
  selections: number;
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

export function LumiPhoto() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus>("all");
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
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<LumiPhotoDashboardStats | null>(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);

  // Carregar projetos da API
  useEffect(() => {
    loadProjects();
    loadDashboardStats();
  }, [selectedStatus]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await obterProjetosLumiPhoto(
        { status: selectedStatus },
        user
      );

      // Mapear dados da API para o formato do componente
      const mappedProjects: Project[] = response.data.map((project: APILumiPhotoProject) => ({
        id: project.id,
        name: project.name,
        date: project.date,
        photos: project.photos,
        views: project.views,
        selections: project.selections,
        status: project.status,
        clientEmail: project.clientEmail,
      }));

      setProjects(mappedProjects);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardStats = async () => {
    try {
      const stats = await obterDashboardLumiPhoto(user);
      setDashboardStats(stats);
      setTotalUploads(stats.total_photos);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

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

  const handleDeleteProject = async () => {
    if (selectedProjectId === null) return;

    try {
      if (isPermanentDelete) {
        // Deletar permanentemente via API
        await excluirProjetoLumiPhoto(selectedProjectId, user);
        setProjects(projects.filter(project => project.id !== selectedProjectId));
      } else {
        // Soft delete - apenas atualiza status para "excluida"
        await atualizarStatusProjetoLumiPhoto(selectedProjectId, "excluida", user);
        setProjects(projects.map(project =>
          project.id === selectedProjectId
            ? { ...project, status: "excluida" as const }
            : project
        ));
      }

      setIsDeleteModalOpen(false);
      await loadDashboardStats(); // Atualizar estatísticas
    } catch (error) {
      console.error('Erro ao deletar projeto:', error);
      alert('Erro ao deletar projeto. Tente novamente.');
    }
  };

  const handleArchiveProject = async (projectId: number) => {
    try {
      await atualizarStatusProjetoLumiPhoto(projectId, "arquivada", user);
      setProjects(projects.map(project =>
        project.id === projectId
          ? { ...project, status: "arquivada" as const }
          : project
      ));
      await loadDashboardStats();
    } catch (error) {
      console.error('Erro ao arquivar projeto:', error);
      alert('Erro ao arquivar projeto. Tente novamente.');
    }
  };

  const handleRestoreProject = async (projectId: number) => {
    try {
      await restaurarProjetoLumiPhoto(projectId, user);
      setProjects(projects.map(project =>
        project.id === projectId
          ? { ...project, status: "em_selecao" as const }
          : project
      ));
      await loadDashboardStats();
    } catch (error) {
      console.error('Erro ao restaurar projeto:', error);
      alert('Erro ao restaurar projeto. Tente novamente.');
    }
  };

  const handleSendProject = async (projectId: number) => {
    try {
      await atualizarStatusProjetoLumiPhoto(projectId, "enviada", user);
      setProjects(projects.map(project =>
        project.id === projectId
          ? { ...project, status: "enviada" as const }
          : project
      ));
      await loadDashboardStats();
    } catch (error) {
      console.error('Erro ao enviar projeto:', error);
      alert('Erro ao enviar projeto. Tente novamente.');
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
    { value: "rascunho" as const, label: "Rascunho", color: "bg-gray-200" },
    { value: "enviada" as const, label: "Enviadas", color: "bg-green-200" },
    { value: "em_selecao" as const, label: "Em Seleção", color: "bg-yellow-200" },
    { value: "finalizada" as const, label: "Finalizadas", color: "bg-blue-200" },
    { value: "arquivada" as const, label: "Arquivadas", color: "bg-amber-200" },
    { value: "excluida" as const, label: "Excluídas", color: "bg-red-200" }
  ];

  const renderProjectActions = (project: Project) => {
    const leftButtons = (
      <>
        {["rascunho", "enviada", "em_selecao", "finalizada", "arquivada"].includes(project.status) && (
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
        {project.status === "rascunho" && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(`/lumiphoto/edit-project/${project.id}`);
              }}
              className="px-3 py-1.5 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => openDeleteConfirmation(project.id)}
              className="px-3 py-1.5 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleArchiveProject(project.id)}
              className="px-3 py-1.5 text-sm bg-amber-100 hover:bg-amber-200 text-amber-700 rounded"
            >
              <Archive className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleSendProject(project.id)}
              className="px-3 py-1.5 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded"
            >
              <Send className="h-4 w-4" />
            </button>
          </>
        )}

        {project.status === "enviada" && (
          <>
            <button
              onClick={() => openDeleteConfirmation(project.id)}
              className="px-3 py-1.5 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleArchiveProject(project.id)}
              className="px-3 py-1.5 text-sm bg-amber-100 hover:bg-amber-200 text-amber-700 rounded"
            >
              <Archive className="h-4 w-4" />
            </button>
          </>
        )}

        {project.status === "em_selecao" && (
          <>
            <button
              onClick={() => openDeleteConfirmation(project.id)}
              className="px-3 py-1.5 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleArchiveProject(project.id)}
              className="px-3 py-1.5 text-sm bg-amber-100 hover:bg-amber-200 text-amber-700 rounded"
            >
              <Archive className="h-4 w-4" />
            </button>
          </>
        )}

        {project.status === "finalizada" && (
          <>
            <button
              onClick={() => openDeleteConfirmation(project.id)}
              className="px-3 py-1.5 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleArchiveProject(project.id)}
              className="px-3 py-1.5 text-sm bg-amber-100 hover:bg-amber-200 text-amber-700 rounded"
            >
              <Archive className="h-4 w-4" />
            </button>
          </>
        )}

        {project.status === "arquivada" && (
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

        {["enviada", "em_selecao", "finalizada", "arquivada"].includes(project.status) && (
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
      <LumiPhotoHeader delivery={true} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center">
          <div className="flex flex-col items-start">
            <h1 className="text-2xl font-bold text-gray-900">Painel</h1>
            <p className="text-gray-600">Gerencie seus projetos e visualize métricas</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/lumiphoto/new-project"
              className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors">
              <FolderPlus className="h-5 w-5 mr-2" />
              Novo Projeto
            </Link>
          </div>
        </div>

        <div className="py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center">
                <FolderPlus className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-900">Projetos Ativos</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {dashboardStats ? dashboardStats.active_projects : projects.filter(p => p.status !== 'excluida' && p.status !== 'arquivada').length}
              </p>
              <p className="text-xs text-gray-600">Projetos em andamento</p>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center">
                <Eye className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-900">Visualizações</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {dashboardStats ? dashboardStats.total_views.toLocaleString() : projects.reduce((acc, p) => acc + p.views, 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-600">Total de visualizações</p>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center">
                <Heart className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-900">Seleções</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {dashboardStats ? dashboardStats.total_selections.toLocaleString() : projects.reduce((acc, p) => acc + p.selections, 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-600">
                Taxa de {dashboardStats ? dashboardStats.selection_rate : '0'}%
              </p>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-blue-900">Uso da Plataforma</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                  Espaço Disponível
                </span>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                <span>{dashboardStats ? dashboardStats.total_photos : totalUploads} fotos</span>
                <span>5.000 máximo</span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${((dashboardStats ? dashboardStats.total_photos : totalUploads) / 5000) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex flex-col items-start">
              <h1 className="text-2xl font-bold text-gray-900">Status dos Projetos</h1>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-3 text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando projetos...</p>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="col-span-3 text-center py-12">
                <FolderPlus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum projeto encontrado</h3>
                <p className="text-gray-500 mb-4">Crie seu primeiro projeto para começar</p>
                <button
                  onClick={handleNewProject}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 mx-auto"
                >
                  <FolderPlus className="h-4 w-4" />
                  Novo Projeto
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
                      <span>{project.views} views</span>
                      <span>{project.selections} seleções</span>
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
              Projetos Recentes
            </h2>

            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="text-left text-sm text-gray-600">
                    <th className="py-3 px-4 font-medium">Nome do Projeto</th>
                    <th className="py-3 px-4 font-medium">Data</th>
                    <th className="py-3 px-4 font-medium">Fotos</th>
                    <th className="py-3 px-4 font-medium">Visualizações</th>
                    <th className="py-3 px-4 font-medium">Seleções</th>
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
                        <td className="py-4 px-4 text-gray-700">{p.views}</td>
                        <td className="py-4 px-4 text-gray-700">{p.selections}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Atividade Recente</h2>
              <button className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 border rounded-lg shadow-sm text-sm font-medium text-gray-900 bg-white hover:bg-gray-100 transition-colors">
                Ver Todas as Atividades
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Últimas interações dos clientes
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Heart className="h-6 w-6 text-blue-400" />
                <div>
                  <p className="font-medium text-gray-900">Ana selecionou 15 fotos</p>
                  <p className="text-sm text-gray-500">
                    No projeto "Casamento Ana & Pedro" • Há 2 horas
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Eye className="h-6 w-6 text-blue-400" />
                <div>
                  <p className="font-medium text-gray-900">
                    Carla visualizou a galeria
                  </p>
                  <p className="text-sm text-gray-500">
                    No projeto "Ensaio Pré-Wedding Carla" • Há 1 dia
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Eye className="h-6 w-6 text-blue-400" />
                <div>
                  <p className="font-medium text-gray-900">
                    Maria visualizou a galeria
                  </p>
                  <p className="text-sm text-gray-500">
                    No projeto "Festa de 15 anos - Maria" • Há 2 dias
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
                <label className="text-sm font-medium text-gray-500">Visualizações</label>
                <p className="text-gray-900">{findSelectedProject()?.views}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Seleções</label>
                <p className="text-gray-900">{findSelectedProject()?.selections}</p>
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

      <ProjectDetailsOffcanvas
        isOpen={isDetailsOffcanvasOpen}
        onClose={() => setIsDetailsOffcanvasOpen(false)}
        project={findSelectedProject()}
      />
    </div>
  );
}