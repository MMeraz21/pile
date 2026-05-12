import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';

import { TodoStore } from './main-todo-storage';

const TODOS = {
  listForDate: 'todos:listForDate',
  listInbox: 'todos:listInbox',
  listCompleted: 'todos:listCompleted',
  listForMonth: 'todos:listForMonth',
  create: 'todos:create',
  update: 'todos:update',
  delete: 'todos:delete',
} as const;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

function registerTodosIpc(store: TodoStore): void {
  ipcMain.handle(TODOS.listForDate, (_e, dateKey: unknown) => {
    if (typeof dateKey !== 'string') {
      return Promise.reject(new RangeError('dateKey must be a string'));
    }
    return store.listForDate(dateKey);
  });
  ipcMain.handle(TODOS.listInbox, () => store.listInbox());
  ipcMain.handle(TODOS.listCompleted, () => store.listCompleted());
  ipcMain.handle(
    TODOS.listForMonth,
    (_e, year: unknown, monthIndex: unknown) => {
      if (typeof year !== 'number' || typeof monthIndex !== 'number') {
        return Promise.reject(new RangeError('Invalid month arguments'));
      }
      return store.listForMonth(year, monthIndex);
    },
  );
  ipcMain.handle(TODOS.create, (_e, input: unknown) => {
    if (
      !input ||
      typeof input !== 'object' ||
      typeof (input as { title?: unknown }).title !== 'string' ||
      !('dateKey' in input)
    ) {
      return Promise.reject(new RangeError('Invalid create payload'));
    }
    const { title, dateKey } = input as {
      title: string;
      dateKey: unknown;
    };
    if (dateKey !== null && typeof dateKey !== 'string') {
      return Promise.reject(new RangeError('Invalid dateKey'));
    }
    return store.create({ title, dateKey });
  });
  ipcMain.handle(TODOS.update, (_e, patch: unknown) => {
    if (!patch || typeof patch !== 'object' || typeof (patch as { id?: unknown }).id !== 'string') {
      return Promise.reject(new RangeError('Invalid update payload'));
    }
    return store.update(patch as Parameters<TodoStore['update']>[0]);
  });
  ipcMain.handle(TODOS.delete, (_e, id: unknown) => {
    if (typeof id !== 'string') {
      return Promise.reject(new RangeError('id must be a string'));
    }
    return store.delete(id);
  });
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  mainWindow.webContents.openDevTools();
};

app.whenReady().then(() => {
  const store = new TodoStore(
    path.join(app.getPath('userData'), 'todos.json'),
  );
  registerTodosIpc(store);
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
