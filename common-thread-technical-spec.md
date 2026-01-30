# Common Thread Technical Specification

**Project:** Common Thread, LLC - Family Connection App  
**Version:** 0.1 (Initial Planning)  
**Last Updated:** January 2026

---

## Executive Summary

Common Thread is a family wellness application designed to help individuals and families understand each other through structured reflection, relational mapping, and AI-assisted guidance. The app features personal profiles, dyadic "relational hearts" between family members, a collective family heart, and an AI companion called Alder Wyn.

---

## Tech Stack

### Core Framework

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | React Native + Expo | True native performance, offline-first, single codebase for iOS/Android |
| Language | TypeScript | Type safety for complex relational data models |
| Navigation | React Navigation 6 | Industry standard for RN navigation |
| Styling | NativeWind (Tailwind for RN) | Familiar Tailwind syntax, native performance |
| UI Components | React Native Paper | Accessible, Material Design components |
| Database (Local) | Expo SQLite | Offline-first reflections and journaling |
| Database (Remote) | Supabase (Postgres) | Row-level security, real-time, auth built-in |
| Deployment | EAS (Expo Application Services) | App Store + Google Play automated builds |

### State Management & Data Sync

| Component | Technology | Purpose |
|-----------|------------|---------|
| Server State | Tanstack Query (React Query) | API caching, synchronization, optimistic updates |
| Local State | Zustand | Simple, performant state management |
| Forms | React Hook Form | Form state management |
| Data Sync | Custom sync layer | SQLite ↔ Supabase bidirectional sync |
| Real-time | Supabase Realtime | Live updates for family interactions |

### Visualization (Mobile-Optimized)

| Component | Technology | Purpose |
|-----------|------------|---------|
| Relational View | Custom Card/List UI | Hierarchical family relationship browsing |
| Charts/Data | Victory Native | Charts optimized for React Native |
| Animations | Reanimated 3 | 60fps native animations |

### AI Layer (Alder Wyn)

| Component | Technology | Purpose |
|-----------|------------|---------|
| LLM | Gemini API (Gemini 2.0 Flash) | Primary conversational AI |
| Complex Tasks | Gemini 1.5 Pro | Deeper analysis, longer context |
| Embeddings | Gemini text-embedding-004 | Semantic search over reflections (future) |

### Development Tools

| Tool | Purpose |
|------|---------|
| Supabase CLI | Local development with Docker |
| pnpm | Package management |
| Zod | Runtime validation + TypeScript inference |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                   MOBILE APP (React Native)                     │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Auth      │  │  Profile &  │  │   Family Relationship   │  │
│  │   Screens   │  │  Reflection │  │   Cards/List View       │  │
│  │  (Supabase) │  │   Forms     │  │                         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Alder Wyn  │  │  Relational │  │   Collective Heart      │  │
│  │  Chat UI    │  │  Heart View │  │   Dashboard             │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                    LOCAL STORAGE (SQLite)                       │
│  - Reflections (offline-first)                                  │
│  - Cached family data                                           │
│  - Pending sync queue                                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API LAYER (Data-Centric)                    │
├─────────────────────────────────────────────────────────────────┤
│  /api/reflections     POST, GET, PATCH reflections (JSON)      │
│  /api/relationships   Manage dyadic connections                 │
│  /api/family          Family CRUD, invitations                  │
│  /api/alder-wyn       AI chat endpoint with context assembly    │
│  /api/sharing         Permission management                     │
│  /api/sync            Bidirectional sync endpoint               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SUPABASE                                 │
├──────────────────────┬──────────────────────────────────────────┤
│      Auth            │  Email/password, magic link, OAuth       │
├──────────────────────┼──────────────────────────────────────────┤
│      Database        │  Postgres with Row-Level Security        │
├──────────────────────┼──────────────────────────────────────────┤
│      Realtime        │  Live updates for family interactions    │
├──────────────────────┼──────────────────────────────────────────┤
│      Storage         │  Profile images, attachments             │
├──────────────────────┼──────────────────────────────────────────┤
│      Edge Functions  │  Complex permission checks, webhooks     │
└──────────────────────┴──────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     EXTERNAL SERVICES                           │
├─────────────────────────────────────────────────────────────────┤
│  Gemini API          Alder Wyn conversations                    │
│  EAS Build           App Store + Google Play deployment         │
│  OneSignal (opt)     Push notifications                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Offline-First Data Synchronization

