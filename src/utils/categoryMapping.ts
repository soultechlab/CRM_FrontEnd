// Mapeamento de categorias do frontend para API
export const categoryToApiCategory = {
  'contratos': 'Contratos',
  'permuta': 'Permuta',
  'eventos': 'Eventos',
  'ensaios': 'Ensaios',
  'outros': 'Outros'
} as const;

// Mapeamento de categorias da API para frontend
export const apiCategoryToCategory = {
  'Contratos': 'contratos',
  'Permuta': 'permuta',
  'Eventos': 'eventos',
  'Ensaios': 'ensaios',
  'Outros': 'outros'
} as const;

export type ModelCategory = 'contratos' | 'permuta' | 'eventos' | 'ensaios' | 'outros';
export type ApiCategory = 'Contratos' | 'Permuta' | 'Eventos' | 'Ensaios' | 'Outros';

// Função para mapear categoria do frontend para API
export function mapCategoryToApi(category: ModelCategory): ApiCategory {
  return categoryToApiCategory[category];
}

// Função para mapear categoria da API para frontend
export function mapApiToCategory(apiCategory: string): ModelCategory {
  const normalized = apiCategory as keyof typeof apiCategoryToCategory;
  return apiCategoryToCategory[normalized] || 'outros';
}

// Função para detectar categoria baseada no nome/conteúdo
export function detectCategoryFromText(text: string): ModelCategory {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('contrato')) return 'contratos';
  if (lowerText.includes('permuta') || lowerText.includes('troca')) return 'permuta';
  if (lowerText.includes('evento') || lowerText.includes('casamento') || lowerText.includes('festa')) return 'eventos';
  if (lowerText.includes('ensaio') || lowerText.includes('book') || lowerText.includes('sessão')) return 'ensaios';
  
  return 'outros';
}