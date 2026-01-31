import { View } from 'react-native';
import { Text } from 'react-native-paper';
import type { AlderWynMessage } from '@/types';

interface ChatBubbleProps {
  message: AlderWynMessage;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <View className={`mb-3 max-w-[80%] ${isUser ? 'self-end' : 'self-start'}`}>
      {!isUser && (
        <Text variant="labelSmall" className="mb-1 text-neutral-500">
          Alder Wyn
        </Text>
      )}
      <View
        className={`rounded-2xl px-4 py-3 ${
          isUser
            ? 'rounded-br-sm bg-primary-500'
            : 'rounded-bl-sm bg-neutral-100'
        }`}
      >
        <Text
          variant="bodyMedium"
          className={isUser ? 'text-white' : 'text-neutral-900'}
        >
          {message.content}
        </Text>
      </View>
    </View>
  );
}
