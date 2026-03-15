/**
 * Bootstrap Templates for Organization Setup Wizard
 * Story 11.12: Organizational Setup Wizard
 *
 * Provides pre-configured templates for different organization types
 * (legal_office, consultancy, corporation, other) with areas, nuclei, and processes
 */

export type OrganizationType = 'legal_office' | 'consultancy' | 'corporation' | 'other';

export interface BootstrapTemplate {
  id: string;
  name: string;
  description: string;
  areas: {
    name: string;
    description?: string;
    nuclei: {
      name: string;
      description?: string;
    }[];
  }[];
  processes?: {
    name: string;
    description?: string;
  }[];
}

export const BOOTSTRAP_TEMPLATES: Record<OrganizationType, BootstrapTemplate> = {
  legal_office: {
    id: 'legal_office_default',
    name: 'Escritório Jurídico',
    description: 'Estrutura padrão para escritórios de advocacia',
    areas: [
      {
        name: 'Recuperação de Crédito',
        description: 'Área responsável por cobranças e recuperação de crédito',
        nuclei: [
          { name: 'Análise de Risco' },
          { name: 'Ações Judiciais' },
          { name: 'Negociação com Devedores' },
        ],
      },
      {
        name: 'Trabalhista',
        description: 'Área de direito trabalhista',
        nuclei: [
          { name: 'Contencioso Trabalhista' },
          { name: 'Consultoria Trabalhista' },
          { name: 'Cálculos e Perícias' },
        ],
      },
      {
        name: 'Civil e Comercial',
        description: 'Área de direito civil e comercial',
        nuclei: [
          { name: 'Direito Contratual' },
          { name: 'Responsabilidade Civil' },
          { name: 'Fusões e Aquisições' },
        ],
      },
      {
        name: 'Tributário',
        description: 'Área de direito tributário',
        nuclei: [
          { name: 'Consultoria Tributária' },
          { name: 'Contencioso Tributário' },
          { name: 'Compliance Fiscal' },
        ],
      },
    ],
    processes: [
      { name: 'Abertura de Demanda' },
      { name: 'Análise Jurídica' },
      { name: 'Encaminhamento para Juízo' },
      { name: 'Acompanhamento de Processo' },
    ],
  },

  consultancy: {
    id: 'consultancy_default',
    name: 'Consultoria',
    description: 'Estrutura padrão para empresas de consultoria',
    areas: [
      {
        name: 'Gestão Estratégica',
        description: 'Consultoria em estratégia empresarial',
        nuclei: [
          { name: 'Planejamento Estratégico' },
          { name: 'Análise de Mercado' },
          { name: 'Benchmarking' },
        ],
      },
      {
        name: 'Gestão Operacional',
        description: 'Consultoria em operações',
        nuclei: [
          { name: 'Otimização de Processos' },
          { name: 'Análise de Custos' },
          { name: 'Lean Manufacturing' },
        ],
      },
      {
        name: 'Transformação Digital',
        description: 'Consultoria em tecnologia e inovação',
        nuclei: [
          { name: 'Transformação Digital' },
          { name: 'Implementação de Sistemas' },
          { name: 'Data & Analytics' },
        ],
      },
      {
        name: 'Recursos Humanos',
        description: 'Consultoria em gestão de pessoas',
        nuclei: [
          { name: 'Desenvolvimento Organizacional' },
          { name: 'Gestão de Desempenho' },
          { name: 'Cultura Organizacional' },
        ],
      },
    ],
    processes: [
      { name: 'Definição de Escopo' },
      { name: 'Execução de Projeto' },
      { name: 'Análise e Recomendações' },
      { name: 'Entrega de Relatório' },
    ],
  },

  corporation: {
    id: 'corporation_default',
    name: 'Corporação',
    description: 'Estrutura padrão para grandes corporações',
    areas: [
      {
        name: 'Diretoria Executiva',
        description: 'Diretoria e governança',
        nuclei: [
          { name: 'Gestão Executiva' },
          { name: 'Planejamento Estratégico' },
          { name: 'Governança Corporativa' },
        ],
      },
      {
        name: 'Financeiro',
        description: 'Área financeira',
        nuclei: [{ name: 'Contabilidade' }, { name: 'Controladoria' }, { name: 'Tesouraria' }],
      },
      {
        name: 'Operações',
        description: 'Área de operações',
        nuclei: [{ name: 'Produção' }, { name: 'Logística' }, { name: 'Qualidade' }],
      },
      {
        name: 'Comercial',
        description: 'Área comercial e vendas',
        nuclei: [
          { name: 'Vendas' },
          { name: 'Marketing' },
          { name: 'Relacionamento com Clientes' },
        ],
      },
      {
        name: 'Recursos Humanos',
        description: 'Gestão de pessoas',
        nuclei: [
          { name: 'Recrutamento' },
          { name: 'Desenvolvimento' },
          { name: 'Folha de Pagamento' },
        ],
      },
    ],
    processes: [
      { name: 'Planejamento de Produção' },
      { name: 'Processamento de Pedidos' },
      { name: 'Controle de Qualidade' },
      { name: 'Entrega ao Cliente' },
    ],
  },

  other: {
    id: 'other_default',
    name: 'Estrutura Customizável',
    description: 'Estrutura em branco para customização completa',
    areas: [
      {
        name: 'Área 1',
        description: 'Editar para adicionar sua primeira área',
        nuclei: [{ name: 'Núcleo 1' }],
      },
    ],
  },
};

/**
 * Get template by organization type
 */
export function getBootstrapTemplate(orgType: OrganizationType): BootstrapTemplate {
  return BOOTSTRAP_TEMPLATES[orgType];
}

/**
 * List all available templates
 */
export function listBootstrapTemplates(): Array<Omit<BootstrapTemplate, 'areas' | 'processes'>> {
  return Object.values(BOOTSTRAP_TEMPLATES).map((template) => ({
    id: template.id,
    name: template.name,
    description: template.description,
  }));
}

/**
 * Type definitions for wizard data
 */
export interface WizardAreaSetup {
  name: string;
  description?: string;
  nuclei: WizardNucleusSetup[];
}

export interface WizardNucleusSetup {
  name: string;
  description?: string;
}

export interface WizardFormData {
  organization_type: OrganizationType;
  template_id?: string;
  areas: WizardAreaSetup[];
  customization: Record<string, any>;
}

export const DEFAULT_WIZARD_DATA: WizardFormData = {
  organization_type: 'other',
  areas: [],
  customization: {},
};
