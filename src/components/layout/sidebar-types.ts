import type { LucideIcon } from 'lucide-react';

export interface NavSubItem {
  title: string;
  url: string;
  badge?: string;
}

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: string;
  isCollapsible?: boolean;
  subItems?: NavSubItem[];
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}
