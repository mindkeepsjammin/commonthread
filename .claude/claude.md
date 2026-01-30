# Claude Agent Rules for Common Thread

**Last Updated:** January 2026

## allowedTools

- Bash(pnpm:*)
- Bash(npm:*)
- Bash(npx:*)
- Bash(git:*)
- Bash(neon:*)
- Bash(eas:*)
- Bash(expo:*)
- Edit
- Write
- Read

## Documentation Structure

This file contains all guidance for the Common Thread family wellness app. As the project grows, consider splitting into:
- `.claude/ARCHITECTURE.md` - Database schema & folder structure
- `.claude/API.md` - API endpoints & patterns
- `.claude/SYNC.md` - Offline-first sync engine details
- `.claude/ALDER_WYN.md` - AI companion specification

---

## General Philosophy

- **Always prioritize clarity, modularity, and developer experience**
- Follow convention over configuration where applicable
- If unsure about implementation choices, ask for clarification or default to modern best practices
- Optimize for performance using React.memo, useCallback, and useMemo where appropriate, especially in lists and data-heavy screens
- Ensure accessibility using React Native's accessibility props (`accessible`, `accessibilityLabel`, `accessibilityRole`)
- **Privacy-first architecture**: Never auto-share data; users explicitly control what's shared
- **Offline-first**: All data saves to SQLite first, then syncs to Neon
- **Mirror-ship for Alder Wyn**: The AI reflects, never advises or diagnoses

---

## Project Stack

| Technology | Purpose |
|-----------|---------|
| **Framework** | React Native + Expo |
| **Language** | TypeScript (strict mode) |
| **Navigation** | React Navigation 6 (Expo Router) |
| **Styling** | NativeWind (Tailwind for RN) |
| **UI Kit** | React Native Paper |
| **Local Database** | Expo SQLite (offline-first) |
| **Remote Database** | Neon (Serverless Postgres) |
| **Auth** | TBD (auth solution to be determined) |
| **Server State** | TanStack Query (React Query) |
| **Local State** | Zustand |
| **Validation** | Zod |
| **Forms** | React Hook Form + @hookform/resolvers |
| **Animations** | Reanimated 3 |
| **Charts** | Victory Native |
| **AI** | Gemini API (2.0 Flash for chat, 1.5 Pro for complex tasks) |
| **Package Manager** | pnpm |
| **Deployment** | EAS (Expo Application Services) |

**Path Aliases** (configured in `tsconfig.json`):
```ts
import { Button } from "@/components/ui/Button";           // → components/ui/Button
import { useReflections } from "@/hooks/use-reflections";  // → hooks/use-reflections
import { Reflection } from "@/types";                      // → types/index
import { reflectionSchema } from "@/lib/validations";      // → lib/validations
import { neon } from "@/lib/neon/client";                   // → lib/neon/client
```

**Always use path aliases (`@/`)** instead of relative imports (`../../`) for better maintainability.

---

## Project Structure

```
common-thread/
├── app/                              # Expo Router screens
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── _layout.tsx
│   ├── (tabs)/                       # Bottom tab navigation
│   │   ├── index.tsx                 # Home (relationship list)
│   │   ├── reflect.tsx               # New reflection
│   │   ├── family.tsx                # Family settings
│   │   ├── alder-wyn.tsx             # Chat with Alder Wyn
│   │   └── _layout.tsx
│   ├── relationship/
│   │   └── [id].tsx                  # Relational heart detail view
│   ├── collective.tsx                # Collective heart
│   └── _layout.tsx                   # Root layout
├── components/
│   ├── ui/                           # Base UI components
│   ├── relationship/
│   │   ├── RelationshipCard.tsx
│   │   ├── RelationshipList.tsx
│   │   └── HealthIndicator.tsx
│   ├── reflection/
│   │   ├── ReflectionForm.tsx
│   │   ├── ReflectionCard.tsx
│   │   └── MoodPicker.tsx
│   ├── alder-wyn/
│   │   ├── ChatBubble.tsx
│   │   ├── ChatInput.tsx
│   │   └── TypingIndicator.tsx
│   └── family/
│       ├── FamilyMemberCard.tsx
│       └── InviteCodeInput.tsx
├── lib/
│   ├── neon/
│   │   ├── client.ts                 # Neon serverless client
│   │   └── auth.ts                   # Auth helpers
│   ├── sqlite/
│   │   ├── db.ts                     # SQLite connection
│   │   ├── schema.ts                 # Local schema definitions
│   │   └── migrations/
│   ├── sync/
│   │   ├── sync-engine.ts            # Bidirectional sync logic
│   │   ├── conflict-resolver.ts      # Conflict resolution
│   │   └── queue.ts                  # Pending changes queue
│   ├── alder-wyn/
│   │   ├── context-assembler.ts
│   │   ├── permission-filter.ts
│   │   └── prompts.ts
│   ├── validations/                  # Zod schemas
│   └── utils/
├── hooks/
│   ├── use-family.ts
│   ├── use-reflections.ts
│   ├── use-relationships.ts
│   ├── use-sync.ts                   # Sync status monitoring
│   └── use-offline.ts                # Offline detection
├── types/
│   └── index.ts
├── api/                              # Backend API handlers
│   ├── reflections.ts
│   ├── relationships.ts
│   ├── family.ts
│   ├── alder-wyn.ts
│   ├── sharing.ts
│   └── sync.ts
├── neon/
│   ├── migrations/
│   └── seed.sql
├── app.json                          # Expo configuration
├── eas.json                          # EAS Build configuration
└── package.json
```

