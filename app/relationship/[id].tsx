import { View, ScrollView } from 'react-native';
import { Text, Card, ProgressBar, Button, ActivityIndicator, Chip } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { useRelationship, useCheckIn } from '@/hooks/use-relationships';
import { useSnackbar } from '@/hooks/use-snackbar';

export default function RelationshipDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading } = useRelationship(id);
  const checkInMutation = useCheckIn();
  const { showSnackbar } = useSnackbar();

  const handleCheckIn = async () => {
    if (!id) return;
    try {
      await checkInMutation.mutateAsync(id);
      showSnackbar('Checked in!', 'success');
    } catch {
      showSnackbar('Failed to check in', 'error');
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!data) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50 p-4">
        <Text variant="bodyLarge" className="text-neutral-500 text-center">
          Relationship not found.
        </Text>
        <Button mode="contained-tonal" className="mt-4" onPress={() => router.back()}>
          Go Back
        </Button>
      </View>
    );
  }

  const { relationship, heart, otherUserName } = data;
  const healthScore = heart?.healthScore ?? 50;
  const commonThreads = heart?.commonThreads ?? [];

  return (
    <ScrollView className="flex-1 bg-neutral-50">
      <View className="p-4">
        <Text variant="headlineMedium" className="mb-1 text-neutral-900">
          {otherUserName}
        </Text>
        {relationship.relationshipType && (
          <Chip compact className="self-start mb-4">
            {relationship.relationshipType}
          </Chip>
        )}
        {!relationship.relationshipType && <View className="mb-4" />}

        <Card className="mb-4">
          <Card.Content>
            <Text variant="titleMedium" className="mb-2">
              Relational Heart
            </Text>

            <Text variant="titleSmall" className="mb-2 text-neutral-600">
              Health Score
            </Text>
            <ProgressBar
              progress={healthScore / 100}
              color={healthScore > 66 ? '#22c55e' : healthScore > 33 ? '#f59e0b' : '#ef4444'}
              className="mb-2 h-3 rounded-full"
            />
            <Text variant="bodySmall" className="text-neutral-500">
              {healthScore}%{' '}
              {healthScore > 66
                ? '— Looking good!'
                : healthScore > 33
                  ? '— Room to grow'
                  : '— Needs attention'}
            </Text>
          </Card.Content>
        </Card>

        <Card className="mb-4">
          <Card.Content>
            <Text variant="titleMedium" className="mb-2">
              Shared Reflections
            </Text>
            {(heart?.sharedReflections?.length ?? 0) > 0 ? (
              <Text variant="bodyMedium" className="text-neutral-600">
                {heart!.sharedReflections.length} shared{' '}
                {heart!.sharedReflections.length === 1 ? 'reflection' : 'reflections'}
              </Text>
            ) : (
              <Text variant="bodyMedium" className="text-neutral-500">
                No shared reflections yet. Share some reflections to see them here.
              </Text>
            )}
          </Card.Content>
        </Card>

        <Card className="mb-4">
          <Card.Content>
            <Text variant="titleMedium" className="mb-2">
              Common Threads
            </Text>
            {commonThreads.length > 0 ? (
              <View className="gap-2">
                {commonThreads.map(thread => (
                  <View key={thread.id} className="flex-row items-center gap-2">
                    <Chip compact>{thread.theme}</Chip>
                    <Text variant="bodySmall" className="text-neutral-400">
                      {new Date(thread.discoveredAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text variant="bodyMedium" className="text-neutral-500">
                Themes and patterns discovered in your relationship will appear here.
              </Text>
            )}
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          icon="heart-pulse"
          className="mb-3"
          onPress={handleCheckIn}
          loading={checkInMutation.isPending}
          disabled={checkInMutation.isPending}
        >
          Check In
        </Button>

        <Button
          mode="contained-tonal"
          className="mb-4"
          onPress={() => router.push('/(tabs)/alder-wyn')}
        >
          Chat About This Relationship
        </Button>
      </View>
    </ScrollView>
  );
}
