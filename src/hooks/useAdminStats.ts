import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { buscarDadosDashboard } from '../services/apiService';

export interface AdminStats {
  users: {
    total: number;
    active: {
      last24h: number;
      last7d: number;
      last30d: number;
    };
    growth: {
      monthly: number;
      yearly: number;
    };
    monthly_growth: Array<{}>;
    subscriber_comparison: Array<{}>;
    avgSessionTime: number;
    arpu: number;
  };
  metrics: {
    failedLogins: number;
    suspiciousActivities: number;
    lastSecurityScan: Date;
  };
  activities: Array<{
    id: string;
    user: string;
    action: string;
    timestamp: string;
  }>;
}

export function useAdminStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>({
    users: {
      total: 0,
      active: {
        last24h: 0,
        last7d: 0,
        last30d: 0
      },
      growth: {
        monthly: 0,
        yearly: 0
      },
      monthly_growth: [],
      subscriber_comparison: [],
      avgSessionTime: 0,
      arpu: 0
    },
    metrics: {
      failedLogins: 0,
      suspiciousActivities: 0,
      lastSecurityScan: new Date()
    },
    activities: []
  });
  
  const mapearDadosStats = (data: any) => {
    return {
      users: {
        total: data.user_statics.total_active_users,
        active: {
          last24h: data.user_statics.total_active_users, // Período Total
          last7d: data.user_statics.active_users_last_7_days,
          last30d: data.user_statics.active_users_last_30_days,
        },
        growth: {
          monthly: data.user_growth.monthly_growth,
          yearly: data.user_growth.annual_growth,
        },
        monthly_growth: data.user_monthly_growth,
        subscriber_comparison: data.subscriber_comparison,
        avgSessionTime: 0,
        arpu: 0,
      },
      metrics: {
        failedLogins: 3, // Dados fictícios, adicione a lógica para buscar esses dados
        suspiciousActivities: 1, // Dados fictícios
        lastSecurityScan: new Date(), // Você pode ajustar para pegar a data real se disponível
      },
      activities: [
        {
          id: '1',
          user: 'João Silva',
          action: 'Login realizado',
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          user: 'Maria Santos',
          action: 'Atualização de perfil',
          timestamp: subDays(new Date(), 1).toISOString(),
        },
        {
          id: '3',
          user: 'Pedro Oliveira',
          action: 'Novo agendamento criado',
          timestamp: subDays(new Date(), 2).toISOString(),
        },
      ],
    };
  }

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await buscarDadosDashboard(user);

        const mappedData = mapearDadosStats(data);

        
        setStats(mappedData);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
  }, [user]);

  return stats;
}