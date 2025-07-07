import React from 'react';
import { Crown, Users, Calendar, DollarSign } from 'lucide-react';
import { PLAN_LIMITS } from '../../../utils/planLimits';

interface PlanInfoProps {
  plan: string;
  role: string;
  planExpiresAt?: string;
}

export default function PlanInfo({ plan, role, planExpiresAt }: PlanInfoProps) {
  const userPlanLimits = PLAN_LIMITS[plan || 'free'];
  const isAdmin = role === 'admin';

  if (isAdmin) {
    return (
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Crown className="h-5 w-5 text-purple-500" />
          Administrador
        </h2>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-purple-800 font-medium">Acesso Total ao Sistema</p>
          <p className="text-sm text-purple-600 mt-1">
            Você tem controle total sobre todas as funcionalidades
          </p>
          
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-purple-700">Clientes ilimitados</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-purple-700">Agenda ilimitada</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-purple-700">Controle financeiro</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Crown className="h-5 w-5 text-blue-500" />
        Plano Atual
      </h2>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-blue-800">
              {userPlanLimits.name}
            </p>
            <p className="text-sm text-blue-600 mt-1">Cliente</p>
          </div>
          {planExpiresAt && (
            <p className="text-sm text-blue-600">
              Expira em: {new Date(planExpiresAt).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-blue-700">
                {userPlanLimits.maxClients === Infinity 
                  ? 'Clientes ilimitados'
                  : `Até ${userPlanLimits.maxClients} clientes / Mês`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-blue-700">
              {userPlanLimits.maxSchedules === Infinity
                ? 'Agenda ilimitada'
                : `Até ${userPlanLimits.maxSchedules} agendamentos / Mês`}
            </span>
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <DollarSign className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-blue-700">
              {userPlanLimits.hasFinancialAccess
                ? 'Acesso ao controle financeiro'
                : 'Sem acesso ao controle financeiro'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}