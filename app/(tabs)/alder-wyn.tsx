import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useState, useCallback, useEffect } from 'react';
import MessageList from '@/components/chat/MessageList';
import ContextSelector from '@/components/chat/ContextSelector';
import { useSendMessage, useConversationHistory } from '@/hooks/use-conversations';
import { useAuthStore } from '@/hooks/use-auth-store';
import type { AlderWynMessage } from '@/types';

export default function AlderWynScreen() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<AlderWynMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [contextType, setContextType] = useState<'personal' | 'relational' | 'collective'>(
    'personal'
  );
  const { user } = useAuthStore();
  const sendMutation = useSendMessage();

  const { data: conversation, isLoading: isLoadingHistory } = useConversationHistory(
    user?.id ? { userId: user.id, contextType } : null
  );

  // Initialize messages from history when conversation loads or context changes
  useEffect(() => {
    if (conversation) {
      setConversationId(conversation.id);
      setMessages(conversation.messages);
    } else {
      setConversationId(undefined);
      setMessages([]);
    }
  }, [conversation]);

  const handleContextChange = useCallback(
    (newContextType: 'personal' | 'relational' | 'collective') => {
      setContextType(newContextType);
    },
    []
  );

  const handleSend = useCallback(() => {
    const text = message.trim();
    if (!text || !user || sendMutation.isPending) return;

    const userMessage: AlderWynMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');

    sendMutation.mutate(
      { conversationId, message: text, userId: user.id, contextType },
      {
        onSuccess: data => {
          setConversationId(data.conversationId);
          setMessages(prev => [...prev, data.reply]);
        },
        onError: () => {
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              content: 'I had trouble responding. Please try again.',
              timestamp: new Date().toISOString(),
            },
          ]);
        },
      }
    );
  }, [message, user, conversationId, contextType, sendMutation]);

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#F9F5F1]"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <ContextSelector contextType={contextType} onContextTypeChange={handleContextChange} />

      <MessageList messages={messages} isLoading={sendMutation.isPending || isLoadingHistory} />

      <View className="flex-row items-center border-t border-neutral-200 bg-[#FDFCFA] p-3">
        <TextInput
          mode="outlined"
          placeholder="Type a message..."
          value={message}
          onChangeText={setMessage}
          className="flex-1"
          dense
          onSubmitEditing={handleSend}
          right={
            <TextInput.Icon
              icon="send"
              disabled={!message.trim() || sendMutation.isPending}
              onPress={handleSend}
            />
          }
        />
      </View>
    </KeyboardAvoidingView>
  );
}
