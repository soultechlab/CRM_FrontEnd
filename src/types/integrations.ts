export interface Gateway {
  id: string;
  name: string;
  logo: string;
  type: 'payment' | 'digital_product';
  connected: boolean;
  webhookUrl?: string;
  apiKey?: string;
}

export interface EmailPlatform {
  id: string;
  name: string;
  logo: string;
  connected: boolean;
  apiKey?: string;
  listId?: string;
}

export interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  lastTriggered?: string;
  successRate: number;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
  scopes: string[];
}

export interface IntegrationLog {
  id: string;
  type: string;
  status: 'success' | 'error';
  message: string;
  timestamp: string;
  details?: any;
}