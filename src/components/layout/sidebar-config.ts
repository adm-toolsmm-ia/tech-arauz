import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  AlertTriangle,
  Bot,
  Plug,
  Settings,
  HelpCircle,
} from 'lucide-react';
import type { NavGroup, NavItem } from './sidebar-types';

export const menuConfig: NavGroup[] = [
  {
    group: 'Inteligencia',
    items: [
      { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
      { title: 'Relatorios', url: '/relatorios', icon: FileText, badge: 'Em Breve' },
    ],
  },
  {
    group: 'Operacao',
    items: [
      {
        title: 'Projetos',
        url: '/projetos',
        icon: FolderKanban,
      },
    ],
  },
  {
    group: 'Sistema',
    items: [
      { title: 'Agentes AI', url: '/agentes', icon: Bot, badge: 'MVP' },
      { title: 'Integracoes', url: '/integracoes', icon: Plug },
    ],
  },
];

export const bottomItems: NavItem[] = [
  {
    title: 'Configuracoes',
    url: '/configuracoes',
    icon: Settings,
  },
  {
    title: 'Ajuda',
    url: '/ajuda',
    icon: HelpCircle,
  },
];