### Strategy

Common Thread uses a local-first approach where all user data is stored locally in SQLite and synced to Supabase when online.

### Local Database (SQLite)

```sql
-- Local tables mirror Supabase schema with additional sync metadata

create table local_reflections (
  id text primary key,
  user_id text not null,
  family_id text,
  type text,
  content text,
  mood_score integer,
  is_shareable integer,
  shared_with text,  -- JSON array
  created_at text,
  -- Sync metadata
  sync_status text,  -- 'pending', 'synced', 'conflict'
  last_synced_at text,
  local_version integer default 1,
  server_version integer
);
```

### Sync Flow

```
User writes reflection (offline)
       │
       ▼
┌──────────────┐
│ Save to      │  Immediate save to SQLite
│ SQLite       │  Show in UI instantly
└──────────────┘
       │
       ▼
┌──────────────┐
│ Mark as      │  sync_status = 'pending'
│ Pending      │
└──────────────┘
       │
       ▼ (when online)
┌──────────────┐
│ Background   │  POST /api/sync with pending changes
│ Sync         │  Conflict detection & resolution
└──────────────┘
       │
       ▼
┌──────────────┐
│ Update       │  Mark as synced, update server_version
│ Local Status │  Pull new changes from server
└──────────────┘
```

### Conflict Resolution

**Strategy: Last-Write-Wins with User Notification**

1. User modifies reflection offline → local_version++
2. Background sync detects server_version mismatch
3. If no conflict: apply changes, update versions
4. If conflict: keep both versions, notify user to review
5. User chooses which version to keep (or merge manually)

---

## Data Model

### Core Tables

```sql
-- Users (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users primary key,
  display_name text not null,
  avatar_url text,
  date_of_birth date,
  role text check (role in ('child', 'teen', 'adult', 'elder')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Families (household groupings)
create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references public.profiles(id),
  invite_code text unique,
  created_at timestamptz default now()
);

-- Family Memberships
create table public.family_memberships (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references public.families(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text check (role in ('admin', 'member', 'child')),
  joined_at timestamptz default now(),
  unique(family_id, user_id)
);

-- Personal Reflections (journal entries, check-ins)
create table public.reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  family_id uuid references public.families(id),
  type text check (type in ('journal', 'check_in', 'exercise', 'prompt_response')),
  content jsonb not null,
  mood_score integer check (mood_score between 1 and 10),
  is_shareable boolean default false,
  shared_with uuid[] default '{}',
  created_at timestamptz default now()
);

-- Dyadic Relationships
create table public.relationships (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references public.families(id) on delete cascade,
  user_a uuid references public.profiles(id),
  user_b uuid references public.profiles(id),
  relationship_type text, -- 'parent-child', 'siblings', 'spouses', etc.
  created_at timestamptz default now(),
  unique(user_a, user_b)
);

-- Relational Hearts (dyadic connection health)
create table public.relational_hearts (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid references public.relationships(id) on delete cascade,
  last_check_in timestamptz,
  health_score integer check (health_score between 1 and 100),
  shared_reflections uuid[] default '{}',
  common_threads jsonb default '[]',
  updated_at timestamptz default now()
);

-- Collective Heart (family-wide)
create table public.collective_hearts (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references public.families(id) on delete cascade unique,
  common_threads jsonb default '[]',
  family_values jsonb default '[]',
  ancestor_threads jsonb default '[]',
  updated_at timestamptz default now()
);

-- Alder Wyn Conversations
create table public.alder_wyn_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  context_type text check (context_type in ('personal', 'relational', 'collective')),
  context_id uuid, -- references relationship or family depending on type
  messages jsonb not null default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Sharing Permissions
create table public.sharing_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  target_user_id uuid references public.profiles(id),
  target_family_id uuid references public.families(id),
  shareable_fields text[] default '{}',
  created_at timestamptz default now(),
  unique(user_id, target_user_id)
);
```

