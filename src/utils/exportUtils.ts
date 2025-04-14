import { Cliente } from '../types';
import { formatarMoeda } from './formatters';

export const exportarClientesCSV = (clientes: Cliente[]) => {
  // Define as colunas do CSV
  const colunas = [
    'Nome',
    'Email',
    'Telefone',
    'Instagram',
    'Status',
    'Tipo de Serviço',
    'Data de Cadastro',
    'Valor Total Gasto',
    'Última Sessão',
    'Origem'
  ];

  // Formata os dados dos clientes
  const linhas = clientes.map(cliente => [
    cliente.nome,
    cliente.email || '',
    cliente.telefone || '',
    cliente.instagram || '',
    cliente.status,
    cliente.tiposServico?.join(', ') || '',
    new Date(cliente.dataCadastro).toLocaleDateString('pt-BR'),
    formatarMoeda(cliente.historico?.valorTotalGasto || 0),
    cliente.historico?.ultimaSessao ? new Date(cliente.historico.ultimaSessao).toLocaleDateString('pt-BR') : '',
    cliente.origem.map(o => o.charAt(0).toUpperCase() + o.slice(1)).join(', ')
  ]);

  // Cria o conteúdo do CSV
  const csvContent = [
    colunas.join(','),
    ...linhas.map(linha => linha.map(valor => `"${valor}"`).join(','))
  ].join('\n');

  // Cria o blob e faz o download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `clientes_fotocrm_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};