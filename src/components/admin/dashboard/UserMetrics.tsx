import React from 'react';
import { Users, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { AdminStats } from '../../../hooks/useAdminStats';
import { formatarMoeda } from '../../../utils/formatters';

interface UserMetricsProps {
  stats: AdminStats['users'];
}

export default function UserMetrics({ stats }: UserMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Usuários Ativos</p>
            <div className="space-y-1">
              <p className="text-2xl font-bold">{stats.active.last24h}</p>
              <div className="text-xs text-gray-500">
                <p>7 dias: {stats.active.last7d}</p>
                <p>30 dias: {stats.active.last30d}</p>
              </div>
            </div>
          </div>
          <Users className="h-8 w-8 text-blue-500" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Crescimento</p>
            <p className="text-2xl font-bold">{stats.growth.monthly}%</p>
            <p className="text-xs text-gray-500">Anual: {stats.growth.yearly}%</p>
          </div>
          <TrendingUp className="h-8 w-8 text-green-500" />
        </div>
      </div>

      {/* <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Tempo Médio</p>
            <p className="text-2xl font-bold">{stats.avgSessionTime}min</p>
            <p className="text-xs text-gray-500">Por sessão</p>
          </div>
          <Clock className="h-8 w-8 text-purple-500" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">ARPU</p>
            <p className="text-2xl font-bold">
              {formatarMoeda(stats.arpu)}
            </p>
            <p className="text-xs text-gray-500">Por usuário</p>
          </div>
          <DollarSign className="h-8 w-8 text-orange-500" />
        </div>
      </div> */}
    </div>
  );
}