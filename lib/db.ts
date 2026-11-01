import "server-only";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createSeed } from "./seed";
import type { Activity, Database } from "./types";

/**
 * Tiny JSON-file database. Perfect for a demo / single-server deployment.
 * Data lives in ./data/db.json (or DATA_DIR). If that location is read-only
 * (e.g. serverless), it falls back to the OS temp dir.
 * Swap this module for Postgres / Supabase / Sanity later without touching UI code.
 */
const primary = path.join(process.env.DATA_DIR || path.join(process.cwd(), "data"), "db.json");
const fallback = path.join(os.tmpdir(), "lume-db.json");

type G = typeof globalThis & { __lumeDb?: Database };
const g = globalThis as G;

function readFile(file: string): Database | null {
  try {
    if (!fs.existsSync(file)) return null;
    return JSON.parse(fs.readFileSync(file, "utf8")) as Database;
  } catch {
    return null;
  }
}

function merge(seed: Database, data: Database): Database {
  // keep new keys from seed when schema grows
  return {
    ...seed,
    ...data,
    settings: {
      ...seed.settings,
      ...data.settings,
      brand: { ...seed.settings.brand, ...data.settings?.brand },
      theme: { ...seed.settings.theme, ...data.settings?.theme },
      intro: { ...seed.settings.intro, ...data.settings?.intro },
      nav: { ...seed.settings.nav, ...data.settings?.nav },
      hero: { ...seed.settings.hero, ...data.settings?.hero },
    },
  };
}

export function getDb(): Database {
  if (g.__lumeDb) return g.__lumeDb;
  const seed = createSeed();
  const stored = readFile(fallback) || readFile(primary);
  g.__lumeDb = stored ? merge(seed, stored) : seed;
  return g.__lumeDb;
}

function persist(db: Database) {
  const json = JSON.stringify(db, null, 2);
  try {
    fs.mkdirSync(path.dirname(primary), { recursive: true });
    fs.writeFileSync(primary, json);
  } catch {
    try {
      fs.writeFileSync(fallback, json);
    } catch {
      /* in-memory only */
    }
  }
}

export function mutate(fn: (db: Database) => void, log?: Omit<Activity, "id" | "at">) {
  const db = getDb();
  fn(db);
  if (log) {
    db.activity.unshift({ ...log, id: uid("a"), at: new Date().toISOString() });
    db.activity = db.activity.slice(0, 60);
  }
  persist(db);
  return db;
}

export function resetDb() {
  g.__lumeDb = createSeed();
  persist(g.__lumeDb);
  return g.__lumeDb;
}

export function uid(prefix = "") {
  return `${prefix}${prefix ? "-" : ""}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
