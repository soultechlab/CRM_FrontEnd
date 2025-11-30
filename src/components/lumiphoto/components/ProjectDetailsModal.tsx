import React from 'react';
import { Modal } from './Modal';

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

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  statusOptions: Array<{
    value: string;
    label: string;
    color: string;
  }>;
}

export function ProjectDetailsModal({ 
  isOpen, 
  onClose, 
  project, 
  statusOptions 
}: ProjectDetailsModalProps) {
  if (!project) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Detalhes do Projeto"
      size="lg"
    >
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-900">{project.name}</h4>
          <p className="text-gray-600">{project.clientEmail}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Data</label>
            <p className="text-gray-900">{project.date}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <p className="text-gray-900">
              {statusOptions.find(s => s.value === project.status)?.label}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Fotos</label>
            <p className="text-gray-900">{project.photos}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Visualizações</label>
            <p className="text-gray-900">{project.views}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Seleções</label>
            <p className="text-gray-900">{project.selections}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}