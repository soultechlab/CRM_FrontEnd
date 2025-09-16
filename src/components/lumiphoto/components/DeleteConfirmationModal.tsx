import React from 'react';
import { ConfirmationModal } from './ConfirmationModal';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPermanent?: boolean;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isPermanent = false
}: DeleteConfirmationModalProps) {
  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={isPermanent ? "Excluir Permanentemente" : "Mover para Lixeira"}
      message={isPermanent 
        ? "Esta ação não pode ser desfeita. O projeto será excluído permanentemente."
        : "O projeto será movido para a lixeira e excluído automaticamente após 30 dias."
      }
      confirmText={isPermanent ? "Excluir Permanentemente" : "Mover para Lixeira"}
      cancelText="Cancelar"
      type={isPermanent ? "danger" : "warning"}
    />
  );
}