import * as SQLite from 'expo-sqlite';

const DB_NAME = 'common_thread.db';
const DATABASE_VERSION = 1;

let db: SQLite.SQLiteDatabase | null = null;

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!db) {
    db = await SQLite.openDatabaseAsync(DB_NAME);

    // Enable WAL mode for better performance
    await db.execAsync('PRAGMA journal_mode = WAL;');

    // Run migrations
    await runMigrations(db);
  }
  return db;
};

const runMigrations = async (database: SQLite.SQLiteDatabase): Promise<void> => {
  // Create migration tracking table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY,
      version INTEGER NOT NULL,
      applied_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Get current version
  const result = await database.getFirstAsync<{ version: number }>(
    'SELECT MAX(version) as version FROM migrations'
  );
  const currentVersion = result?.version ?? 0;

  if (currentVersion < DATABASE_VERSION) {
    await applyMigrations(database, currentVersion);
  }
};

const applyMigrations = async (
  database: SQLite.SQLiteDatabase,
  fromVersion: number
): Promise<void> => {
  // Migration 1: Initial schema
  if (fromVersion < 1) {
    await database.execAsync(`
      -- Local reflections table
      CREATE TABLE IF NOT EXISTS local_reflections (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        family_id TEXT,
        type TEXT CHECK (type IN ('journal', 'check_in', 'exercise', 'prompt_response')),
        content TEXT NOT NULL,
        mood_score INTEGER CHECK (mood_score BETWEEN 1 AND 10),
        is_shareable INTEGER DEFAULT 0,
        shared_with TEXT DEFAULT '[]',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'conflict')),
        last_synced_at TEXT,
        local_version INTEGER DEFAULT 1,
        server_version INTEGER
      );

      -- Local profiles cache
      CREATE TABLE IF NOT EXISTS local_profiles (
        id TEXT PRIMARY KEY,
        display_name TEXT NOT NULL,
        avatar_url TEXT,
        role TEXT,
        sync_status TEXT DEFAULT 'synced',
        last_synced_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- Sync queue for pending operations
      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_name TEXT NOT NULL,
        record_id TEXT NOT NULL,
        operation TEXT CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
        payload TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        retry_count INTEGER DEFAULT 0,
        last_error TEXT
      );

      -- Alder Wyn conversation cache
      CREATE TABLE IF NOT EXISTS local_conversations (
        id TEXT PRIMARY KEY,
        context_type TEXT NOT NULL,
        context_id TEXT,
        messages TEXT DEFAULT '[]',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_reflections_user_id ON local_reflections(user_id);
      CREATE INDEX IF NOT EXISTS idx_reflections_sync_status ON local_reflections(sync_status);
      CREATE INDEX IF NOT EXISTS idx_sync_queue_table ON sync_queue(table_name);
    `);

    // Record migration
    await database.runAsync('INSERT INTO migrations (version) VALUES (?)', DATABASE_VERSION);
  }
};

export const closeDatabase = async (): Promise<void> => {
  if (db) {
    await db.closeAsync();
    db = null;
  }
};
