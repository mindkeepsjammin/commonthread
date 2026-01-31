---
name: ct-add-feature
description: Feature development patterns for Common Thread's dual-database (SQLite + Neon), offline-first, privacy-first architecture. Use when adding new features that involve data models, hooks, UI components, or Alder Wyn integration.
---

# Common Thread Feature Development

You are implementing features for Common Thread, a family wellness app with offline-first dual-database architecture (SQLite + Neon), privacy-first data sharing, and an AI companion (Alder Wyn) that follows mirror-ship principles.

## Feature Development Phases

Every non-trivial feature follows this sequence:

1. **Context** — Understand existing patterns (use context-navigator agent)
2. **UX Design** — Design interaction before building (use ux-designer agent, then ui-craftsman)
3. **Database** — Design schemas for BOTH SQLite and Neon (use database-sync-expert agent)
4. **Data Layer** — Hooks, sync logic, validation (use offline-sync-expert for sync concerns)
5. **UI** — Components with all states (use ui-craftsman agent)
6. **Tests** — Sync, privacy, offline scenarios (use test-engineer agent)
7. **Review** — Privacy audit + quality check (use quality-reviewer agent)
8. **Docs** — Update CLAUDE.md if architecture changed

## Agent Routing

| Phase | Agent | When |
|-------|-------|------|
| Find existing code | context-navigator | Always first |
| UX research/design | ux-designer | Before UI for non-trivial features |
| Schema design | database-sync-expert | Any new tables or columns |
| Sync pipeline | offline-sync-expert | Background sync, conflict resolution, retry logic |
| React Native UI | ui-craftsman | Components, forms, screens |
| Alder Wyn changes | alder-wyn-expert | ANY AI companion changes |
| Testing | test-engineer | After implementation |
| Code review | quality-reviewer | After significant changes |

## Dual-Database Schema Design

Every data model needs BOTH a SQLite schema and a Neon schema:

### SQLite Schema (Local — Offline-First)

```typescript
// lib/sqlite/db.ts
await db.execAsync(`
  CREATE TABLE IF NOT EXISTS reflections (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    mood_score INTEGER,
    is_shareable INTEGER DEFAULT 0,
    shared_with TEXT DEFAULT '[]',
    -- Sync metadata (required on ALL tables)
    sync_status TEXT DEFAULT 'pending',
    updated_at TEXT DEFAULT (datetime('now')),
    device_id TEXT,
    server_version INTEGER DEFAULT 0,
    local_version INTEGER DEFAULT 1
  );
`);
```

### Neon Schema (Remote — Cloud Backup)

```sql
-- neon/migrations/00X_create_reflections.sql
CREATE TABLE reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  mood_score INTEGER CHECK (mood_score BETWEEN 1 AND 10),
  is_shareable BOOLEAN DEFAULT FALSE,
  shared_with UUID[] DEFAULT '{}',
  -- Sync metadata
  sync_status TEXT DEFAULT 'synced',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  device_id TEXT,
  server_version INTEGER DEFAULT 1,
  local_version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reflections_user ON reflections(user_id);
CREATE INDEX idx_reflections_sync ON reflections(sync_status);
```

### Required Sync Metadata Columns

Every new table MUST include:

| Column | SQLite Type | Neon Type | Purpose |
|--------|-------------|-----------|---------|
| `sync_status` | TEXT | TEXT | 'pending' / 'synced' / 'conflict' |
| `updated_at` | TEXT | TIMESTAMPTZ | Last modification time |
| `device_id` | TEXT | TEXT | Which device made the change |
| `server_version` | INTEGER | INTEGER | Server-side version counter |
| `local_version` | INTEGER | INTEGER | Client-side version counter |

## Offline-First Write Pattern

All writes go to SQLite FIRST, then sync to Neon in background:

```typescript
// hooks/use-reflections.ts
const createReflection = async (data: ReflectionCreateInput) => {
  const id = generateUUID();

  // 1. Write to SQLite immediately (works offline)
  await sqliteDb.runAsync(
    `INSERT INTO reflections (id, user_id, content, mood_score, sync_status, device_id)
     VALUES (?, ?, ?, ?, 'pending', ?)`,
    [id, userId, data.content, data.moodScore, deviceId]
  );

  // 2. Queue for background sync to Neon
  syncQueue.enqueue({
    table: 'reflections',
    operation: 'INSERT',
    recordId: id,
    data: { ...data, id, userId }
  });

  // 3. Return immediately (optimistic UI)
  return { id, ...data, syncStatus: 'pending' };
};
```

## Privacy Checklist (Every Feature)

Before completing any feature, verify:

- [ ] `is_shareable` checked before exposing data to other users
- [ ] `shared_with` array validated before access
- [ ] Permission filter runs BEFORE Alder Wyn context assembly
- [ ] User can only access their own data (userId checks)
- [ ] Family membership verified before family data access
- [ ] No sensitive data in console.log or error messages
- [ ] Auth tokens stored in Expo Secure Store (not AsyncStorage)
- [ ] Child accounts (COPPA) have restricted access

## UI Component Patterns

### Required States for Every Screen

```tsx
// Every data-driven screen needs these 4 states:
const ReflectionList = () => {
  const { data, isLoading, error } = useReflections();
  const { isOnline } = useOffline();

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorState onRetry={refetch} />;
  if (!data?.length) return <EmptyState message="No reflections yet" />;

  return (
    <>
      {!isOnline && <OfflineBanner />}
      <FlatList
        data={data}
        renderItem={({ item }) => <ReflectionCard reflection={item} />}
        keyExtractor={(item) => item.id}
      />
    </>
  );
};
```

### Component Standards

- Use **React Native Paper** for inputs, buttons, dialogs, cards
- Use **NativeWind** (Tailwind classes) for styling — no inline styles
- Use **FlatList** for lists (never ScrollView + map)
- Use **path aliases** (`@/components/...`) — never relative imports
- Add **accessibility props** on all interactive elements
- Memoize list items with `React.memo` when appropriate

## Hook Pattern

```typescript
// hooks/use-{feature}.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useReflections = () => {
  return useQuery({
    queryKey: ['reflections'],
    queryFn: async () => {
      // Read from SQLite (offline-first)
      return sqliteDb.getAllAsync<Reflection>(
        'SELECT * FROM reflections WHERE user_id = ? ORDER BY updated_at DESC',
        [userId]
      );
    },
  });
};
```

## Validation Pattern

```typescript
// lib/validations/reflection.ts
import { z } from 'zod';

export const reflectionCreateSchema = z.object({
  content: z.string().min(1).max(5000),
  moodScore: z.number().int().min(1).max(10).optional(),
  isShareable: z.boolean().default(false),
  sharedWith: z.array(z.string().uuid()).default([]),
});

export type ReflectionCreateInput = z.infer<typeof reflectionCreateSchema>;
```

## When to Use This Skill

Use when:
- Adding a new data model / table
- Creating a new screen or feature
- Building hooks that read/write data
- Integrating with Alder Wyn
- Adding sharing or family features
- Any feature touching the sync pipeline

## Success Criteria

- [ ] Both SQLite and Neon schemas designed with sync metadata
- [ ] Writes go to SQLite first (offline-first)
- [ ] Privacy checklist passes
- [ ] All 4 UI states handled (loading, error, empty, offline)
- [ ] Zod validation on all inputs
- [ ] Path aliases used throughout
- [ ] No `any` types in TypeScript
- [ ] Accessibility props on interactive elements
