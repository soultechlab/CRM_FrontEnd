import React from 'react';
import { Clock, User } from 'lucide-react';

interface Activity {
  id: string;
  type: 'login' | 'client_created' | 'appointment_created' | 'plan_updated';
  user: {
    name: string;
    email: string;
  };
  details: string;
  timestamp: string;
  ip?: string;
}

interface ActivityLogProps {
  activities: Activity[];
}

export default function ActivityLog({ activities }: ActivityLogProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Atividades Recentes</h3>
      
      <div className="space-y-4">
        {activities.map(activity => (
          <div key={activity.id} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
            {activity.type === 'login' ? (
              <Clock className="h-5 w-5 text-blue-500 mt-1" />
            ) : (
              <User className="h-5 w-5 text-green-500 mt-1" />
            )}
            
            <div className="flex-1">
              <div className="flex justify-between">
                <p className="font-medium">{activity.user.name}</p>
                <p className="text-sm text-gray-500">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
              <p className="text-sm text-gray-600">{activity.details}</p>
              {activity.ip && (
                <p className="text-xs text-gray-500 mt-1">IP: {activity.ip}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}