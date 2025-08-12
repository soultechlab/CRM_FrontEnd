import React, { useState } from 'react';
import { X, Download, Upload, AlertCircle } from 'lucide-react';
import { Cliente } from '../../../types';

interface ImportarClientesModalProps {
  onClose: () => void;
  onImport: (clientes: Cliente[]) => void;
}

export default function ImportarClientesModal({ onClose, onImport }: ImportarClientesModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownloadModelo = () => {
    const headers = [
      'Nome',
      'Email',
      'Telefone',
      'Instagram',
      'Facebook',
      'Profissão',
      'Data de Nascimento (DD/MM/AAAA)',
      'Origem',
      'Observações'
    ];

    const csv = [headers.join(',')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'modelo_importacao_clientes.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verificar extensão
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx'].includes(extension || '')) {
      setError('Formato de arquivo inválido. Use CSV ou XLSX.');
      return;
    }

    setFile(file);
    setError(null);
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      // Aqui você implementaria a lógica de parsing do arquivo
      // e conversão para o formato de Cliente[]
      
      // Exemplo básico:
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const text = e.target?.result as string;
          const rows = text.split('\n').slice(1); // Pula o cabeçalho
          
          const clientes: Cliente[] = rows.map((row) => {
            const [nome, email, telefone, instagram, facebook, profissao, dataNascimento, origem, observacoes] = row.split(',');
            
            if (nome) {
              return {
                id: Date.now().toString(),
                nome: nome.trim(),
                email: email.trim(),
                telefone: telefone.trim(),
                instagram: instagram.trim(),
                facebook: facebook.trim(),
                profissao: profissao.trim(),
                dataNascimento: dataNascimento.trim(),
                origem: [origem.trim().toLowerCase()],
                observacoes: observacoes?.trim(),
                dataCadastro: new Date().toISOString(),
                status: 'prospecto'
              };
            }
          });

          onImport(clientes);
        } catch (error) {
          setError('Erro ao processar o arquivo. Verifique o formato .');
        }
      };

      reader.readAsText(file);
    } catch (error) {
      setError('Erro ao importar clientes. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Importar Clientes em Massa</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Download do Modelo */}
          <div>
            <button
              onClick={handleDownloadModelo}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <Download className="h-5 w-5" />
              Baixar modelo CSV
            </button>
            <p className="mt-2 text-sm text-gray-500">
              Use este modelo para formatar corretamente seus dados antes da importação.
            </p>
          </div>

          {/* Upload de Arquivo */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-4">
                Envie seu arquivo CSV ou XLSX aqui!
              </p>
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
              >
                Selecionar Arquivo
              </label>
            </div>
          </div>

          {/* Nome do arquivo selecionado */}
          {file && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <p>Arquivo selecionado: {file.name}</p>
            </div>
          )}

          {/* Mensagem de erro */}
          {error && (
            <div className="flex items-start gap-2 text-red-600 bg-red-50 p-4 rounded-lg">
              <AlertCircle className="h-5 w-5 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleImport}
              disabled={!file || loading}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Importando...' : 'Importar Clientes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
