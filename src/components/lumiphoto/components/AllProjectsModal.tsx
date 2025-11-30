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

interface AllProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  statusOptions: Array<{
    value: string;
    label: string;
    color: string;
  }>;
}

export function AllProjectsModal({ 
  isOpen, 
  onClose, 
  projects, 
  statusOptions 
}: AllProjectsModalProps) {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
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
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  statusOptions.find(s => s.value === project.status)?.color
                } text-gray-800`}>
                  {statusOptions.find(s => s.value === project.status)?.label}
                </span>
                <span className="text-sm text-gray-500">{project.photos} fotos</span>
              </div>
              <div className="mt-2 text-xs text-gray-400">
                <span>{project.views} visualizações • {project.selections} seleções</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}