---

## Component Rules

- **Use function components with arrow syntax**
- Always define props via TypeScript interfaces (never use `any`)
- Destructure props in function signatures for clarity:
  ```tsx
  export const ReflectionCard = ({ reflection, onPress }: ReflectionCardProps) => { ... }
  ```
- Co-locate small, page-specific components within the page folder when they're not reusable
- **Reuse common components** like:
  - `<RelationshipCard />`
  - `<RelationshipList />`
  - `<ReflectionForm />`
  - `<ReflectionCard />`
  - `<MoodPicker />`
  - `<ChatBubble />`
  - `<HealthIndicator />`
- Document reusable components with JSDoc comments including props, usage examples, and dependencies
- **List-specific rules:**
  - Always use `FlatList` for long lists (virtualization)
  - Use unique keys based on `item.id`, not array index
  - Handle loading and empty states explicitly
  - Memoize list items with `React.memo` when appropriate

---

## Form Handling Rules

- Use **React Hook Form + Zod** for all forms
- Define Zod schemas in `/lib/validations/`
- **Reuse existing schemas**:
  - `reflectionCreateSchema`, `reflectionUpdateSchema`
  - `profileUpdateSchema`
  - `familyCreateSchema`
  - `sharingSettingsSchema`
- Display inline errors for each field
- Show loading state on submit button (e.g., `disabled` + spinner)
- Use `onSubmit` with `async/await`, not `.then()`
- Ensure forms are accessible:
  - Use proper labels with `accessibilityLabel`
  - Ensure keyboard navigation works

**Example form structure:**
```tsx
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reflectionCreateSchema, type ReflectionCreateInput } from "@/lib/validations/reflection";

const form = useForm<ReflectionCreateInput>({
  resolver: zodResolver(reflectionCreateSchema),
});

const onSubmit = async (data: ReflectionCreateInput) => {
  try {
    await saveReflection(data);
    // Show success feedback
  } catch (error) {
    // Show error feedback
  }
};
```

---

## UI/UX Standards

- **Use React Native Paper** for all inputs, buttons, dialogs, etc.
- Use NativeWind (Tailwind) classes for styling
- Ensure responsive design for different screen sizes
- Use **lucide-react-native** or React Native Paper icons
- Support dark mode using Paper's theme system
- Use skeleton loaders for loading states
- **Provide fallback UI** for:
  - Empty states (e.g., "No reflections yet")
  - Loading states (e.g., skeleton cards)
  - Error states (e.g., error messages with retry)
  - Offline states (e.g., "You're offline. Changes will sync when connected.")

**Relationship Card UI:**
- Display partner name and avatar
- Show relationship type (parent-child, siblings, spouses)
- Health score indicator (1-100)
- Last interaction timestamp
- Unread shared reflections badge

**Platform Conventions:**
- iOS: Follow Human Interface Guidelines, support swipe-to-go-back
- Android: Follow Material Design, handle hardware back button

---

## Offline-First Sync Rules

**Sync Status Values:**
- `pending` - Saved locally, not yet synced
- `synced` - Successfully synced to Neon
- `conflict` - Server version differs, needs resolution

**Sync Engine Rules:**
- Save to SQLite immediately (optimistic UI)
- Queue changes for background sync
- Batch syncs every 5 minutes or on app background
- Prefer WiFi for large data syncs
- Reduce sync frequency when battery low

**Conflict Resolution:**
- Default: Last-write-wins with user notification
- Keep both versions when conflict detected
- Let user choose which version to keep

---

## Alder Wyn (AI Companion) Rules

**Core Principle: Mirror-ship**
- Reflects back what it observes
- Asks questions that invite exploration
- Notices patterns and gently shares them
- Offers practices or exercises when appropriate
- Celebrates growth and effort

**Never Do:**
- Never diagnose mental health conditions
- Never provide medical advice
- Never take sides in family conflicts
- Never share one family member's private data with another
- Never pressure users to share
- Never claim to know what's best
- Never simulate therapy

**Context Types:**
| Context | Accessible Data |
|---------|-----------------|
| Personal | User's own reflections, mood history |
| Relational | Shared reflections between two users, relational heart |
| Collective | Family-wide shared content, collective heart |

**Critical Rule:** Permission filter runs BEFORE context assembly. Alder Wyn never sees unshared data.

---

