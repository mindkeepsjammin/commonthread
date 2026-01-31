import { useRef, useEffect } from 'react';
import { FlatList, View } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import ChatBubble from './ChatBubble';
import type { AlderWynMessage } from '@/types';

interface MessageListProps {
  messages: AlderWynMessage[];
  isLoading?: boolean;
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  if (messages.length === 0 && !isLoading) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <Text variant="titleMedium" className="mb-2 text-neutral-700">
          Alder Wyn
        </Text>
        <Text variant="bodyMedium" className="text-center text-neutral-500">
          I'm here to help you reflect on your experiences and relationships.
          What's been on your mind lately?
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      ref={listRef}
      data={messages}
      keyExtractor={(_, index) => index.toString()}
      renderItem={({ item }) => <ChatBubble message={item} />}
      contentContainerStyle={{ padding: 16 }}
      onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      ListFooterComponent={
        isLoading ? (
          <View className="mb-3 max-w-[80%] self-start">
            <Text variant="labelSmall" className="mb-1 text-neutral-500">
              Alder Wyn
            </Text>
            <View className="flex-row items-center rounded-2xl rounded-bl-sm bg-neutral-100 px-4 py-3">
              <ActivityIndicator size="small" />
              <Text variant="bodySmall" className="ml-2 text-neutral-500">
                Reflecting...
              </Text>
            </View>
          </View>
        ) : null
      }
    />
  );
}
