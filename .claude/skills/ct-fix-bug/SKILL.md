---
name: ct-fix-bug
description: Bug diagnosis and fix patterns for Common Thread, covering sync bugs, privacy breaches, offline failures, and Alder Wyn issues. Use when diagnosing or fixing bugs, especially those involving the sync pipeline, data sharing, or offline behavior.
---

# Common Thread Bug Diagnosis & Fix

You are debugging issues in Common Thread, a family wellness app with offline-first dual-database sync (SQLite + Neon), privacy-controlled data sharing, and an AI companion (Alder Wyn).

## Bug Severity Guide

| Severity | Examples | Response |
|----------|----------|----------|
| **Critical** | Data loss during sync, privacy breach (user sees another's private data), Alder Wyn exposes unshared data | Fix immediately |
| **High** | Offline writes not syncing, shared reflections not appearing, sync stuck in 'pending' | Fix within 24h |
| **Medium** | UI glitch, slow query, incorrect health score calculation | Fix within week |
| **Low** | Cosmetic issue, minor text error | Fix when convenient |

## Diagnosis Workflow

1. **Reproduce** — Identify exact steps, note online/offline state
2. **Classify** — Determine bug category (sync, privacy, UI, Alder Wyn, data)
3. **Locate** — Use context-navigator to find relevant code
4. **Root cause** — Identify the actual cause, not just symptoms
5. **Fix** — Route to appropriate specialist agent
6. **Regression test** — Use test-engineer to prevent recurrence
7. **Review** — Use quality-reviewer for privacy/security impact

## Agent Routing by Bug Type

| Bug Type | Primary Agent | Secondary |
|----------|---------------|-----------|
| Sync pipeline (queue, retry, background) | offline-sync-expert | database-sync-expert |
| Schema / query issues | database-sync-expert | — |
| Privacy / data leaking | quality-reviewer | alder-wyn-expert |
| Alder Wyn behavior | alder-wyn-expert | quality-reviewer |
| UI rendering / styling | ui-craftsman | — |
| Navigation / routing | ui-craftsman | context-navigator |
| Performance | quality-reviewer | database-sync-expert |

## Sync Bug Debugging

Sync bugs are the most common and complex category in Common Thread.

### Sync Status State Machine

```
[new record] → pending → synced
                  ↓
               conflict → [user resolves] → synced
```

### Common Sync Issues

#### 1. Records Stuck in 'pending'

**Symptoms:** Data saved locally but never appears in Neon.

**Check:**
```typescript
// Query pending records
const pending = await sqliteDb.getAllAsync(
  "SELECT * FROM reflections WHERE sync_status = 'pending'"
);

// Check sync queue
const queue = await syncQueue.getPending();
```

**Common causes:**
- Sync queue not processing (background task not running)
- Network detection returning false positive for offline
- Neon connection string invalid or expired
- Record fails Neon validation (schema mismatch)

#### 2. Conflict Not Resolving

**Symptoms:** sync_status stuck at 'conflict', user not prompted.

**Check:**
- `server_version` vs `local_version` mismatch
- Conflict resolver not triggering
- UI not showing conflict resolution dialog

#### 3. Duplicate Records After Sync

**Symptoms:** Same record appears twice after coming back online.

**Common causes:**
- UUID generation not deterministic (generating new ID on retry)
- Upsert not used on Neon side (INSERT instead of INSERT ON CONFLICT)
- Sync queue retrying a record that already succeeded

#### 4. Data Loss During Sync

**CRITICAL** — Investigate immediately.

**Check:**
- SQLite write completed before sync attempted
- Neon response parsed correctly (not treating success as failure)
- Conflict resolution not silently dropping local version
- Device clock skew causing incorrect `updated_at` comparison

### Sync Debug Queries

```sql
-- SQLite: Find all unsynced records
SELECT table_name, COUNT(*) FROM (
  SELECT 'reflections' as table_name FROM reflections WHERE sync_status != 'synced'
  UNION ALL
  SELECT 'relationships' FROM relationships WHERE sync_status != 'synced'
) GROUP BY table_name;

-- SQLite: Find conflicts
SELECT * FROM reflections WHERE sync_status = 'conflict';

-- SQLite: Check version mismatches
SELECT id, local_version, server_version
FROM reflections
WHERE local_version != server_version;
```

## Privacy Bug Patterns

### 1. Data Leaking Between Users

**Symptoms:** User sees another user's private reflections or data.

**Check:**
- Every query filters by `user_id` or `userId`
- Shared data checks `is_shareable = true` AND `shared_with` contains viewer's ID
- Family data checks family membership first

**Anti-pattern:**
```typescript
// BAD: No user filter
const reflections = await sqliteDb.getAllAsync('SELECT * FROM reflections');

// GOOD: Always filter by user
const reflections = await sqliteDb.getAllAsync(
  'SELECT * FROM reflections WHERE user_id = ?', [userId]
);
```

### 2. Alder Wyn Seeing Unshared Data

**CRITICAL** — The permission filter MUST run BEFORE context assembly.

**Check:**
```typescript
// CORRECT order:
const filtered = await permissionFilter.filter(data, viewerId); // FIRST
const context = await contextAssembler.build(filtered);          // SECOND
const response = await alderWyn.respond(context);

// WRONG order:
const context = await contextAssembler.build(allData);  // Exposes private data!
const response = await alderWyn.respond(context);
```

### 3. Shared Reflections Visible to Wrong Users

**Check:**
- `shared_with` array contains correct UUIDs
- Sharing UI correctly populates the array
- Unsharing removes the UUID (not just hiding in UI)

## Offline Bug Patterns

### 1. Writes Lost When Offline

**Symptoms:** User enters data offline, data disappears.

**Check:**
- Write goes to SQLite FIRST (not Neon)
- SQLite transaction completes before returning success to UI
- `sync_status` set to `'pending'` on write
- Optimistic UI shows the data immediately

### 2. App Crashes When Offline

**Check:**
- Neon client calls wrapped in try/catch
- Network check before Neon operations
- Fallback to SQLite data when Neon unreachable

### 3. Stale Data After Coming Online

**Check:**
- Sync triggers on network state change
- TanStack Query cache invalidated after sync
- `updated_at` comparison is correct (timezone issues?)

## Regression Test Patterns

After fixing a bug, create tests for:

```typescript
// Sync bugs: Test state transitions
test('record transitions from pending to synced after successful sync', async () => {
  // Create record locally
  // Trigger sync
  // Verify sync_status = 'synced'
});

// Privacy bugs: Test data isolation
test('user cannot see another user private reflections', async () => {
  // Create private reflection for user A
  // Query as user B
  // Verify empty result
});

// Offline bugs: Test offline writes
test('data persists in SQLite when offline', async () => {
  // Simulate offline
  // Write data
  // Verify in SQLite
  // Verify sync_status = 'pending'
});
```

## File Locations for Common Bugs

| Area | Key Files |
|------|-----------|
| Sync engine | `lib/sync/sync-engine.ts`, `lib/sync/queue.ts`, `lib/sync/conflict-resolver.ts` |
| SQLite operations | `lib/sqlite/db.ts` |
| Neon operations | `lib/neon/client.ts` |
| Permission filters | `lib/alder-wyn/permission-filter.ts` |
| Context assembly | `lib/alder-wyn/context-assembler.ts` |
| Hooks (data layer) | `hooks/use-reflections.ts`, `hooks/use-relationships.ts`, etc. |
| Auth | `hooks/use-auth-store.ts`, `lib/neon/auth.ts` |

## When to Use This Skill

Use when:
- Diagnosing any bug in Common Thread
- Sync is not working as expected
- Data appears/disappears unexpectedly
- Privacy concerns about data exposure
- Alder Wyn responds with information it shouldn't have
- Offline behavior is broken
- Records are duplicated or lost

## Success Criteria

- [ ] Root cause identified (not just symptoms fixed)
- [ ] Fix doesn't introduce new sync issues
- [ ] Privacy not degraded by the fix
- [ ] Regression test created
- [ ] Offline behavior verified after fix
- [ ] Quality reviewer approved (for privacy/security bugs)
