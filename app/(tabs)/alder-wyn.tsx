import { View, ScrollView } from 'react-native';
import { Text, Card, TextInput } from 'react-native-paper';
import { useState } from 'react';

export default function AlderWynScreen() {
  const [message, setMessage] = useState('');

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        <Card className="mb-4">
          <Card.Content>
            <Text variant="titleMedium" className="mb-2">
              Alder Wyn
            </Text>
            <Text variant="bodyMedium" className="mb-4 text-gray-600">
              I'm here to help you reflect on your experiences and relationships. I'm not a
              therapist, but I can help you explore your thoughts and feelings.
            </Text>
            <Text variant="bodySmall" className="italic text-gray-500">
              "What's been on your mind lately?"
            </Text>
          </Card.Content>
        </Card>

        <View className="items-center py-8">
          <Text variant="bodyMedium" className="text-center text-gray-500">
            Start a conversation by typing a message below
          </Text>
        </View>
      </ScrollView>

      <View className="flex-row items-center border-t border-gray-200 bg-white p-2">
        <TextInput
          mode="outlined"
          placeholder="Type a message..."
          value={message}
          onChangeText={setMessage}
          className="flex-1"
          dense
          right={
            <TextInput.Icon
              icon="send"
              onPress={() => {
                // TODO: Send message to Alder Wyn
                setMessage('');
              }}
            />
          }
        />
      </View>
    </View>
  );
}
