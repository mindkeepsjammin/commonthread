---
name: ct-quality-check
description: Quality validation and pre-commit checklist for Common Thread, covering privacy/security, offline-first compliance, React Native standards, and common anti-patterns. Use when reviewing code, preparing to commit, or auditing for quality issues.
---

# Common Thread Quality Check

Quality patterns and checklists for Common Thread. Use this before committing code or when reviewing changes for privacy, security, offline-first compliance, and React Native best practices.

## Quick Check Process

1. Identify changed files
2. Scan for critical issues (privacy, security, sync)
3. Run automated checks (`pnpm typecheck && pnpm lint`)
4. Determine: PASS / PASS WITH WARNINGS / FAIL

## Critical Issues Checklist

### Privacy & Security (CRITICAL — must fix before commit)

- [ ] **Permission filter before Alder Wyn context** — `permissionFilter.filter()` runs BEFORE `contextAssembler.build()`
- [ ] **is_shareable checked** — No shared data exposed without `is_shareable = true`
- [ ] **shared_with validated** — Viewer's UUID must be in array before access
- [ ] **userId filter on all queries** — Every data query includes `WHERE user_id = ?`
- [ ] **Family membership verified** — Family data requires membership check
- [ ] **No hardcoded secrets** — API keys in `.env`, not in code
- [ ] **Auth tokens in Secure Store** — Never in AsyncStorage or plain storage
- [ ] **No sensitive data in logs** — No user content, tokens, or PII in console.log
- [ ] **Child account restrictions** — COPPA compliance for child role

### Offline-First & Sync (HIGH — must fix before commit)

- [ ] **SQLite writes first** — All data writes go to SQLite before Neon
- [ ] **sync_status = 'pending'** — Set on every local write
- [ ] **Sync metadata included** — New tables have sync_status, updated_at, device_id, server_version, local_version
- [ ] **Neon calls wrapped in try/catch** — Network failures handled gracefully
- [ ] **Optimistic UI** — Data shows immediately from SQLite, not waiting for Neon

### TypeScript & Code Quality (MEDIUM)

- [ ] **No `any` types** — Use proper interfaces
- [ ] **No console.log in production** — Remove debug logs
- [ ] **Error handling on async** — All async calls in try/catch
- [ ] **Zod validation on inputs** — User inputs validated with Zod schemas
- [ ] **Types from centralized location** — Import from `@/types`

### React Native Standards (MEDIUM)

- [ ] **React Native Paper components** — Buttons, inputs, cards, dialogs from Paper
- [ ] **NativeWind classes** — No inline styles (`style={{ }}`)
- [ ] **FlatList for lists** — Not ScrollView + .map()
- [ ] **Path aliases** — `@/components/...` not `../../components/...`
- [ ] **Accessibility props** — `accessibilityLabel`, `accessibilityRole` on interactive elements
- [ ] **All 4 states handled** — Loading, error, empty, offline states in data screens
- [ ] **Memoization** — React.memo on list items, useCallback on handlers in lists

### Quick Wins (LOW — nice to fix)

- [ ] No commented-out code blocks
- [ ] No unused imports
- [ ] Consistent formatting

## Anti-Patterns & Corrections

### Privacy Anti-Patterns

```typescript
// BAD: No user filter — exposes all users' data
const reflections = await db.getAllAsync('SELECT * FROM reflections');

// GOOD: Always filter by user
const reflections = await db.getAllAsync(
  'SELECT * FROM reflections WHERE user_id = ?', [userId]
);
```

```typescript
// BAD: Context assembled before permission filter
const context = await contextAssembler.build(allUserData);
const response = await alderWyn.respond(context);

// GOOD: Filter first, then assemble
const safe = await permissionFilter.filter(allUserData, viewerId);
const context = await contextAssembler.build(safe);
const response = await alderWyn.respond(context);
```

### Offline-First Anti-Patterns

```typescript
// BAD: Remote-first write — fails when offline
const result = await neonClient.query(
  'INSERT INTO reflections (content) VALUES ($1)', [content]
);

// GOOD: SQLite-first write — works offline
await sqliteDb.runAsync(
  'INSERT INTO reflections (id, content, sync_status) VALUES (?, ?, ?)',
  [id, content, 'pending']
);
syncQueue.enqueue({ table: 'reflections', operation: 'INSERT', recordId: id });
```

```typescript
// BAD: Blocking on Neon response for UI
const data = await neonClient.query('SELECT * FROM reflections WHERE user_id = $1', [userId]);
setReflections(data.rows);

// GOOD: Read from SQLite for immediate UI
const data = await sqliteDb.getAllAsync(
  'SELECT * FROM reflections WHERE user_id = ?', [userId]
);
setReflections(data);
```

### React Native Anti-Patterns

```tsx
// BAD: Inline styles
<View style={{ padding: 16, backgroundColor: '#fff' }}>

// GOOD: NativeWind classes
<View className="p-4 bg-white">
```

```tsx
// BAD: ScrollView with map for long lists
<ScrollView>
  {items.map(item => <Card key={item.id} />)}
</ScrollView>

// GOOD: FlatList with virtualization
<FlatList
  data={items}
  renderItem={({ item }) => <Card item={item} />}
  keyExtractor={item => item.id}
/>
```

```tsx
// BAD: Relative imports
import { Button } from '../../components/ui/Button';

// GOOD: Path alias
import { Button } from '@/components/ui/Button';
```

## Automated Checks

Run before every commit:

```bash
# TypeScript type checking
pnpm typecheck

# Linting
pnpm lint

# Fix auto-fixable lint issues
pnpm lint:fix

# Format code
pnpm format
```

## Output Levels

| Result | Meaning | Action |
|--------|---------|--------|
| PASS | No critical or high issues | Safe to commit |
| PASS WITH WARNINGS | No critical issues, some medium/low | Review warnings, commit OK |
| FAIL | Critical or high issues found | Must fix before commit |

**Auto-FAIL triggers:**
- Any privacy/security issue (CRITICAL section)
- Any offline-first violation (writes to Neon before SQLite)
- TypeScript `any` type in new code
- Hardcoded API keys or secrets

## When to Use This Skill

Use when:
- About to commit code
- Reviewing changes after implementing a feature
- Auditing existing code for quality
- Running a pre-merge review
- Checking for privacy or security issues

## Success Criteria

- [ ] All CRITICAL items pass
- [ ] All HIGH items pass
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes (or only pre-existing warnings)
- [ ] No new anti-patterns introduced
