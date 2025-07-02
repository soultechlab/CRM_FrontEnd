export const PLAN_LIMITS = {
  free: {
    maxClients: 5,
    maxSchedules: 5,
    hasFinancialAccess: false,
    name: 'Gratuito'
  },
  monthly: {
    maxClients: Infinity,
    maxSchedules: Infinity,
    hasFinancialAccess: true,
    name: 'Mensal'
  },
  annual: {
    maxClients: Infinity,
    maxSchedules: Infinity,
    hasFinancialAccess: true,
    name: 'Anual'
  },
  lifetime: {
    maxClients: Infinity,
    maxSchedules: Infinity,
    hasFinancialAccess: true,
    name: 'Vitalício'
  }
};

export const getPlanLimits = (plan: string) => {
  return PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;
};

export const checkPlanLimit = (user: any, type: 'clients' | 'schedules') => {
  const limits = getPlanLimits(user.plan);
  const currentCount = type === 'clients' ? user.clientCount : user.scheduleCount;
  
  return currentCount < limits[type === 'clients' ? 'maxClients' : 'maxSchedules'];
};

export const hasFinancialAccess = (user: any) => {
  const limits = getPlanLimits(user.plan);
  return limits.hasFinancialAccess;
};