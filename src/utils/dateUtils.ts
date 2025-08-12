import { format, formatDistance, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatarDataBR = (date: Date | string): string => {
  try {
    const dataObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dataObj, 'dd/MM/yyyy', { locale: ptBR });
  } catch (error) {
    return 'Data inválida';
  }
};

export const formatarDataHoraBR = (date: Date | string): string => {
  try {
    const dataObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dataObj, 'dd/MM/yyyy HH:mm', { locale: ptBR });
  } catch (error) {
    return 'Data inválida';
  }
};

export const tempoDecorrido = (date: Date | string): string => {
  try {
    const dataObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistance(dataObj, new Date(), { 
      locale: ptBR,
      addSuffix: true 
    });
    } catch (error) {
    return 'Data inválida';
  }
};
