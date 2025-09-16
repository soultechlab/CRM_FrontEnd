import React, { useState } from 'react';
import { X, Download, Heart, Trash2, RotateCcw, ZoomIn, ZoomOut, MoreVertical } from 'lucide-react';

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

interface PhotoViewerProps {
  photo: Photo;
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  onRestore: () => void;
}

export function PhotoViewer({ photo, isOpen, onClose, onDelete, onRestore }: PhotoViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [showActions, setShowActions] = useState(false);

  if (!isOpen) return null;

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = photo.url;
    link.download = photo.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black bg-opacity-50 text-white">
        <div className="flex items-center justify-between p-4">
          <div className="flex-1">
            <h3 className="text-lg font-medium truncate">{photo.name}</h3>
            <p className="text-sm text-gray-300">
              {formatFileSize(photo.size)} • {photo.uploadDate}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Zoom controls */}
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            <span className="text-sm px-2">{Math.round(zoom * 100)}%</span>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
            
            {/* Actions */}
            <button
              onClick={handleDownload}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <Download className="h-5 w-5" />
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
              
              {showActions && (
                <div className="absolute right-0 top-12 bg-white rounded-lg shadow-lg py-2 min-w-48">
                  <button
                    onClick={() => {
                      // Toggle favorite
                      setShowActions(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Heart className={`h-4 w-4 ${photo.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                    {photo.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                  </button>
                  
                  {photo.isDeleted ? (
                    <button
                      onClick={() => {
                        onRestore();
                        setShowActions(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Restaurar foto
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        onDelete();
                        setShowActions(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Mover para lixeira
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Image */}
      <div className="flex items-center justify-center h-full p-16">
        <div className="relative overflow-auto max-w-full max-h-full">
          <img
            src={photo.url}
            alt={photo.name}
            className="max-w-none transition-transform duration-200"
            style={{ 
              transform: `scale(${zoom})`,
              cursor: zoom > 1 ? 'grab' : 'default'
            }}
            onClick={(e) => {
              if (zoom <= 1) {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const centerX = rect.width / 2;
                
                if (x < centerX) {
                  // Click na esquerda - diminuir zoom ou fechar
                  if (zoom > 1) {
                    handleZoomOut();
                  }
                } else {
                  // Click na direita - aumentar zoom
                  handleZoomIn();
                }
              }
            }}
          />
        </div>
      </div>

      {/* Background overlay */}
      <div 
        className="absolute inset-0 -z-10" 
        onClick={onClose}
      />
    </div>
  );
}