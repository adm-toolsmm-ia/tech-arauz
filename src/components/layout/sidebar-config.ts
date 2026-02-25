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
} from 'lucide-react';
import type { NavGroup, NavItem } from './sidebar-types';

export const menuConfig: NavGroup[] = [
  {
    group: 'Inteligência',
    items: [
      { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
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
    group: 'Sistema',
    items: [
      { title: 'Agentes AI', url: '/agentes', icon: Bot, badge: 'MVP' },
      { title: 'Integrações', url: '/integracoes', icon: Plug },
      { title: 'Usuários', url: '/cadastros/usuarios', icon: UserPlus },
    ],
  },
  {
    group: 'Auxiliares',
    items: [{ title: 'Tipos de Agentes', url: '/auxiliares/agent-types', icon: Settings }],
  },
];

export const bottomItems: NavItem[] = [
  // { title: 'Configurações', url: '/configuracoes', icon: Settings },
  // { title: 'Ajuda', url: '/ajuda', icon: HelpCircle },
];
