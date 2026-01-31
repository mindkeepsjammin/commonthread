import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const signupSchema = z
  .object({
    displayName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const newPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmNewPassword: z.string(),
  })
  .refine(data => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

export const changeEmailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

// Profile schemas
export const profileUpdateSchema = z.object({
  displayName: z.string().min(2).max(100).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  dateOfBirth: z.string().datetime().optional().nullable(),
  role: z.enum(['child', 'teen', 'adult', 'elder']).optional(),
});

// Reflection schemas
export const reflectionCreateSchema = z.object({
  type: z.enum(['journal', 'check_in', 'exercise', 'prompt_response']),
  content: z.string().min(1, 'Content is required'),
  moodScore: z.number().min(1).max(10).optional(),
  isShareableWithFamily: z.boolean().default(false),
  sharedWith: z.array(z.string().uuid()).default([]),
  promptId: z.string().optional(),
  promptText: z.string().optional(),
  exerciseId: z.string().optional(),
  exerciseTitle: z.string().optional(),
  exerciseSteps: z.array(z.string()).optional(),
  exerciseClosingQuestion: z.string().optional(),
});

export const suggestionRequestSchema = z.object({
  userId: z.string().uuid(),
  type: z.enum(['prompt', 'exercise']),
  previousIds: z.array(z.string()).optional(),
});

export const reflectionUpdateSchema = reflectionCreateSchema.partial();

// Family schemas
export const familyCreateSchema = z.object({
  name: z.string().min(2, 'Family name must be at least 2 characters').max(100),
});

export const familyJoinSchema = z.object({
  inviteCode: z.string().length(8, 'Invite code must be 8 characters'),
});

// Family invite schema
export const familyInviteSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export type FamilyInviteInput = z.infer<typeof familyInviteSchema>;

// Sharing settings schema
export const sharingSettingsSchema = z.object({
  targetUserId: z.string().uuid().optional(),
  targetFamilyId: z.string().uuid().optional(),
  shareableFields: z.array(z.string()),
});

// Alder Wyn schemas
export const alderWynMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1, 'Message content is required'),
  timestamp: z.string(),
});

export const alderWynSendMessageSchema = z.object({
  conversationId: z.string().uuid().optional(),
  message: z.string().min(1, 'Message is required').max(5000, 'Message too long'),
  contextType: z.enum(['personal', 'relational', 'collective']).default('personal'),
  contextId: z.string().uuid().optional(),
  userId: z.string().uuid(),
});

// Type exports
export type AlderWynMessageInput = z.infer<typeof alderWynMessageSchema>;
export type AlderWynSendMessageInput = z.infer<typeof alderWynSendMessageSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type ReflectionCreateInput = z.infer<typeof reflectionCreateSchema>;
export type ReflectionUpdateInput = z.infer<typeof reflectionUpdateSchema>;
export type FamilyCreateInput = z.infer<typeof familyCreateSchema>;
export type FamilyJoinInput = z.infer<typeof familyJoinSchema>;
export type SharingSettingsInput = z.infer<typeof sharingSettingsSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type NewPasswordInput = z.infer<typeof newPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ChangeEmailInput = z.infer<typeof changeEmailSchema>;
export type SuggestionRequestInput = z.infer<typeof suggestionRequestSchema>;
