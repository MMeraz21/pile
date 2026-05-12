import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { getTodosApi } from '@/lib/todos-bridge';
import { cn } from '@/lib/utils';
import { parseLocalDateKey, type Todo } from '@/todos-schema';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function startOfMonthGrid(d: Date) {
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  return start;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function CalendarView() {
  const api = getTodosApi();
  const [cursor, setCursor] = React.useState(() => new Date());
  const today = React.useMemo(() => new Date(), []);

  const [monthTodos, setMonthTodos] = React.useState<Todo[]>([]);
  const [loadErr, setLoadErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!api) {
      setMonthTodos([]);
      return;
    }
    let cancelled = false;
    setLoadErr(null);
    api
      .listForMonth(cursor.getFullYear(), cursor.getMonth())
      .then((rows) => {
        if (!cancelled) setMonthTodos(rows);
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setLoadErr(e instanceof Error ? e.message : 'Could not load month.');
      });
    return () => {
      cancelled = true;
    };
  }, [api, cursor]);

  const days = React.useMemo(() => {
    const start = startOfMonthGrid(cursor);
    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  }, [cursor]);

  const todosByDay = React.useMemo(() => {
    const map = new Map<number, Todo[]>();
    for (const t of monthTodos) {
      if (!t.dateKey) continue;
      const d = parseLocalDateKey(t.dateKey);
      if (
        !d ||
        d.getFullYear() !== cursor.getFullYear() ||
        d.getMonth() !== cursor.getMonth()
      ) {
        continue;
      }
      const dayNum = d.getDate();
      const cur = map.get(dayNum) ?? [];
      cur.push(t);
      map.set(dayNum, cur);
    }
    for (const [k, list] of map) {
      map.set(
        k,
        list.slice().sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
      );
    }
    return map;
  }, [monthTodos, cursor]);

  const monthLabel = cursor.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      <header className="flex h-12 shrink-0 items-center gap-3 border-b px-4">
        <SidebarTrigger />
        <h1 className="text-sm font-semibold tracking-tight">{monthLabel}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCursor(new Date())}
          >
            Today
          </Button>
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Previous month"
              onClick={() =>
                setCursor(
                  new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1),
                )
              }
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Next month"
              onClick={() =>
                setCursor(
                  new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1),
                )
              }
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      </header>

      {!api ? (
        <div className="text-muted-foreground p-6 text-sm">
          Open pile in Electron to show scheduled todos on the calendar.
        </div>
      ) : (
        <>
          {loadErr ? (
            <p className="text-destructive px-6 pt-2 text-sm" role="alert">
              {loadErr}
            </p>
          ) : null}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="grid grid-cols-7 border-b bg-muted/30">
              {WEEKDAYS.map((d) => (
                <div
                  key={d}
                  className="text-muted-foreground px-3 py-2 text-[0.7rem] font-medium uppercase tracking-wide"
                >
                  {d}
                </div>
              ))}
            </div>
            <div className="grid min-h-[320px] flex-1 grid-cols-7 grid-rows-6">
              {days.map((date, i) => {
                const inMonth = date.getMonth() === cursor.getMonth();
                const isTodayCell = isSameDay(date, today);
                const todos = inMonth
                  ? todosByDay.get(date.getDate()) ?? []
                  : [];
                const isLastCol = (i + 1) % 7 === 0;
                const isLastRow = i >= 35;

                return (
                  <div
                    key={i}
                    className={cn(
                      'group/cell flex min-h-0 flex-col gap-1 p-1.5 transition-colors',
                      !isLastCol && 'border-r',
                      !isLastRow && 'border-b',
                      !inMonth && 'bg-muted/20',
                      inMonth && 'hover:bg-muted/40',
                    )}
                  >
                    <div className="flex items-center justify-end">
                      <span
                        className={cn(
                          'flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs tabular-nums',
                          isTodayCell &&
                            'bg-primary text-primary-foreground font-semibold',
                          !isTodayCell &&
                            !inMonth &&
                            'text-muted-foreground/40',
                          !isTodayCell &&
                            inMonth &&
                            'text-foreground/80',
                        )}
                      >
                        {date.getDate()}
                      </span>
                    </div>
                    <div className="flex min-h-0 flex-col gap-1 overflow-hidden">
                      {todos.map((todo) => (
                        <button
                          key={todo.id}
                          type="button"
                          title={todo.title}
                          className={cn(
                            'bg-muted text-foreground/80 truncate rounded-md px-1.5 py-0.5 text-left text-xs font-medium transition-colors',
                            'hover:bg-muted/80',
                          )}
                        >
                          {todo.title}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}
