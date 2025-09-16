import React from 'react';
import { Modal } from './Modal';
import { Eye, Activity } from 'lucide-react';

interface AllActivitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AllActivitiesModal({ 
  isOpen, 
  onClose 
}: AllActivitiesModalProps) {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Todas as Atividades"
      size="xl"
    >
      <div className="space-y-4">
        <div className="text-center py-8">
          <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Log de atividades em desenvolvimento</p>
          <p className="text-sm text-gray-400 mt-2">
            Aqui você verá todas as ações realizadas nos projetos
          </p>
          <div className="mt-4 text-left bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Em breve você poderá ver:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Upload de fotos</li>
              <li>• Criação de projetos</li>
              <li>• Mudanças de status</li>
              <li>• Visualizações de clientes</li>
              <li>• Seleções de fotos</li>
              <li>• Arquivamento de projetos</li>
            </ul>
          </div>
        </div>
      </div>
    </Modal>
  );
}