import React from 'react';
import { Calendar, DollarSign, Users, Clock } from 'lucide-react';
import { PLAN_LIMITS } from '../../../../utils/planLimits';

interface PlanSelectionProps {
  selectedPlan: string;
  onChange: (plan: string) => void;
  isAdmin: boolean;
}

export default function PlanSelection({ selectedPlan, onChange, isAdmin }: PlanSelectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Plano de Acesso</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(PLAN_LIMITS).map(([plan, limits]) => (
          <button
            key={plan}
            type="button"
            onClick={() => onChange(plan)}
            className={`p-4 border rounded-lg text-left transition-colors ${
              selectedPlan === plan
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            } ${!isAdmin && plan === 'lifetime' ? 'hidden' : ''}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{limits.name}</h4>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span>
                      {limits.maxClients === Infinity 
                        ? 'Clientes ilimitados' 
                        : `Até ${limits.maxClients} clientes`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>
                      {limits.maxSchedules === Infinity 
                        ? 'Agenda ilimitada' 
                        : `Até ${limits.maxSchedules} agendamentos`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span>
                      {limits.hasFinancialAccess 
                        ? 'Acesso ao financeiro' 
                        : 'Sem acesso ao financeiro'}
                    </span>
                  </div>
                </div>
              </div>
              {selectedPlan === plan && (
                <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <div className="h-2 w-2 bg-white rounded-full" />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {isAdmin && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              Data de Expiração
            </div>
          </label>
          <input
            type="date"
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      )}
    </div>
  );
}