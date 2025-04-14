import React, { useState, useEffect } from 'react';
import { Search, X, FileText } from 'lucide-react';
import { Cliente, Documento, SignatureField, Modelo } from '../types';
import { storage } from '../utils/localStorage';
import { PdfViewer } from './PdfViewer';

interface DocumentoFormProps {
  initialData?: Documento;
  onSubmit: (documento: Documento) => void;
}

export function DocumentoForm({ initialData, onSubmit }: DocumentoFormProps) {
  const [nome, setNome] = useState(initialData?.nome || '');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientes, setSelectedClientes] = useState<Array<{
    cliente: Cliente;
    fields: SignatureField[];
  }>>(
    initialData?.assinantes.map(a => ({
      cliente: a,
      fields: initialData.signatureFields?.[a.id] || []
    })) || []
  );
  const [previewUrl, setPreviewUrl] = useState<string>(initialData?.arquivo_url || '');
  const [currentClienteIndex, setCurrentClienteIndex] = useState<number | null>(null);
  const [fieldType, setFieldType] = useState<'assinatura' | 'nome' | 'email' | 'cpf'>('assinatura');
  const [selectedModelo, setSelectedModelo] = useState<Modelo | null>(null);
  const [useModelo, setUseModelo] = useState(false);
  
  const clientes = storage.getClientes();
  const modelos = storage.getModelos();
  const filteredClientes = clientes.filter(cliente => 
    !selectedClientes.find(sc => sc.cliente.id === cliente.id) &&
    (cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
     cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
     cliente.cpf.includes(searchTerm))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedClientes.some(sc => sc.fields.length === 0)) {
      alert('Todos os assinantes precisam ter pelo menos um campo de assinatura definido');
      return;
    }
    
    let arquivo_url = initialData?.arquivo_url || '';
    
    if (arquivo) {
      const reader = new FileReader();
      reader.onloadend = () => {
        arquivo_url = reader.result as string;
        
        const documento: Documento = {
          id: initialData?.id || crypto.randomUUID(),
          nome,
          arquivo_url,
          status: 'aguardando_envio',
          created_at: initialData?.created_at || new Date().toISOString(),
          assinantes: selectedClientes.map(sc => sc.cliente),
          signatureFields: selectedClientes.reduce((acc, sc) => ({
            ...acc,
            [sc.cliente.id]: sc.fields
          }), {})
        };

        onSubmit(documento);
      };
      reader.readAsDataURL(arquivo);
    } else if (selectedModelo) {
      const documento: Documento = {
        id: initialData?.id || crypto.randomUUID(),
        nome,
        arquivo_url: selectedModelo.arquivo_url,
        status: 'aguardando_envio',
        created_at: initialData?.created_at || new Date().toISOString(),
        assinantes: selectedClientes.map(sc => sc.cliente),
        signatureFields: selectedClientes.reduce((acc, sc) => ({
          ...acc,
          [sc.cliente.id]: sc.fields
        }), {})
      };

      onSubmit(documento);
    } else {
      const documento: Documento = {
        id: initialData?.id || crypto.randomUUID(),
        nome,
        arquivo_url,
        status: 'aguardando_envio',
        created_at: initialData?.created_at || new Date().toISOString(),
        assinantes: selectedClientes.map(sc => sc.cliente),
        signatureFields: selectedClientes.reduce((acc, sc) => ({
          ...acc,
          [sc.cliente.id]: sc.fields
        }), {})
      };

      onSubmit(documento);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('O arquivo deve ter no máximo 5MB');
        return;
      }
      if (file.type !== 'application/pdf') {
        alert('Apenas arquivos PDF são permitidos');
        return;
      }
      setArquivo(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setSelectedModelo(null);
      setUseModelo(false);
    }
  };

  const handleModeloSelect = (modelo: Modelo) => {
    setSelectedModelo(modelo);
    setPreviewUrl(modelo.arquivo_url);
    setArquivo(null);
    setUseModelo(true);
  };

  const handleAddCliente = (cliente: Cliente) => {
    setSelectedClientes([...selectedClientes, { cliente, fields: [] }]);
    setSearchTerm('');
  };

  const handleRemoveCliente = (clienteId: string) => {
    setSelectedClientes(selectedClientes.filter(sc => sc.cliente.id !== clienteId));
    if (currentClienteIndex !== null) {
      setCurrentClienteIndex(null);
    }
  };

  const handleAddField = (position: { x: number; y: number; page: number }) => {
    if (currentClienteIndex === null) return;
    
    const newSelectedClientes = [...selectedClientes];
    const fieldWidth = fieldType === 'assinatura' ? 30 : 20;
    const fieldHeight = fieldType === 'assinatura' ? 10 : 5;
    
    // Check for overlapping fields with a margin
    const margin = 2; // 2% margin around fields
    const existingFields = newSelectedClientes[currentClienteIndex].fields;
    const isOverlapping = existingFields.some(field => {
      const fieldRight = field.position.x + field.width + margin;
      const fieldBottom = field.position.y + field.height + margin;
      const newFieldRight = position.x + fieldWidth + margin;
      const newFieldBottom = position.y + fieldHeight + margin;
      const fieldLeft = field.position.x - margin;
      const fieldTop = field.position.y - margin;
      const newFieldLeft = position.x - margin;
      const newFieldTop = position.y - margin;

      return field.position.page === position.page &&
        !(newFieldLeft > fieldRight ||
          newFieldRight < fieldLeft ||
          newFieldTop > fieldBottom ||
          newFieldBottom < fieldTop);
    });

    if (isOverlapping) {
      alert('Os campos precisam ter um espaçamento mínimo entre si. Por favor, escolha outra posição.');
      return;
    }

    // Check for overlapping with other signers' fields
    const otherSignersFields = selectedClientes.flatMap((sc, index) => 
      index !== currentClienteIndex ? sc.fields : []
    );
    
    const isOverlappingOtherSigners = otherSignersFields.some(field => {
      const fieldRight = field.position.x + field.width + margin;
      const fieldBottom = field.position.y + field.height + margin;
      const newFieldRight = position.x + fieldWidth + margin;
      const newFieldBottom = position.y + fieldHeight + margin;
      const fieldLeft = field.position.x - margin;
      const fieldTop = field.position.y - margin;
      const newFieldLeft = position.x - margin;
      const newFieldTop = position.y - margin;

      return field.position.page === position.page &&
        !(newFieldLeft > fieldRight ||
          newFieldRight < fieldLeft ||
          newFieldTop > fieldBottom ||
          newFieldBottom < fieldTop);
    });

    if (isOverlappingOtherSigners) {
      alert('O campo está muito próximo dos campos de outro assinante. Por favor, escolha outra posição.');
      return;
    }

    // Add field with adjusted position if needed
    let adjustedPosition = { ...position };
    if (position.x + fieldWidth > 100) {
      adjustedPosition.x = 100 - fieldWidth;
    }
    if (position.y + fieldHeight > 100) {
      adjustedPosition.y = 100 - fieldHeight;
    }

    // Suggest nearby positions for related fields
    const suggestNearbyPosition = (basePosition: { x: number; y: number }, index: number) => {
      const positions = [
        { x: basePosition.x + fieldWidth + margin, y: basePosition.y }, // right
        { x: basePosition.x, y: basePosition.y + fieldHeight + margin }, // below
        { x: basePosition.x - fieldWidth - margin, y: basePosition.y }, // left
        { x: basePosition.x, y: basePosition.y - fieldHeight - margin }, // above
      ];

      return positions[index % positions.length];
    };

    // If this is a signature field, suggest positions for auto-filled fields
    if (fieldType === 'assinatura') {
      const autoFields = ['nome', 'email', 'cpf'] as const;
      autoFields.forEach((type, index) => {
        const suggestedPosition = suggestNearbyPosition(adjustedPosition, index);
        if (
          suggestedPosition.x >= 0 && 
          suggestedPosition.x + fieldWidth <= 100 &&
          suggestedPosition.y >= 0 && 
          suggestedPosition.y + fieldHeight <= 100
        ) {
          newSelectedClientes[currentClienteIndex].fields.push({
            type,
            position: { ...suggestedPosition, page: position.page },
            width: 20,
            height: 5
          });
        }
      });
    }

    newSelectedClientes[currentClienteIndex].fields.push({
      type: fieldType,
      position: adjustedPosition,
      width: fieldWidth,
      height: fieldHeight
    });
    
    setSelectedClientes(newSelectedClientes);
  };

  const handleDeleteField = (fieldIndex: number) => {
    if (currentClienteIndex === null) return;
    
    const newSelectedClientes = [...selectedClientes];
    newSelectedClientes[currentClienteIndex].fields.splice(fieldIndex, 1);
    setSelectedClientes(newSelectedClientes);
  };

  const handleMoveField = (fieldIndex: number, newPosition: { x: number; y: number }) => {
    if (currentClienteIndex === null) return;
    
    const newSelectedClientes = [...selectedClientes];
    const field = newSelectedClientes[currentClienteIndex].fields[fieldIndex];
    field.position = { ...field.position, x: newPosition.x, y: newPosition.y };
    setSelectedClientes(newSelectedClientes);
  };

  const getFieldColor = (clienteIndex: number) => {
    const colors = [
      'rgb(239 68 68)', // red
      'rgb(34 197 94)', // green
      'rgb(59 130 246)', // blue
      'rgb(168 85 247)', // purple
      'rgb(234 179 8)', // yellow
    ];
    return colors[clienteIndex % colors.length];
  };

  const getAllSignerFields = () => {
    return selectedClientes.map((sc, index) => ({
      fields: sc.fields,
      color: getFieldColor(index),
      assinanteIndex: index
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      {!initialData && (
        <div className="space-y-4">
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setUseModelo(false)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium ${
                !useModelo
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Novo Arquivo
            </button>
            <button
              type="button"
              onClick={() => setUseModelo(true)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium ${
                useModelo
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Usar Modelo
            </button>
          </div>

          {useModelo ? (
            <div className="grid grid-cols-2 gap-4">
              {modelos.map((modelo) => (
                <button
                  key={modelo.id}
                  type="button"
                  onClick={() => handleModeloSelect(modelo)}
                  className={`p-4 rounded-lg border text-left hover:bg-gray-50 ${
                    selectedModelo?.id === modelo.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-blue-500" />
                    <div>
                      <h3 className="font-medium">{modelo.nome}</h3>
                      <p className="text-sm text-gray-500">{modelo.categoria}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700">Arquivo (PDF até 5MB)</label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="mt-1 block w-full"
                required={!initialData && !selectedModelo}
              />
            </div>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Adicionar Assinantes</label>
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, email ou CPF..."
            className="w-full px-4 py-2 border rounded-md"
          />
          <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
        </div>
        
        {searchTerm && (
          <div className="mt-2 max-h-40 overflow-y-auto border rounded-md">
            {filteredClientes.map((cliente) => (
              <button
                key={cliente.id}
                type="button"
                onClick={() => handleAddCliente(cliente)}
                className="w-full text-left px-4 py-2 hover:bg-gray-50"
              >
                <div className="font-medium">{cliente.nome}</div>
                <div className="text-sm text-gray-500">{cliente.email}</div>
              </button>
            ))}
            {filteredClientes.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                Nenhum cliente encontrado
              </div>
            )}
          </div>
        )}
      </div>

      {selectedClientes.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Assinantes Selecionados</h3>
          {selectedClientes.map((sc, index) => (
            <div
              key={sc.cliente.id}
              className={`p-3 rounded-lg border-2 ${
                currentClienteIndex === index
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{sc.cliente.nome}</div>
                  <div className="text-sm text-gray-500">{sc.cliente.email}</div>
                  <div className="text-sm text-gray-500">
                    Campos definidos: {sc.fields.length}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setCurrentClienteIndex(
                      currentClienteIndex === index ? null : index
                    )}
                    className={`px-3 py-1 rounded text-sm ${
                      currentClienteIndex === index
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {currentClienteIndex === index ? 'Concluir' : 'Definir Campos'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveCliente(sc.cliente.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {previewUrl && currentClienteIndex !== null && (
        <div className="border-t pt-4">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Definir campos para {selectedClientes[currentClienteIndex].cliente.nome}
            </h3>
            <div className="mt-2 flex space-x-2">
              <button
                type="button"
                onClick={() => setFieldType('assinatura')}
                className={`px-3 py-1 rounded text-sm ${
                  fieldType === 'assinatura'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Assinatura Digital
              </button>
              <button
                type="button"
                onClick={() => setFieldType('nome')}
                className={`px-3 py-1 rounded text-sm ${
                  fieldType === 'nome'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Nome (Auto-preenchido)
              </button>
              <button
                type="button"
                onClick={() => setFieldType('email')}
                className={`px-3 py-1 rounded text-sm ${
                  fieldType === 'email'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Email (Auto-preenchido)
              </button>
              <button
                type="button"
                onClick={() => setFieldType('cpf')}
                className={`px-3 py-1 rounded text-sm ${
                  fieldType === 'cpf'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                CPF (Auto-preenchido)
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Clique no documento para adicionar campos. Os campos de nome, email e CPF serão preenchidos automaticamente.
              Apenas a assinatura digital precisará ser feita pelo assinante.
            </p>
          </div>

          <div className="relative">
            <PdfViewer
              pdfUrl={previewUrl}
              onPositionSelect={handleAddField}
              onDeleteField={handleDeleteField}
              onMoveField={handleMoveField}
              fields={selectedClientes[currentClienteIndex].fields.map(field => ({
                ...field,
                color: getFieldColor(currentClienteIndex)
              }))}
              allSignerFields={getAllSignerFields()}
              previewData={{
                nome: selectedClientes[currentClienteIndex].cliente.nome,
                email: selectedClientes[currentClienteIndex].cliente.email,
                cpf: selectedClientes[currentClienteIndex].cliente.cpf,
                assinatura: '',
                assinanteIndex: currentClienteIndex
              }}
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {initialData ? 'Salvar Alterações' : 'Cadastrar Documento'}
      </button>
    </form>
  );
}