import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { storage, Documento, Cliente } from '../utils/localStorage';

interface DocumentoUploadProps {
  onSuccess: () => void;
}

export function DocumentoUpload({ onSuccess }: DocumentoUploadProps) {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [nome, setNome] = useState('');
  const [clientesSelecionados, setClientesSelecionados] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const clientes = storage.getClientes();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!arquivo) return;

    // Converter o arquivo para Data URL
    const reader = new FileReader();
    reader.onloadend = () => {
      const arquivo_url = reader.result as string;
      
      const novoDocumento: Documento = {
        id: crypto.randomUUID(),
        nome,
        arquivo_url,
        status: 'aguardando_envio',
        created_at: new Date().toISOString(),
        assinantes: clientes.filter(c => clientesSelecionados.includes(c.id))
      };

      const documentos = storage.getDocumentos();
      storage.setDocumentos([...documentos, novoDocumento]);

      setArquivo(null);
      setNome('');
      setClientesSelecionados([]);
      onSuccess();
    };

    reader.readAsDataURL(arquivo);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('O arquivo deve ter no máximo 5MB');
        e.target.value = '';
        return;
      }
      if (file.type !== 'application/pdf') {
        setError('Apenas arquivos PDF são permitidos');
        e.target.value = '';
        return;
      }
      setArquivo(file);
      setError(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700">Nome do Documento</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Arquivo (PDF até 5MB)</label>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="mt-1 block w-full"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Selecione os Assinantes</label>
        <div className="max-h-40 overflow-y-auto border rounded-md p-2">
          {clientes.map((cliente) => (
            <label key={cliente.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50">
              <input
                type="checkbox"
                checked={clientesSelecionados.includes(cliente.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setClientesSelecionados([...clientesSelecionados, cliente.id]);
                  } else {
                    setClientesSelecionados(clientesSelecionados.filter(id => id !== cliente.id));
                  }
                }}
                className="rounded text-blue-600"
              />
              <span>{cliente.nome} ({cliente.email})</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Enviar Documento
      </button>
    </form>
  );
}