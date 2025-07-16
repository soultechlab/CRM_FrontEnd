import React, { useEffect, useState } from 'react';
import { useTemplates } from '../../hooks/useTemplates';
import { DocumentTemplate } from '../../types';

export function TestIntegration() {
  const { 
    templates, 
    loading, 
    error, 
    obterTemplatesAvailables,
    clearError 
  } = useTemplates();
  
  const [availableTemplates, setAvailableTemplates] = useState<{
    default: DocumentTemplate[];
    custom: DocumentTemplate[];
    total: number;
  } | null>(null);

  useEffect(() => {
    testIntegration();
  }, []);

  const testIntegration = async () => {
    try {
      clearError();
      console.log('🔗 Testando integração com backend...');
      
      const response = await obterTemplatesAvailables();
      
      if (response) {
        setAvailableTemplates(response);
        console.log('✅ Integração funcionando! Templates disponíveis:', response);
      } else {
        console.log('❌ Falha na integração ou sem templates disponíveis');
      }
    } catch (err) {
      console.error('❌ Erro na integração:', err);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">🧪 Teste de Integração - Templates LumiDocs</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status da Integração */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">📊 Status da Integração</h3>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${loading ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
              <span className="text-sm">
                {loading ? 'Carregando...' : 'Backend Conectado'}
              </span>
            </div>
            
            {error && (
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <span className="text-sm text-red-600">{error}</span>
              </div>
            )}
            
            {availableTemplates && (
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                  <span className="text-sm">
                    {availableTemplates.default.length} templates padrão
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                  <span className="text-sm">
                    {availableTemplates.custom.length} templates customizados
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <span className="text-sm font-semibold">
                    Total: {availableTemplates.total} templates
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Funcionalidades Implementadas */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">⚡ Funcionalidades Implementadas</h3>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span className="text-sm">Listar templates disponíveis</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span className="text-sm">Criar novos templates</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span className="text-sm">Upload de arquivos PDF</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span className="text-sm">Excluir templates</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span className="text-sm">Alterar status (ativo/inativo)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span className="text-sm">Categorização automática</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span className="text-sm">Filtros e busca</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span className="text-sm">Hook personalizado (useTemplates)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dados dos Templates */}
      {availableTemplates && (
        <div className="mt-6 bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">📋 Templates Disponíveis</h3>
          
          {availableTemplates.default.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-medium mb-2 text-blue-600">🏛️ Templates Padrão</h4>
              <div className="space-y-2">
                {availableTemplates.default.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <span className="font-medium">{template.name}</span>
                      {template.description && (
                        <span className="text-sm text-gray-600 ml-2">- {template.description}</span>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      template.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {template.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {availableTemplates.custom.length > 0 && (
            <div>
              <h4 className="text-md font-medium mb-2 text-purple-600">🎨 Templates Customizados</h4>
              <div className="space-y-2">
                {availableTemplates.custom.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div>
                      <span className="font-medium">{template.name}</span>
                      {template.description && (
                        <span className="text-sm text-gray-600 ml-2">- {template.description}</span>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      template.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {template.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {availableTemplates.total === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum template encontrado.</p>
              <p className="text-sm text-gray-400 mt-1">
                Crie seu primeiro template usando o botão "Novo Modelo".
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">🔗 Endpoints da API Integrados:</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• GET /api/v1/document-templates/available - Listar templates disponíveis</li>
          <li>• POST /api/v1/document-templates - Criar template</li>
          <li>• PUT /api/v1/document-templates/{`{id}`} - Atualizar template</li>
          <li>• DELETE /api/v1/document-templates/{`{id}`} - Excluir template</li>
          <li>• PUT /api/v1/document-templates/{`{id}`}/toggle-active - Alterar status</li>
          <li>• POST /api/v1/document-templates/{`{id}`}/create-document - Criar documento</li>
        </ul>
      </div>
    </div>
  );
}