---
name: ct-dual-migration
description: Dual-database migration patterns for Common Thread's SQLite (local) + Neon (remote) architecture. Use when adding or modifying tables, columns, or indexes in either database, or when planning schema changes that must stay in sync across both databases.
---

# Common Thread Dual-Database Migration

Common Thread uses two databases that must stay in schema parity:
- **SQLite** (local, on-device) — offline-first, immediate reads/writes
- **Neon** (remote, serverless Postgres) — cloud backup, cross-device sync

Every schema change requires migration in BOTH databases.

## File Locations

| Database | Schema/Migration Location |
|----------|--------------------------|
| SQLite schema | `lib/sqlite/db.ts` (CREATE TABLE statements) |
| SQLite migrations | `lib/sqlite/migrations/` (ALTER statements) |
| Neon migrations | `neon/migrations/` (SQL files, numbered) |
| Neon seed data | `neon/seed.sql` |

## Migration Workflow

### 1. Design Schema Change

Use **database-sync-expert** agent to design the change for both databases.

### 2. Create Neon Migration FIRST

```sql
-- neon/migrations/00X_add_mood_score.sql
ALTER TABLE reflections ADD COLUMN mood_score INTEGER;
CREATE INDEX idx_reflections_mood ON reflections(user_id, mood_score);
```

Deploy to Neon before app update so the remote schema is ready when devices sync.

### 3. Create SQLite Migration

```typescript
// lib/sqlite/migrations/00X_add_mood_score.ts
export const migration_00X = {
  version: X,
  up: async (db: SQLiteDatabase) => {
    await db.execAsync(
      'ALTER TABLE reflections ADD COLUMN mood_score INTEGER'
    );
  },
};
```

SQLite migration runs automatically on app launch (version check).

### 4. Update SQLite Schema Definition

Also update the CREATE TABLE in `lib/sqlite/db.ts` so new installs get the correct schema:

```typescript
// lib/sqlite/db.ts — update the CREATE TABLE to include new column
await db.execAsync(`
  CREATE TABLE IF NOT EXISTS reflections (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    mood_score INTEGER,          -- NEW
    sync_status TEXT DEFAULT 'pending',
    ...
  );
`);
```

### 5. Deploy

1. Deploy Neon migration (remote schema ready)
2. Release app update (SQLite migrates on first launch)
3. Monitor sync health

## SQLite Constraints

SQLite has limited ALTER TABLE support:

| Operation | Supported? | Workaround |
|-----------|-----------|------------|
| ADD COLUMN | Yes | Direct ALTER TABLE |
| DROP COLUMN | SQLite 3.35+ only | Recreate table if older |
| RENAME COLUMN | SQLite 3.25+ | Recreate table if older |
| Change column type | No | Recreate table |
| Add NOT NULL without default | No | Add with DEFAULT, then update |
| Add FOREIGN KEY | No | Recreate table |

### Table Recreate Pattern (for unsupported ALTERs)

```typescript
export const migration_00X = {
  version: X,
  up: async (db: SQLiteDatabase) => {
    await db.execAsync(`
      -- 1. Create new table with desired schema
      CREATE TABLE reflections_new (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        mood_score INTEGER NOT NULL DEFAULT 0,
        sync_status TEXT DEFAULT 'pending',
        updated_at TEXT DEFAULT (datetime('now'))
      );

      -- 2. Copy data
      INSERT INTO reflections_new (id, content, sync_status, updated_at)
      SELECT id, content, sync_status, updated_at FROM reflections;

      -- 3. Drop old table
      DROP TABLE reflections;

      -- 4. Rename new table
      ALTER TABLE reflections_new RENAME TO reflections;

      -- 5. Recreate indexes
      CREATE INDEX idx_reflections_sync ON reflections(sync_status);
    `);
  },
};
```

## Neon Migration Patterns

Neon is full Postgres, so all standard DDL works:

```sql
-- Add column with constraint
ALTER TABLE reflections ADD COLUMN mood_score INTEGER CHECK (mood_score BETWEEN 1 AND 10);

-- Add column with default
ALTER TABLE reflections ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();

-- Drop column
ALTER TABLE reflections DROP COLUMN IF EXISTS legacy_field;

-- Rename column
ALTER TABLE reflections RENAME COLUMN old_name TO new_name;

-- Add index
CREATE INDEX CONCURRENTLY idx_reflections_mood ON reflections(user_id, mood_score);

-- Add foreign key
ALTER TABLE reflections ADD CONSTRAINT fk_user
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
```

## Schema Parity Rules

Both databases MUST have equivalent schemas (adjusted for type differences):

