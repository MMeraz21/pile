import { contextBridge, ipcRenderer } from 'electron';

import type { Todo } from './todos-schema';

const CHANNELS = {
  listForDate: 'todos:listForDate',
  listInbox: 'todos:listInbox',
  listCompleted: 'todos:listCompleted',
  listForMonth: 'todos:listForMonth',
  create: 'todos:create',
  update: 'todos:update',
  delete: 'todos:delete',
} as const;

contextBridge.exposeInMainWorld('pileTodos', {
  listForDate: (dateKey: string) =>
    ipcRenderer.invoke(CHANNELS.listForDate, dateKey),
  listInbox: () => ipcRenderer.invoke(CHANNELS.listInbox),
  listCompleted: () => ipcRenderer.invoke(CHANNELS.listCompleted),
  listForMonth: (year: number, monthIndex: number) =>
    ipcRenderer.invoke(CHANNELS.listForMonth, year, monthIndex),
  create: (input: { title: string; dateKey: string | null }) =>
    ipcRenderer.invoke(CHANNELS.create, input),
  update: (
    patch: Pick<Todo, 'id'> &
      Partial<Pick<Todo, 'title' | 'completed' | 'dateKey'>>,
  ) => ipcRenderer.invoke(CHANNELS.update, patch),
  delete: (id: string) => ipcRenderer.invoke(CHANNELS.delete, id),
});
