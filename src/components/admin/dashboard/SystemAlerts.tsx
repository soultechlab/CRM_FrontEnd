import React from 'react';
import { AlertCircle, Bell } from 'lucide-react';

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: string;
}

interface SystemAlertsProps {
  alerts: Alert[];
}

export default function SystemAlerts({ alerts }: SystemAlertsProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Alertas do Sistema</h3>
        <Bell className="h-5 w-5 text-gray-500" />
      </div>
      
      <div className="space-y-3">
        {alerts.map(alert => (
          <div
            key={alert.id}
            className={`p-4 rounded-lg flex items-start gap-3 ${
              alert.type === 'error' ? 'bg-red-50 text-red-700' :
              alert.type === 'warning' ? 'bg-yellow-50 text-yellow-700' :
              'bg-blue-50 text-blue-700'
            }`}
          >
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">{alert.message}</p>
              <p className="text-sm opacity-75">
                {new Date(alert.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}