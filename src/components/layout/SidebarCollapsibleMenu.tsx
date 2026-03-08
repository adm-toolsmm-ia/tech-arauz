'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import type { NavItem } from './sidebar-types';

interface SidebarCollapsibleMenuProps {
  item: NavItem;
}

export const SidebarCollapsibleMenu: React.FC<SidebarCollapsibleMenuProps> = ({ item }) => {
  const pathname = usePathname();
  const isActive = item.subItems?.some(
    (sub) => pathname === sub.url || pathname.startsWith(`${sub.url}/`),
  );
  const [isOpen, setIsOpen] = useState(isActive);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton isActive={isActive} tooltip={item.title} className="group/collapsible">
            <item.icon className="size-4" />
            <span>{item.title}</span>
            <ChevronDown
              className={cn(
                'ml-auto size-4 transition-transform duration-200',
                isOpen && 'rotate-180',
              )}
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent className="animate-collapsible-down data-[state=closed]:animate-collapsible-up">
          <SidebarMenuSub>
            {item.subItems?.map((subItem) => {
              const isSubActive = pathname === subItem.url;
              return (
                <SidebarMenuSubItem key={subItem.url}>
                  <SidebarMenuSubButton asChild isActive={isSubActive}>
                    <Link href={subItem.url}>
                      <span>{subItem.title}</span>
                      {subItem.badge && (
                        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {subItem.badge}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
};
