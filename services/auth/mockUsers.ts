import { User } from './types';

// Mock admin user
export const ADMIN_USER: User = {
  id: '1',
  email: 'admin@fotocrm.com',
  name: 'Admin',
  role: 'admin',
  plan: 'lifetime',
  limits: {
    maxClients: Infinity,
    maxSchedules: Infinity,
    hasFinancialAccess: true
  }
};

// Mock users database
export const mockUsers: User[] = [ADMIN_USER];