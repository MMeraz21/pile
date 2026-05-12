import { TodosListView } from '@/components/todos-list-view';
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
    description:
      'Capture tasks here without assigning a calendar day. Use Today for items tied to this date.',
  },
  today: {
    id: 'today',
    title: 'Today',
    description: '',
  },
  done: {
    id: 'done',
    title: 'Done',
    description: 'A history of tasks you marked complete.',
  },
};

export function ListPlaceholderView({ id }: { id: string }) {
  const view = views[id] ?? views.inbox;
  const description =
    id === 'today'
      ? `Todos for today's date (${new Date().toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })}). Add tasks you plan to do that calendar day.`
      : view.description;
  const hasTodosUi = id === 'inbox' || id === 'today' || id === 'done';
  const mode =
    id === 'inbox' ? 'inbox' : id === 'today' ? 'today' : id === 'done' ? 'done' : undefined;

  return (
    <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
      <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger />
        <h1 className="text-sm font-semibold tracking-tight">{view.title}</h1>
      </header>
      {hasTodosUi && mode ? (
        <TodosListView mode={mode} description={description} />
      ) : (
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-6">
          <h2 className="text-2xl font-semibold tracking-tight">{view.title}</h2>
          <p className="text-muted-foreground max-w-xl text-sm">
            {view.description}
          </p>
        </div>
      )}
    </div>
  );
}
