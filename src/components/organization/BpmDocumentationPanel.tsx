'use client';

import { FileText, AlertTriangle, Clock, BookOpen, ListOrdered } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { OrgDocumentation, OrgInputOutput } from '@/types/organization';

function formatInputOutput(items: OrgInputOutput[]): string[] {
  return items.map((i) => (typeof i === 'object' && i?.name ? i.name : String(i)));
}

interface BpmDocumentationPanelProps {
  /** Inputs do processo/atividade */
  inputs?: OrgInputOutput[];
  /** Outputs do processo/atividade */
  outputs?: OrgInputOutput[];
  /** Riscos */
  risks?: string[];
  /** Impactos */
  impacts?: string[];
  /** Documentação JSONB (steps, regra, horario_limite, step_by_step, etc.) */
  documentation?: OrgDocumentation | Record<string, unknown> | null;
  /** Exibir badge de fonte (ex.: Espaider) */
  showSourceBadge?: boolean;
  /** Exibir campos de documentação de atividade (step_by_step, guidelines, common_errors) */
  showActivityDocs?: boolean;
}

const ACTIVITY_DOC_KEYS = [
  'step_by_step',
  'guidelines',
  'common_errors',
  'procedures',
  'best_practices',
  'instructions',
] as const;

export function BpmDocumentationPanel({
  inputs = [],
  outputs = [],
  risks = [],
  impacts = [],
  documentation,
  showSourceBadge = true,
  showActivityDocs = false,
}: BpmDocumentationPanelProps) {
  const doc = documentation as OrgDocumentation | Record<string, unknown> | undefined;
  const steps = doc?.steps;
  const hasSteps = Array.isArray(steps) && steps.length > 0;
  const activityDocEntries =
    showActivityDocs && doc
      ? ACTIVITY_DOC_KEYS.filter((k) => doc[k] && typeof doc[k] === 'string')
      : [];
  const hasActivityDocs = activityDocEntries.length > 0;
  const hasInputs = inputs.length > 0;
  const hasOutputs = outputs.length > 0;
  const hasRisks = risks.length > 0;
  const hasImpacts = impacts.length > 0;
  const hasDocMeta =
    doc?.horario_limite ||
    doc?.regra ||
    doc?.prazo ||
    doc?.disponivel_a_partir ||
    doc?.doc;

  if (
    !hasInputs &&
    !hasOutputs &&
    !hasRisks &&
    !hasImpacts &&
    !hasSteps &&
    !hasDocMeta &&
    !hasActivityDocs &&
    !(showSourceBadge && (doc as OrgDocumentation)?.source)
  ) {
    return null;
  }

  return (
    <div className="space-y-4">
      {showSourceBadge && (doc as OrgDocumentation)?.source && (
        <Badge variant="secondary" className="gap-1">
          <BookOpen className="size-3" />
          Fonte: {doc.source}
          {(doc as OrgDocumentation).doc && ` (${(doc as OrgDocumentation).doc})`}
        </Badge>
      )}

      {hasDocMeta && (
        <section>
          <div className="mb-2 flex items-center gap-2 border-b pb-2">
            <Clock className="size-4 text-primary" />
            <h4 className="text-sm font-semibold">Regras e prazos</h4>
          </div>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {(doc as OrgDocumentation)?.horario_limite && (
              <li>
                <span className="font-medium text-foreground">Horário limite:</span>{' '}
                {(doc as OrgDocumentation).horario_limite}
              </li>
            )}
            {(doc as OrgDocumentation)?.disponivel_a_partir && (
              <li>
                <span className="font-medium text-foreground">Disponível a partir:</span>{' '}
                {(doc as OrgDocumentation).disponivel_a_partir}
              </li>
            )}
            {(doc as OrgDocumentation)?.prazo && (
              <li>
                <span className="font-medium text-foreground">Prazo:</span>{' '}
                {(doc as OrgDocumentation).prazo}
              </li>
            )}
            {(doc as OrgDocumentation)?.regra && (
              <li>
                <span className="font-medium text-foreground">Regra:</span>{' '}
                {(doc as OrgDocumentation).regra}
              </li>
            )}
          </ul>
        </section>
      )}

      {hasActivityDocs && (
        <section>
          <div className="mb-2 flex items-center gap-2 border-b pb-2">
            <FileText className="size-4 text-primary" />
            <h4 className="text-sm font-semibold">Documentação</h4>
          </div>
          <div className="space-y-3 text-sm">
            {activityDocEntries.map((k) => {
              const label =
                k === 'step_by_step'
                  ? 'Passo a passo'
                  : k === 'common_errors'
                    ? 'Erros comuns'
                    : k === 'best_practices'
                      ? 'Boas práticas'
                      : k === 'procedures'
                        ? 'Procedimentos'
                        : k === 'instructions'
                          ? 'Instruções'
                          : 'Diretrizes';
              return (
                <div key={k}>
                  <p className="text-xs font-medium text-muted-foreground">{label}</p>
                  <p className="mt-0.5 whitespace-pre-wrap">{String(doc?.[k] ?? '')}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {hasSteps && (
        <section>
          <div className="mb-2 flex items-center gap-2 border-b pb-2">
            <ListOrdered className="size-4 text-primary" />
            <h4 className="text-sm font-semibold">Passos</h4>
          </div>
          <ol className="list-inside list-decimal space-y-1 text-sm">
            {steps!.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>
      )}

      {(hasInputs || hasOutputs) && (
        <section>
          <div className="mb-2 flex items-center gap-2 border-b pb-2">
            <FileText className="size-4 text-primary" />
            <h4 className="text-sm font-semibold">Inputs e outputs</h4>
          </div>
          <div className="grid gap-3 text-sm md:grid-cols-2">
            {hasInputs && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Inputs</p>
                <p className="mt-0.5">{formatInputOutput(inputs).join(', ')}</p>
              </div>
            )}
            {hasOutputs && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Outputs</p>
                <p className="mt-0.5">{formatInputOutput(outputs).join(', ')}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {(hasRisks || hasImpacts) && (
        <section>
          <div className="mb-2 flex items-center gap-2 border-b pb-2">
            <AlertTriangle className="size-4 text-primary" />
            <h4 className="text-sm font-semibold">Riscos e impactos</h4>
          </div>
          <div className="grid gap-3 text-sm md:grid-cols-2">
            {hasRisks && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Riscos</p>
                <p className="mt-0.5">{risks.join(', ')}</p>
              </div>
            )}
            {hasImpacts && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Impactos</p>
                <p className="mt-0.5">{impacts.join(', ')}</p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