## Database Schema (Core Tables)

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles |
| `families` | Family groups with invite codes |
| `family_memberships` | User-family associations with roles (admin, member, child) |
| `reflections` | Journal entries and check-ins |
| `relationships` | Dyadic connections between users |
| `relational_hearts` | Health scores for relationships |
| `collective_hearts` | Family-wide shared data |
| `alder_wyn_conversations` | AI chat history |
| `sharing_settings` | Granular permission controls |

**Local SQLite tables** mirror Neon schema with additional sync metadata:
- `sync_status` - pending/synced/conflict
- `last_synced_at` - timestamp
- `local_version` / `server_version` - for conflict detection

---

## Naming Conventions

| Entity | Convention | Example |
|--------|-----------|---------|
| **Components** | PascalCase.tsx | `ReflectionCard.tsx`, `MoodPicker.tsx` |
| **Variables** | camelCase | `reflections`, `moodScore`, `isShareable` |
| **DB Models** | PascalCase | `Reflection`, `Family`, `RelationalHeart` |
| **Routes** | kebab-case folders | `/relationship`, `/alder-wyn` |
| **API handlers** | RESTful | `GET /api/reflections`, `POST /api/sync` |
| **Constants** | UPPER_SNAKE_CASE | `SYNC_INTERVAL_MS`, `MAX_MOOD_SCORE` |
| **Custom Hooks** | useCamelCase | `useReflections`, `useSync`, `useOffline` |
| **Zod Schemas** | camelCase + "Schema" | `reflectionCreateSchema`, `profileUpdateSchema` |
| **Type Exports** | PascalCase + suffix | `ReflectionCreateInput`, `FamilyMembership` |

---

## Avoid

- No inline styles - use NativeWind classes
- No use of `any` in TypeScript
- No console logs in production code
- No business logic in screen files - isolate to helpers, hooks, or lib
- No hardcoded values - use constants or database data
- No hardcoded user IDs - always use authenticated user context
- Avoid adding new dependencies without justification
- Don't use relative imports (`../../lib/utils`) when path aliases (`@/lib/utils`) are available
- Don't auto-share private reflections
- Never expose other users' unshared data
- Never skip the permission filter for Alder Wyn context

---

## Code Review Checklist

When reviewing code, ensure:

- **TypeScript safe** (no `any`, proper interfaces used)
- **Follows project conventions** (folder structure, naming, path aliases)
- **Uses React Native Paper and NativeWind appropriately**
- **Business logic isolated** from screen files
- **Includes try/catch for async calls**
- **Includes Zod validation** where inputs exist
- **Reuses existing schemas** and utilities
- **Avoids hardcoded values**
- **Reuses functions or components** (no logic duplication)
- **Fallback UI states** (loading, empty, error, offline)
- **No performance bottlenecks** (use FlatList, memoize appropriately)
- **Data privacy respected** (sharing permissions checked)
- **Offline-first** (saves to SQLite before Neon)
- **Accessibility** (proper labels, screen reader support)

---

## Claude Should Ask

When implementing features, always clarify:
- "Should this data be stored offline-first or remote-only?"
- "What sharing permissions should apply to this feature?"
- "Should this be accessible to all family members or specific relationships?"
- "Is this a personal, relational, or collective context for Alder Wyn?"
- "Do you want me to scaffold this feature or build it to completion?"
- "Should this support offline usage?"
- "What happens when the user is offline?"

---

## Quick Reference

**Common Commands:**
```bash
# Development
pnpm install              # Install dependencies
pnpm start                # Start Expo dev server
pnpm ios                  # Run on iOS simulator
pnpm android              # Run on Android emulator

# Database
# Neon is serverless - no local instance needed
# Use Neon dashboard or CLI for migrations
# neon branches create    # Create a branch for development

# Build
eas build --platform ios
eas build --platform android
eas submit                # Submit to app stores
```

**File Locations:**
- Neon migrations: `neon/migrations/`
- SQLite schema: `lib/sqlite/schema.ts`
- Validation schemas: `lib/validations/`
- Utility functions: `lib/utils/`
- Type definitions: `types/`
- UI components: `components/ui/`
- Business components: `components/`

**Key Environment Variables:**
- `EXPO_PUBLIC_NEON_DATABASE_URL` - Neon database connection string
- `GEMINI_API_KEY` - Gemini API key for Alder Wyn

**Important Database Fields:**
- `is_shareable` - Boolean, must be true for others to see
- `shared_with` - UUID array of users who can see the reflection
- `sync_status` - pending/synced/conflict for offline tracking
- `mood_score` - Integer 1-10 for check-ins

**User Roles (family_memberships):**
- `admin` - Can manage family settings, invite members
- `member` - Standard family member
- `child` - Restricted access (COPPA considerations)

---

## Compliance & Safety

- **Age Requirement:** Users must be 13+ (COPPA compliance)
- **Disclaimers:** Alder Wyn is NOT a therapist - clear in onboarding
- **Crisis Resources:** Include 988 Suicide & Crisis Lifeline info
- **Data Deletion:** Account deletion removes all user data
- **Encryption:** All data encrypted in transit (HTTPS) and at rest
