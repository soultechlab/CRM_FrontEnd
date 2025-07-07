import React from 'react';
import { MessageCircle, Mail, Instagram, MapPin } from 'lucide-react';
import { Cliente } from '../../../types';

interface InfoBasicaProps {
  cliente: Cliente;
}

export default function InfoBasica({ cliente }: InfoBasicaProps) {
  const criarLinkWhatsApp = (telefone: string) => {
    if (!telefone) return null;
    const numeroLimpo = telefone.replace(/\D/g, '');
    return `https://wa.me/55${numeroLimpo}`;
  };

  const criarLinkInstagram = (instagram: string) => {
    if (!instagram) return null;
    const usuario = instagram.replace('@', '');
    return `https://instagram.com/${usuario}`;
  };

  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="text-lg font-semibold mb-4">Informações Básicas</h3>
      
      <div className="space-y-3">
        {cliente.telefone && (
          <a
            href={criarLinkWhatsApp(cliente.telefone)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
            <span>{cliente.telefone}</span>
          </a>
        )}
        
        {cliente.email && (
          <a
            href={`mailto:${cliente.email}`}
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
          >
            <Mail className="h-5 w-5" />
            <span>{cliente.email}</span>
          </a>
        )}
        
        {cliente.instagram && (
          <a
            href={criarLinkInstagram(cliente.instagram)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-700 hover:text-pink-600 transition-colors"
          >
            <Instagram className="h-5 w-5" />
            <span>{cliente.instagram}</span>
          </a>
        )}
        
        {cliente.endereco && (
          <div className="flex items-center gap-2 text-gray-700">
            <MapPin className="h-5 w-5" />
            <span>
              {`${cliente.endereco.rua}, ${cliente.endereco.numero}${
                cliente.endereco.complemento ? ` - ${cliente.endereco.complemento}` : ''
              }`}
              <br />
              {`${cliente.endereco.bairro} - ${cliente.endereco.cidade}/${cliente.endereco.estado}`}
            </span>
          </div>
        )}
      </div>

      {cliente.observacoes && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Observações</h4>
          <p className="text-sm text-gray-600">{cliente.observacoes}</p>
        </div>
      )}

      {cliente.origem?.filter(origem => origem !== null).length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Origem</h4>
          <div className="flex flex-wrap gap-2">
            {cliente.origem.map((origem) => (
              <span
                key={origem}
                className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800"
              >
                {origem}
              </span>
            ))}
          </div>
        </div>
      )}

      {cliente.tiposServico && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Tipo do Serviço</h4>
          <div className="flex flex-wrap gap-2">
              <span
                className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800"
              >
                {cliente.tiposServico}
              </span>
          </div>
        </div>
      )}
    </div>
  );
}