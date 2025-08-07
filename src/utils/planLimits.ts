export const PLAN_LIMITS = {
  free: {
    maxClients: 5,
    maxSchedules: 5,
    hasFinancialAccess: false,
    name: 'Gratuito',
    maxTemplates: 1,
    maxDocumentSends: 5,
  },
  monthly: {
    maxClients: Infinity,
    maxSchedules: Infinity,
    hasFinancialAccess: true,
    name: 'Mensal',
    maxTemplates: 5,
    maxDocumentSends: 50,
  },
  annual: {
    maxClients: Infinity,
    maxSchedules: Infinity,
    hasFinancialAccess: true,
    name: 'Anual',
    maxTemplates: 10,
    maxDocumentSends: 100,
  },
  lifetime: {
    maxClients: Infinity,
    maxSchedules: Infinity,
    hasFinancialAccess: true,
    name: 'Vitalício',
    maxTemplates: 10,
    maxDocumentSends: 100,
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

// NOVAS FUNÇÕES PARA LIMITES DE TEMPLATES E ENVIOS DE DOCUMENTOS

export const checkTemplateLimit = (userPlan: string, currentTemplateCount: number) => {
  const limits = getPlanLimits(userPlan);
  return {
    reached: currentTemplateCount >= limits.maxTemplates,
    limit: limits.maxTemplates,
  };
};

export const checkDocumentSendLimit = (userPlan: string, currentSendCount: number) => {
  const limits = getPlanLimits(userPlan);
  return {
    reached: currentSendCount >= limits.maxDocumentSends,
    limit: limits.maxDocumentSends,
  };
};
