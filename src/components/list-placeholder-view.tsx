import { TodosListView } from '@/components/todos-list-view';
import { SidebarTrigger } from '@/components/ui/sidebar';

type ListView = {
  id: string;
  title: string;
};

const views: Record<string, ListView> = {
  inbox: { id: 'inbox', title: 'Inbox' },
  today: { id: 'today', title: 'Today' },
  done: { id: 'done', title: 'Done' },
};

export function ListPlaceholderView({ id }: { id: string }) {
  const view = views[id] ?? { id: 'unknown', title: 'List' };
  const hasTodosUi = id === 'inbox' || id === 'today' || id === 'done';
  const mode =
    id === 'inbox'
      ? 'inbox'
      : id === 'today'
        ? 'today'
        : id === 'done'
          ? 'done'
          : undefined;

  return (
    <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
      <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger />
        <h1 className="text-sm font-semibold tracking-tight">{view.title}</h1>
      </header>
      {hasTodosUi && mode ? (
        <TodosListView mode={mode} />
      ) : (
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-6">
          <h2 className="text-2xl font-semibold tracking-tight">{view.title}</h2>
        </div>
      )}
    </div>
  );
}
