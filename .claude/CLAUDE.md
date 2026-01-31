# Claude Agent Rules for Common Thread

**Last Updated:** January 2026

## allowedTools

- Bash(pnpm:\*)
- Bash(npm:\*)
- Bash(npx:\*)
- Bash(git:\*)
- Bash(neon:\*)
- Bash(eas:\*)
- Bash(expo:\*)
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

## Subagents

Specialized agents are available in `.claude/agents/`. Use them for domain-specific tasks:

| Agent                    | When to Use                                                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| **context-navigator**    | Finding code, understanding architecture, tracing data flow, locating features                                            |
| **database-sync-expert** | Schema changes, SQLite/Neon queries, migrations, sync metadata design                                                     |
| **offline-sync-expert**  | Sync pipeline issues, conflict resolution, background sync, network resilience, retry logic                               |
| **ux-designer**          | UX research, interaction design, accessibility audits, mobile optimization — use BEFORE ui-craftsman                      |
| **ui-craftsman**         | Building React Native components, forms, screens with NativeWind + Paper                                                  |
| **test-engineer**        | Writing tests, validating features, testing sync behavior and privacy filters                                             |
| **quality-reviewer**     | Code review, security/privacy audit, performance review — use AFTER significant code changes                              |
| **alder-wyn-expert**     | Anything involving Alder Wyn: mirror-ship validation, context assembly, permission filters, system prompts, health scores |

**Key rules:**

- Use **alder-wyn-expert** for ANY Alder Wyn AI companion changes
- Use **quality-reviewer** proactively after completing features
- Use **ux-designer** before **ui-craftsman** for non-trivial UX work
- Use **database-sync-expert** or **offline-sync-expert** for any data layer changes

---

## Skills

Domain knowledge documents in `.claude/skills/`. Read the relevant skill before starting work in that domain:

| Skill                 | When to Read                                                          | Path                                        |
| --------------------- | --------------------------------------------------------------------- | ------------------------------------------- |
| **ct-add-feature**    | Adding any new feature (data model, hooks, UI, Alder Wyn integration) | `.claude/skills/ct-add-feature/SKILL.md`    |
| **ct-fix-bug**        | Diagnosing or fixing bugs, especially sync/privacy/offline issues     | `.claude/skills/ct-fix-bug/SKILL.md`        |
| **ct-quality-check**  | Before committing code, or reviewing changes for quality              | `.claude/skills/ct-quality-check/SKILL.md`  |
| **ct-dual-migration** | Adding or modifying tables/columns in SQLite or Neon                  | `.claude/skills/ct-dual-migration/SKILL.md` |

**When to use skills:**

- Read **ct-add-feature** at the start of any feature work — it covers dual-DB schema patterns, offline-first writes, privacy checklists, and agent routing
- Read **ct-dual-migration** before ANY schema change — SQLite and Neon must stay in sync
- Read **ct-quality-check** before committing — covers privacy, offline-first, and React Native standards
- Read **ct-fix-bug** when investigating any bug — includes sync state debugging, privacy breach patterns, and severity guide

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

| Technology          | Purpose                                                    |
| ------------------- | ---------------------------------------------------------- |
| **Framework**       | React Native + Expo                                        |
| **Language**        | TypeScript (strict mode)                                   |
| **Navigation**      | React Navigation 6 (Expo Router)                           |
| **Styling**         | NativeWind (Tailwind for RN)                               |
| **UI Kit**          | React Native Paper                                         |
| **Local Database**  | Expo SQLite (offline-first)                                |
| **Remote Database** | Neon (Serverless Postgres)                                 |
| **Auth**            | TBD (auth solution to be determined)                       |
| **Server State**    | TanStack Query (React Query)                               |
| **Local State**     | Zustand                                                    |
| **Validation**      | Zod                                                        |
| **Forms**           | React Hook Form + @hookform/resolvers                      |
| **Animations**      | Reanimated 3                                               |
| **Charts**          | Victory Native                                             |
| **AI**              | Gemini API (2.0 Flash for chat, 1.5 Pro for complex tasks) |
| **Package Manager** | pnpm                                                       |
| **Deployment**      | EAS (Expo Application Services)                            |

**Path Aliases** (configured in `tsconfig.json`):

```ts
import { Button } from '@/components/ui/Button'; // → components/ui/Button
import { useReflections } from '@/hooks/use-reflections'; // → hooks/use-reflections
import { Reflection } from '@/types'; // → types/index
import { reflectionSchema } from '@/lib/validations'; // → lib/validations
import { neon } from '@/lib/neon/client'; // → lib/neon/client
```

**Always use path aliases (`@/`)** instead of relative imports (`../../`) for better maintainability.

---

## Project Structure

