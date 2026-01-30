import { View, ScrollView } from 'react-native';
import { Text, Card, ProgressBar, Button } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';

export default function RelationshipDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // Placeholder data
  const healthScore = 75;

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <Card className="mb-4">
          <Card.Content>
            <Text variant="titleLarge" className="mb-2">
              Relational Heart
            </Text>
            <Text variant="bodyMedium" className="mb-4 text-gray-500">
              Relationship ID: {id}
            </Text>

            <Text variant="titleMedium" className="mb-2">
              Health Score
            </Text>
            <ProgressBar
              progress={healthScore / 100}
              color={healthScore > 66 ? '#22c55e' : healthScore > 33 ? '#f59e0b' : '#ef4444'}
              className="mb-2 h-3 rounded-full"
            />
            <Text variant="bodySmall" className="text-gray-500">
              {healthScore}% - Looking good!
            </Text>
          </Card.Content>
        </Card>

        <Card className="mb-4">
          <Card.Content>
            <Text variant="titleMedium" className="mb-2">
              Shared Reflections
            </Text>
            <Text variant="bodyMedium" className="text-gray-500">
              No shared reflections yet. Share some reflections to see them here.
            </Text>
          </Card.Content>
        </Card>

        <Card className="mb-4">
          <Card.Content>
            <Text variant="titleMedium" className="mb-2">
              Common Threads
            </Text>
            <Text variant="bodyMedium" className="text-gray-500">
              Themes and patterns discovered in your relationship will appear here.
            </Text>
          </Card.Content>
        </Card>

        <Button mode="contained" className="mb-4">
          Chat About This Relationship
        </Button>
      </View>
    </ScrollView>
  );
}
