import React from 'react';
import { useAdminStats } from '../../hooks/useAdminStats';
import UserMetrics from './dashboard/UserMetrics';
import UserActivity from './dashboard/UserActivity';
import SecurityMetrics from './dashboard/SecurityMetrics';
import UserGrowthChart from './dashboard/charts/UserGrowthChart';
import SubscriberBarChart from './dashboard/charts/SubscriberBarChart';
import ConversionFunnelChart from './dashboard/charts/ConversionFunnelChart';
import UserDistributionPie from './dashboard/charts/UserDistributionPie';

const mockChartData = {
  growth: [
    { month: 'Jan', users: 100, activeUsers: 80 },
    { month: 'Fev', users: 120, activeUsers: 95 },
    { month: 'Mar', users: 150, activeUsers: 120 }
  ],
  subscribers: [
    { month: 'Jan', free: 70, monthly: 20, annual: 10 },
    { month: 'Fev', free: 80, monthly: 25, annual: 15 },
    { month: 'Mar', free: 90, monthly: 35, annual: 25 }
  ],
  funnel: [
    { name: 'Visitantes', value: 1000, color: '#94A3B8' },
    { name: 'Cadastros', value: 750, color: '#4F46E5' },
    { name: 'Assinantes', value: 500, color: '#10B981' }
  ],
  distribution: [
    { name: 'Free', value: 60, color: '#94A3B8' },
    { name: 'Mensal', value: 25, color: '#4F46E5' },
    { name: 'Anual', value: 15, color: '#10B981' }
  ]
};

export default function AdminDashboard() {
  const stats = useAdminStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dashboard Administrativo</h2>
      </div>

      <UserMetrics stats={stats.users} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserGrowthChart data={stats.users.monthly_growth} />
        <SubscriberBarChart data={stats.users.subscriber_comparison} />
      </div>

      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConversionFunnelChart data={mockChartData.funnel} />
        <UserDistributionPie data={mockChartData.distribution} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserActivity activities={stats.activities} />
        <SecurityMetrics metrics={stats.metrics} />
      </div> */}
    </div>
  );
}