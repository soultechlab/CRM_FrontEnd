import React from 'react';
import { Activity } from 'lucide-react';
import { tempoDecorrido } from '../../../utils/dateUtils';

interface ActivityLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
}

interface UserActivityProps {
  activities: ActivityLog[];
}

export default function UserActivity({ activities = [] }: UserActivityProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Atividade dos Usuários</h2>
        <Activity className="h-5 w-5 text-gray-500" />
      </div>

      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium">{activity.user}</p>
                <p className="text-sm text-gray-600">{activity.action}</p>
                <p className="text-xs text-gray-500">
                  {tempoDecorrido(activity.timestamp)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            Nenhuma atividade registrada
          </div>
        )}
      </div>
    </div>
  );
}