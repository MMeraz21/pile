import { AppSidebar } from '@/components/app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';

export function App() {
  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger />
          </header>
          <div className="flex flex-1 flex-col gap-2 p-6">
            <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
            <p className="text-muted-foreground max-w-xl text-sm">
              Tasks go here.
            </p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
