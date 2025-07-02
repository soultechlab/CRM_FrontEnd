import { Gateway, WebhookConfig, IntegrationLog } from '../types/integrations';

export const generateWebhookUrl = (gateway: Gateway): string => {
  return `https://api.seusite.com/webhooks/${gateway.id}`;
};

export const validateWebhookUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const formatWebhookEvent = (event: string): string => {
  return event.replace('.', ' → ');
};

export const calculateWebhookSuccessRate = (logs: IntegrationLog[], webhookId: string): number => {
  const webhookLogs = logs.filter(log => log.type === 'webhook');
  if (webhookLogs.length === 0) return 0;

  const successCount = webhookLogs.filter(log => log.status === 'success').length;
  return (successCount / webhookLogs.length) * 100;
};

export const generateApiKey = (): string => {
  const prefix = 'sk_';
  const random = Math.random().toString(36).substring(2);
  const timestamp = Date.now().toString(36);
  return `${prefix}${random}${timestamp}`;
};