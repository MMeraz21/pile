import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { getTodosApi } from '@/lib/todos-bridge';
import { cn } from '@/lib/utils';
import { parseLocalDateKey, toDateKey, type Todo } from '@/todos-schema';
import { CheckCircle2, Circle, Trash2 } from 'lucide-react';
import * as React from 'react';

export type TodosListMode = 'inbox' | 'today' | 'done';

type TodosListViewProps = {
  mode: TodosListMode;
};

function formatTodoDateLabel(dateKey: string | null): string {
  if (dateKey === null) return 'Inbox';
  const d = parseLocalDateKey(dateKey);
  return d ? d.toLocaleDateString(undefined, { dateStyle: 'medium' }) : dateKey;
}

export function TodosListView({ mode }: TodosListViewProps) {
  const api = getTodosApi();
  const todayKey = React.useMemo(() => toDateKey(new Date()), []);

  const [todos, setTodos] = React.useState<Todo[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [draft, setDraft] = React.useState('');

  const load = React.useCallback(async () => {
    if (!api) {
      setTodos([]);
      setError(null);
      return;
    }
    setError(null);
    setBusy(true);
    try {
      if (mode === 'inbox') {
        setTodos(await api.listInbox());
      } else if (mode === 'today') {
        setTodos(await api.listForDate(todayKey));
      } else {
        setTodos(await api.listCompleted());
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load todos.');
      setTodos([]);
    } finally {
      setBusy(false);
    }
  }, [api, mode, todayKey]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const showAddForm = mode === 'today';

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api || mode !== 'today') return;
    const title = draft.trim();
    if (!title) return;
    const dateKey = todayKey;
    setError(null);
    try {
      await api.create({ title, dateKey });
      setDraft('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add todo.');
    }
  };

  const toggle = async (todo: Todo) => {
    if (!api || mode === 'done') return;
    setError(null);
    try {
      await api.update({ id: todo.id, completed: !todo.completed });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update todo.');
    }
  };

  const remove = async (id: string) => {
    if (!api || mode === 'done') return;
    setError(null);
    try {
      await api.delete(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete todo.');
    }
  };

  if (!api) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-6 pt-4">
        <p className="text-amber-600 dark:text-amber-400 max-w-xl text-sm">
          Local storage runs in the desktop app only. Launch pile with Electron
          to load and save todos.
        </p>
      </div>
    );
  }

  const canMutate = mode !== 'done';

  return (
    <div className="flex flex-1 flex-col gap-4 min-h-0 p-6 pt-4">
      {showAddForm && (
        <form
          className="flex shrink-0 items-center gap-2"
          onSubmit={(e) => void onAdd(e)}
        >
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a todo…"
            disabled={busy}
            className="max-w-lg"
          />
          <Button type="submit" size="sm" disabled={busy || !draft.trim()}>
            Add
          </Button>
        </form>
      )}

      {error && (
        <p className="text-destructive max-w-xl text-sm" role="alert">
          {error}
        </p>
      )}

      {(showAddForm || error) ? <Separator className="shrink-0" /> : null}

      <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
        {busy && todos.length === 0 ? (
          <li className="text-muted-foreground text-sm">Loading…</li>
        ) : todos.length === 0 ? (
          <li className="text-muted-foreground text-sm">
            {mode === 'done'
              ? 'Completed tasks will collect here.'
              : 'Nothing here yet.'}
          </li>
        ) : (
          todos.map((todo) => (
            <li
              key={todo.id}
              className={cn(
                'flex items-center gap-2 rounded-lg border bg-card px-3 py-2 shadow-sm',
              )}
            >
              {canMutate ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0"
                  aria-pressed={todo.completed}
                  aria-label={
                    todo.completed ? 'Mark as not done' : 'Mark as done'
                  }
                  onClick={() => void toggle(todo)}
                >
                  {todo.completed ? (
                    <CheckCircle2 className="text-primary size-4" />
                  ) : (
                    <Circle className="size-4" />
                  )}
                </Button>
              ) : null}
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    'break-words text-sm font-medium leading-snug',
                    todo.completed && canMutate
                      ? 'text-muted-foreground line-through'
                      : undefined,
                  )}
                >
                  {todo.title}
                </p>
                {mode === 'done' ? (
                  <p className="text-muted-foreground mt-1 text-xs leading-snug">
                    {formatTodoDateLabel(todo.dateKey)}
                  </p>
                ) : null}
              </div>
              {canMutate ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-destructive shrink-0"
                  aria-label={`Delete "${todo.title}"`}
                  onClick={() => void remove(todo.id)}
                >
                  <Trash2 />
                </Button>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
