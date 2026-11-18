/**
 * Storage for kept feelings — one `RecordedEmotion` per moment, all of it
 * local (docs/technical-notes.md — Data model).
 *
 * The `logbook` database holds one `recordedEmotions` object store, keyed by
 * `id`. The schema is versioned from the first release: bump `dbVersion` and
 * migrate in `upgrade` here, and document the migration in
 * `docs/technical-notes.md`.
 */
import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { RecordedEmotion } from "~/types/recordedEmotion";

interface LogbookSchema extends DBSchema {
  recordedEmotions: {
    key: string;
    value: RecordedEmotion;
  };
}

const dbVersion = 1;

let dbPromise: Promise<IDBPDatabase<LogbookSchema>> | undefined;

function openLogbookDb(): Promise<IDBPDatabase<LogbookSchema>> {
  dbPromise ??= openDB<LogbookSchema>("logbook", dbVersion, {
    upgrade(db) {
      db.createObjectStore("recordedEmotions", { keyPath: "id" });
    },
  });
  return dbPromise;
}

/** A fresh keep: the moment is now, and so is the recording. */
export function createRecordedEmotion(emotionId: string): RecordedEmotion {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    emotionId,
    occurredAt: now,
    createdAt: now
  };
}

/** Save a kept feeling — creates it, or replaces it on an edit. */
export async function saveRecordedEmotion(
  record: RecordedEmotion
): Promise<void> {
  const db = await openLogbookDb();
  await db.put("recordedEmotions", record);
}

/** One kept feeling by id, or undefined when it isn't there. */
export async function getRecordedEmotion(
  id: string
): Promise<RecordedEmotion | undefined> {
  const db = await openLogbookDb();
  return db.get("recordedEmotions", id);
}

/** All kept feelings, newest moment first. */
export async function getRecordedEmotions(): Promise<RecordedEmotion[]> {
  const db = await openLogbookDb();
  const records = await db.getAll("recordedEmotions");
  return records.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
}

/** Let a kept feeling go. */
export async function deleteRecordedEmotion(id: string): Promise<void> {
  const db = await openLogbookDb();
  await db.delete("recordedEmotions", id);
}
