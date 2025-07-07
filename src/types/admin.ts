export interface SystemSettings {
  logo: string;
  welcomeMessage: string;
  systemName: string;
  stripeWebhookUrl?: string;
  stripePublicKey?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  plan: 'free' | 'monthly' | 'annual' | 'lifetime';
  planExpiresAt?: string; // For monthly/annual plans
  status: 'active' | 'inactive';
  instagram?: string;
  whatsapp?: string;
  website?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
  lastLogin: string;
  createdAt: string;
  limits?: {
    maxClients: number;
    maxSchedules: number;
    hasFinancialAccess: boolean;
  };
}