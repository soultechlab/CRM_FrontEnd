import React, { useState, useMemo, useRef } from 'react';
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
  const [isDragging, setIsDragging] = useState(false);
  const [showAllFields, setShowAllFields] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  // Memoizar as opções do Document para evitar reloads desnecessários
  const documentOptions = useMemo(() => ({
    cMapUrl: 'https://unpkg.com/pdfjs-dist@4.8.69/cmaps/',
    cMapPacked: true,
    standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@4.8.69/standard_fonts/',
    httpHeaders: pdfUrl.includes('localhost:8080') || pdfUrl.includes('api') ? {
      'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : undefined
    } : undefined,
    withCredentials: pdfUrl.includes('localhost:8080') || pdfUrl.includes('api')
  }), [pdfUrl]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  }

  function onDocumentLoadError(error: any) {
    console.error('Error loading PDF:', error);
    setError(`Falha ao carregar o arquivo PDF: ${error.message || 'Arquivo inválido ou corrompido'}`);
    setLoading(false);
  }

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // SEMPRE prevenir propagação e comportamento padrão
    event.preventDefault();
    event.stopPropagation();
    
    if (draggingField !== null || isDragging || readOnly || !onPositionSelect) return;
    
    if ((event.target as HTMLElement).closest('[data-field]')) return;
    
    // Encontrar o elemento da página PDF usando o ref
    const pdfPageElement = pdfContainerRef.current?.querySelector('.react-pdf__Page__canvas') as HTMLCanvasElement;
    if (!pdfPageElement) return;
    
    const pdfRect = pdfPageElement.getBoundingClientRect();
    
    // Calcular posição relativa à página PDF real
    const x = ((event.clientX - pdfRect.left) / pdfRect.width) * 100;
    const y = ((event.clientY - pdfRect.top) / pdfRect.height) * 100;
    
    // Verificar se o clique foi dentro da área da página PDF
    if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
      onPositionSelect({ x, y, page: pageNumber });
    }
  };

  const handleDragStart = (event: React.MouseEvent, index: number) => {
    event.stopPropagation();
    event.preventDefault();
    const fieldElement = event.currentTarget as HTMLDivElement;
    const rect = fieldElement.getBoundingClientRect();
    setDragOffset({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    });
    setDraggingField(index);
    setIsDragging(true);
  };

  const handleDrag = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (draggingField === null) return;

    // Encontrar o elemento da página PDF usando o ref
    const pdfPageElement = pdfContainerRef.current?.querySelector('.react-pdf__Page__canvas') as HTMLCanvasElement;
    if (!pdfPageElement) return;

    const pdfRect = pdfPageElement.getBoundingClientRect();
    const x = ((event.clientX - pdfRect.left - dragOffset.x) / pdfRect.width) * 100;
    const y = ((event.clientY - pdfRect.top - dragOffset.y) / pdfRect.height) * 100;

    if (onMoveField) {
      onMoveField(draggingField, { x: Math.max(0, Math.min(x, 100)), y: Math.max(0, Math.min(y, 100)) });
    }
  };

  const handleDragEnd = (event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setDraggingField(null);
    setTimeout(() => setIsDragging(false), 100);
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

  const renderField = (field: Field, index: number, color: string, assinanteIndex: number, isActive: boolean = false) => {
    return (
      <div
        key={`${index}-${assinanteIndex}`}
        data-field="true"
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
          zIndex: isActive ? 10 : 5,
          transform: 'translate(0, 0)' // Força compositing para melhor performance
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
  };

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
        ref={pdfContainerRef}
        className="relative cursor-crosshair border-2 border-dashed border-gray-300 rounded-lg overflow-hidden" 
        onClick={handleClick}
        onMouseMove={handleDrag}
        onMouseUp={(e) => handleDragEnd(e)}
        style={{ display: 'flex', justifyContent: 'center' }}
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
              onLoadSuccess={({ width, height }) => {
                // Garantir que as dimensões da página estão disponíveis
                console.log('Página carregada com dimensões:', width, height);
              }}
            />
          </Document>
        )}

        {/* Fields overlay positioned absolutely */}
        <div 
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }}
        >
          {/* Current signer's fields */}
          {fields.filter(f => f.position.page === pageNumber).map((field, index) => (
            <div key={`current-${index}`} className="pointer-events-auto">
              {renderField(
                field, 
                index, 
                previewData?.assinanteIndex !== undefined ? allSignerFields[previewData.assinanteIndex]?.color || 'rgb(59 130 246)' : 'rgb(59 130 246)', 
                previewData?.assinanteIndex || 0, 
                true
              )}
            </div>
          ))}

          {/* Other signers' fields */}
          {showAllFields && allSignerFields.map((signer) => (
            signer.assinanteIndex !== previewData?.assinanteIndex &&
            signer.fields
              .filter(f => f.position.page === pageNumber)
              .map((field, index) => (
                <div key={`signer-${signer.assinanteIndex}-${index}`} className="pointer-events-none">
                  {renderField(field, index, signer.color, signer.assinanteIndex)}
                </div>
              ))
          ))}
        </div>
      </div>
      
      {!readOnly && (
        <div className="mt-4 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p><strong>Dica:</strong> Clique no documento para adicionar um campo na posição desejada. Arraste os campos para reposicioná-los.</p>
        </div>
      )}
    </div>
  );
}