import type { DateKey, Todo } from '@/todos-schema';

export type PileTodosApi = {
  listForDate: (dateKey: string) => Promise<Todo[]>;
  listInbox: () => Promise<Todo[]>;
  listCompleted: () => Promise<Todo[]>;
  listForMonth: (year: number, monthIndex: number) => Promise<Todo[]>;
  create: (input: { title: string; dateKey: DateKey | null }) => Promise<Todo>;
  update: (
    patch: Pick<Todo, 'id'> &
      Partial<Pick<Todo, 'title' | 'completed' | 'dateKey'>>,
  ) => Promise<Todo>;
  delete: (id: string) => Promise<void>;
};

export function getTodosApi(): PileTodosApi | undefined {
  return typeof window !== 'undefined'
    ? (window.pileTodos as PileTodosApi | undefined)
    : undefined;
}
