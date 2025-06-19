import { Cliente, Documento, syncStorage as storage } from './localStorage';

// PDF base64 simples e funcional
const samplePdfDataUrl = 'data:application/pdf;base64,JVBERi0xLjQKJcfsj6IKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKL01lZGlhQm94IFswIDAgNTk1IDg0Ml0KPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+Pgo+PgovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggMTMwCj4+CnN0cmVhbQpCVAovRjEgMjQgVGYKNzIgNzIwIFRkCihDb250cmF0byBkZSBTZXJ2acOnb3MpIFRqCkVUCkJUCi9GMSA0OCBUZKJO3W5zb3NCTAovRjEgMTIgVGYKNzIgNjAwIFRkCihOb21lOiBfX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fKSBUagpFVApCVAovRjEgMTIgVGYKNzIgNTYwIFRkCihBc3NpbmF0dXJhOiBfX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fKSBUagpFVApCVAovRjEgMTIgVGYKNzIgNTIwIFRkCihEYXRhOiBfX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMTUgMDAwMDAgbiAKMDAwMDAwMDIyMCAwMDAwMCBuIAowMDAwMDAwMjg5IDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNgovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDY3CiUlRU9GCg==';

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

  // Save test data to localStorage (usando as novas chaves)
  localStorage.setItem('lumidocs_clientes', JSON.stringify(clientes));
  localStorage.setItem('lumidocs_documentos', JSON.stringify(documentos));

  return { clientes, documentos };
}