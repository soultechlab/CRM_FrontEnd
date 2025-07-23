export const categoryToApiCategory = {
  'contratos': 'contratos',
  'permuta': 'permuta',
  'eventos': 'eventos',
  'ensaios': 'ensaios',
  'outros': 'outros'
} as const;

export const apiCategoryToCategory = {
  'contratos': 'contratos',
  'permuta': 'permuta',
  'eventos': 'eventos',
  'ensaios': 'ensaios',
  'outros': 'outros'
} as const;

export type ModelCategory = 'contratos' | 'permuta' | 'eventos' | 'ensaios' | 'outros';
export type ApiCategory = 'contratos' | 'permuta' | 'eventos' | 'ensaios' | 'outros';

export function mapCategoryToApi(category: ModelCategory): ApiCategory {
  return categoryToApiCategory[category];
}

export function mapApiToCategory(apiCategory: string): ModelCategory {
  if (!apiCategory) return 'outros';
  
  const trimmed = apiCategory.trim().toLowerCase();
  const normalized = trimmed as keyof typeof apiCategoryToCategory;
  return apiCategoryToCategory[normalized] || 'outros';
}

export function detectCategoryFromText(text: string): ModelCategory {
  if (!text) return 'outros';
  
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('contrato') || lowerText.includes('acordo') || lowerText.includes('termo')) return 'contratos';
  if (lowerText.includes('permuta') || lowerText.includes('troca') || lowerText.includes('intercâmbio')) return 'permuta';
  if (lowerText.includes('evento') || lowerText.includes('casamento') || lowerText.includes('festa') || 
      lowerText.includes('celebração') || lowerText.includes('aniversário') || lowerText.includes('formatura')) return 'eventos';
  if (lowerText.includes('ensaio') || lowerText.includes('book') || lowerText.includes('sessão') || 
      lowerText.includes('fotografia') || lowerText.includes('fotos')) return 'ensaios';
  
  return 'outros';
}