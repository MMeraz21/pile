import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Calendar, Inbox, ListChecks } from 'lucide-react';

export function App() {
  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader className="border-b border-sidebar-border">
            <span className="text-sidebar-foreground flex h-8 items-center px-2 text-sm font-semibold tracking-tight">
              pile
            </span>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Lists</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive tooltip="Inbox">
                      <Inbox />
                      <span>Inbox</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Today">
                      <Calendar />
                      <span>Today</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Done">
                      <ListChecks />
                      <span>Done</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarRail />
        </Sidebar>
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger />
          </header>
          <div className="flex flex-1 flex-col gap-2 p-6">
            <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
            <p className="text-muted-foreground max-w-xl text-sm">
              Tasks go here. This shell uses the shadcn/ui sidebar (Radix Nova
              preset, Tailwind v3 + theme tokens in{' '}
              <code className="bg-muted rounded px-1 py-0.5 text-xs">
                src/index.css
              </code>
              ).
            </p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
