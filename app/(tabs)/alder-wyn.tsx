import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useState, useCallback } from 'react';
import MessageList from '@/components/chat/MessageList';
import { useSendMessage } from '@/hooks/use-conversations';
import { useAuthStore } from '@/hooks/use-auth-store';
import type { AlderWynMessage } from '@/types';

export default function AlderWynScreen() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<AlderWynMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const { user } = useAuthStore();
  const sendMutation = useSendMessage();

  const handleSend = useCallback(() => {
    const text = message.trim();
    if (!text || !user || sendMutation.isPending) return;

    const userMessage: AlderWynMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage('');

    sendMutation.mutate(
      { conversationId, message: text, userId: user.id },
      {
        onSuccess: (data) => {
          setConversationId(data.conversationId);
          setMessages((prev) => [...prev, data.reply]);
        },
        onError: () => {
          setMessages((prev) => [
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
  }, [message, user, conversationId, sendMutation]);

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-neutral-50"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <MessageList messages={messages} isLoading={sendMutation.isPending} />

      <View className="flex-row items-center border-t border-neutral-200 bg-white p-2">
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
