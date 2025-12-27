import { useState, useEffect } from 'react';
import { Eye, Heart, Calendar, Mail, User, CheckCircle, Clock, Archive, Send, Pencil, XCircle, Activity as ActivityIcon, Image, Copy, Link2, Download, DollarSign, Plus } from 'lucide-react';
import { Offcanvas } from './Offcanvas';
import { PhotoViewer } from './PhotoViewer';
import { Modal } from './Modal';
import { AddPhotosToProjectModal } from './AddPhotosToProjectModal';
import { useAuth } from '../../../contexts/AuthContext';
import { obterAtividadesProjetoLumiPhoto, obterFotosLumiPhoto, obterSelecoesGaleriaLumiPhoto, LumiPhotoActivity, LumiPhotoPhoto } from '../../../services/lumiPhotoService';
import { toast } from 'react-toastify';
import { buildPublicGalleryShareUrl } from '../../../utils/lumiphotoPublic';

interface Project {
  id: number;
  name: string;
  date: string;
  photos: number;
  downloads?: number;
  views?: number;
  selections?: number;
  status: string;
  clientEmail: string;
  clientName?: string;
  shareLink?: string;
  shareToken?: string;
  maxSelections?: number | null;
  contractedPhotos?: number | null;
  allowDownload?: boolean;
  allowExtraPhotos?: boolean;
  extraPhotosType?: 'individual' | 'packages' | 'both';
  extraPhotoPrice?: number | null;
  packageQuantity?: number | null;
  packagePrice?: number | null;
  requirePassword?: boolean;
  accessPassword?: string | null;
  linkExpiration?: number | null;
}

interface ProjectDetailsOffcanvasProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

interface ProjectSelection {
  id: number;
  photo_id: number;
  order?: number | null;
  selected_at?: string | null;
  created_at?: string | null;
  photo?: LumiPhotoPhoto;
}