```
common-thread/
├── app/                              # Expo Router screens
│   ├── (auth)/                       # Auth flow
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   ├── complete-profile.tsx
│   │   ├── forgot-password.tsx
│   │   ├── reset-password.tsx
│   │   ├── reset-password-sent.tsx
│   │   └── verify-email.tsx
│   ├── (onboarding)/                 # Onboarding flow
│   │   ├── _layout.tsx
│   │   ├── welcome.tsx
│   │   ├── self-portrait.tsx
│   │   ├── relational-foundation.tsx
│   │   └── family-preview.tsx
│   ├── (tabs)/                       # Bottom tab navigation
│   │   ├── _layout.tsx
│   │   ├── index.tsx                 # Home (relationship list)
│   │   ├── reflect.tsx               # New reflection
│   │   ├── family.tsx                # Family settings
│   │   ├── alder-wyn.tsx             # Chat with Alder Wyn
│   │   └── settings.tsx              # User settings
│   ├── api/                          # API route handlers
│   │   ├── alder-wyn/chat+api.ts
│   │   └── research/submit+api.ts
│   ├── relationship/
│   │   └── [id].tsx                  # Relational heart detail view
│   ├── research/                     # Research study forms
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── parent.tsx
│   │   ├── teen.tsx
│   │   ├── grandparent.tsx
│   │   ├── adult-no-children.tsx
│   │   └── thank-you.tsx
│   ├── settings/                     # Settings sub-pages
│   │   ├── change-email.tsx
│   │   ├── change-password.tsx
│   │   └── delete-account.tsx
│   ├── _layout.tsx                   # Root layout
│   └── +not-found.tsx
├── components/
│   ├── ui/                           # Base UI components
│   │   ├── Avatar.tsx
│   │   ├── GlobalSnackbar.tsx
│   │   ├── LoadingScreen.tsx
│   │   └── index.ts
│   ├── chat/                         # Chat UI (Alder Wyn)
│   │   ├── ChatBubble.tsx
│   │   ├── MessageList.tsx
│   │   └── index.ts
│   ├── families/                     # Family management
│   │   ├── FamilyCard.tsx
│   │   ├── InviteDialog.tsx
│   │   ├── PendingInviteBanner.tsx
│   │   └── index.ts
│   ├── reflections/                  # Reflection components
│   │   ├── ReflectionCard.tsx
│   │   ├── ReflectionForm.tsx
│   │   └── index.ts
│   ├── relationship/                 # Relationship components (planned)
│   ├── onboarding/                   # Onboarding components
│   │   ├── FeaturePreviewCard.tsx
│   │   ├── ImportantPersonCard.tsx
│   │   ├── JournalPrompt.tsx
│   │   ├── OnboardingProgress.tsx
│   │   ├── PhilosophyBanner.tsx
│   │   ├── SkipLink.tsx
│   │   ├── ValueChip.tsx
│   │   └── index.ts
│   └── research-forms/               # Research form components
│       ├── ResearchForm.tsx
│       ├── FormSection.tsx
│       ├── SingleSelect.tsx
│       ├── MultiSelect.tsx
│       ├── ShortAnswer.tsx
│       ├── ConsentCheckbox.tsx
│       ├── SubmitButton.tsx
│       └── index.ts
├── lib/
│   ├── neon/
│   │   ├── client.ts                 # Neon serverless client
│   │   ├── auth.ts                   # Auth helpers
│   │   ├── social-auth.ts            # Social auth helpers
│   │   └── schema.sql                # SQL schema reference
│   ├── sqlite/
│   │   ├── db.ts                     # SQLite connection
│   │   └── migrations/               # Local migrations (planned)
│   ├── sync/                         # Sync engine (planned)
│   ├── alder-wyn/                    # AI companion logic (planned)
│   ├── research-forms/               # Research form definitions
│   │   ├── parent-form.ts
│   │   ├── teen-form.ts
│   │   ├── grandparent-form.ts
│   │   ├── adult-no-children-form.ts
│   │   ├── types.ts
│   │   └── index.ts
│   ├── validations/                  # Zod schemas
│   │   └── index.ts
│   ├── utils/
│   │   └── query-client.ts           # TanStack Query config
│   ├── health-score.ts               # Health score calculation
│   └── theme.ts                      # React Native Paper theme
├── hooks/
│   ├── use-auth-store.ts             # Zustand auth state
│   ├── use-conversations.ts          # Alder Wyn conversations
│   ├── use-families.ts               # Family data
│   ├── use-onboarding-store.ts       # Zustand onboarding state
│   ├── use-onboarding.ts             # Onboarding logic
│   ├── use-profile.ts                # User profile
│   ├── use-reflections.ts            # Reflections data
│   ├── use-relationships.ts          # Relationships data
│   └── use-snackbar.ts               # Snackbar notifications
├── types/
│   ├── database.ts                   # Neon database types
│   └── index.ts                      # Application types
├── neon/
│   └── migrations/                   # Neon schema migrations
├── supabase/
│   └── functions/                    # Edge functions
│       └── send-invite/index.ts
├── docs/                             # Documentation
│   ├── technical-spec.md
│   ├── roadmap.md
│   └── market-research/
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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reflectionCreateSchema, type ReflectionCreateInput } from '@/lib/validations/reflection';

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

**Design Inspiration:** Day One (Apple Design Award), Waffle (warm shared journaling), Reflectly (beautiful onboarding).

### Typography

- **Headings:** Merriweather (serif) — Bold for headlines, Regular for titles
- **Body/Labels:** Inter — Regular, Medium, SemiBold
- Fonts loaded via `expo-font` in `app/_layout.tsx`, configured in `lib/theme.ts`
- Use Tailwind: `font-serif`, `font-serif-bold`, `font-sans`, `font-sans-medium`, `font-sans-semibold`
- Paper components use fonts automatically via MD3 `configureFonts()`

### Color Palette

- **Primary (Terracotta):** #d95f3f — grounding, family bonds
- **Secondary (Sage Green):** #7a905d — calm, growth
- **Accent (Warm Gold):** #d9902b — highlights, celebration
- **Neutral (Warm Gray):** #9a968b — backgrounds, text
- **Surface warm:** #FDFCFA (warm white), #F9F5F1 (warm beige, Waffle-inspired)
- Full 50–900 scale for all colors in `tailwind.config.js` and `lib/theme.ts`

### Surfaces & Shadows

- Use warm surfaces (#FDFCFA, #F9F5F1) instead of pure white
- Use soft Day One-inspired shadows from `shadows` export in `lib/theme.ts` (sm/md/lg)
- Cards should feel like keepsakes, not Material cards
- Prefer `mode="elevated"` with `style={shadows.md}` over `mode="outlined"`

### Gradients

- Use `expo-linear-gradient` for auth/onboarding hero sections
- Gradient pattern: `colors={[primary[100], primary[50], background]}`

### Logo

- `components/ui/Logo.tsx` — SVG-based, props: `size` (sm/md/lg), `variant` (full/icon)
- Use on auth screens and onboarding welcome

### General

- **Use React Native Paper** for all inputs, buttons, dialogs, etc.
- Use NativeWind (Tailwind) classes for layout and spacing
- Use `rounded-2xl` or `rounded-3xl` for organic feel
- Buttons use `contentStyle={{ paddingVertical: 6 }}` and `style={{ borderRadius: 12 }}`
- Support dark mode using Paper's custom theme system
- **Provide fallback UI** for:
  - Empty states (e.g., "No reflections yet")
  - Loading states (e.g., skeleton cards)
  - Error states (e.g., error messages with retry)
  - Offline states (e.g., "You're offline. Changes will sync when connected.")

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

| Table                     | Purpose                                                    |
| ------------------------- | ---------------------------------------------------------- |
| `profiles`                | User profiles                                              |
| `families`                | Family groups with invite codes                            |
| `family_memberships`      | User-family associations with roles (admin, member, child) |
| `reflections`             | Journal entries and check-ins                              |
| `relationships`           | Dyadic connections between users                           |
| `relational_hearts`       | Health scores for relationships                            |
| `collective_hearts`       | Family-wide shared data                                    |
| `alder_wyn_conversations` | AI chat history                                            |
| `sharing_settings`        | Granular permission controls                               |

**Local SQLite tables** mirror Neon schema with additional sync metadata:

- `sync_status` - pending/synced/conflict
- `last_synced_at` - timestamp
- `local_version` / `server_version` - for conflict detection

---

## Naming Conventions

| Entity           | Convention           | Example                                         |
| ---------------- | -------------------- | ----------------------------------------------- |
| **Components**   | PascalCase.tsx       | `ReflectionCard.tsx`, `MoodPicker.tsx`          |
| **Variables**    | camelCase            | `reflections`, `moodScore`, `isShareable`       |
| **DB Models**    | PascalCase           | `Reflection`, `Family`, `RelationalHeart`       |
| **Routes**       | kebab-case folders   | `/relationship`, `/alder-wyn`                   |
| **API handlers** | RESTful              | `GET /api/reflections`, `POST /api/sync`        |
| **Constants**    | UPPER_SNAKE_CASE     | `SYNC_INTERVAL_MS`, `MAX_MOOD_SCORE`            |
| **Custom Hooks** | useCamelCase         | `useReflections`, `useSync`, `useOffline`       |
| **Zod Schemas**  | camelCase + "Schema" | `reflectionCreateSchema`, `profileUpdateSchema` |
| **Type Exports** | PascalCase + suffix  | `ReflectionCreateInput`, `FamilyMembership`     |

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
