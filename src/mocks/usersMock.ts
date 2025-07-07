import { User } from '../types/admin';
import { subDays, subMonths } from 'date-fns';

export const mockUsers: User[] = [
  {
    id: 'admin',
    name: 'Administrador',
    email: 'admin@fotocrm.com',
    role: 'admin',
    plan: 'lifetime',
    status: 'active',
    instagram: '@fotocrm.admin',
    whatsapp: '11999999999',
    lastLogin: new Date().toISOString(),
    createdAt: new Date('2024-01-01').toISOString()
  },
  {
    id: '1',
    name: 'Maria Silva',
    email: 'maria@email.com',
    role: 'user',
    plan: 'annual',
    status: 'active',
    instagram: '@mariasilva.photo',
    whatsapp: '11987654321',
    lastLogin: new Date().toISOString(),
    createdAt: subMonths(new Date(), 6).toISOString()
  },
  {
    id: '2',
    name: 'João Santos',
    email: 'joao@email.com',
    role: 'user',
    plan: 'monthly',
    status: 'active',
    instagram: '@joaosantos.fotografia',
    whatsapp: '11976543210',
    lastLogin: subDays(new Date(), 2).toISOString(),
    createdAt: subMonths(new Date(), 3).toISOString()
  },
  {
    id: '3',
    name: 'Ana Oliveira',
    email: 'ana@email.com',
    role: 'user',
    plan: 'free',
    status: 'inactive',
    instagram: '@anaoliveira',
    whatsapp: '11965432109',
    lastLogin: subMonths(new Date(), 1).toISOString(),
    createdAt: subMonths(new Date(), 2).toISOString()
  }
];