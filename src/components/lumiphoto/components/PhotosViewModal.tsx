import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Image, Eye } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { obterEntregaLumiPhoto, LumiPhotoDelivery, LumiPhotoPhoto } from '../../../services/lumiPhotoService';
import { toast } from 'react-toastify';
import { PhotoViewer } from './PhotoViewer';

interface Project {
  id: number;
  name: string;
  date: string;
  photos: number;
  status: string;
  clientEmail: string;
  projectId?: number | null;
  photosList?: LumiPhotoPhoto[];
}

interface PhotosViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

export function PhotosViewModal({
  isOpen,
  onClose,
  project
}: PhotosViewModalProps) {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<LumiPhotoPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<LumiPhotoPhoto | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const resolvePreviewUrl = (photo: LumiPhotoPhoto) =>
    photo.watermarked_url || photo.thumbnail_url || photo.digital_ocean_url;

  const resolveFullUrl = (photo: LumiPhotoPhoto) =>
    photo.watermarked_url || photo.digital_ocean_url;

  useEffect(() => {
    if (isOpen && project) {
      loadPhotos();
    }
  }, [isOpen, project]);

  const loadPhotos = async () => {
    if (!project) return;

    try {
      if (project.photosList && project.photosList.length > 0) {
        setPhotos(project.photosList);
        return;
      }

      setLoading(true);
      const response: LumiPhotoDelivery = await obterEntregaLumiPhoto(project.id, user);
      const photosList = response.photos ?? [];
      setPhotos(photosList);
    } catch (error: any) {
      console.error('Erro ao carregar fotos da entrega:', error);
      toast.error('Erro ao carregar fotos da entrega');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoClick = (photo: LumiPhotoPhoto) => {
    if (!project?.projectId) {
      // Prioriza foto com marca d'água ao abrir em nova aba
      window.open(resolveFullUrl(photo), '_blank');
      return;
    }

    setSelectedPhoto(photo);
    setIsViewerOpen(true);
  };

  const handlePhotoDeleted = async () => {
    await loadPhotos();
  };

  if (!project) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Fotos da Entrega"
        size="xl"
      >
        <div>
          <div className="mb-4">
            <h4 className="font-semibold text-gray-900">{project.name}</h4>
            <p className="text-gray-600">
              {loading ? 'Carregando...' : `${photos.length} foto${photos.length !== 1 ? 's' : ''} disponível${photos.length !== 1 ? 'eis' : ''}`}
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Carregando fotos...</p>
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-12">
              <Image className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma foto encontrada</p>
              <p className="text-sm text-gray-400 mt-2">
                As fotos enviadas para esta entrega aparecerão aqui
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
                        src={resolvePreviewUrl(photo)}
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
      </Modal>

      {selectedPhoto && project.projectId && (
        <PhotoViewer
          projectId={project.projectId}
          photo={{
            id: selectedPhoto.id.toString(),
            name: selectedPhoto.original_name,
            url: resolveFullUrl(selectedPhoto),
            thumbnail: resolvePreviewUrl(selectedPhoto),
            size: selectedPhoto.file_size,
            type: selectedPhoto.mime_type,
            uploadDate: selectedPhoto.upload_date
              ? new Date(selectedPhoto.upload_date).toLocaleDateString('pt-BR')
              : '',
            isFavorite: selectedPhoto.is_selected,
            isDeleted: false,
            has_watermark: selectedPhoto.has_watermark,
            watermark_config: selectedPhoto.watermark_config,
            // Campos adicionais do backend
            watermarked_url: selectedPhoto.watermarked_url,
            digital_ocean_url: selectedPhoto.digital_ocean_url,
            thumbnail_url: selectedPhoto.thumbnail_url,
          }}
          isOpen={isViewerOpen}
          onClose={() => {
            setIsViewerOpen(false);
            setSelectedPhoto(null);
          }}
          onPhotoDeleted={handlePhotoDeleted}
          readOnly
        />
      )}
    </>
  );
}
