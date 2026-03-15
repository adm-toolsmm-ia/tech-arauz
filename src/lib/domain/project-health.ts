export interface OverdueProjectLike {
  status?: string | null;
  end_date?: string | null;
  prazo_cronograma?: string | null;
  prazo_aprovador?: string | null;
}

function normalizeStatus(status: string | null | undefined): string {
  return (status || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function isConsideredActive(status: string | null | undefined): boolean {
  const normalized = normalizeStatus(status);
  const inactiveStatuses = ['cancelado', 'concluido', 'paralisado'];
  return !inactiveStatuses.includes(normalized);
}

export function getOverdueData(
  project: OverdueProjectLike,
  referenceDate = new Date(),
): { isOverdue: boolean; maxDays: number } {
  // Atrasado apenas se não estiver concluído ou cancelado
  if (!isConsideredActive(project.status)) {
    return { isOverdue: false, maxDays: 0 };
  }

  // Verifica apenas end_date para determinar se está atrasado
  // prazo_cronograma não é considerado para overdue status
  const datesToCheck = [project.end_date]
    .filter((d): d is string => typeof d === 'string')
    .map((d) => new Date(d));

  if (datesToCheck.length === 0) return { isOverdue: false, maxDays: 0 };

  const refMidnight = new Date(referenceDate);
  refMidnight.setHours(0, 0, 0, 0);

  let maxDays = 0;
  let isOverdue = false;

  datesToCheck.forEach((d) => {
    if (d < refMidnight) {
      isOverdue = true;
      const diffTime = Math.abs(refMidnight.getTime() - d.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > maxDays) maxDays = diffDays;
    }
  });

  return { isOverdue, maxDays };
}