| SQLite Type | Neon (Postgres) Type |
|-------------|---------------------|
| TEXT | TEXT / VARCHAR |
| INTEGER | INTEGER / BIGINT |
| REAL | FLOAT / DOUBLE PRECISION |
| TEXT (ISO date) | TIMESTAMPTZ |
| TEXT (JSON string) | JSONB |
| INTEGER (0/1) | BOOLEAN |
| TEXT (UUID string) | UUID |
| TEXT (array as JSON) | UUID[] / TEXT[] |

## Required Sync Metadata

Every new table MUST include these columns in BOTH databases:

```sql
-- Neon version
sync_status TEXT DEFAULT 'synced',
updated_at TIMESTAMPTZ DEFAULT NOW(),
device_id TEXT,
server_version INTEGER DEFAULT 1,
local_version INTEGER DEFAULT 1
```

```sql
-- SQLite version
sync_status TEXT DEFAULT 'pending',
updated_at TEXT DEFAULT (datetime('now')),
device_id TEXT,
server_version INTEGER DEFAULT 0,
local_version INTEGER DEFAULT 1
```

Note: SQLite defaults to `'pending'` (needs sync), Neon defaults to `'synced'` (server is source of truth).

## Handling Pending Syncs During Migration

If records are in `sync_status = 'pending'` when a migration runs:

1. **SQLite migration** — Runs on device, pending records get new columns with defaults
2. **Neon migration** — Runs on server, pending records will sync with new columns after migration
3. **Key rule:** New columns must have defaults or be nullable, otherwise pending syncs will fail

```sql
-- SAFE: New column is nullable
ALTER TABLE reflections ADD COLUMN mood_score INTEGER;

-- SAFE: New column has default
ALTER TABLE reflections ADD COLUMN mood_score INTEGER DEFAULT 0;

-- UNSAFE: Required column without default breaks pending syncs
ALTER TABLE reflections ADD COLUMN mood_score INTEGER NOT NULL;
```

## Rollback Procedures

### Rollback Neon

```sql
-- neon/migrations/00X_add_mood_score_down.sql
ALTER TABLE reflections DROP COLUMN IF EXISTS mood_score;
DROP INDEX IF EXISTS idx_reflections_mood;
```

### Rollback SQLite

SQLite doesn't support DROP COLUMN on older versions. Options:
1. Table recreate (copy data, drop old, rename new)
2. Leave column in place (harmless, ignored by app code)
3. Release new app version with corrected schema

### Rollback Order

1. Release previous app version (or hotfix) — stops SQLite migration
2. Rollback Neon migration — restores server schema
3. Mark affected pending syncs as needing re-sync

## New Table Template

When creating an entirely new table:

```sql
-- neon/migrations/00X_create_gratitudes.sql
CREATE TABLE gratitudes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  -- Feature-specific columns
  relationship_id UUID REFERENCES relationships(id),
  is_shareable BOOLEAN DEFAULT FALSE,
  shared_with UUID[] DEFAULT '{}',
  -- Sync metadata (REQUIRED)
  sync_status TEXT DEFAULT 'synced',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  device_id TEXT,
  server_version INTEGER DEFAULT 1,
  local_version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gratitudes_user ON gratitudes(user_id);
CREATE INDEX idx_gratitudes_sync ON gratitudes(sync_status);
CREATE INDEX idx_gratitudes_relationship ON gratitudes(relationship_id);
```

```typescript
// lib/sqlite/db.ts — add to initialization
await db.execAsync(`
  CREATE TABLE IF NOT EXISTS gratitudes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    relationship_id TEXT,
    is_shareable INTEGER DEFAULT 0,
    shared_with TEXT DEFAULT '[]',
    sync_status TEXT DEFAULT 'pending',
    updated_at TEXT DEFAULT (datetime('now')),
    device_id TEXT,
    server_version INTEGER DEFAULT 0,
    local_version INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_gratitudes_user ON gratitudes(user_id);
  CREATE INDEX IF NOT EXISTS idx_gratitudes_sync ON gratitudes(sync_status);
`);
```

## When to Use This Skill

Use when:
- Adding a new table to the app
- Adding or modifying columns
- Adding indexes
- Changing data types or constraints
- Planning any schema change
- Debugging schema parity issues between SQLite and Neon

## Success Criteria

- [ ] Both SQLite AND Neon schemas updated
- [ ] Schemas are equivalent (accounting for type differences)
- [ ] Sync metadata columns present on new tables
- [ ] New columns are nullable or have defaults (for pending sync safety)
- [ ] Neon migration deployed before app update
- [ ] SQLite CREATE TABLE in db.ts updated for new installs
- [ ] Rollback plan documented
- [ ] Existing pending syncs won't break
