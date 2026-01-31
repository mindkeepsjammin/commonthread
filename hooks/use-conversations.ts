import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AlderWynConversation, AlderWynMessage } from '@/types';

interface ChatResponse {
  conversationId: string;
  reply: AlderWynMessage;
}

interface SendMessageParams {
  conversationId?: string;
  message: string;
  userId: string;
  contextType?: 'personal' | 'relational' | 'collective';
  contextId?: string;
}

async function sendMessage(params: SendMessageParams): Promise<ChatResponse> {
  const res = await fetch('/api/alder-wyn/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Failed to send message');
  }
  return res.json();
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation-history'] });
      queryClient.invalidateQueries({ queryKey: ['conversations-list'] });
    },
  });
}

// --- Conversation history ---

export interface ConversationHistoryParams {
  userId: string;
  contextType?: 'personal' | 'relational' | 'collective';
  contextId?: string;
}

async function fetchConversationHistory(
  params: ConversationHistoryParams
): Promise<AlderWynConversation | null> {
  const queryParams = new URLSearchParams({ userId: params.userId });
  if (params.contextType) queryParams.set('contextType', params.contextType);
  if (params.contextId) queryParams.set('contextId', params.contextId);

  const res = await fetch(`/api/alder-wyn/history?${queryParams}`);
  if (!res.ok) {
    throw new Error('Failed to load conversation history');
  }
  const data = await res.json();
  return data.conversation as AlderWynConversation | null;
}

export function useConversationHistory(params: ConversationHistoryParams | null) {
  return useQuery({
    queryKey: [
      'conversation-history',
      params?.userId,
      params?.contextType,
      params?.contextId,
    ],
    queryFn: () => fetchConversationHistory(params!),
    enabled: !!params?.userId,
    staleTime: 1000 * 60 * 5,
  });
}

// --- Conversations list ---

export interface ConversationListItem {
  id: string;
  userId: string;
  contextType: 'personal' | 'relational' | 'collective';
  contextId: string | null;
  contextName: string | null;
  messageCount: number;
  lastMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

async function fetchConversations(userId: string): Promise<ConversationListItem[]> {
  const res = await fetch(`/api/alder-wyn/conversations?userId=${userId}`);
  if (!res.ok) {
    throw new Error('Failed to load conversations');
  }
  const data = await res.json();
  return data.conversations;
}

export function useConversations(userId: string | undefined) {
  return useQuery({
    queryKey: ['conversations-list', userId],
    queryFn: () => fetchConversations(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}
