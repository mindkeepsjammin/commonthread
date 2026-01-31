# Common Thread — Feature Summary

**Last Updated:** January 2026

---

## 1. Authentication

**What it is:** Email/password and Google OAuth login system using Supabase Auth.

**How it works:** Users sign up, create a profile (display name + role), and get a persisted session. Includes forgot/reset password flows.

**Still need to build:**

- Email verification enforcement
- Additional OAuth providers (Apple, etc.)
- Two-factor authentication

---

## 2. Onboarding

**What it is:** Multi-step intro flow collecting user values, energy sources, connection styles ("Living Self-Portrait").

**How it works:** Steps tracked in DB (welcome → self_portrait → family_preview → relational_foundation → completed). Draft data stored in Zustand, saved to `profiles.self_portrait` JSONB on continue. Steps are skippable.

**Still need to build:**

- Relational Foundation screen content
- Family Preview screen content
- Resume onboarding if user exits mid-flow

---

## 3. Reflections

**What it is:** Journal entries, check-ins, and mood tracking (1-10 scale) with granular sharing controls.

**How it works:** Full CRUD via Neon. Reflection types: journal, check_in, exercise, prompt_response. Users set `is_shareable` and pick specific family members via `shared_with`. Sharing triggers health score updates.

**Still need to build:**

- Guided exercises and prompt libraries (types exist, no content)
- Search/filter by date or mood
- Reflection analytics/insights

---

## 4. Family Management

**What it is:** Create/join family groups with invite codes and email invitations.

**How it works:** Families get an 8-char invite code. Email invites sent via Supabase Edge Function. Joining auto-creates relationships + relational hearts between all members. Roles: admin, member, child.

**Still need to build:**

- Leave family / remove members
- Family settings editing
- COPPA restrictions for child role
- Collective hearts (family-wide health tracking)

---

## 5. Relationships & Health Scores

**What it is:** Tracks dyadic connections between family members with a health score (1-100).

**How it works:** Auto-created when users join same family. Score formula: shared reflections (40pts), recency (30pts), common threads (30pts). Updated on check-in, reflection share, or thread discovery.

**Still need to build:**

- Relationship list view on home screen
- Editable relationship types (parent-child, siblings, etc.)
- Score history tracking
- Drop alerts and improvement recommendations
- `components/relationship/` is empty — needs UI components

---

## 6. Common Threads

**What it is:** AI-discovered shared themes between two people based on their reflections.

**How it works:** When 3+ reflections are shared between two users, Gemini 1.5 Pro analyzes patterns and stores discovered threads. Fire-and-forget — failures are non-critical.

**Still need to build:**

- Automatic/scheduled discovery (currently manual trigger)
- Better UI for viewing and exploring threads

---

## 7. Alder Wyn AI Chat

**What it is:** Privacy-first AI companion using mirror-ship principles (reflects, never advises or diagnoses).

**How it works:** Gemini 2.0 Flash powers chat. Permission filter runs BEFORE context assembly — Alder Wyn only sees shared data. Three context modes: personal (own reflections), relational (shared data between two users), collective (family-wide). Crisis detection mentions 988 hotline.

**Still need to build:**

- Streaming responses
- Relationship/family picker for relational and collective context
- Conversation management (list, delete, rename)
- Token tracking / rate limiting

---

## 8. Research Forms

**What it is:** Survey system for research data collection (Parent, Teen, Grandparent, Adult forms).

**How it works:** Form definitions in `lib/research-forms/`, rendered by reusable components. Submissions stored in `research_responses` table with IP hash for dedup.

**Still need to build:**

- Admin interface to view/export responses
- Age verification for teen form (COPPA)

---

## 9. Settings

**What it is:** User profile display, sign out, and sub-pages for account management.

**How it works:** Main screen shows profile + sign out. Links to change password, change email, delete account.

**Still need to build:**

- Verify sub-screen implementations work end-to-end
- Notification preferences
- Privacy/sharing defaults
- Theme preference override
- Data export

---

## 10. Offline-First Sync Engine — NOT BUILT

**What it is (planned):** SQLite-first local storage with background sync to Neon.

**Current state:** SQLite schema is defined with sync metadata columns (`sync_status`, `last_synced_at`, `local_version`, `server_version`), but `lib/sync/` is empty. The app reads/writes directly to Neon — no offline support.

**Need to build:**

- Entire sync engine (queue, batch processing, retry)
- Offline detection and SQLite fallback
- Conflict resolution (last-write-wins with user notification)
- Background sync worker
- WiFi preference for large syncs

---

## 11. Database Layer

**What it is:** Dual-database architecture — Neon (cloud PostgreSQL) + SQLite (local).

**How it works:** Neon is the working primary DB. Five migrations cover the full schema. SQLite is defined but unused.

**Still need to build:**

- Connect SQLite to app reads/writes
- `sharing_settings` table is unused
- `collective_hearts` table doesn't exist yet (referenced in docs)

---

## 12. Theme System

**What it is:** MD3 theme with warm organic colors (terracotta/sage/honey), light + dark mode.

**How it works:** React Native Paper theming with system color scheme detection.

**Still need to build:**

- User preference override (currently follows system only)

---

## Biggest Gaps (Priority Order)

1. **Sync engine** — the entire offline-first architecture is unbuilt
2. **Relationship UI** — no components, no list view, no type editing
3. **Alder Wyn context picker** — relational/collective modes need a UI to select who/which family
4. **Collective hearts** — documented but schema doesn't exist
5. **COPPA compliance** — child role exists but has no restrictions
