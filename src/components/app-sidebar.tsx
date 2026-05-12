import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { Calendar, Inbox, ListChecks } from 'lucide-react';
import * as React from 'react';

type ListItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const lists: ListItem[] = [
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'today', label: 'Today', icon: Calendar },
  { id: 'done', label: 'Done', icon: ListChecks },
];

export function AppSidebar({
  activeId = 'inbox',
  ...props
}: React.ComponentProps<typeof Sidebar> & { activeId?: string }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="h-12 justify-center border-b border-sidebar-border">
        <span className="text-sidebar-foreground flex items-center px-2 text-sm font-semibold tracking-tight">
          pile
        </span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Lists</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {lists.map(({ id, label, icon: Icon }) => (
                <SidebarMenuItem key={id}>
                  <SidebarMenuButton
                    isActive={activeId === id}
                    tooltip={label}
                  >
                    <Icon />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