### Row-Level Security Policies

```sql
-- Users can only see their own profile fully
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can see family members' basic info
create policy "Users can view family members"
  on public.profiles for select
  using (
    id in (
      select fm.user_id from public.family_memberships fm
      where fm.family_id in (
        select family_id from public.family_memberships
        where user_id = auth.uid()
      )
    )
  );

-- Reflections: owner always, shared_with if marked shareable
create policy "Users can view permitted reflections"
  on public.reflections for select
  using (
    user_id = auth.uid()
    or (is_shareable = true and auth.uid() = any(shared_with))
  );

-- Relationships: only participants
create policy "Users can view their relationships"
  on public.relationships for select
  using (user_a = auth.uid() or user_b = auth.uid());
```

---

## Data Flow Diagrams

### User Registration & Family Creation

```
┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│  User    │      │  Auth    │      │  Create  │      │  Create  │
│  Signs   │ ──▶  │  via     │ ──▶  │  Profile │ ──▶  │  Family  │
│  Up      │      │  Supabase│      │  Record  │      │  (admin) │
└──────────┘      └──────────┘      └──────────┘      └──────────┘
                                                            │
                                                            ▼
                                    ┌──────────────────────────────┐
                                    │  Generate Invite Code        │
                                    │  Share with Family Members   │
                                    └──────────────────────────────┘
```

### Reflection Creation & Sharing

```
┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│  User    │      │  Save to │      │  Choose  │      │  Update  │
│  Writes  │ ──▶  │  Reflect-│ ──▶  │  Sharing │ ──▶  │  shared_ │
│  Entry   │      │  ions    │      │  Settings│      │  with[]  │
└──────────┘      └──────────┘      └──────────┘      └──────────┘
                                                            │
                                                            ▼
                                    ┌──────────────────────────────┐
                                    │  Realtime: Notify shared     │
                                    │  family members              │
                                    └──────────────────────────────┘
```

### Alder Wyn Conversation Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                     ALDER WYN PIPELINE                           │
└──────────────────────────────────────────────────────────────────┘

  User Message
       │
       ▼
┌──────────────┐
│ Determine    │  Personal context? Relational? Collective?
│ Context Type │
└──────────────┘
       │
       ▼
┌──────────────┐
│ Permission   │  What data is this user allowed to include?
│ Filter       │  - Own reflections: always
│              │  - Partner's data: only if shared
│              │  - Family data: based on sharing_settings
└──────────────┘
       │
       ▼
┌──────────────┐
│ Context      │  Assemble filtered data into context window
│ Assembler    │  - Recent reflections
│              │  - Relationship health scores
│              │  - Common threads (if permitted)
└──────────────┘
       │
       ▼
┌──────────────┐
│ System       │  Inject Alder Wyn personality + boundaries
│ Prompt       │  - Mirror-ship role definition
│ Builder      │  - Prohibited behaviors
│              │  - Therapeutic guidelines
└──────────────┘
       │
       ▼
┌──────────────┐
│ Gemini API   │  model: gemini-2.0-flash
│ Request      │  
└──────────────┘
       │
       ▼
┌──────────────┐
│ Response     │  Safety check, format validation
│ Filter       │
└──────────────┘
       │
       ▼
┌──────────────┐
│ Store in     │  Append to alder_wyn_conversations.messages
│ Conversation │
│ History      │
└──────────────┘
       │
       ▼
  Return to User
