import { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  Mail,
  User,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Image as ImageIcon,
  Shield,
  Link2,
  Copy,
  Lock,
  AlertTriangle,
} from 'lucide-react';
import { Offcanvas } from './Offcanvas';
import { LumiPhotoDelivery, LumiPhotoPhoto } from '../../../services/lumiPhotoService';
import { buildDeliveryShareUrl } from '../../../utils/lumiphotoPublic';
import { toast } from 'react-toastify';

interface DeliveryProject extends Partial<LumiPhotoDelivery> {
  id: number;
  name: string;
  date: string;
  photos: number;
  downloads: number;
  status: string;
  rawStatus?: string;
  clientEmail?: string;
  deliveryToken?: string;
  photosList?: LumiPhotoPhoto[];
}

interface DeliveryDetailsOffcanvasProps {
  isOpen: boolean;
  onClose: () => void;
  project: DeliveryProject | null;
}

export function DeliveryDetailsOffcanvas({ isOpen, onClose, project }: DeliveryDetailsOffcanvasProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'photos' | 'downloads' | 'link'>('overview');
  const [previewPhoto, setPreviewPhoto] = useState<LumiPhotoPhoto | null>(null);
  const [downloadingPhotoId, setDownloadingPhotoId] = useState<number | null>(null);
  const [downloadingZip, setDownloadingZip] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setActiveTab('overview');
      setPreviewPhoto(null);
    }
  }, [isOpen]);

  const photos = project?.photosList || [];
  const security = project?.security_settings || {};
  const layout = project?.layout_settings || {};
  const shareUrl = buildDeliveryShareUrl(project?.deliveryToken);

  const tabs = [
    { id: 'overview', label: 'Visão Geral' },
    { id: 'photos', label: 'Fotos' },
    { id: 'downloads', label: 'Downloads' },
    { id: 'link', label: 'Link de Entrega' }
  ];

  const formatDateTime = (value?: string | null) => {
    if (!value) return 'Não informado';
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

  const daysRemaining = useMemo(() => {
    if (!project?.expires_at) return null;

    const expiresAt = new Date(project.expires_at).getTime();
    const now = Date.now();
    const diff = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));

    if (Number.isNaN(diff)) {
      return null;
    }

    return diff < 0 ? 0 : diff;
  }, [project?.expires_at]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enviada':
        return 'bg-green-100 text-green-800';
      case 'criado':
      case 'rascunho':
        return 'bg-gray-100 text-gray-800';
      case 'baixada':
        return 'bg-blue-100 text-blue-800';
      case 'expirada':
        return 'bg-red-100 text-red-800';
      case 'excluida':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'enviada':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'baixada':
        return <Download className="h-5 w-5 text-blue-600" />;
      case 'expirada':
      case 'excluida':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) {
      toast.error('Link público indisponível no momento.');
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copiado com sucesso!');
    } catch (error) {
      console.error('Erro ao copiar link:', error);
      toast.error('Não foi possível copiar o link.');
    }
  };

  if (!project) return null;

  const renderOverview = () => (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 break-words">{project.name}</h3>
          <div className="flex items-center text-gray-500 text-sm mt-1">
            <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
            <span>Criado em {project.date}</span>
          </div>
        </div>
        <div className={`mt-3 sm:mt-0 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
          <div className="flex items-center gap-2">
            {getStatusIcon(project.status)}
            {(project.rawStatus || project.status).replace('_', ' ')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-2">
            <ImageIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">{project.photos}</div>
          <div className="text-sm text-blue-600 font-medium">Fotos entregues</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-2">
            <Download className="h-6 w-6 text-green-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">{project.downloads}</div>
          <div className="text-sm text-green-600 font-medium">Downloads totais</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-2">
            <Clock className="h-6 w-6 text-purple-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">
            {daysRemaining === null ? '—' : `${daysRemaining} dia${daysRemaining === 1 ? '' : 's'}`}
          </div>
          <div className="text-sm text-purple-600 font-medium">
            {project.expires_at ? 'Até expirar' : 'Sem expiração configurada'}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-lg font-semibold text-gray-900 mb-3">Informações do Cliente</h4>
        <div className="space-y-3">
          <div className="flex items-center">
            <User className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
            <span className="text-gray-900 break-words">{project.clientEmail || 'Cliente não informado'}</span>
          </div>
          <div className="flex items-center">
            <Mail className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
            <span className="text-gray-900 break-words">{project.clientEmail || 'E-mail não informado'}</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-semibold text-gray-900">Configurações de Acesso</h4>
          <Shield className="h-5 w-5 text-gray-500" />
        </div>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${security.allow_download === false ? 'bg-red-500' : 'bg-green-500'}`}></span>
            {security.allow_download === false ? 'Download desativado' : 'Download habilitado'}
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${security.allow_zip_download === false ? 'bg-red-500' : 'bg-green-500'}`}></span>
            {security.allow_zip_download === false ? 'Download em ZIP desabilitado' : 'ZIP disponível'}
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${security.require_password ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            {security.require_password ? 'Protegido por senha' : 'Sem senha configurada'}
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${security.show_metadata === false ? 'bg-red-500' : 'bg-green-500'}`}></span>
            {security.show_metadata === false ? 'Metadados ocultos' : 'Metadados habilitados'}
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${security.disable_right_click ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            {security.disable_right_click ? 'Clique direito bloqueado' : 'Clique direito liberado'}
          </div>
        </div>
      </div>

      {layout?.logo_url && (
        <div className="bg-white border rounded-lg p-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Identidade Visual</h4>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              <img src={layout.logo_url} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex-1 text-sm text-gray-600 space-y-1">
              <p>Cor primária: <span className="font-semibold">{layout.primary_color || 'Padrão'}</span></p>
              <p>Layout da galeria: <span className="font-semibold">{layout.gallery_layout || 'grid'}</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderPhotos = () => (
    <div className="p-4 sm:p-6">
      {photos.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Nenhuma foto enviada para esta entrega ainda.</p>
          <p className="text-sm text-gray-400 mt-2">Faça upload na etapa de criação ou edite a entrega para adicionar imagens.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <button
              key={photo.id}
              onClick={() => setPreviewPhoto(photo)}
              className="group relative rounded-lg overflow-hidden border border-gray-200 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {photo.thumbnail_url || photo.digital_ocean_url ? (
                  <img
                    src={photo.thumbnail_url || photo.digital_ocean_url}
                    alt={photo.original_name}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="text-white text-sm font-medium">Visualizar</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <p className="text-xs text-white truncate">{photo.original_name}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderDownloads = () => (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <h5 className="text-sm text-gray-500">Total de downloads</h5>
          <p className="text-2xl font-bold text-gray-900 mt-1">{project.downloads}</p>
          <p className="text-xs text-gray-400">Contagem geral registrada no painel</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <h5 className="text-sm text-gray-500">ZIP disponível</h5>
          {project.zip_url ? (
            <>
              <p className="text-sm text-gray-700 mt-2 break-words">Arquivo pronto para download.</p>
              <button
                onClick={handleDownloadZip}
                className="mt-3 inline-flex items-center gap-2 text-sm text-blue-600 font-medium hover:text-blue-800 disabled:text-gray-400"
                disabled={downloadingZip}
              >
                {downloadingZip ? (
                  <>
                    <Download className="h-4 w-4 animate-spin" />
                    Preparando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Baixar arquivo ZIP
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Nenhum arquivo ZIP gerado para esta entrega.
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <Download className="h-4 w-4" />
          Configuração de downloads
        </h5>
        <ul className="text-sm text-blue-900 space-y-1">
          <li>{security.allow_download === false ? 'Downloads desabilitados.' : 'Downloads liberados para o cliente.'}</li>
          <li>{security.allow_individual_download === false ? 'Downloads individuais bloqueados.' : 'Downloads individuais autorizados.'}</li>
          <li>{security.allow_zip_download === false ? 'ZIP indisponível.' : 'ZIP habilitado (quando gerado).'}</li>
        </ul>
      </div>
    </div>
  );

  const renderLink = () => (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Link público da entrega
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-700">
              <Link2 className="h-4 w-4 text-gray-400 mr-2" />
              <span className="truncate">
                {shareUrl || 'Link ainda não disponível'}
              </span>
            </div>
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              disabled={!shareUrl}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar
            </button>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 text-green-900 font-medium">
            {project.expires_at ? <Clock className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            {project.expires_at ? 'Expiração configurada' : 'Sem expiração configurada'}
          </div>
          {project.expires_at && (
            <p className="text-sm text-green-700 mt-1">
              Expira em {formatDateTime(project.expires_at)} ({daysRemaining ?? '—'} dias restantes)
            </p>
          )}
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-900 font-semibold">
            <Lock className="h-4 w-4" />
            Proteção por senha
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {security.require_password
              ? 'O cliente precisará informar a senha configurada para visualizar a entrega.'
              : 'Nenhuma senha foi configurada para esta entrega.'}
          </p>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'photos':
        return renderPhotos();
      case 'downloads':
        return renderDownloads();
      case 'link':
        return renderLink();
      default:
        return renderOverview();
    }
  };

  const downloadFileFromUrl = async (assetUrl: string, filename: string) => {
    const response = await fetch(assetUrl);
    if (!response.ok) {
      throw new Error('Falha ao baixar arquivo');
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  };

  const handleDownloadPhoto = async (photo: LumiPhotoPhoto) => {
    if (!photo.digital_ocean_url) {
      toast.error('Arquivo da foto não disponível no momento.');
      return;
    }

    try {
      setDownloadingPhotoId(photo.id);
      const filename = photo.original_name || photo.filename || `foto-${photo.id}`;
      await downloadFileFromUrl(photo.digital_ocean_url, filename);
      toast.success('Download iniciado!');
    } catch (error) {
      console.error('Erro ao baixar foto da entrega:', error);
      toast.error('Não foi possível baixar esta foto.');
    } finally {
      setDownloadingPhotoId(null);
    }
  };

  const handleDownloadZip = async () => {
    if (!project?.zip_url) {
      toast.error('Nenhum arquivo ZIP gerado para esta entrega.');
      return;
    }

    try {
      setDownloadingZip(true);
      const filename = `${project.name || 'entrega'}-completo.zip`;
      await downloadFileFromUrl(project.zip_url, filename);
      toast.success('Download do ZIP iniciado!');
    } catch (error) {
      console.error('Erro ao baixar ZIP da entrega:', error);
      toast.error('Não foi possível baixar o arquivo ZIP.');
    } finally {
      setDownloadingZip(false);
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
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
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

      {previewPhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl overflow-hidden shadow-2xl max-w-4xl w-full">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 truncate">{previewPhoto.original_name}</h3>
                <p className="text-xs text-gray-500">
                  {previewPhoto.mime_type} • {Math.round((previewPhoto.file_size || 0) / 1024 / 1024)} MB
                </p>
              </div>
              <button
                onClick={() => setPreviewPhoto(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                Fechar
              </button>
            </div>
            <div className="bg-black flex items-center justify-center max-h-[80vh]">
              <img
                src={previewPhoto.digital_ocean_url}
                alt={previewPhoto.original_name}
                className="max-h-[80vh] object-contain"
              />
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
              <span className="text-sm text-gray-600">
                Upload em {previewPhoto.upload_date ? new Date(previewPhoto.upload_date).toLocaleDateString('pt-BR') : 'Data não informada'}
              </span>
              <button
                onClick={() => handleDownloadPhoto(previewPhoto)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                disabled={downloadingPhotoId === previewPhoto.id}
              >
                <Download className={`h-4 w-4 mr-2 ${downloadingPhotoId === previewPhoto.id ? 'animate-spin' : ''}`} />
                {downloadingPhotoId === previewPhoto.id ? 'Preparando...' : 'Baixar foto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
