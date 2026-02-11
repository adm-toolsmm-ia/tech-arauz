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
    group: 'Gestao',
    items: [
      {
        title: 'Projetos',
        url: '/projetos',
        icon: FolderKanban,
        isCollapsible: true,
        subItems: [
          { title: 'Visao Geral', url: '/projetos' },
          { title: 'Cronogramas', url: '/projetos/cronogramas', badge: 'Em Breve' },
          { title: 'Entregas', url: '/projetos/entregas', badge: 'Em Breve' },
        ],
      },
    ],
  },
  {
    group: 'Inteligencia',
    items: [
      { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
      { title: 'Relatorios', url: '/relatorios', icon: FileText, badge: 'Em Breve' },
      { title: 'Riscos', url: '/riscos', icon: AlertTriangle, badge: 'Em Breve' },
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