```

---

## Alder Wyn Specification

### Personality & Role

Alder Wyn operates as a **mirror** rather than an advisor. The core function is to help users see themselves and their relationships more clearly through:

- Reflective questions
- Pattern recognition across entries
- Gentle reframing
- Suggested practices and exercises
- Encouragement and validation

### System Prompt Structure

```typescript
const buildAlderWynPrompt = (context: AlderWynContext) => `
You are Alder Wyn, a gentle and wise AI companion within the Common Thread family wellness app.

## Your Name's Meaning
- Alder: The bridge tree, protector of thresholds, the one who makes crossings possible
- Wyn: Old English/Celtic root meaning blessed, friend, joy, belonging

## Your Role: Mirror-ship
You practice mirror-ship—relating with someone as a mirror to help them see themselves more clearly. You do not give advice or tell people what to do. Instead, you:
- Reflect back what you observe
- Ask questions that invite deeper exploration
- Notice patterns and gently share them
- Offer practices or exercises when appropriate
- Celebrate growth and effort

## Boundaries (Never Do)
- Never diagnose mental health conditions
- Never provide medical advice
- Never take sides in family conflicts
- Never share one family member's private data with another
- Never pressure users to share more than they're comfortable with
- Never claim to know what's best for the user or their family
- Never simulate therapy or claim therapeutic credentials

## Context You Have Access To
${context.availableData}

## Current Conversation Context
Type: ${context.type} (personal | relational | collective)
${context.additionalContext}

Respond with warmth, curiosity, and gentle wisdom. Keep responses concise unless depth is clearly needed.
`;
```

### Permitted Data Access by Context

| Context Type | Accessible Data |
|--------------|-----------------|
| Personal | User's own reflections, mood history, personal threads |
| Relational | Shared reflections between the two users, relational heart health, mutual common threads |
| Collective | Family-wide shared content, collective heart data, common threads across all members |

**Critical Rule:** Alder Wyn never sees data that hasn't been explicitly shared. The permission filter runs *before* context assembly.

---

## Mobile-Friendly Relationship Visualization

### Approach: Hierarchical Card-Based Navigation

Instead of a complex graph visualization (React Flow), Common Thread uses a mobile-optimized hierarchical view with progressive disclosure.

### UI Pattern: Relationship Cards

```typescript
// Primary view: Current user's connections
interface RelationshipCard {
  relationshipId: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar: string;
  relationshipType: 'parent-child' | 'siblings' | 'spouses' | 'other';
  healthScore: number;
  lastInteraction: Date;
  unreadReflections: number;
}

// components/RelationshipList.tsx
export function RelationshipList({ userId }: { userId: string }) {
  const { data: relationships } = useRelationships(userId);

  return (
    <ScrollView>
      <Text variant="headline">Your Family Connections</Text>
      {relationships.map(rel => (
        <RelationshipCard
          key={rel.id}
          relationship={rel}
          onPress={() => navigation.navigate('RelationalHeart', { id: rel.id })}
        />
      ))}
    </ScrollView>
  );
}

// Individual relationship card
function RelationshipCard({ relationship, onPress }) {
  return (
    <Pressable onPress={onPress}>
      <Card>
        <Card.Content>
          <Avatar source={{ uri: relationship.partnerAvatar }} />
          <Text variant="titleLarge">{relationship.partnerName}</Text>
          <Text variant="bodyMedium">{relationship.relationshipType}</Text>

          {/* Health indicator */}
          <ProgressBar
            progress={relationship.healthScore / 100}
            color={getHealthColor(relationship.healthScore)}
          />

          {/* Last interaction */}
          <Text variant="bodySmall">
            Last connected {formatRelativeTime(relationship.lastInteraction)}
          </Text>

          {/* Unread badge */}
          {relationship.unreadReflections > 0 && (
            <Badge>{relationship.unreadReflections} new</Badge>
          )}
        </Card.Content>
      </Card>
    </Pressable>
  );
}
```

### Alternative View: Family Tree (Optional MVP Phase 2)

For users who want a visual overview, provide a simplified family tree using React Native Skia:

```typescript
// Simplified node positions (no complex layout algorithm)
interface FamilyNode {
  id: string;
  x: number;  // Grid-based positioning
  y: number;
  member: FamilyMember;
}

