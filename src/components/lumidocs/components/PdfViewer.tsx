import React, { useState, useMemo } from 'react';
import { Document, Page } from 'react-pdf';
import { X, GripHorizontal, UserCircle } from 'lucide-react';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Importar nossa configuração customizada do PDF.js
import { pdfjs } from '../utils/pdfConfig';

interface Field {
  type: 'assinatura' | 'nome' | 'email' | 'cpf';
  position: { x: number; y: number; page: number };
  width: number;
  height: number;
  color?: string;
}

interface PdfViewerProps {
  pdfUrl: string;
  onPositionSelect?: (position: { x: number; y: number; page: number }) => void;
  onDeleteField?: (index: number) => void;
  onMoveField?: (index: number, newPosition: { x: number; y: number }) => void;
  fields?: Field[];
  allSignerFields?: Array<{
    fields: Field[];
    color: string;
    assinanteIndex: number;
  }>;
  previewData?: {
    nome: string;
    email: string;
    cpf: string;
    assinatura: string;
    assinanteIndex: number;
  };
  readOnly?: boolean;
  showSignatureFields?: boolean;
}

export function PdfViewer({ 
  pdfUrl, 
  onPositionSelect, 
  onDeleteField,
  onMoveField,
  fields = [],
  allSignerFields = [],
  previewData,
  readOnly = false,
  showSignatureFields = false
}: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [draggingField, setDraggingField] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showAllFields, setShowAllFields] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoizar as opções do Document para evitar reloads desnecessários
  const documentOptions = useMemo(() => ({
    cMapUrl: 'https://unpkg.com/pdfjs-dist@4.8.69/cmaps/',
    cMapPacked: true,
    standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@4.8.69/standard_fonts/',
  }), []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  }

  function onDocumentLoadError(error: any) {
    console.error('Error loading PDF:', error);
    console.error('PDF URL:', pdfUrl);
    console.error('Error details:', error.message, error.name, error.stack);
    setError(`Falha ao carregar o arquivo PDF: ${error.message || 'Arquivo inválido ou corrompido'}`);
    setLoading(false);
  }

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (draggingField !== null || readOnly || !onPositionSelect) return;
    
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    onPositionSelect({ x, y, page: pageNumber });
  };

  const handleDragStart = (event: React.MouseEvent, index: number) => {
    event.stopPropagation();
    const fieldElement = event.currentTarget as HTMLDivElement;
    const rect = fieldElement.getBoundingClientRect();
    setDragOffset({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    });
    setDraggingField(index);
  };

  const handleDrag = (event: React.MouseEvent) => {
    if (draggingField === null) return;

    const container = event.currentTarget.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = ((event.clientX - rect.left - dragOffset.x) / rect.width) * 100;
    const y = ((event.clientY - rect.top - dragOffset.y) / rect.height) * 100;

    if (onMoveField) {
      onMoveField(draggingField, { x: Math.max(0, Math.min(x, 100)), y: Math.max(0, Math.min(y, 100)) });
    }
  };

  const handleDragEnd = () => {
    setDraggingField(null);
  };

  const getFieldPreview = (field: Field, assinanteIndex: number) => {
    if (!previewData) return '';

    switch (field.type) {
      case 'assinatura':
        return `[Assinatura Digital]`;
      case 'nome':
        return assinanteIndex === previewData.assinanteIndex ? previewData.nome : `[Nome do Assinante ${assinanteIndex + 1}]`;
      case 'email':
        return assinanteIndex === previewData.assinanteIndex ? previewData.email : `[Email do Assinante ${assinanteIndex + 1}]`;
      case 'cpf':
        return assinanteIndex === previewData.assinanteIndex ? previewData.cpf : `[CPF do Assinante ${assinanteIndex + 1}]`;
      default:
        return '';
    }
  };

  const getFieldLabel = (field: Field) => {
    switch (field.type) {
      case 'assinatura':
        return 'Assinatura Digital';
      case 'nome':
        return 'Nome Completo';
      case 'email':
        return 'E-mail';
      case 'cpf':
        return 'CPF';
      default:
        return '';
    }
  };

  const renderField = (field: Field, index: number, color: string, assinanteIndex: number, isActive: boolean = false) => (
    <div
      key={`${index}-${assinanteIndex}`}
      style={{
        position: 'absolute',
        left: `${field.position.x}%`,
        top: `${field.position.y}%`,
        width: `${field.width}%`,
        height: `${field.height}%`,
        border: `2px solid ${color}`,
        backgroundColor: `${color}20`,
        borderRadius: '4px',
        cursor: isActive ? (draggingField === index ? 'grabbing' : 'grab') : 'default',
        userSelect: 'none',
        opacity: isActive ? 1 : 0.7,
        zIndex: isActive ? 10 : 5
      }}
      onMouseDown={isActive ? (e) => handleDragStart(e, index) : undefined}
    >
      <div className="absolute -top-8 left-0 flex items-center space-x-1 z-20">
        <div
          className="text-xs font-medium px-2 py-1 rounded flex items-center space-x-1 shadow-sm"
          style={{ backgroundColor: color, color: 'white' }}
        >
          {isActive && <GripHorizontal className="w-3 h-3" />}
          <span>{getFieldLabel(field)}</span>
          <span className="ml-1">
            (A{assinanteIndex + 1})
          </span>
        </div>
        {isActive && onDeleteField && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteField(index);
            }}
            className="bg-red-500 text-white rounded p-1 hover:bg-red-600 shadow-sm"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
      <div className="w-full h-full flex items-center justify-center text-xs text-gray-700 overflow-hidden p-1 font-medium">
        {getFieldPreview(field, assinanteIndex)}
      </div>
    </div>
  );

  return (
    <div className="pdf-viewer">
      <div className="mb-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
              disabled={pageNumber <= 1}
              className="px-4 py-2 bg-gray-100 rounded-md disabled:opacity-50 hover:bg-gray-200 transition-colors"
            >
              Anterior
            </button>
            <span className="py-2 px-4 bg-gray-50 rounded-md font-medium">
              Página {pageNumber} de {numPages}
            </span>
            <button
              onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
              disabled={pageNumber >= numPages}
              className="px-4 py-2 bg-gray-100 rounded-md disabled:opacity-50 hover:bg-gray-200 transition-colors"
            >
              Próxima
            </button>
          </div>
          <button
            onClick={() => setShowAllFields(!showAllFields)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              showAllFields
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            {showAllFields ? 'Ocultar Outros Assinantes' : 'Mostrar Todos Assinantes'}
          </button>
        </div>

        {showAllFields && allSignerFields.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Legenda dos Assinantes:</h4>
            <div className="flex flex-wrap gap-3">
              {allSignerFields.map((signer, index) => (
                <div
                  key={index}
                  className="flex items-center px-3 py-2 rounded-lg border"
                  style={{ 
                    backgroundColor: `${signer.color}15`, 
                    borderColor: signer.color,
                    color: signer.color
                  }}
                >
                  <UserCircle
                    className="w-4 h-4 mr-2"
                    style={{ color: signer.color }}
                  />
                  <span className="font-medium">
                    Assinante {signer.assinanteIndex + 1}
                  </span>
                  <span className="ml-2 text-xs bg-white px-2 py-1 rounded">
                    {signer.fields.filter(f => f.position.page === pageNumber).length} campos
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div 
        className="relative cursor-crosshair border-2 border-dashed border-gray-300 rounded-lg overflow-hidden" 
        onClick={handleClick}
        onMouseMove={handleDrag}
        onMouseUp={handleDragEnd}
      >
        {error ? (
          <div className="flex flex-col items-center justify-center h-96 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <div className="text-red-500 text-lg mb-2">⚠️</div>
              <p className="text-gray-700 mb-2">{error}</p>
              <p className="text-sm text-gray-500">Verifique sua conexão com a internet e tente novamente.</p>
            </div>
          </div>
        ) : (
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            options={documentOptions}
            loading={
              <div className="flex items-center justify-center h-96 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">Carregando PDF...</p>
                  <p className="text-xs text-gray-500 mt-1">URL: {pdfUrl}</p>
                </div>
              </div>
            }
            className="w-full"
          >
            <Page 
              pageNumber={pageNumber}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="pdf-page w-full"
              width={800}
            />
          </Document>
        )}

        {/* Current signer's fields */}
        {fields.filter(f => f.position.page === pageNumber).map((field, index) => (
          renderField(
            field, 
            index, 
            previewData?.assinanteIndex !== undefined ? allSignerFields[previewData.assinanteIndex]?.color || 'rgb(59 130 246)' : 'rgb(59 130 246)', 
            previewData?.assinanteIndex || 0, 
            true
          )
        ))}

        {/* Other signers' fields */}
        {showAllFields && allSignerFields.map((signer) => (
          signer.assinanteIndex !== previewData?.assinanteIndex &&
          signer.fields
            .filter(f => f.position.page === pageNumber)
            .map((field, index) => renderField(field, index, signer.color, signer.assinanteIndex))
        ))}
      </div>
      
      {!readOnly && (
        <div className="mt-4 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p><strong>Dica:</strong> Clique no documento para adicionar um campo na posição desejada. Arraste os campos para reposicioná-los.</p>
        </div>
      )}
    </div>
  );
}