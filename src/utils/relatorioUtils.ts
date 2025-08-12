import { jsPDF } from 'jspdf';
import { Transacao, ResumoFinanceiro } from '../types/financeiro';
import { formatarMoeda, formatarData } from './formatters';

export const exportarRelatorioFinanceiro = (
  transacoes: Transacao[],
  resumo: ResumoFinanceiro,
  periodo: string
) => {
  const doc = new jsPDF();
  const hoje = new Date();

  const titulo = `Relatório Financeiro - ${
    periodo === 'mes' ? 'Mês Atual' :
    periodo === 'ano' ? 'Ano Atual' :
    periodo === 'receitas' ? 'Receitas' :
    periodo === 'despesas' ? 'Despesas' :
    'Saldo Líquido'
  }`;

  const transacoesFiltradas = transacoes.filter(transacao => {
    const dataTransacao = new Date(transacao.data);
    const filtroData = periodo === 'mes' 
      ? dataTransacao.getMonth() === hoje.getMonth() && dataTransacao.getFullYear() === hoje.getFullYear()
      : periodo === 'ano'
      ? dataTransacao.getFullYear() === hoje.getFullYear()
      : true;

    const filtroTipo = periodo === 'receitas'
      ? transacao.tipo === 'receita'
      : periodo === 'despesas'
      ? transacao.tipo === 'despesa'
      : true;

    return filtroData && filtroTipo;
  });

  doc.setFontSize(20);
  doc.text('FotoCRM', 105, 20, { align: 'center' });
  doc.setFontSize(16);
  doc.text(titulo, 105, 30, { align: 'center' });
  doc.setFontSize(12);
  doc.text(`Gerado em: ${formatarData(hoje.toISOString())}`, 105, 40, { align: 'center' });

  doc.setFontSize(14);
  doc.text('Resumo Financeiro', 20, 60);
  doc.setFontSize(12);

  if (periodo === 'receitas' || periodo === 'mes' || periodo === 'ano') {
    doc.text(`Receitas: ${formatarMoeda(resumo.receitaTotal)}`, 20, 70);
    if (resumo.receitasPendentes > 0) {
      doc.text(`Receitas Pendentes: ${formatarMoeda(resumo.receitasPendentes)}`, 20, 80);
    }
  }

  if (periodo === 'despesas' || periodo === 'mes' || periodo === 'ano') {
    const yPos = periodo === 'despesas' ? 70 : 90;
    doc.text(`Despesas: ${formatarMoeda(resumo.despesaTotal)}`, 20, yPos);
    if (resumo.despesasPendentes > 0) {
      doc.text(`Despesas Pendentes: ${formatarMoeda(resumo.despesasPendentes)}`, 20, yPos + 10);
    }
  }

  if (periodo === 'saldo' || periodo === 'mes' || periodo === 'ano') {
    const yPos = periodo === 'saldo' ? 70 : 110;
    doc.text(`Saldo Líquido: ${formatarMoeda(resumo.saldoLiquido)}`, 20, yPos);
  }

  if (transacoesFiltradas.length > 0) {
    doc.setFontSize(14);
    doc.text('Transações do Período', 20, 130);
    
    let y = 140;
    transacoesFiltradas.forEach((transacao) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      const linha = `${formatarData(transacao.data)} - ${transacao.descricao} - ${
        formatarMoeda(transacao.valor)
      } (${transacao.status})`;
      
      doc.setFontSize(10);
      doc.text(linha, 20, y);
      y += 10;
    });
  }

  doc.save(`relatorio_financeiro_${periodo}_${formatarData(hoje.toISOString())}.pdf`);
};
