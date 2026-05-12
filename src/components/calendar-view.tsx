import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import * as React from 'react';

type CalendarEvent = {
  id: string;
  title: string;
  day: number;
  variant?: 'neutral' | 'accent' | 'success' | 'warning';
};

const SAMPLE_EVENTS: CalendarEvent[] = [
  { id: 'e1', title: 'Team standup', day: 4, variant: 'accent' },
  { id: 'e2', title: 'Design review', day: 6, variant: 'success' },
  { id: 'e3', title: 'Ship pile v0', day: 11, variant: 'accent' },
  { id: 'e4', title: 'Lunch w/ Sam', day: 14, variant: 'warning' },
  { id: 'e5', title: '1:1 Alex', day: 14, variant: 'neutral' },
  { id: 'e6', title: 'Tax filing', day: 18, variant: 'neutral' },
  { id: 'e7', title: 'Vacation', day: 22, variant: 'success' },
  { id: 'e8', title: 'Vacation', day: 23, variant: 'success' },
  { id: 'e9', title: 'Vacation', day: 24, variant: 'success' },
  { id: 'e10', title: 'Dentist', day: 27, variant: 'warning' },
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const eventVariants: Record<NonNullable<CalendarEvent['variant']>, string> = {
  neutral:
    'bg-muted text-foreground/80 hover:bg-muted/80',
  accent:
    'bg-blue-500/10 text-blue-700 hover:bg-blue-500/15 dark:bg-blue-400/15 dark:text-blue-200 dark:hover:bg-blue-400/20',
  success:
    'bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 dark:bg-emerald-400/15 dark:text-emerald-200 dark:hover:bg-emerald-400/20',
  warning:
    'bg-amber-500/15 text-amber-800 hover:bg-amber-500/20 dark:bg-amber-400/15 dark:text-amber-200 dark:hover:bg-amber-400/20',
};

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
  const [cursor, setCursor] = React.useState(() => new Date());
  const today = React.useMemo(() => new Date(), []);

  const days = React.useMemo(() => {
    const start = startOfMonthGrid(cursor);
    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  }, [cursor]);

  const eventsByDay = React.useMemo(() => {
    const map = new Map<number, CalendarEvent[]>();
    for (const e of SAMPLE_EVENTS) {
      const list = map.get(e.day) ?? [];
      list.push(e);
      map.set(e.day, list);
    }
    return map;
  }, []);

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
                  new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1)
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
                  new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
                )
              }
            >
              <ChevronRight />
            </Button>
          </div>
          <Button size="sm">
            <Plus />
            <span>Event</span>
          </Button>
        </div>
      </header>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="grid grid-cols-7 border-b bg-muted/30">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="px-3 py-2 text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid flex-1 grid-cols-7 grid-rows-6">
          {days.map((date, i) => {
            const inMonth = date.getMonth() === cursor.getMonth();
            const isToday = isSameDay(date, today);
            const events = inMonth
              ? eventsByDay.get(date.getDate()) ?? []
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
                  inMonth && 'hover:bg-muted/40'
                )}
              >
                <div className="flex items-center justify-end">
                  <span
                    className={cn(
                      'flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs tabular-nums',
                      isToday &&
                        'bg-primary text-primary-foreground font-semibold',
                      !isToday && !inMonth && 'text-muted-foreground/40',
                      !isToday && inMonth && 'text-foreground/80'
                    )}
                  >
                    {date.getDate()}
                  </span>
                </div>
                <div className="flex min-h-0 flex-col gap-1 overflow-hidden">
                  {events.map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      title={e.title}
                      className={cn(
                        'truncate rounded-md px-1.5 py-0.5 text-left text-xs font-medium transition-colors',
                        eventVariants[e.variant ?? 'neutral']
                      )}
                    >
                      {e.title}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
