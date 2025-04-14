import React from 'react';
import { Shield, AlertTriangle } from 'lucide-react';
import { formatarDataHoraBR } from '../../../utils/dateUtils';

interface SecurityMetricsProps {
  metrics: {
    failedLogins: number;
    suspiciousActivities: number;
    lastSecurityScan: Date;
  };
}

export default function SecurityMetrics({ metrics }: SecurityMetricsProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Métricas de Segurança</h2>
        <Shield className="h-5 w-5 text-gray-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-red-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">Tentativas de Login Falhas</p>
              <p className="text-xl font-bold text-red-700">{metrics.failedLogins}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="p-4 bg-yellow-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600">Atividades Suspeitas</p>
              <p className="text-xl font-bold text-yellow-700">{metrics.suspiciousActivities}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Última Verificação</p>
              <p className="text-xl font-bold text-green-700">
                {formatarDataHoraBR(metrics.lastSecurityScan)}
              </p>
            </div>
            <Shield className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>
    </div>
  );
}