import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';

import type { DateKey, Todo, TodosFileV1 } from './todos-schema';
import { DATE_KEY_RE, parseLocalDateKey } from './todos-schema';

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isValidTodo(t: unknown): t is Todo {
  if (!isPlainObject(t)) return false;
  const dk = t.dateKey;
  const dateOk =
    dk === null ||
    (typeof dk === 'string' && DATE_KEY_RE.test(dk) && !!parseLocalDateKey(dk));
  return (
    typeof t.id === 'string' &&
    typeof t.title === 'string' &&
    typeof t.completed === 'boolean' &&
    dateOk &&
    typeof t.createdAt === 'string' &&
    typeof t.updatedAt === 'string'
  );
}

function sortForWorklists(a: Todo, b: Todo): number {
  if (a.completed !== b.completed) return a.completed ? 1 : -1;
  return a.createdAt.localeCompare(b.createdAt);
}

export class TodoStore {
  constructor(private readonly filePath: string) {}

  private mutex = Promise.resolve();

  private withLock<T>(fn: () => Promise<T>): Promise<T> {
    const task = this.mutex.then(fn);
    this.mutex = task.then(
      () => undefined,
      () => undefined,
    );
    return task;
  }

  private async readAll(): Promise<Todo[]> {
    try {
      const raw = await fs.readFile(this.filePath, 'utf-8');
      const parsed: unknown = JSON.parse(raw);
      if (
        !isPlainObject(parsed) ||
        parsed.version !== 1 ||
        !Array.isArray(parsed.todos)
      ) {
        return [];
      }
      return parsed.todos.filter(isValidTodo);
    } catch (e: unknown) {
      const code = isPlainObject(e) ? e.code : undefined;
      if (code === 'ENOENT') return [];
      throw e;
    }
  }

  private async writeAll(todos: Todo[]): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    const body: TodosFileV1 = { version: 1, todos };
    await fs.writeFile(this.filePath, JSON.stringify(body, null, 2), 'utf-8');
  }

  async listForDate(dateKey: string): Promise<Todo[]> {
    if (!DATE_KEY_RE.test(dateKey) || !parseLocalDateKey(dateKey)) {
      throw new RangeError('Invalid dateKey');
    }
    return this.withLock(async () => {
      const todos = await this.readAll();
      return todos
        .filter((t) => t.dateKey === dateKey)
        .slice()
        .sort(sortForWorklists);
    });
  }

  async listInbox(): Promise<Todo[]> {
    return this.withLock(async () => {
      const todos = await this.readAll();
      return todos
        .filter((t) => t.dateKey === null)
        .slice()
        .sort(sortForWorklists);
    });
  }

  async listCompleted(): Promise<Todo[]> {
    return this.withLock(async () => {
      const todos = await this.readAll();
      return todos
        .filter((t) => t.completed)
        .slice()
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .slice(0, 500);
    });
  }

  async listForMonth(year: number, monthIndex: number): Promise<Todo[]> {
    return this.withLock(async () => {
      const todos = await this.readAll();
      return todos.filter((t) => {
        if (!t.dateKey || t.completed) return false;
        const d = parseLocalDateKey(t.dateKey);
        return !!d && d.getFullYear() === year && d.getMonth() === monthIndex;
      });
    });
  }

  async create(input: {
    title: string;
    dateKey: DateKey | null;
  }): Promise<Todo> {
    const title = input.title.trim();
    if (!title) throw new RangeError('Title is required');
    let dateKey = input.dateKey;
    if (dateKey !== null) {
      dateKey = dateKey.trim();
      if (!DATE_KEY_RE.test(dateKey) || !parseLocalDateKey(dateKey)) {
        throw new RangeError('Invalid dateKey');
      }
    }
    const now = new Date().toISOString();
    const todo: Todo = {
      id: randomUUID(),
      title,
      completed: false,
      dateKey,
      createdAt: now,
      updatedAt: now,
    };
    await this.withLock(async () => {
      const todos = await this.readAll();
      todos.push(todo);
      await this.writeAll(todos);
    });
    return todo;
  }

  async update(patch: {
    id: string;
    title?: string;
    completed?: boolean;
    dateKey?: DateKey | null;
  }): Promise<Todo> {
    return this.withLock(async () => {
      const todos = await this.readAll();
      const i = todos.findIndex((t) => t.id === patch.id);
      if (i === -1) throw new RangeError('Todo not found');
      const cur = todos[i];
      const nextTitle =
        patch.title !== undefined ? patch.title.trim() : cur.title;
      if (!nextTitle) throw new RangeError('Title is required');

      let nextDateKey = cur.dateKey;
      if (patch.dateKey !== undefined) {
        nextDateKey = patch.dateKey;
        if (nextDateKey !== null) {
          if (
            !DATE_KEY_RE.test(nextDateKey) ||
            !parseLocalDateKey(nextDateKey)
          ) {
            throw new RangeError('Invalid dateKey');
          }
        }
      }

      const now = new Date().toISOString();
      const next: Todo = {
        ...cur,
        title: nextTitle,
        completed: patch.completed ?? cur.completed,
        dateKey: nextDateKey,
        updatedAt: now,
      };
      todos[i] = next;
      await this.writeAll(todos);
      return next;
    });
  }

  async delete(id: string): Promise<void> {
    await this.withLock(async () => {
      const todos = await this.readAll();
      const next = todos.filter((t) => t.id !== id);
      if (next.length === todos.length) {
        throw new RangeError('Todo not found');
      }
      await this.writeAll(next);
    });
  }
}
