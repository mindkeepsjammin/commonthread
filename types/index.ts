// Onboarding types
export type OnboardingStep =
  | 'not_started'
  | 'welcome'
  | 'self_portrait'
  | 'family_preview'
  | 'relational_foundation'
  | 'completed';

export interface SelfPortrait {
  pronouns?: string;
  howIDescribeMyself?: string;
  currentSeason?: string; // growth, rest, transition, healing, exploration
  whatFeelsImportantNow?: string;
  valuesIHoldClose?: string[];
  whatGivesMeEnergy?: string;
  needsInRelationships?: string;
  howILikeToConnect?: string[];
  lastUpdated?: string;
}

export interface ImportantPerson {
  name?: string;
  relationship?: string;
  whatTheyMean?: string;
}

export interface RelationalFoundation {
  importantPeople?: ImportantPerson[];
  howIShowCare?: string;
  whatConnectionMeansToMe?: string;
  relationshipStrengths?: string[];
  areasOfGrowth?: string[];
  lastUpdated?: string;
}

// User types
export interface Profile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  dateOfBirth: string | null;
  role: 'child' | 'teen' | 'adult' | 'elder' | null;
  onboardingStep: OnboardingStep;
  onboardingCompletedAt: string | null;
  selfPortrait: SelfPortrait | null;
  relationalFoundation: RelationalFoundation | null;
  createdAt: string;
  updatedAt: string;
}

// Family types
export interface Family {
  id: string;
  name: string;
  createdBy: string;
  inviteCode: string;
  createdAt: string;
}

export interface FamilyMembership {
  id: string;
  familyId: string;
  userId: string;
  role: 'admin' | 'member' | 'child';
  joinedAt: string;
}

// Reflection types
export interface Reflection {
  id: string;
  userId: string;
  familyId: string | null;
  type: 'journal' | 'check_in' | 'exercise' | 'prompt_response';
  content: ReflectionContent;
  moodScore: number | null;
  isShareable: boolean;
  sharedWith: string[];
  createdAt: string;
}

export interface ReflectionContent {
  text: string;
  promptId?: string;
  exerciseId?: string;
}

// Relationship types
export interface Relationship {
  id: string;
  familyId: string;
  userA: string;
  userB: string;
  relationshipType: string;
  createdAt: string;
}

export interface RelationalHeart {
  id: string;
  relationshipId: string;
  lastCheckIn: string | null;
  healthScore: number;
  sharedReflections: string[];
  commonThreads: CommonThread[];
  updatedAt: string;
}

export interface CommonThread {
  id: string;
  theme: string;
  discoveredAt: string;
}

// Alder Wyn types
export interface AlderWynConversation {
  id: string;
  userId: string;
  contextType: 'personal' | 'relational' | 'collective';
  contextId: string | null;
  messages: AlderWynMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface AlderWynMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Family invite types
export interface FamilyInvite {
  id: string;
  familyId: string;
  invitedBy: string;
  invitedEmail: string;
  status: 'pending' | 'accepted' | 'expired';
  createdAt: string;
  expiresAt: string;
}

export interface PendingInviteInfo extends FamilyInvite {
  familyName: string;
  inviterName: string;
}

// Sync types
export type SyncStatus = 'pending' | 'synced' | 'conflict';

export interface SyncableRecord {
  syncStatus: SyncStatus;
  lastSyncedAt: string | null;
  localVersion: number;
  serverVersion: number | null;
}
