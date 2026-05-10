import { describe, expect, it } from 'vitest';
import { formatOrganizationContext, type OrganizationContextSnapshot } from '../organization-context';

describe('organization context helper', () => {
  it('formats a hierarchical snapshot for chat fallback', () => {
    const snapshot: OrganizationContextSnapshot = {
      areas: [
        {
          id: 'area-1',
          tenant_id: 'tenant-1',
          name: 'Financeiro',
          description: 'Gestão financeira',
          objective: 'Controlar recebimentos e pagamentos',
          responsible_roles: ['gerente financeiro'],
          documentation: {},
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-02T00:00:00Z',
        },
      ],
      nuclei: [
        {
          id: 'nucleus-1',
          tenant_id: 'tenant-1',
          area_id: 'area-1',
          name: 'Cobrança',
          description: 'Núcleo de cobrança',
          objective: 'Acompanhar inadimplência',
          responsible_roles: ['analista financeiro'],
          documentation: {},
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-02T00:00:00Z',
        },
      ],
      processes: [
        {
          id: 'process-1',
          tenant_id: 'tenant-1',
          area_id: 'area-1',
          nucleus_id: 'nucleus-1',
          name: 'Aprovação de cobrança',
          description: 'Fluxo de aprovação',
          objective: 'Validar cobrança antes do envio',
          inputs: [{ name: 'fatura' }],
          outputs: [{ name: 'cobrança aprovada' }],
          responsible_roles: ['analista financeiro'],
          risks: ['atraso'],
          impacts: ['financeiro'],
          documentation: {
            steps: ['validar valores', 'aprovar cobrança'],
            regra: 'Aprovar apenas valores conferidos',
          },
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-02T00:00:00Z',
        },
      ],
      routines: [
        {
          id: 'routine-1',
          tenant_id: 'tenant-1',
          process_id: 'process-1',
          name: 'Conferência diária',
          description: 'Rotina de conferência',
          objective: 'Revisar itens pendentes',
          responsible_roles: ['analista financeiro'],
          documentation: {
            steps: ['verificar fila', 'disparar alertas'],
          },
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-02T00:00:00Z',
        },
      ],
      activities: [
        {
          id: 'activity-1',
          tenant_id: 'tenant-1',
          routine_id: 'routine-1',
          name: 'Validar boleto',
          description: 'Checagem final',
          objective: 'Confirmar dados de pagamento',
          complexity: 'medium',
          priority: 'high',
          required_role: 'analista financeiro',
          average_execution_time: 90,
          inputs: [{ name: 'boleto' }],
          outputs: [{ name: 'boleto validado' }],
          risks: ['erro de leitura'],
          impacts: ['atraso no recebimento'],
          responsible_roles: ['analista financeiro'],
          documentation: {
            steps: ['abrir boleto', 'validar campos', 'confirmar'],
          },
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-02T00:00:00Z',
        },
      ],
    };

    const prompt = formatOrganizationContext(snapshot);

    expect(prompt).toContain('Financeiro');
    expect(prompt).toContain('Cobrança');
    expect(prompt).toContain('Aprovação de cobrança');
    expect(prompt).toContain('Conferência diária');
    expect(prompt).toContain('Validar boleto');
    expect(prompt).toContain('1h 30m');
  });

  it('keeps orphan entities visible in the linear fallback section', () => {
    const snapshot: OrganizationContextSnapshot = {
      areas: [
        {
          id: 'area-1',
          tenant_id: 'tenant-1',
          name: 'Operações',
          description: null,
          objective: 'Dar suporte ao negócio',
          responsible_roles: [],
          documentation: {},
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-02T00:00:00Z',
        },
      ],
      nuclei: [],
      processes: [
        {
          id: 'process-2',
          tenant_id: 'tenant-1',
          area_id: null,
          nucleus_id: null,
          name: 'Processo órfão',
          description: null,
          objective: 'Fluxo ainda não vinculado',
          inputs: [],
          outputs: [],
          responsible_roles: [],
          risks: [],
          impacts: [],
          documentation: {},
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-02T00:00:00Z',
        },
      ],
      routines: [],
      activities: [],
    };

    const prompt = formatOrganizationContext(snapshot);

    expect(prompt).toContain('Processo órfão');
    expect(prompt).toContain('Sem área');
  });
});
