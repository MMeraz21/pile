import { AppSidebar } from '@/components/app-sidebar';
import { CalendarView } from '@/components/calendar-view';
import { ListPlaceholderView } from '@/components/list-placeholder-view';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import * as React from 'react';

export function App() {
  const [activeId, setActiveId] = React.useState('inbox');

  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider>
        <AppSidebar activeId={activeId} onSelectList={setActiveId} />
        <SidebarInset>
          {activeId === 'calendar' ? (
            <CalendarView />
          ) : (
            <ListPlaceholderView id={activeId} />
          )}
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
