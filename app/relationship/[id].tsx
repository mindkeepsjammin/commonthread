import { View, ScrollView } from 'react-native';
import { Text, Card, ProgressBar, Button, ActivityIndicator, Chip, useTheme } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { useRelationship, useCheckIn, useDiscoverThreads } from '@/hooks/use-relationships';
import { useSharedReflections } from '@/hooks/use-shared-reflections';
import { ReflectionCard } from '@/components/reflections';
import { useSnackbar } from '@/hooks/use-snackbar';

export default function RelationshipDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading } = useRelationship(id);
  const checkInMutation = useCheckIn();
  const discoverMutation = useDiscoverThreads();
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

  const handleDiscover = async () => {
    if (!id) return;
    try {
      const threads = await discoverMutation.mutateAsync(id);
      if (threads.length > 0) {
        showSnackbar(`Found ${threads.length} common thread${threads.length > 1 ? 's' : ''}!`, 'success');
      } else {
        showSnackbar('No patterns found yet. Share more reflections!', 'info');
      }
    } catch {
      showSnackbar('Failed to discover threads', 'error');
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!data) {
    return (
      <View className="flex-1 items-center justify-center p-4" style={{ backgroundColor: theme.colors.background }}>
        <Text variant="bodyLarge" className="text-center" style={{ color: theme.colors.onSurfaceVariant }}>
          Relationship not found.
        </Text>
        <Button mode="contained-tonal" className="mt-4" onPress={() => router.back()}>
          Go Back
        </Button>
      </View>
    );
  }

  const { relationship, heart, otherUserName, otherUserId } = data;
  const healthScore = heart?.healthScore ?? 50;
  const commonThreads = heart?.commonThreads ?? [];
  const { data: sharedReflections, isLoading: loadingReflections } = useSharedReflections(otherUserId);

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      <View className="p-4">
        <Text variant="headlineMedium" className="mb-1" style={{ color: theme.colors.onBackground }}>
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
            <Text variant="titleMedium" className="mb-2" style={{ color: theme.colors.onBackground }}>
              Relational Heart
            </Text>

            <Text variant="titleSmall" className="mb-2" style={{ color: theme.colors.onSurfaceVariant }}>
              Health Score
            </Text>
            <ProgressBar
              progress={healthScore / 100}
              color={healthScore > 66 ? '#22c55e' : healthScore > 33 ? '#f59e0b' : '#ef4444'}
              className="mb-2 h-3 rounded-full"
            />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {healthScore}%{' '}
              {healthScore > 66
                ? '— Looking good!'
                : healthScore > 33
                  ? '— Room to grow'
                  : '— Needs attention'}
            </Text>
          </Card.Content>
        </Card>

        <Text variant="titleMedium" className="mb-2" style={{ color: theme.colors.onBackground }}>
          Shared Reflections
        </Text>
        {loadingReflections ? (
          <ActivityIndicator size="small" className="my-4" />
        ) : !sharedReflections || sharedReflections.length === 0 ? (
          <Card className="mb-4">
            <Card.Content>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                No shared reflections yet. Share some reflections to see them here.
              </Text>
            </Card.Content>
          </Card>
        ) : (
          <View className="mb-4">
            {sharedReflections.map(reflection => (
              <ReflectionCard
                key={reflection.id}
                reflection={reflection}
                onPress={() => {}}
                showAuthor
                authorName={reflection.authorName}
              />
            ))}
          </View>
        )}

        <Card className="mb-4">
          <Card.Content>
            <Text variant="titleMedium" className="mb-2" style={{ color: theme.colors.onBackground }}>
              Common Threads
            </Text>
            {commonThreads.length > 0 ? (
              <View className="gap-2">
                {commonThreads.map(thread => (
                  <View key={thread.id} className="flex-row items-center gap-2">
                    <Chip compact>{thread.theme}</Chip>
                    <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                      {new Date(thread.discoveredAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Themes and patterns discovered in your relationship will appear here.
              </Text>
            )}
            {(heart?.sharedReflections?.length ?? 0) >= 3 && (
              <Button
                mode="contained-tonal"
                icon="magnify"
                className="mt-3"
                onPress={handleDiscover}
                loading={discoverMutation.isPending}
                disabled={discoverMutation.isPending}
                compact
              >
                Discover Threads
              </Button>
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
