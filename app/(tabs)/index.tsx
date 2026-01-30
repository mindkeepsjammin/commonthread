import { View, ScrollView } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { useProfile } from '@/hooks/use-profile';

export default function HomeScreen() {
  const { data: profile } = useProfile();

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <Text variant="headlineMedium" className="mb-2">
          Welcome back{profile?.displayName ? `, ${profile.displayName}` : ''}
        </Text>
        <Text variant="bodyMedium" className="mb-6 text-gray-500">
          Your family connections at a glance
        </Text>

        <Card className="mb-4">
          <Card.Content>
            <Text variant="titleMedium" className="mb-2">
              Your Relationships
            </Text>
            <Text variant="bodyMedium" className="text-gray-500">
              No relationships yet. Join or create a family to start connecting.
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => router.push('/(tabs)/family')}>Get Started</Button>
          </Card.Actions>
        </Card>

        <Card className="mb-4">
          <Card.Content>
            <Text variant="titleMedium" className="mb-2">
              Recent Reflections
            </Text>
            <Text variant="bodyMedium" className="text-gray-500">
              Start journaling to see your recent reflections here.
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => router.push('/(tabs)/reflect')}>Start Reflecting</Button>
          </Card.Actions>
        </Card>

        <Card>
          <Card.Content>
            <Text variant="titleMedium" className="mb-2">
              Chat with Alder Wyn
            </Text>
            <Text variant="bodyMedium" className="text-gray-500">
              Your gentle AI companion for reflection and growth.
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => router.push('/(tabs)/alder-wyn')}>Start Conversation</Button>
          </Card.Actions>
        </Card>
      </View>
    </ScrollView>
  );
}
