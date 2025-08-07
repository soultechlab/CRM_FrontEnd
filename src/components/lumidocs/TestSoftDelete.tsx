import React, { useState } from 'react';
import { useTemplates } from '../../hooks/useTemplates';
import { Bug, Play, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

export function TestSoftDelete() {
  const { debug, excluir, obterTemplates, obterLixeira, restaurar, loading } = useTemplates();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [testTemplateId, setTestTemplateId] = useState<number>(1);

  const addTestResult = (step: string, result: any, status: 'success' | 'error' | 'info') => {
    setTestResults(prev => [...prev, {
      step,
      result,
      status,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runSoftDeleteTest = async () => {
    setTestResults([]);
    
    try {
      // Step 1: Debug inicial
      addTestResult('1. Debug inicial', 'Verificando status antes do delete...', 'info');
      const debugBefore = await debug(testTemplateId);
      addTestResult('1. Debug inicial - Resultado', debugBefore, debugBefore ? 'success' : 'error');

      // Step 2: Deletar template
      addTestResult('2. Deletar template', `Deletando template ID ${testTemplateId}...`, 'info');
      const deleteResult = await excluir(testTemplateId);
      addTestResult('2. Deletar template - Resultado', { success: deleteResult }, deleteResult ? 'success' : 'error');

      // Step 3: Debug após delete
      addTestResult('3. Debug após delete', 'Verificando se foi marcado como deletado...', 'info');
      const debugAfter = await debug(testTemplateId);
      addTestResult('3. Debug após delete - Resultado', debugAfter, debugAfter ? 'success' : 'error');

      // Step 4: Verificar se sumiu da listagem
      addTestResult('4. Listagem principal', 'Verificando se sumiu da listagem principal...', 'info');
      const mainList = await obterTemplates();
      addTestResult('4. Listagem principal - Resultado', { message: 'Verificar se template não aparece na lista' }, 'info');

      // Step 5: Verificar se aparece na lixeira
      addTestResult('5. Listagem lixeira', 'Verificando se aparece na lixeira...', 'info');
      const trashList = await obterLixeira();
      addTestResult('5. Listagem lixeira - Resultado', { count: trashList.length, templates: trashList }, trashList.length > 0 ? 'success' : 'info');

      // Step 6: Restaurar (opcional)
      if (window.confirm('Deseja restaurar o template para teste completo?')) {
        addTestResult('6. Restaurar template', 'Restaurando template...', 'info');
        const restoreResult = await restaurar(testTemplateId);
        addTestResult('6. Restaurar template - Resultado', { success: restoreResult }, restoreResult ? 'success' : 'error');

        // Step 7: Debug após restore
        addTestResult('7. Debug após restore', 'Verificando se foi restaurado...', 'info');
        const debugRestore = await debug(testTemplateId);
        addTestResult('7. Debug após restore - Resultado', debugRestore, debugRestore ? 'success' : 'error');
      }

    } catch (error: any) {
      addTestResult('❌ Erro no teste', error.message, 'error');
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-3">
            <Bug className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Teste de Soft Delete</h2>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Este componente testa o funcionamento do soft delete seguindo o diagnóstico fornecido.
          </p>
        </div>

        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div>
              <label htmlFor="templateId" className="block text-sm font-medium text-gray-700 mb-2">
                ID do Template para Teste:
              </label>
              <input
                id="templateId"
                type="number"
                value={testTemplateId}
                onChange={(e) => setTestTemplateId(Number(e.target.value))}
                className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
              />
            </div>
            <div className="flex items-end space-x-2">
              <button
                onClick={runSoftDeleteTest}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Executar Teste
              </button>
              <button
                onClick={clearResults}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Limpar
              </button>
            </div>
          </div>

          {testResults.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Resultados do Teste</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-md border ${
                      result.status === 'success'
                        ? 'bg-green-50 border-green-200'
                        : result.status === 'error'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {result.status === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {result.status === 'error' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                        {result.status === 'info' && <RefreshCw className="h-4 w-4 text-blue-600" />}
                        <span className="font-medium text-gray-900">{result.step}</span>
                      </div>
                      <span className="text-xs text-gray-500">{result.timestamp}</span>
                    </div>
                    <div className="mt-2">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-white p-2 rounded border overflow-x-auto">
                        {typeof result.result === 'object' 
                          ? JSON.stringify(result.result, null, 2)
                          : result.result
                        }
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">📋 O que verificar:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• <strong>Debug inicial:</strong> deleted_at deve ser null, is_soft_deleted: false</li>
              <li>• <strong>Após delete:</strong> deleted_at deve ter data/hora, is_soft_deleted: true</li>
              <li>• <strong>Listagem principal:</strong> Template não deve aparecer</li>
              <li>• <strong>Lixeira:</strong> Template deve aparecer aqui</li>
              <li>• <strong>Após restore:</strong> deleted_at deve ser null novamente</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}