// Touch-optimized interactions
- Single tap: Select member
- Long press: Quick actions menu
- Swipe: Navigate between generations
- Pinch: Zoom (if graph is large)
```

**Recommendation:** Start with **card-based list view** for MVP. Add optional graph visualization in Phase 2 if user research shows demand.

---

## Project Structure

```
common-thread/
├── app/                              # React Native app (Expo)
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── _layout.tsx
│   ├── (tabs)/                       # Bottom tab navigation
│   │   ├── index.tsx                 # Home (relationship list)
│   │   ├── reflect.tsx               # New reflection
│   │   ├── family.tsx                # Family settings
│   │   ├── alder-wyn.tsx            # Chat with Alder Wyn
│   │   └── _layout.tsx
│   ├── relationship/
│   │   └── [id].tsx                  # Relational heart detail view
│   ├── collective.tsx                # Collective heart
│   └── _layout.tsx                   # Root layout
├── components/
│   ├── ui/                           # React Native Paper components
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
│   ├── supabase/
│   │   ├── client.ts                 # Supabase client for RN
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
│   └── utils/
├── hooks/
│   ├── use-family.ts
│   ├── use-reflections.ts
│   ├── use-relationships.ts
│   ├── use-sync.ts                   # Sync status monitoring
│   └── use-offline.ts                # Offline detection
├── types/
│   └── index.ts
├── api/                              # Backend API (Node.js or Supabase Functions)
│   ├── reflections.ts
│   ├── relationships.ts
│   ├── family.ts
│   ├── alder-wyn.ts
│   ├── sharing.ts
│   └── sync.ts                       # Sync endpoint
├── supabase/
│   ├── migrations/
│   └── seed.sql
├── app.json                          # Expo configuration
├── eas.json                          # EAS Build configuration
└── package.json
```

---

## MVP Scope (Phase 1)

### In Scope

1. **Authentication**
   - Email/password signup and login
   - Profile creation with basic info

2. **Family Management**
   - Create a family
   - Generate and share invite code
   - Join existing family

3. **Personal Reflections**
   - Daily check-in (mood + short text)
   - Journal entries
   - Mark entries as shareable or private

4. **Single Relationship View**
   - View connection with one family member
   - See shared reflections
   - Basic relational heart score

5. **Simple Map Visualization**
   - Show current user + family members as nodes
   - Lines connecting relationships
   - Tap node to view that relationship

6. **Alder Wyn (Basic)**
   - Personal context only
   - Reflect on recent entries
   - Suggest simple prompts

### Out of Scope (Future Phases)

- Collective heart
- Ancestor threads
- Therapeutic exercises library
- Complex sharing permissions UI
- Analytics dashboard
- Multi-family support
- Third-party integrations
- Optional graph visualization (stick with cards for MVP)

---

## Compliance & Privacy Considerations

### COPPA (Children's Online Privacy Protection Act)

If users under 13 are allowed:
- Parental consent required before data collection
- Limited data collection for minors
- Parent dashboard to review/delete child's data
- No behavioral advertising to children

**Recommendation:** For MVP, require users to be 13+. Add child accounts in a later phase with proper consent flows.

### Mental Health Content

- Alder Wyn is explicitly NOT a therapist
- Include clear disclaimers in onboarding
- Provide crisis resources (988 Suicide & Crisis Lifeline, etc.)
- Consider content moderation for concerning entries
- Terms of service must be clear about limitations

### Data Security

- All data encrypted in transit (HTTPS) and at rest (Supabase default)
- Row-level security for authorization
- Regular security audits post-launch
- Clear data deletion process (account deletion removes all user data)

---

## Development Phases

### Phase 1: Foundation (Weeks 1-4)
- [ ] Project setup (Expo, React Native, TypeScript)
- [ ] Configure EAS Build for iOS + Android
- [ ] Authentication flow (Supabase Auth in RN)
- [ ] Basic profile CRUD
- [ ] Family creation and invitation system
- [ ] SQLite local database setup
- [ ] Database schema (Supabase + SQLite)

### Phase 2: Offline-First Core (Weeks 5-8)
- [ ] Reflection entry system (offline-first)
- [ ] SQLite → Supabase sync engine
- [ ] Conflict resolution strategy
- [ ] Background sync with queue
- [ ] Sharing permissions (basic)
- [ ] Relationship model and relational heart

### Phase 3: Mobile UI & Navigation (Weeks 9-10)
- [ ] Hierarchical relationship list view
- [ ] Relational heart detail screens
- [ ] Bottom tab navigation
- [ ] Gesture handling (swipe, pull-to-refresh)
- [ ] Native animations (health scores, transitions)

### Phase 4: Alder Wyn (Weeks 11-12)
- [ ] Gemini API integration
- [ ] Context assembler and permission filter
- [ ] Chat interface (mobile-optimized)
- [ ] System prompt refinement
- [ ] Message streaming for better UX

### Phase 5: Polish & App Store Launch (Weeks 13-16)
- [ ] UI/UX polish (iOS + Android platform conventions)
- [ ] Onboarding flow (first-time user experience)
- [ ] Error handling and edge cases
- [ ] Push notifications setup (optional)
- [ ] App icons, splash screens, assets
- [ ] Privacy policy and terms
- [ ] App Store submission (iOS)
- [ ] Google Play submission (Android)
- [ ] Beta testing with TestFlight + Play Console

---

## Mobile-Specific Considerations

### Platform Conventions

**iOS:**
- Use iOS navigation patterns (back button, swipe-to-go-back)
- Follow Human Interface Guidelines
- Use SF Symbols for icons
- Implement haptic feedback for interactions
- Support Face ID / Touch ID for quick login

**Android:**
- Material Design 3 components
- Hardware back button support
- Use Material icons
- Support biometric authentication
- Follow Android design guidelines

### Performance Optimization

- **List virtualization:** Use `FlatList` for long reflection lists
- **Image optimization:** Compress and cache profile images
- **Bundle size:** Use Hermes JavaScript engine for faster startup
- **Memory management:** Unload off-screen reflections
- **Animations:** Use `Reanimated` for 60fps native animations

### Battery & Network Efficiency

- **Batch sync:** Group pending changes, sync every 5 minutes or on app background
- **WiFi preference:** Large data syncs only on WiFi by default
- **Background fetch:** iOS background refresh for new family updates
- **Low power mode:** Reduce sync frequency when battery low

### Accessibility

- **Screen readers:** VoiceOver (iOS) and TalkBack (Android) support
- **Font scaling:** Respect user's dynamic text size preferences
- **High contrast:** Support system-wide accessibility themes
- **Gesture alternatives:** Provide button alternatives for all swipe gestures

---

## Open Questions

1. **Age gating:** What's the minimum age? How do we handle families with young children?

2. **Onboarding:** What's the first-time user experience? Solo journaling first, then family invite?

3. **Engagement model:** Daily prompts? Weekly check-ins? Push notifications?

4. **Monetization:** Freemium? Subscription? In-app purchase? (Affects App Store requirements)

5. **App Store approval:** How to position Alder Wyn to avoid "medical app" rejection?

6. **Content moderation:** What happens if someone writes something concerning? Automated flagging?

7. **Biometric lock:** Should reflections require Face ID/fingerprint to open?

8. **Export data:** Allow users to export all reflections as PDF/JSON for portability?

9. **Family size limits:** Max family members for performance? (Affects UI design)

10. **Multi-device support:** Can one user access from multiple devices? (Requires sync across devices)

---

## Resources & References

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase with React Native](https://supabase.com/docs/guides/getting-started/quickstarts/react-native)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [React Native Paper](https://reactnativepaper.com/)
- [NativeWind Documentation](https://www.nativewind.dev/)
- [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [React Query (Tanstack Query)](https://tanstack.com/query/latest)
- [Zustand State Management](https://zustand-demo.pmnd.rs/)

---

*Document maintained by: [Your Name]*  
*For questions: [contact info]*
