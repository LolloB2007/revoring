/**
 * File-backed store. One JSON file per table, kept in `data/`.
 * Used in local dev and any persistent-disk host. NOT used on Vercel
 * (filesystem is read-only at runtime).
 */
import { promises as fs } from "node:fs";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import type { StoreApi, Predicate } from "./types";

const DATA_DIR = path.resolve(process.cwd(), "data");
if (!existsSync(DATA_DIR)) {
  try { mkdirSync(DATA_DIR, { recursive: true }); } catch { /* read-only fs on prod */ }
}

const locks = new Map<string, Promise<void>>();

async function withLock<T>(file: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(file) ?? Promise.resolve();
  let release!: () => void;
  const next = new Promise<void>((res) => (release = res));
  locks.set(file, prev.then(() => next));
  await prev;
  try {
    return await fn();
  } finally {
    release();
    if (locks.get(file) === next) locks.delete(file);
  }
}

function fileFor(table: string): string {
  return path.join(DATA_DIR, `${table}.json`);
}

async function readTable<T>(table: string): Promise<T[]> {
  const file = fileFor(table);
  try {
    const raw = await fs.readFile(file, "utf8");
    if (!raw.trim()) return [];
    return JSON.parse(raw, dateReviver) as T[];
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw e;
  }
}

async function writeTable<T>(table: string, rows: T[]): Promise<void> {
  const file = fileFor(table);
  const tmp = `${file}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(rows, null, 2));
  await fs.rename(tmp, file);
}

function dateReviver(_: string, value: unknown): unknown {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return value;
}

export const fileStore: StoreApi = {
  async all<T>(table: string): Promise<T[]> {
    return readTable<T>(table);
  },
  async findOne<T>(table: string, p: Predicate<T>): Promise<T | undefined> {
    const rows = await readTable<T>(table);
    return rows.find(p);
  },
  async findMany<T>(table: string, p?: Predicate<T>): Promise<T[]> {
    const rows = await readTable<T>(table);
    return p ? rows.filter(p) : rows;
  },
  async insert<T>(table: string, row: T): Promise<T> {
    return withLock(fileFor(table), async () => {
      const rows = await readTable<T>(table);
      rows.push(row);
      await writeTable(table, rows);
      return row;
    });
  },
  async insertMany<T>(table: string, newRows: T[]): Promise<T[]> {
    return withLock(fileFor(table), async () => {
      const rows = await readTable<T>(table);
      rows.push(...newRows);
      await writeTable(table, rows);
      return newRows;
    });
  },
  async updateWhere<T>(
    table: string,
    p: Predicate<T>,
    patch: Partial<T> | ((row: T) => Partial<T>),
  ): Promise<number> {
    return withLock(fileFor(table), async () => {
      const rows = await readTable<T>(table);
      let count = 0;
      for (let i = 0; i < rows.length; i++) {
        if (p(rows[i])) {
          const p2 = typeof patch === "function" ? patch(rows[i]) : patch;
          rows[i] = { ...rows[i], ...p2 };
          count++;
        }
      }
      if (count) await writeTable(table, rows);
      return count;
    });
  },
  async upsert<T>(
    table: string,
    p: Predicate<T>,
    factory: () => T,
    patch?: Partial<T> | ((row: T) => Partial<T>),
  ): Promise<T> {
    return withLock(fileFor(table), async () => {
      const rows = await readTable<T>(table);
      const idx = rows.findIndex(p);
      let result: T;
      if (idx >= 0) {
        const p2 = patch ? (typeof patch === "function" ? patch(rows[idx]) : patch) : {};
        rows[idx] = { ...rows[idx], ...p2 };
        result = rows[idx];
      } else {
        result = factory();
        rows.push(result);
      }
      await writeTable(table, rows);
      return result;
    });
  },
  async deleteWhere<T>(table: string, p: Predicate<T>): Promise<number> {
    return withLock(fileFor(table), async () => {
      const rows = await readTable<T>(table);
      const next = rows.filter((r) => !p(r));
      const removed = rows.length - next.length;
      if (removed) await writeTable(table, next);
      return removed;
    });
  },
  async replaceAll<T>(table: string, rows: T[]): Promise<void> {
    return withLock(fileFor(table), () => writeTable(table, rows));
  },
};
