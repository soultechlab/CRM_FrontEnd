import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  loading?: boolean;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  loading = false
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all my-4 sm:my-8 sm:align-middle w-full max-w-xs sm:max-w-lg">
          <div className="bg-white px-3 pt-4 pb-3 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-10 w-10 sm:h-10 sm:w-10 rounded-full bg-red-100 sm:mx-0">
                <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              </div>
              <div className="mt-2 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900">
                    {title}
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={loading}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-1 sm:mt-2">
                  <p className="text-xs sm:text-sm text-gray-500">
                    {message}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-3 py-2 sm:px-6 sm:py-3 flex flex-col sm:flex-row-reverse gap-2 sm:gap-0">
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-3 py-1.5 sm:px-4 sm:py-2 bg-red-600 text-xs sm:text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Excluindo...
                </div>
              ) : (
                'Excluir'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-3 py-1.5 sm:px-4 sm:py-2 bg-white text-xs sm:text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
