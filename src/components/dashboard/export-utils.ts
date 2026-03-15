/**
 * Export utilities for ResponsableDetailModal
 * Handles CSV, JSON, and PDF export of performance data with team comparison
 */

import type { PerformanceMetrics } from '@/app/dashboard/operacoes/actions';

interface ExportOptions {
  allData?: PerformanceMetrics[];
  includeComparison?: boolean;
}

/**
 * Calculate team averages for comparison metrics
 */
function calculateTeamAverages(allData: PerformanceMetrics[]) {
  if (allData.length === 0) {
    return { avgMovements: 0, avgDuration: 0, avgCompletion: 0 };
  }

  const totalMovements = allData.reduce((sum, d) => sum + d.total_movements, 0);
  const totalDuration = allData.reduce((sum, d) => sum + d.average_duration_days, 0);
  const totalCompletion = allData.reduce(
    (sum, d) =>
      sum + (d.total_movements > 0 ? (d.projects_completed / d.total_movements) * 100 : 0),
    0,
  );

  return {
    avgMovements: Math.round(totalMovements / allData.length),
    avgDuration: Math.round(totalDuration / allData.length),
    avgCompletion: Math.round(totalCompletion / allData.length),
  };
}

/**
 * Export performance data to JSON (nested structure with comparison)
 */
export function exportToJSON(person: PerformanceMetrics, options: ExportOptions = {}) {
  const efficiency =
    person.total_movements > 0
      ? Math.round((person.projects_completed / person.total_movements) * 100)
      : 0;

  const movementsPerDay =
    person.average_duration_days > 0 ? person.total_movements / person.average_duration_days : 0;

  const teamAverages =
    options.allData && options.includeComparison ? calculateTeamAverages(options.allData) : null;

  const performanceDelta =
    teamAverages && teamAverages.avgMovements > 0
      ? Math.round(
          ((person.total_movements - teamAverages.avgMovements) / teamAverages.avgMovements) * 100,
        )
      : 0;

  const jsonData = {
    metadata: {
      exportDate: new Date().toISOString(),
      exportFormat: 'application/json',
      system: 'Tech Arauz - Dashboard de Performance',
    },
    person: {
      name: person.responsible,
      metrics: {
        totalMovements: person.total_movements,
        completionRate: `${efficiency}%`,
        averageDuration: `${person.average_duration_days} dias`,
        projectsCompleted: person.projects_completed,
        leadTimeAverage: `${person.lead_time_average_days} dias`,
        movementsPerDay: movementsPerDay.toFixed(2),
      },
    },
    ...(teamAverages &&
      options.includeComparison && {
        comparison: {
          teamAverages: {
            avgMovements: teamAverages.avgMovements,
            avgDuration: `${teamAverages.avgDuration} dias`,
            avgCompletion: `${teamAverages.avgCompletion}%`,
          },
          performance: {
            movementsDelta: `${performanceDelta > 0 ? '+' : ''}${performanceDelta}%`,
            status:
              performanceDelta > 20
                ? 'High Performer'
                : performanceDelta > 0
                  ? 'Above Average'
                  : 'At Risk',
          },
        },
      }),
  };

  return JSON.stringify(jsonData, null, 2);
}

/**
 * Download JSON export
 */
