/** Calendar day identifier in local time (YYYY-MM-DD). */
export type DateKey = string;

export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  /** `null` = inbox (not scheduled to a calendar day yet). */
  dateKey: DateKey | null;
  createdAt: string;
  updatedAt: string;
};

export type TodosFileV1 = {
  version: 1;
  todos: Todo[];
};

export const DATE_KEY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function toDateKey(date: Date): DateKey {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Parse a date key using local-calendar semantics (midnight local). */
export function parseLocalDateKey(key: string): Date | null {
  const m = DATE_KEY_RE.exec(key.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const day = Number(m[3]);
  const dt = new Date(y, mo, day);
  if (
    dt.getFullYear() !== y ||
    dt.getMonth() !== mo ||
    dt.getDate() !== day
  ) {
    return null;
  }
  return dt;
}
