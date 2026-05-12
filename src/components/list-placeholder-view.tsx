import { SidebarTrigger } from '@/components/ui/sidebar';

type ListView = {
  id: string;
  title: string;
  description: string;
};

const views: Record<string, ListView> = {
  inbox: {
    id: 'inbox',
    title: 'Inbox',
    description: 'Tasks go here.',
  },
  today: {
    id: 'today',
    title: 'Today',
    description: 'What you committed to for today.',
  },
  done: {
    id: 'done',
    title: 'Done',
    description: 'A history of finished tasks.',
  },
};

export function ListPlaceholderView({ id }: { id: string }) {
  const view = views[id] ?? views.inbox;

  return (
    <>
      <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger />
      </header>
      <div className="flex flex-1 flex-col gap-2 p-6">
        <h1 className="text-2xl font-semibold tracking-tight">{view.title}</h1>
        <p className="text-muted-foreground max-w-xl text-sm">
          {view.description}
        </p>
      </div>
    </>
  );
}
