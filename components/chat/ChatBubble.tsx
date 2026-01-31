import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { shadows } from '@/lib/theme';
import type { AlderWynMessage } from '@/types';

interface ChatBubbleProps {
  message: AlderWynMessage;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <View className={`mb-3 max-w-[80%] ${isUser ? 'self-end' : 'self-start'}`}>
      {!isUser && (
        <Text
          variant="labelSmall"
          className="mb-1"
          style={{ fontFamily: 'Merriweather-Regular', color: '#9a968b' }}
        >
          Alder Wyn
        </Text>
      )}
      <View
        className={`rounded-3xl px-4 py-3 ${
          isUser ? 'rounded-br-sm bg-primary-400' : 'rounded-bl-sm bg-[#F9F5F1]'
        }`}
        style={!isUser ? shadows.sm : undefined}
      >
        <Text variant="bodyMedium" className={isUser ? 'text-white' : 'text-neutral-900'}>
          {message.content}
        </Text>
      </View>
    </View>
  );
}
