export function getDiasDoMes(data: Date): Date[] {
  const ano = data.getFullYear();
  const mes = data.getMonth();
  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);
  
  const dias: Date[] = [];
  const primeiroDiaSemana = primeiroDia.getDay();
  
  // Adiciona dias do mês anterior
  for (let i = primeiroDiaSemana - 1; i >= 0; i--) {
    const dia = new Date(ano, mes, -i);
    dias.push(dia);
  }
  
  // Adiciona dias do mês atual
  for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
    dias.push(new Date(ano, mes, dia));
  }
  
  // Adiciona dias do próximo mês para completar a grade
  const diasRestantes = 42 - dias.length; // 6 linhas * 7 dias = 42
  for (let dia = 1; dia <= diasRestantes; dia++) {
    dias.push(new Date(ano, mes + 1, dia));
  }
  
  return dias;
}

export function getDiasDaSemana(data: Date): Date[] {
  if (!data || !(data instanceof Date)) {
    data = new Date(); // Use current date if invalid
  }

  const dias: Date[] = [];
  const primeiroDiaSemana = new Date(data);
  primeiroDiaSemana.setDate(data.getDate() - data.getDay()); // Start from Sunday

  // Add 7 days of the week
  for (let i = 0; i < 7; i++) {
    const dia = new Date(primeiroDiaSemana);
    dia.setDate(primeiroDiaSemana.getDate() + i);
    dias.push(dia);
  }

  return dias;
}