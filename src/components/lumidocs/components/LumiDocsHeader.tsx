import React from 'react';
import { Plus, FileSignature } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface LumiDocsHeaderProps {
  onNewDocumentClick?: () => void;
  onNewModelClick?: () => void;
}

export function LumiDocsHeader({ onNewDocumentClick, onNewModelClick }: LumiDocsHeaderProps) {
  const location = useLocation();
  
  // Determinar qual botão mostrar baseado na rota atual
  const getButtonConfig = () => {
    if (location.pathname === '/modelos') {
      return {
        text: 'Novo Modelo',
        onClick: onNewModelClick,
      };
    }
    return {
      text: 'Novo Documento',
      onClick: onNewDocumentClick,
    };
  };

  const buttonConfig = getButtonConfig();

  return (
    <div>
      <div className="bg-white shadow-sm py-4 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileSignature className="w-8 h-8 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-800">lumi.doc</h1>
        </div>
        <div className="flex items-center space-x-4 sm:space-x-6">
          <nav className="hidden md:flex space-x-6">
            <Link 
              to="/lumidocs" 
              className={`font-medium transition-colors ${
                location.pathname === '/lumidocs' 
                  ? 'text-blue-600' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Documentos
            </Link>
            <Link 
              to="/modelos" 
              className={`font-medium transition-colors ${
                location.pathname === '/modelos' 
                  ? 'text-blue-600' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Modelos
            </Link>
          </nav>
          {buttonConfig.onClick && (
            <button
              onClick={buttonConfig.onClick}
              className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              {buttonConfig.text}
            </button>
          )}
        </div>
      </div>
      {/* Navegação mobile */}
      <nav className="flex md:hidden justify-center gap-4 border-b border-gray-100 bg-white pb-2">
        <Link 
          to="/lumidocs" 
          className={`font-medium px-2 py-1 rounded transition-colors ${
            location.pathname === '/lumidocs' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          Documentos
        </Link>
        <Link 
          to="/modelos" 
          className={`font-medium px-2 py-1 rounded transition-colors ${
            location.pathname === '/modelos' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          Modelos
        </Link>
      </nav>
    </div>
  );
}