export function ProjectDetailsOffcanvas({ isOpen, onClose, project }: ProjectDetailsOffcanvasProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'photos' | 'selections' | 'activities' | 'share'>('overview');
  const [activities, setActivities] = useState<LumiPhotoActivity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [photos, setPhotos] = useState<LumiPhotoPhoto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [selections, setSelections] = useState<ProjectSelection[]>([]);
  const [loadingSelections, setLoadingSelections] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<LumiPhotoPhoto | null>(null);
  const [isPhotoViewerOpen, setIsPhotoViewerOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportTab, setExportTab] = useState<'lightroom' | 'finder' | 'windows'>('lightroom');
  const [isAddPhotosModalOpen, setIsAddPhotosModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen && project && activeTab === 'activities') {
      loadActivities();
    }
  }, [isOpen, project, activeTab]);

  useEffect(() => {
    if (isOpen && project && activeTab === 'photos') {
      loadPhotos();
    }
  }, [isOpen, project, activeTab]);

  useEffect(() => {
    if (isOpen && project && activeTab === 'selections') {
      loadSelections();
    }
  }, [isOpen, project, activeTab]);

  useEffect(() => {
    if (!isOpen) {
      setIsPhotoViewerOpen(false);
      setSelectedPhoto(null);
    }
  }, [isOpen]);

  useEffect(() => {
    setPhotos([]);
    setSelections([]);
    setSelectedPhoto(null);
    setIsPhotoViewerOpen(false);
  }, [project]);

  const loadActivities = async () => {
    if (!project) return;

    try {
      setLoadingActivities(true);
      const data = await obterAtividadesProjetoLumiPhoto(project.id, user);
      setActivities(data);
    } catch (error: any) {
      console.error('Erro ao carregar atividades:', error);
      toast.error('Erro ao carregar atividades do projeto');
    } finally {
      setLoadingActivities(false);
    }
  };

  const loadPhotos = async () => {
    if (!project) return;

    try {
      setLoadingPhotos(true);
      const response = await obterFotosLumiPhoto(project.id, user);
      const photosList = Array.isArray(response) ? response : response.data || [];

      setPhotos(photosList);
    } catch (error: any) {
      console.error('[GALLERY] Erro ao carregar fotos:', error);
      toast.error('Erro ao carregar fotos do projeto');
    } finally {
      setLoadingPhotos(false);
    }
  };

  const loadSelections = async () => {
    if (!project?.shareToken) {
      setSelections([]);
      return;
    }

    try {
      setLoadingSelections(true);
      const response = await obterSelecoesGaleriaLumiPhoto(project.shareToken);
      const selectionsList = (Array.isArray(response) ? response : response.data || []) as ProjectSelection[];
      setSelections(selectionsList);
    } catch (error: any) {
      console.error('Erro ao carregar seleções:', error);
      toast.error('Erro ao carregar seleções do projeto');
    } finally {
      setLoadingSelections(false);
    }
  };

  const handlePhotoClick = (photo: LumiPhotoPhoto) => {
    setSelectedPhoto(photo);
    setIsPhotoViewerOpen(true);
  };

  const handlePhotoViewerClose = () => {
    setIsPhotoViewerOpen(false);
    setSelectedPhoto(null);
  };

  const resolvePhotoPreview = (photo: LumiPhotoPhoto) =>
    photo.watermarked_url || photo.thumbnail_url || photo.digital_ocean_url;

  const resolvePhotoFull = (photo: LumiPhotoPhoto) =>
    photo.watermarked_url || photo.digital_ocean_url;

  const handleAddPhotosComplete = async () => {
    await loadPhotos();
    toast.success('Fotos adicionadas com sucesso!');
  };

  const handlePhotoDeleted = async () => {
    await loadPhotos();
    if (project?.shareToken) {
      await loadSelections();
    }
  };

  const copyToClipboard = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copiado para a área de transferência`);
    } catch (error) {
      console.error('Erro ao copiar valor:', error);
      toast.error('Não foi possível copiar. Tente manualmente.');
    }
  };

  const getLightroomExportText = (): string => {
    return selections
      .map(selection => {
        const fileName = selection.photo?.original_name || '';
        // Remove a extensão do arquivo
        return fileName.replace(/\.[^/.]+$/, '');
      })
      .filter(name => name !== '')
      .join(', ');
  };

  const getFinderExportText = (): string => {
    return selections
      .map(selection => selection.photo?.original_name || '')
      .filter(name => name !== '')
      .join('\n');
  };

  const getWindowsExportText = (): string => {
    return selections
      .map(selection => selection.photo?.original_name || '')
      .filter(name => name !== '')
      .join('\n');
  };

  const copyCurrentTabContent = async () => {
    if (selections.length === 0) {
      toast.warning('Nenhuma foto selecionada para copiar');
      return;
    }

    let content = '';
    let label = '';

    switch (exportTab) {
      case 'lightroom':
        content = getLightroomExportText();
        label = 'Nomes para Lightroom';
        break;
      case 'finder':
        content = getFinderExportText();
        label = 'Nomes para Finder';
        break;
      case 'windows':
        content = getWindowsExportText();
        label = 'Nomes para Windows';
        break;
    }

    await copyToClipboard(content, label);
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return 'Data não informada';
    try {
      return new Date(value).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return value;
    }
  };

  const resolveShareUrl = (): string => {
    if (!project) return '';
    return buildPublicGalleryShareUrl(project.shareToken, project.shareLink);
  };

  if (!project) return null;

  const tabs = [
    { id: 'overview', label: 'Visão Geral' },
    { id: 'photos', label: 'Fotos' },
    { id: 'selections', label: 'Seleções' },
    { id: 'activities', label: 'Atividades' },
    { id: 'share', label: 'Compartilhar' }
  ];

  // Atividades recentes para overview (pegar as 3 primeiras)
  const recentActivities = activities.slice(0, 3);

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'rascunho': return 'bg-gray-100 text-gray-800';
      case 'enviada': return 'bg-green-100 text-green-800';
      case 'em_selecao': return 'bg-yellow-100 text-yellow-800';
      case 'finalizada': return 'bg-blue-100 text-blue-800';
      case 'arquivada': return 'bg-amber-100 text-amber-800';
      case 'excluida': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProjectStatusIcon = (status: string) => {
    switch (status) {
      case 'rascunho': return <Pencil className="h-5 w-5 text-gray-600" />;
      case 'enviada': return <Send className="h-5 w-5 text-green-600" />;
      case 'em_selecao': return <Eye className="h-5 w-5 text-yellow-600" />;
      case 'finalizada': return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'arquivada': return <Archive className="h-5 w-5 text-amber-600" />;
      case 'excluida': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const renderOverview = () => (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Project Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 break-words">{project.name}</h3>
          <div className="flex items-center text-gray-500 text-sm mt-1">
            <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
            <span>{project.date}</span>
          </div>
        </div>
        <div className={`mt-3 sm:mt-0 px-3 py-1 rounded-full text-sm font-medium ${getProjectStatusColor(project.status)}`}>
          <div className="flex items-center gap-2">
            {getProjectStatusIcon(project.status)}
            {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('_', ' ')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-2">
            <Eye className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">
            {project.views !== undefined ? project.views : project.downloads || 0}
          </div>
          <div className="text-sm text-gray-500">
            {project.views !== undefined ? 'Visualizações' : 'Downloads'}
          </div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center w-12 h-12 bg-pink-100 rounded-full mx-auto mb-2">
            <Heart className="h-6 w-6 text-pink-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">{project.selections || 0}</div>
          <div className="text-sm text-gray-500">Seleções</div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Detalhes do Cliente</h4>
        <div className="space-y-3">
          <div className="flex items-center">
            <User className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
            <span className="text-gray-900 break-words">
              {project.clientName || 'Cliente não informado'}
            </span>
          </div>
          <div className="flex items-center">
            <Mail className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
            <span className="text-gray-900 break-all">
              {project.clientEmail || 'E-mail não informado'}
            </span>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente</h4>
        <div className="space-y-3">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity) => (
              <div key={activity.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm bg-gray-50 p-3 rounded-lg">
                <span className="text-gray-900 font-medium">{activity.description}</span>
                <span className="text-gray-500 text-xs sm:text-sm mt-1 sm:mt-0">
                  {new Date(activity.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500 text-sm">
              Nenhuma atividade recente
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPhotos = () => (
    <div className="p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">Fotos do Projeto</h4>
          <p className="text-gray-600">
            {loadingPhotos
              ? 'Carregando fotos...'
              : `${photos.length} foto${photos.length !== 1 ? 's' : ''} disponível${photos.length !== 1 ? 'eis' : ''}`}
          </p>
        </div>
        <button
          onClick={() => setIsAddPhotosModalOpen(true)}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Adicionar Fotos
        </button>
      </div>

      {loadingPhotos ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando fotos...</p>
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-12">
          <Image className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Nenhuma foto encontrada</p>
          <p className="text-sm text-gray-400 mt-2">
            As fotos enviadas para este projeto aparecerão aqui
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[600px] overflow-y-auto">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-200 hover:border-blue-500 transition-all"
              onClick={() => handlePhotoClick(photo)}
            >
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {photo.thumbnail_url || photo.digital_ocean_url || photo.watermarked_url ? (
                  <img
                    src={resolvePhotoPreview(photo)}
                    alt={photo.original_name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <Image className="h-8 w-8 text-gray-400" />
                )}
              </div>

              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePhotoClick(photo);
                  }}
                  className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                  title="Visualizar"
                >
                  <Eye className="h-5 w-5 text-gray-700" />
                </button>
              </div>

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                <p className="text-xs text-white truncate" title={photo.original_name}>
                  {photo.original_name}
                </p>
              </div>

              {photo.is_selected && (
                <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  Selecionada
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSelections = () => {
    if (!project.shareToken) {
      return (
        <div className="p-4 sm:p-6">
          <div className="text-center py-12">
            <Image className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Este projeto ainda não possui um link público.</p>
            <p className="text-sm text-gray-400 mt-2">
              Gere o link de compartilhamento (aba "Compartilhar") para que o cliente possa selecionar fotos.
            </p>
          </div>
        </div>
      );
    }

    const selectionLimit = project.maxSelections ?? project.contractedPhotos ?? null;
    const progress = selectionLimit
      ? Math.min(100, Math.round((selections.length / selectionLimit) * 100))
      : null;
    const shareUrl = resolveShareUrl();

    return (
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">Seleções do Cliente</h4>
            <p className="text-sm text-gray-500">
              Acompanhe em tempo real as fotos marcadas através do link público.
            </p>
          </div>
          {shareUrl && (
            <button
              onClick={() => window.open(shareUrl, '_blank')}
              className="inline-flex items-center justify-center px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Link2 className="h-4 w-4 mr-2" />
              Abrir galeria pública
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Fotos selecionadas</p>
            <p className="text-2xl font-bold text-gray-900">{selections.length}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Limite configurado</p>
            <p className="text-2xl font-bold text-gray-900">
              {selectionLimit ? selectionLimit : 'Sem limite'}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Proteção</p>
            <p className="text-base font-semibold text-gray-900">
              {project.requirePassword
                ? project.accessPassword
                  ? `Senha ativa (${project.accessPassword})`
                  : 'Senha ativa'
                : 'Sem senha'}
            </p>
          </div>
        </div>

        {/* Card de Fotos Extras */}
        {project.allowExtraPhotos && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <h5 className="font-semibold text-blue-900">Opções de Fotos Extras</h5>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Individual */}
              {(project.extraPhotosType === 'individual' || project.extraPhotosType === 'both') &&
               project.extraPhotoPrice && (
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">💎 Individual</span>
                    <span className="text-xl font-bold text-blue-600">
                      R$ {Number(project.extraPhotoPrice).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">por foto adicional</p>
                </div>
              )}

              {/* Pacote */}
              {(project.extraPhotosType === 'packages' || project.extraPhotosType === 'both') &&
               project.packageQuantity && project.packagePrice && (
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">📦 Pacote</span>
                    <span className="text-xl font-bold text-green-600">
                      R$ {Number(project.packagePrice).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">
                    {project.packageQuantity} fotos extras
                  </p>
                  <p className="text-xs text-green-700 font-medium">
                    R$ {(Number(project.packagePrice) / project.packageQuantity).toFixed(2)} por foto
                  </p>
                </div>
              )}
            </div>

            <div className="mt-3 bg-blue-100 rounded-md p-3">
              <p className="text-xs text-blue-800">
                <span className="font-semibold">ℹ️ Modo:</span>{' '}
                {project.extraPhotosType === 'individual' && 'Venda individual de fotos extras'}
                {project.extraPhotosType === 'packages' && 'Venda por pacotes de fotos'}
                {project.extraPhotosType === 'both' && 'Cliente pode escolher entre individual ou pacote'}
              </p>
            </div>
          </div>
        )}

        {selectionLimit && (
          <div>
            <div className="flex justify-between text-sm mb-1 text-gray-600">
              <span>{selections.length} de {selectionLimit} seleções</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${selections.length >= selectionLimit ? 'bg-red-500' : 'bg-blue-600'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            {selections.length >= selectionLimit && (
              <p className="text-xs text-red-600 mt-2">
                Limite atingido. Oriente o cliente caso deseje fotos extras.
              </p>
            )}
          </div>
        )}

        {selections.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h5 className="text-sm font-semibold text-blue-900 mb-1">
                  {selections.length} FOTO{selections.length !== 1 ? 'S' : ''} SELECIONADA{selections.length !== 1 ? 'S' : ''}
                </h5>
                <p className="text-xs text-blue-700">
                  Exporte os nomes dos arquivos selecionados para usar em seu software de edição
                </p>
              </div>
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar Fotos
              </button>
            </div>
          </div>
        )}

        {loadingSelections ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Carregando seleções...</p>
          </div>
        ) : selections.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma foto selecionada ainda</p>
            <p className="text-sm text-gray-400 mt-2">
              Assim que o cliente fizer seleções elas aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {selections.map((selection) => (
              <div
                key={selection.id}
                className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:border-blue-400 transition-colors"
              >
                <div className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                  {selection.photo?.thumbnail_url || selection.photo?.digital_ocean_url || selection.photo?.watermarked_url ? (
                    <img
                      src={resolvePhotoPreview(selection.photo)}
                      alt={selection.photo.original_name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <Image className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {selection.photo?.original_name || `Foto #${selection.photo_id}`}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selection.order ? `Ordem #${selection.order}` : 'Sem ordem definida'} •{' '}
                    {formatDateTime(selection.selected_at ?? selection.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => selection.photo && handlePhotoClick(selection.photo)}
                  disabled={!selection.photo}
                  className="inline-flex items-center justify-center px-3 py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 disabled:text-gray-400 disabled:border-gray-200"
                >
                  Ver
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderActivities = () => (
    <div className="p-4 sm:p-6">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">Todas as Atividades</h4>
      {loadingActivities ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Carregando atividades...</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8">
          <ActivityIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">Nenhuma atividade registrada</p>
          <p className="text-xs text-gray-400 mt-2">
            As atividades do projeto aparecerão aqui
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {activities.map((activity) => (
            <div key={activity.id} className="border-l-2 border-blue-200 pl-4 pb-4 bg-gray-50 rounded-r-lg pr-4 py-3">
              <div className="text-sm font-medium text-gray-900">{activity.description}</div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(activity.created_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              {activity.ip_address && (
                <div className="text-xs text-gray-400 mt-1">IP: {activity.ip_address}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderShare = () => {
    const shareUrl = resolveShareUrl();

    return (
      <div className="p-4 sm:p-6 space-y-6">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">Compartilhar Projeto</h4>
          <p className="text-sm text-gray-500">
            Gere o link de seleção e compartilhe com o cliente para que ele visualize e marque as fotos favoritas.
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Link público
          </label>
          {shareUrl ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(shareUrl, 'Link')}
                  className="px-3 py-2 text-sm text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  onClick={() => window.open(shareUrl, '_blank')}
                  className="px-3 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Abrir
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg border border-dashed border-gray-300 text-sm text-gray-600 bg-gray-50">
              Ainda não há link gerado. Salve o projeto e utilize a página de edição para gerar o link público.
            </div>
          )}
        </div>

        {project.shareToken && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Token</p>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-mono text-gray-900 truncate">{project.shareToken}</span>
                <button
                  onClick={() => copyToClipboard(project.shareToken!, 'Token')}
                  className="p-2 text-gray-600 hover:text-gray-900"
                  title="Copiar token"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Senha</p>
              {project.requirePassword ? (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {project.accessPassword || 'Defina uma senha na edição do projeto'}
                  </span>
                  {project.accessPassword && (
                    <button
                      onClick={() => copyToClipboard(project.accessPassword!, 'Senha')}
                      className="p-2 text-gray-600 hover:text-gray-900"
                      title="Copiar senha"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ) : (
                <span className="text-sm text-gray-600">Sem senha</span>
              )}
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Downloads</p>
              <span className="text-sm font-semibold text-gray-900">
                {project.allowDownload ? 'Permitido' : 'Bloqueado'}
              </span>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-900">
          <p className="font-semibold mb-1">Dica</p>
          <p>
            Compartilhe o link com seu cliente. Ele poderá selecionar até{' '}
            {project.maxSelections ?? project.contractedPhotos ?? 'sem limite'} fotos, e você acompanhará tudo pela aba
            "Seleções". {project.linkExpiration
              ? `O link expira em ${project.linkExpiration} dia(s) após o envio.`
              : 'Sem expiração configurada.'}
          </p>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'photos':
        return renderPhotos();
      case 'selections':
        return renderSelections();
      case 'activities':
        return renderActivities();
      case 'share':
        return renderShare();
      default:
        return renderOverview();
    }
  };

  return (
    <>
      <Offcanvas isOpen={isOpen} onClose={onClose} title={project.name} size="xl">
        <div className="flex-shrink-0 border-b border-gray-200 bg-white">
          <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </Offcanvas>

      {selectedPhoto && (
        <PhotoViewer
          projectId={project.id}
          photo={{
            id: selectedPhoto.id.toString(),
            name: selectedPhoto.original_name,
            url: resolvePhotoFull(selectedPhoto),
            thumbnail: resolvePhotoPreview(selectedPhoto),
            size: selectedPhoto.file_size ?? 0,
            type: selectedPhoto.mime_type ?? 'image/jpeg',
            uploadDate: new Date(selectedPhoto.upload_date || selectedPhoto.created_at).toLocaleDateString('pt-BR'),
            isDeleted: false,
            has_watermark: selectedPhoto.has_watermark,
            watermark_config: selectedPhoto.watermark_config,
            // Campos necessários para priorizar foto com marca d'água
            watermarked_url: selectedPhoto.watermarked_url ?? undefined,
            digital_ocean_url: selectedPhoto.digital_ocean_url ?? undefined,
            thumbnail_url: selectedPhoto.thumbnail_url ?? undefined,
          }}
          isOpen={isPhotoViewerOpen}
          onClose={handlePhotoViewerClose}
          onPhotoDeleted={handlePhotoDeleted}
        />
      )}

      <AddPhotosToProjectModal
        isOpen={isAddPhotosModalOpen}
        onClose={() => setIsAddPhotosModalOpen(false)}
        projectId={project.id}
        onUploadComplete={handleAddPhotosComplete}
      />

      <Modal
        isOpen={isExportModalOpen}
        onClose={() => {
          setIsExportModalOpen(false);
          setExportTab('lightroom');
        }}
        title="Exportar Seleções"
        size="lg"
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
              <Download className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {selections.length} foto{selections.length !== 1 ? 's' : ''} selecionada{selections.length !== 1 ? 's' : ''}
            </h3>
            <p className="text-sm text-gray-600">
              Escolha o formato e copie os nomes das fotos
            </p>
          </div>

          {/* Tabs Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setExportTab('lightroom')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  exportTab === 'lightroom'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Lightroom
                </div>
              </button>
              <button
                onClick={() => setExportTab('finder')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  exportTab === 'finder'
                    ? 'border-gray-500 text-gray-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  Finder (Mac)
                </div>
              </button>
              <button
                onClick={() => setExportTab('windows')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  exportTab === 'windows'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 12V6.75l6-1.32v6.48L3 12m17-9v8.75l-10 .15V5.21L20 3M3 13l6 .09v6.81l-6-1.15V13m17 .25V22l-10-1.91V13.1l10 .15z"/>
                  </svg>
                  Windows 10
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="space-y-4">
            {exportTab === 'lightroom' && (
              <div className="space-y-3">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-purple-900 mb-2">Adobe Lightroom</h4>
                  <p className="text-xs text-purple-700 mb-3">
                    Nomes sem extensão, separados por vírgula. Perfeito para usar no filtro de biblioteca.
                  </p>
                  <div className="bg-white border border-purple-300 rounded-lg p-3 max-h-64 overflow-y-auto">
                    <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono">
                      {getLightroomExportText() || 'Nenhuma foto selecionada'}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {exportTab === 'finder' && (
              <div className="space-y-3">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Finder (macOS)</h4>
                  <p className="text-xs text-gray-700 mb-3">
                    Nomes completos com extensão, um por linha. Use no Finder do Mac.
                  </p>
                  <div className="bg-white border border-gray-300 rounded-lg p-3 max-h-64 overflow-y-auto">
                    <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono">
                      {getFinderExportText() || 'Nenhuma foto selecionada'}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {exportTab === 'windows' && (
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">Windows 10</h4>
                  <p className="text-xs text-blue-700 mb-3">
                    Nomes completos com extensão, um por linha. Use no Windows Explorer.
                  </p>
                  <div className="bg-white border border-blue-300 rounded-lg p-3 max-h-64 overflow-y-auto">
                    <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono">
                      {getWindowsExportText() || 'Nenhuma foto selecionada'}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setIsExportModalOpen(false);
                setExportTab('lightroom');
              }}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                copyCurrentTabContent();
                setIsExportModalOpen(false);
                setExportTab('lightroom');
              }}
              className="flex-1 inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
