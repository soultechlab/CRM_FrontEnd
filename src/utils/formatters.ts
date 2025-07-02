export const formatarMoeda = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

export const formatarData = (data: string): string => {
  return new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR');
};

export const formatarTelefone = (telefone: string): string => {
  if (!telefone) return '';
  const numero = telefone.replace(/\D/g, '');
  if (numero.length === 11) {
    return numero.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  return numero.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
};

export const formatarCPF = (cpf: string): string => {
  if (!cpf) return '';
  const numero = cpf.replace(/\D/g, '');
  return numero.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatarCNPJ = (cnpj: string): string => {
  if (!cnpj) return '';
  const numero = cnpj.replace(/\D/g, '');
  return numero.replace(/(\d{2})(\d{4})(\d{4})(\d{2})(\d{1})/, '$1.$2.$3/$4-$5');
};