export function downloadJSON(jsonString: string, filename: string) {
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename.replace('.json', '') + '.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * Export performance data to enhanced CSV (with team comparison)
 */
export function exportToCSV(
  person: PerformanceMetrics,
  filename: string,
  options: ExportOptions = {},
) {
  const efficiency =
    person.total_movements > 0
      ? Math.round((person.projects_completed / person.total_movements) * 100)
      : 0;

  const movementsPerDay =
    person.average_duration_days > 0
      ? (person.total_movements / person.average_duration_days).toFixed(1)
      : '0';

  const teamAverages =
    options.allData && options.includeComparison ? calculateTeamAverages(options.allData) : null;

  const headers = ['Métrica', 'Valor', ...(teamAverages ? ['Média de Time', 'Vs Média'] : [])];

  const rows = [
    ['Responsável', person.responsible, '', ''],
    [
      'Movimentações Totais',
      person.total_movements.toString(),
      teamAverages?.avgMovements.toString() || '',
      teamAverages
        ? `${(((person.total_movements - teamAverages.avgMovements) / teamAverages.avgMovements) * 100).toFixed(1)}%`
        : '',
    ],
    [
      'Tempo Médio (dias)',
      person.average_duration_days.toString(),
      teamAverages?.avgDuration.toString() || '',
      teamAverages
        ? `${(person.average_duration_days - teamAverages.avgDuration).toFixed(1)} dias`
        : '',
    ],
    ['Projetos Concluídos', person.projects_completed.toString(), '', ''],
    ['Lead Time Médio (dias)', person.lead_time_average_days.toString(), '', ''],
    [
      'Taxa de Conclusão',
      `${efficiency}%`,
      teamAverages ? `${teamAverages.avgCompletion}%` : '',
      '',
    ],
    ['Movimentações por Dia', movementsPerDay, '', ''],
    ['Data de Exportação', new Date().toLocaleDateString('pt-BR'), '', ''],
    ['Hora de Exportação', new Date().toLocaleTimeString('pt-BR'), '', ''],
  ];

  const csvContent = [
    headers.map((h) => `"${h}"`).join(','),
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
 * Export performance data to enhanced PDF (with headers, footers, pagination)
 */
export async function exportToPDF(
  person: PerformanceMetrics,
  filename: string,
  options: ExportOptions = {},
) {
  try {
    const efficiency =
      person.total_movements > 0
        ? Math.round((person.projects_completed / person.total_movements) * 100)
        : 0;

    const movementsPerDay =
      person.average_duration_days > 0
        ? (person.total_movements / person.average_duration_days).toFixed(1)
        : '0';

    const teamAverages =
      options.allData && options.includeComparison ? calculateTeamAverages(options.allData) : null;

    const performanceDelta =
      teamAverages && teamAverages.avgMovements > 0
        ? Math.round(
            ((person.total_movements - teamAverages.avgMovements) / teamAverages.avgMovements) *
              100,
          )
        : 0;

    // Dynamically import html2pdf to avoid SSR issues
    const html2pdf = (await import('html2pdf.js')).default;

    // Create HTML content for PDF with enhanced styling
    const element = document.createElement('div');
    element.style.padding = '20px';
    element.style.fontFamily = 'Arial, sans-serif';
    element.innerHTML = `
      <!-- Header -->
      <div style="border-bottom: 3px solid #0066cc; padding-bottom: 15px; margin-bottom: 20px;">
        <h1 style="color: #0066cc; margin: 0 0 5px 0; font-size: 28px;">Relatório de Performance</h1>
        <p style="color: #666; margin: 0; font-size: 14px;">Tech Arauz - Dashboard de Performance</p>
      </div>

      <!-- Person Info -->
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <h2 style="color: #0066cc; font-size: 20px; margin: 0 0 10px 0;">${person.responsible}</h2>
        <p style="color: #666; margin: 0; font-size: 12px;">
          Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
        </p>
      </div>

      <!-- Executive Summary -->
      <h3 style="color: #333; font-size: 14px; margin-top: 20px; margin-bottom: 10px; border-left: 4px solid #0066cc; padding-left: 10px;">Resumo Executivo</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; width: 40%;">Movimentações</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${person.total_movements}</td>
          ${teamAverages ? `<td style="padding: 10px; border: 1px solid #ddd; color: #666; font-size: 12px;">Média: ${teamAverages.avgMovements}</td>` : ''}
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Tempo Médio</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${person.average_duration_days} dias</td>
          ${teamAverages ? `<td style="padding: 10px; border: 1px solid #ddd; color: #666; font-size: 12px;">Média: ${teamAverages.avgDuration} dias</td>` : ''}
        </tr>
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Projetos Concluídos</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${person.projects_completed}</td>
          <td style="padding: 10px; border: 1px solid #ddd;"></td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Lead Time Médio</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${person.lead_time_average_days} dias</td>
          <td style="padding: 10px; border: 1px solid #ddd;"></td>
        </tr>
      </table>

      <!-- Efficiency Indicators -->
      <h3 style="color: #333; font-size: 14px; margin-top: 20px; margin-bottom: 10px; border-left: 4px solid #0066cc; padding-left: 10px;">Indicadores de Eficiência</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; width: 40%;">Taxa de Conclusão</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${efficiency}%</td>
          ${teamAverages ? `<td style="padding: 10px; border: 1px solid #ddd; color: #666; font-size: 12px;">Média: ${teamAverages.avgCompletion}%</td>` : ''}
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Movimentações por Dia</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${movementsPerDay}</td>
          <td style="padding: 10px; border: 1px solid #ddd;"></td>
        </tr>
      </table>

      ${
        teamAverages
          ? `
      <!-- Performance Comparison -->
      <h3 style="color: #333; font-size: 14px; margin-top: 20px; margin-bottom: 10px; border-left: 4px solid #0066cc; padding-left: 10px;">Comparação com Time</h3>
      <div style="padding: 15px; background-color: ${performanceDelta > 0 ? '#e8f5e9' : '#fff3e0'}; border-radius: 5px; margin-bottom: 20px;">
        <p style="margin: 0 0 5px 0; color: #333; font-weight: bold;">Status: ${performanceDelta > 20 ? '🌟 High Performer' : performanceDelta > 0 ? '📈 Acima da Média' : '⚠️ Em Risco'}</p>
        <p style="margin: 0; color: #666; font-size: 12px;">Desempenho ${performanceDelta > 0 ? '+' : ''}${performanceDelta}% vs Média do Time</p>
      </div>
      `
          : ''
      }

      <!-- Footer -->
      <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #ddd; text-align: center; font-size: 11px; color: #999;">
        <p style="margin: 0;">Tech Arauz - Dashboard de Performance | ${new Date().getFullYear()}</p>
        <p style="margin: 5px 0 0 0;">Este relatório é confidencial e destinado apenas para o destinatário</p>
      </div>
    `;

    // Configure html2pdf options with pagination
    const opt = {
      margin: [15, 10, 15, 10], // [top, left, bottom, right]
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
export function generateFilename(personName: string, extension: 'csv' | 'pdf' | 'json' = 'csv') {
  const sanitizedName = personName.toLowerCase().replace(/\s+/g, '-');
  const date = new Date().toISOString().split('T')[0];
  return `performance-${sanitizedName}-${date}.${extension}`;
}
