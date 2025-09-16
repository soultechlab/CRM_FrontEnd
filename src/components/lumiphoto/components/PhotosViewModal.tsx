import React from 'react';
import { Modal } from './Modal';
import { Image } from 'lucide-react';

interface Project {
  id: number;
  name: string;
  date: string;
  photos: number;
  views: number;
  selections: number;
  status: string;
  clientEmail: string;
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
  if (!project) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Fotos do Projeto"
      size="xl"
    >
      <div>
        <div className="mb-4">
          <h4 className="font-semibold text-gray-900">{project.name}</h4>
          <p className="text-gray-600">{project.photos} fotos disponíveis</p>
        </div>
        <div className="text-center py-8">
          <Image className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Visualizador de fotos em desenvolvimento</p>
          <p className="text-sm text-gray-400 mt-2">
            Em breve você poderá visualizar e gerenciar as fotos deste projeto aqui
          </p>
        </div>
      </div>
    </Modal>
  );
}