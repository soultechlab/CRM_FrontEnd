import React from 'react';
import { X, FileText, Download } from 'lucide-react';

interface DownloadFormatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadPDF: () => void;
  onDownloadDOCX: () => void;
  modelName: string;
}

export function DownloadFormatModal({ 
  isOpen, 
  onClose, 
  onDownloadPDF, 
  onDownloadDOCX,
  modelName 
}: DownloadFormatModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Download className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Baixar Modelo</h3>
              <p className="text-sm text-gray-500 mt-1">{modelName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Escolha o formato para baixar o modelo:
          </p>

          <div className="space-y-3">
            <button
              onClick={onDownloadPDF}
              className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-red-200">
                  <FileText className="w-5 h-5 text-red-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">PDF</div>
                  <div className="text-sm text-gray-500">Documento portátil para visualização</div>
                </div>
              </div>
              <Download className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
            </button>

            <button
              onClick={onDownloadDOCX}
              className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">DOC/DOCX</div>
                  <div className="text-sm text-gray-500">Documento do Word para edição</div>
                </div>
              </div>
              <Download className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
            </button>

          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}