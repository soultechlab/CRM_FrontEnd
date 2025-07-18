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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <FileText className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Visualizar Template
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {template.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {template.description && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Descrição:</h4>
              <p className="text-sm text-gray-600">{template.description}</p>
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
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    PDF não disponível para visualização
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}