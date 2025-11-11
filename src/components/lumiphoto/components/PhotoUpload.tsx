import React, { useState, useRef } from 'react';
import { Upload, Image, X, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { uploadFotoLumiPhoto, uploadFotosEmLoteLumiPhoto } from '../../../services/lumiPhotoService';
import { toast } from 'react-toastify';

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

interface FailedFile {
  name: string;
  message?: string;
}

interface PhotoUploadProps {
  projectId: number;
  onUpload: (photo: Photo) => void;
  onClose: () => void;
  onComplete?: () => void;
  addWatermark?: boolean;
  watermarkText?: string;
  watermarkPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
}

export function PhotoUpload({ projectId, onUpload, onClose, onComplete, addWatermark, watermarkText, watermarkPosition }: PhotoUploadProps) {
  const { user } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [failedFiles, setFailedFiles] = useState<FailedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    // Formatos RAW suportados
    const rawExtensions = ['.cr2', '.cr3', '.nef', '.arw', '.dng', '.raf', '.orf', '.rw2', '.pef'];

    const imageFiles = files.filter(file => {
      const fileName = file.name.toLowerCase();
      const isRaw = rawExtensions.some(ext => fileName.endsWith(ext));
      const isImage = file.type.startsWith('image/');
      return isImage || isRaw;
    });

    setSelectedFiles(prev => [...prev, ...imageFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadedCount(0);
    setFailedCount(0);
    setFailedFiles([]);
    setUploadProgress(0);

    let successfulUploads = 0;
    let failedUploads = 0;
    let failedFileDetails: FailedFile[] = [];

    try {
      const maxSize = 100 * 1024 * 1024; // 100MB
      const invalidFiles = selectedFiles.filter(file => file.size > maxSize);

      if (invalidFiles.length > 0) {
        failedUploads = invalidFiles.length;
        failedFileDetails = invalidFiles.map(file => ({
          name: file.name,
          message: 'Arquivo excede 100MB',
        }));
        toast.error(`${invalidFiles.length} arquivo(s) excedem o tamanho máximo de 100MB`);
        return;
      }

      if (selectedFiles.length === 1) {
        try {
          const uploadedPhoto = await uploadFotoLumiPhoto(
            projectId,
            selectedFiles[0],
            user,
            {
              applyWatermark: addWatermark,
              watermarkText,
              watermarkPosition,
            }
          );

          const photo: Photo = {
            id: uploadedPhoto.id.toString(),
            name: uploadedPhoto.original_name,
            url: uploadedPhoto.digital_ocean_url,
            thumbnail: uploadedPhoto.thumbnail_url || uploadedPhoto.digital_ocean_url,
            size: uploadedPhoto.file_size,
            type: uploadedPhoto.mime_type,
            uploadDate: new Date(uploadedPhoto.created_at).toLocaleDateString('pt-BR'),
            tags: [],
            isFavorite: false,
            isDeleted: false
          };

          onUpload(photo);
          successfulUploads = 1;
          toast.success('Foto enviada com sucesso!');
        } catch (error: any) {
          console.error('Erro ao fazer upload:', error);
          failedUploads = 1;
          failedFileDetails = [{
            name: selectedFiles[0].name,
            message: error?.message,
          }];
          toast.error(error?.message || 'Erro ao fazer upload da foto');
        }
      } else {
        const { photos: uploadedPhotos, failed } = await uploadFotosEmLoteLumiPhoto(
          projectId,
          selectedFiles,
          user,
          (progress) => setUploadProgress(progress),
          {
            applyWatermark: addWatermark,
            watermarkText: watermarkText,
            watermarkPosition: watermarkPosition,
          }
        );

        uploadedPhotos.forEach((uploadedPhoto) => {
          const photo: Photo = {
            id: uploadedPhoto.id.toString(),
            name: uploadedPhoto.original_name,
            url: uploadedPhoto.digital_ocean_url,
            thumbnail: uploadedPhoto.thumbnail_url || uploadedPhoto.digital_ocean_url,
            size: uploadedPhoto.file_size,
            type: uploadedPhoto.mime_type,
            uploadDate: new Date(uploadedPhoto.created_at).toLocaleDateString('pt-BR'),
            tags: [],
            isFavorite: false,
            isDeleted: false
          };

          onUpload(photo);
        });

        successfulUploads = uploadedPhotos.length;

        if (successfulUploads > 0) {
          toast.success(`${successfulUploads} foto(s) enviada(s) com sucesso!`);
        }

        if (failed.length > 0) {
          failedUploads = failed.length;
          failedFileDetails = failed.map(file => ({
            name: file.name,
            message: file.message,
          }));
          toast.warn(`${failedUploads} arquivo(s) não foram enviados.`);
        }

        if (successfulUploads === 0 && failedUploads === 0) {
          toast.info('Nenhum arquivo foi processado.');
        }
      }
    } catch (error: any) {
      console.error('Erro no processo de upload:', error);
      if (failedUploads === 0) {
        failedUploads = selectedFiles.length;
        failedFileDetails = selectedFiles.map(file => ({ name: file.name }));
      }
      toast.error(error?.message || 'Erro ao processar upload');
    } finally {
      setUploadedCount(successfulUploads);
      setFailedCount(failedUploads);
      setFailedFiles(failedFileDetails);
      setUploading(false);

      const shouldClose = successfulUploads > 0 && failedUploads === 0;
      const failedNames = new Set(failedFileDetails.map(file => file.name));

      setTimeout(() => {
        setSelectedFiles(prev =>
          failedNames.size > 0 ? prev.filter(file => failedNames.has(file.name)) : []
        );
        setUploadProgress(0);
        if (onComplete) onComplete();
        if (shouldClose) {
          onClose();
        }
      }, 1500);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Upload de Fotos</h3>
        <p className="text-sm text-gray-600">
          Adicione suas fotos arrastando e soltando ou clicando para selecionar
        </p>
      </div>

      {/* Área de Drop */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.cr2,.cr3,.nef,.arw,.dng,.raf,.orf,.rw2,.pef"
          onChange={handleChange}
          className="hidden"
        />
        
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h4 className="text-lg font-medium text-gray-900 mb-2">
          Arraste suas fotos aqui
        </h4>
        <p className="text-gray-600 mb-4">
          ou{' '}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            clique para selecionar
          </button>
        </p>
        <p className="text-xs text-gray-500">
          Suporta: JPG, PNG, GIF, WebP e RAW (CR2, CR3, NEF, ARW, DNG, RAF, ORF, RW2, PEF)
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Máximo: 100MB por arquivo
        </p>
      </div>

      {/* Barra de progresso do upload */}
      {uploading && uploadProgress > 0 && (
        <div className="mt-6">
          <div className="mb-2 flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Enviando...</span>
            <span className="text-sm text-gray-600">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Mensagem de status do upload */}
      {uploading && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-700">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
            <span className="text-sm font-medium">
              Fazendo upload de {selectedFiles.length} foto(s)...
            </span>
          </div>
        </div>
      )}

      {/* Resultados do upload */}
      {!uploading && (uploadedCount > 0 || failedCount > 0) && (
        <div className="mt-4 space-y-2">
          {uploadedCount > 0 && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {uploadedCount} foto(s) enviada(s) com sucesso!
                </span>
              </div>
            </div>
          )}
          {failedCount > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {failedCount} foto(s) falharam no upload
                </span>
              </div>
              {failedFiles.length > 0 && (
                <ul className="mt-2 text-xs text-red-700 list-disc list-inside space-y-1">
                  {failedFiles.map((file, index) => (
                    <li key={`${file.name}-${index}`}>
                      <span className="font-semibold">{file.name}</span>
                      {file.message && ` — ${file.message}`}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* Preview dos arquivos selecionados */}
      {selectedFiles.length > 0 && !uploading && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Arquivos selecionados ({selectedFiles.length})
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Image className="h-8 w-8 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botões de ação */}
      <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || uploading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Enviando...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Upload ({selectedFiles.length})
            </>
          )}
        </button>
      </div>
    </div>
  );
}
