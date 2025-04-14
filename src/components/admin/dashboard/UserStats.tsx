import React from 'react';
import { Users, UserPlus, Activity, Clock } from 'lucide-react';

interface UserStatsProps {
  stats: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    averageSessionTime: string;
  };
}

export default function UserStats({ stats }: UserStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total de Usuários</p>
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
          </div>
          <Users className="h-8 w-8 text-blue-500" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Usuários Ativos</p>
            <p className="text-2xl font-bold">{stats.activeUsers}</p>
          </div>
          <Activity className="h-8 w-8 text-green-500" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Novos Usuários</p>
            <p className="text-2xl font-bold">{stats.newUsers}</p>
          </div>
          <UserPlus className="h-8 w-8 text-purple-500" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Tempo Médio de Sessão</p>
            <p className="text-2xl font-bold">{stats.averageSessionTime}</p>
          </div>
          <Clock className="h-8 w-8 text-orange-500" />
        </div>
      </div>
    </div>
  );
}