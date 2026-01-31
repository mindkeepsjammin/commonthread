import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AlderWynMessage } from '@/types';

interface ChatResponse {
  conversationId: string;
  reply: AlderWynMessage;
}

interface SendMessageParams {
  conversationId?: string;
  message: string;
  userId: string;
  contextType?: 'personal' | 'relational' | 'collective';
}

async function fetchConversation(userId: string) {
  // Load most recent conversation for the user
  const res = await fetch('/api/alder-wyn/history?' + new URLSearchParams({ userId }));
  if (!res.ok) return null;
  return res.json();
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
      queryClient.invalidateQueries({ queryKey: ['conversation'] });
    },
  });
}
