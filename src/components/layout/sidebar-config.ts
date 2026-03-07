import {
  LayoutDashboard,
  FolderKanban,
  CalendarDays,
  FileText,
  AlertTriangle,
  Bot,
  Plug,
  Settings,
  HelpCircle,
  UserPlus,
  Zap,
  Database,
  MessageSquare,
  Activity,
  Building2,
  Building,
  GitBranch,
  FolderCog,
  Monitor,
  Truck,
  Wrench,
  ClipboardList,
} from 'lucide-react';
import type { NavGroup, NavItem } from './sidebar-types';

export const menuConfig: NavGroup[] = [
  {
    group: 'Inteligência',
    items: [
      { title: 'Dashboard Projetos', url: '/dashboard/projetos', icon: LayoutDashboard },
      { title: 'Dashboard Operações', url: '/dashboard/operacoes', icon: Activity },
      { title: 'Documentação', url: '/documentacao', icon: FileText },
      // { title: 'Relatórios', url: '/relatorios', icon: FileText, badge: 'Em Breve' },
    ],
  },
  {
    group: 'Operação',
    items: [
      {
        title: 'Projetos',
        url: '/projetos',
        icon: FolderKanban,
      },
      {
        title: 'Cronogramas',
        url: '/cronogramas',
        icon: CalendarDays,
      },
    ],
  },
  {
    group: 'Organização',
    items: [
      { title: 'Empresa', url: '/organizacao/empresa', icon: Building },
      { title: 'Áreas', url: '/organizacao/areas', icon: Building2 },
      { title: 'Núcleos', url: '/organizacao/nucleos', icon: GitBranch },
      { title: 'Processos', url: '/organizacao/processos', icon: GitBranch },
      { title: 'Rotinas', url: '/organizacao/rotinas', icon: ClipboardList },
      { title: 'Sistemas', url: '/organizacao/recursos?tab=sistemas', icon: Monitor },
      { title: 'Fornecedores', url: '/organizacao/recursos?tab=fornecedores', icon: Truck },
      { title: 'Serviços', url: '/organizacao/recursos?tab=servicos', icon: Wrench },
      { title: 'Documentos', url: '/organizacao/recursos?tab=documentos', icon: FileText },
    ],
  },
  {
    group: 'Tecnologia & IA',
    items: [
      { title: 'Agentes AI', url: '/agentes', icon: Bot, badge: 'MVP' },
      { title: 'Chatbot AI', url: '/conversas', icon: MessageSquare },
      { title: 'Integrações', url: '/integracoes', icon: Plug },
    ],
  },
  {
    group: 'Tabelas Auxiliares',
    items: [
      { title: 'Tipos de Agentes', url: '/auxiliares/agent-types', icon: Settings },
      { title: 'Modelos IA', url: '/auxiliares/modelos-ia', icon: Database },
      { title: 'Provedores IA', url: '/auxiliares/lm-providers', icon: Zap },
      { title: 'Usuários', url: '/cadastros/usuarios', icon: UserPlus },
    ],
  },
];

export const bottomItems: NavItem[] = [
  // { title: 'Configurações', url: '/configuracoes', icon: Settings },
  // { title: 'Ajuda', url: '/ajuda', icon: HelpCircle },
];
