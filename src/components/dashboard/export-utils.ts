/**
 * Export utilities for ResponsableDetailModal
 * Handles CSV and PDF export of performance data
 */

import type { PerformanceMetrics } from '@/app/dashboard/operacoes/actions';

/**
 * Export performance data to CSV
 */
export function exportToCSV(person: PerformanceMetrics, filename: string) {
  const efficiency = person.total_movements > 0
    ? Math.round((person.projects_completed / person.total_movements) * 100)
    : 0;

  const movementsPerDay = person.average_duration_days > 0
    ? (person.total_movements / person.average_duration_days).toFixed(1)
    : '0';

  const headers = [
    'Métrica',
    'Valor',
  ];

  const rows = [
    ['Responsável', person.responsible],
    ['Movimentações Totais', person.total_movements.toString()],
    ['Tempo Médio (dias)', person.average_duration_days.toString()],
    ['Projetos Concluídos', person.projects_completed.toString()],
    ['Lead Time Médio (dias)', person.lead_time_average_days.toString()],
    ['Taxa de Conclusão', `${efficiency}%`],
    ['Movimentações por Dia', movementsPerDay],
    ['Data de Exportação', new Date().toLocaleDateString('pt-BR')],
    ['Hora de Exportação', new Date().toLocaleTimeString('pt-BR')],
  ];

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * Export performance data to PDF using html2pdf
 */
export async function exportToPDF(
  person: PerformanceMetrics,
  filename: string,
) {
  try {
    const efficiency = person.total_movements > 0
      ? Math.round((person.projects_completed / person.total_movements) * 100)
      : 0;

    const movementsPerDay = person.average_duration_days > 0
      ? (person.total_movements / person.average_duration_days).toFixed(1)
      : '0';

    // Dynamically import html2pdf to avoid SSR issues
    const html2pdf = (await import('html2pdf.js')).default;

    // Create HTML content for PDF
    const element = document.createElement('div');
    element.style.padding = '20px';
    element.style.fontFamily = 'Arial, sans-serif';
    element.innerHTML = `
      <h1 style="color: #333; margin-bottom: 20px;">Relatório de Performance</h1>
      <h2 style="color: #666; font-size: 18px; margin-bottom: 15px;">${person.responsible}</h2>

      <h3 style="color: #333; font-size: 14px; margin-top: 20px; margin-bottom: 10px;">Resumo Executivo</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Movimentações</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${person.total_movements}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Tempo Médio</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${person.average_duration_days} dias</td>
        </tr>
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Projetos Concluídos</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${person.projects_completed}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Lead Time Médio</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${person.lead_time_average_days} dias</td>
        </tr>
      </table>

      <h3 style="color: #333; font-size: 14px; margin-top: 20px; margin-bottom: 10px;">Indicadores de Eficiência</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Taxa de Conclusão</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${efficiency}%</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Movimentações por Dia</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${movementsPerDay}</td>
        </tr>
      </table>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #999;">
        <p>Data de Exportação: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}</p>
        <p>Sistema: Tech Arauz - Dashboard de Performance</p>
      </div>
    `;

    // Configure html2pdf options
    const opt = {
      margin: 10,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
    } as any; // html2pdf types are not fully exposed

    // Generate PDF
    await html2pdf().set(opt).from(element).save();
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    // Fallback to CSV if PDF generation fails
    exportToCSV(person, filename.replace('.pdf', '.csv'));
  }
}

/**
 * Generate filename with person name and date
 */
export function generateFilename(personName: string, extension: 'csv' | 'pdf') {
  const sanitizedName = personName.toLowerCase().replace(/\s+/g, '-');
  const date = new Date().toISOString().split('T')[0];
  return `performance-${sanitizedName}-${date}.${extension}`;
}
