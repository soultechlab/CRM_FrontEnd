import { useState } from 'react';

export function useCalendario() {
  const [dataAtual, setDataAtual] = useState(new Date());
  const [visualizacao, setVisualizacao] = useState<'mes' | 'semana'>('mes');

  const navegar = (delta: number) => {
    setDataAtual(prev => {
      const novaData = new Date(prev);
      if (visualizacao === 'mes') {
        novaData.setMonth(prev.getMonth() + delta);
      } else {
        novaData.setDate(prev.getDate() + (delta * 7));
      }
      return novaData;
    });
  };

  const irParaData = (data: Date) => {
    setDataAtual(data);
  };

  return {
    dataAtual,
    visualizacao,
    setVisualizacao,
    navegar,
    irParaData
  };
}