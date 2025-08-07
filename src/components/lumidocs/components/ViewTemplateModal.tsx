import React from 'react';
import { X, FileText } from 'lucide-react';
import { DocumentTemplate } from '../../../types';
import { PdfViewer } from './PdfViewer';

interface ViewTemplateModalProps {
  template: DocumentTemplate | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewTemplateModal({ template, isOpen, onClose }: ViewTemplateModalProps) {
  if (!isOpen || !template) return null;

  const pdfUrl = template.storage_url || template.file_path || '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xs sm:max-w-2xl md:max-w-4xl lg:max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-6 border-b border-gray-200">
          <div className="flex items-center">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-2 sm:mr-3" />
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Visualizar Template
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {template.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-3 sm:p-6 overflow-y-auto">
          {template.description && (
            <div className="mb-3 sm:mb-4 p-2 sm:p-4 bg-gray-50 rounded-lg">
              <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Descrição:</h4>
              <p className="text-xs sm:text-sm text-gray-600">{template.description}</p>
            </div>
          )}
          
          <div className="min-h-96">
            {pdfUrl ? (
              <PdfViewer
                pdfUrl={pdfUrl}
                readOnly={true}
                showSignatureFields={false}
              />
            ) : (
              <div className="flex items-center justify-center h-96 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-xs sm:text-base text-gray-500">
                    PDF não disponível para visualização
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-2 sm:px-6 py-3 sm:py-4 flex items-center justify-end border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors w-full sm:w-auto"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
