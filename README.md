# Common Thread

> Family wellness mobile app with journaling, relational health tracking, and an AI companion — helping families strengthen their bonds through shared reflection.

## Status

**Early development (MVP phase)**
Building core flows: authentication, onboarding, reflections, family management, and Alder Wyn AI chat.

## Problem & Purpose

Families lack a shared space to reflect on their relationships and track emotional wellness together. Common Thread provides private journaling, shared reflections, and an AI companion (Alder Wyn) that mirrors back patterns without diagnosing or advising. Privacy-first and offline-first by design, so users control exactly what gets shared.

## Tech Stack

| Layer           | Technology                      |
| --------------- | ------------------------------- |
| Framework       | React Native + Expo (SDK 54)    |
| Language        | TypeScript (strict)             |
| Navigation      | Expo Router                     |
| Styling         | NativeWind (Tailwind for RN)    |
| UI Kit          | React Native Paper (MD3)        |
| Local DB        | Expo SQLite (offline-first)     |
| Remote DB       | Neon (Serverless Postgres)      |
| Auth            | Supabase                        |
| Server State    | TanStack Query (React Query)    |
| Local State     | Zustand                         |
| Forms           | React Hook Form + Zod           |
| AI              | Google Gemini API               |
| Animations      | Reanimated 3                    |
| Package Manager | pnpm                            |
| Deployment      | EAS (Expo Application Services) |

## Directory Map

```
app/                  # Expo Router screens
  (auth)/             # Login, signup, password reset
  (onboarding)/       # Welcome, self-portrait, family preview
  (tabs)/             # Bottom tabs: home, reflect, family, alder-wyn, settings
  api/                # API route handlers
  relationship/       # Relational heart detail views
  research/           # Research study forms
  settings/           # Settings sub-pages
components/           # UI and feature components
  ui/                 # Base UI (Avatar, LoadingScreen, Logo)
  chat/               # Alder Wyn chat UI
  families/           # Family cards, invites
  reflections/        # Reflection cards and forms
  onboarding/         # Onboarding flow components
  research-forms/     # Research form components
hooks/                # Custom hooks (auth, reflections, families, etc.)
lib/                  # Utilities, validation, DB clients
  neon/               # Neon client, auth helpers, schema
  sqlite/             # SQLite connection and migrations
  research-forms/     # Research form definitions
  validations/        # Zod schemas
types/                # TypeScript type definitions
neon/migrations/      # Neon schema migrations
docs/                 # Technical spec, roadmap, market research
```

## Key Entry Points

| What           | Path                       |
| -------------- | -------------------------- |
| Root layout    | `app/_layout.tsx`          |
| Home (tabs)    | `app/(tabs)/index.tsx`     |
| Alder Wyn chat | `app/(tabs)/alder-wyn.tsx` |
| Neon schema    | `lib/neon/schema.sql`      |
| Auth store     | `hooks/use-auth-store.ts`  |
| Theme config   | `lib/theme.ts`             |
| App config     | `app.json`                 |
| EAS config     | `eas.json`                 |

## Running Locally

```bash
pnpm install
pnpm start            # Start Expo dev server
pnpm ios              # Run on iOS simulator
pnpm android          # Run on Android emulator
pnpm lint             # ESLint
pnpm typecheck        # TypeScript check (no emit)
pnpm format           # Prettier
```

## Current Features

- Email/password authentication with Supabase
- Multi-step onboarding (welcome, self-portrait, relational foundation, family preview)
- Reflection journaling with mood scoring
- Family creation and invite system (admin/member/child roles)
- Alder Wyn AI companion chat (mirror-ship model, never diagnoses or advises)
- Relational heart health scores between family members
- Privacy-first sharing controls (nothing shared by default)
- Offline-first architecture (SQLite local, Neon remote)
- Research study forms (parent, teen, grandparent, adult-no-children)
- NativeWind + React Native Paper themed UI with custom typography

## Known Gaps / Roadmap

- [ ] Offline-to-remote sync engine (SQLite to Neon pipeline)
- [ ] Conflict resolution UI for sync conflicts
- [ ] Collective hearts (family-wide health view)
- [ ] Alder Wyn context assembly with permission filters
- [ ] Push notifications
- [ ] Dark mode
- [ ] Social auth (Google, Apple sign-in)

## Related Docs

- [`.claude/CLAUDE.md`](.claude/CLAUDE.md) — coding conventions, component rules, DB schema, Alder Wyn spec
- [`docs/technical-spec.md`](docs/technical-spec.md) — full technical specification
- [`docs/roadmap.md`](docs/roadmap.md) — product roadmap
- [`docs/market-research/`](docs/market-research/) — competitive analysis
