export interface User {
  id: string;
  token: string;
  email: string;
  name: string;
  cpf?: string;
  company_name?: string;
  company_cnpj?: string;
  company_address?: string;
  role: 'admin' | 'user';
  plan: 'free' | 'monthly' | 'annual' | 'lifetime';
  limits: {
    maxClients: number;
    maxSchedules: number;
    hasFinancialAccess: boolean;
  };
  instagram?: string;
  whatsapp?: string;
  website?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
}

export interface AuthError {
  message: string;
}