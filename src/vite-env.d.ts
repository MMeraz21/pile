/// <reference types="vite/client" />

import type { PileTodosApi } from '@/lib/todos-bridge';

declare global {
  interface Window {
    pileTodos?: PileTodosApi;
  }
}

export {};
