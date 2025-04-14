import { Cliente, Documento } from '../types';
import { storage } from './localStorage';

// Sample PDF data URL (a minimal valid PDF)
const samplePdfDataUrl = 'data:application/pdf;base64,JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXMKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAgL1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSIAogICAgPj4KICA+PgogIC9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBvYmoKPDwKICAvVHlwZSAvRm9udAogIC9TdWJ0eXBlIC9UeXBlMQogIC9CYXNlRm9udCAvVGltZXMtUm9tYW4KPj4KZW5kb2JqCgo1IDAgb2JqICAlIHBhZ2UgY29udGVudAo8PAogIC9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCjcwIDUwIFRECi9GMSAxMiBUZgooSGVsbG8sIHdvcmxkISkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4gCjAwMDAwMDAwNzkgMDAwMDAgbiAKMDAwMDAwMDE3MyAwMDAwMCBuIAowMDAwMDAwMzAxIDAwMDAwIG4gCjAwMDAwMDAzODAgMDAwMDAgbiAKdHJhaWxlcgo8PAogIC9TaXplIDYKICAvUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDkyCiUlRU9G';

export function createTestData() {
  // Create test clients
  const clientes: Cliente[] = [
    {
      id: '1',
      nome: 'João Silva',
      email: 'joao.silva@email.com',
      cpf: '123.456.789-00',
      created_at: new Date('2024-01-01').toISOString()
    },
    {
      id: '2',
      nome: 'Maria Santos',
      email: 'maria.santos@email.com',
      cpf: '987.654.321-00',
      created_at: new Date('2024-01-02').toISOString()
    },
    {
      id: '3',
      nome: 'Pedro Oliveira',
      email: 'pedro.oliveira@email.com',
      cpf: '456.789.123-00',
      created_at: new Date('2024-01-03').toISOString()
    }
  ];

  // Create test documents
  const documentos: Documento[] = [
    {
      id: '1',
      nome: 'Contrato de Teste - Rascunho',
      arquivo_url: samplePdfDataUrl,
      status: 'aguardando_envio',
      created_at: new Date('2024-01-04').toISOString(),
      assinantes: [clientes[0], clientes[1]],
      signatureFields: {
        '1': [
          {
            type: 'assinatura',
            position: { x: 20, y: 30, page: 1 },
            width: 30,
            height: 10
          }
        ],
        '2': [
          {
            type: 'assinatura',
            position: { x: 20, y: 50, page: 1 },
            width: 30,
            height: 10
          }
        ]
      }
    },
    {
      id: '2',
      nome: 'Contrato de Teste - Enviado',
      arquivo_url: samplePdfDataUrl,
      status: 'aguardando_assinatura',
      created_at: new Date('2024-01-05').toISOString(),
      assinantes: [clientes[1], clientes[2]],
      signatureFields: {
        '2': [
          {
            type: 'assinatura',
            position: { x: 20, y: 30, page: 1 },
            width: 30,
            height: 10
          }
        ],
        '3': [
          {
            type: 'assinatura',
            position: { x: 20, y: 50, page: 1 },
            width: 30,
            height: 10
          }
        ]
      }
    },
    {
      id: '3',
      nome: 'Contrato de Teste - Assinado',
      arquivo_url: samplePdfDataUrl,
      status: 'assinado',
      created_at: new Date('2024-01-06').toISOString(),
      assinantes: [clientes[0], clientes[2]],
      signatureFields: {
        '1': [
          {
            type: 'assinatura',
            position: { x: 20, y: 30, page: 1 },
            width: 30,
            height: 10
          }
        ],
        '3': [
          {
            type: 'assinatura',
            position: { x: 20, y: 50, page: 1 },
            width: 30,
            height: 10
          }
        ]
      }
    }
  ];

  // Save test data to localStorage
  storage.setClientes(clientes);
  storage.setDocumentos(documentos);

  return { clientes, documentos };
}