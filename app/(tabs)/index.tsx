import { View, ScrollView } from 'react-native';
import { Text, Card, Button, Chip, ActivityIndicator, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { useProfile } from '@/hooks/use-profile';
import { useReflections } from '@/hooks/use-reflections';
import { useFamilies } from '@/hooks/use-families';
import { shadows } from '@/lib/theme';
import type { Reflection } from '@/types';

const TYPE_LABELS: Record<Reflection['type'], string> = {
  journal: 'Journal',
  check_in: 'Check-in',
  exercise: 'Exercise',
  prompt_response: 'Prompt',
};

export default function HomeScreen() {
  const theme = useTheme();
  const { data: profile } = useProfile();
  const { data: reflections, isLoading: reflectionsLoading } = useReflections();
  const { data: families, isLoading: familiesLoading } = useFamilies();

  const recentReflections = reflections?.slice(0, 3) ?? [];
  const hasFamilies = (families?.length ?? 0) > 0;
  const hasReflections = recentReflections.length > 0;

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      <View className="px-5 pb-8 pt-6">
        <Text
          variant="headlineMedium"
          className="mb-1"
          style={{ color: theme.colors.onBackground }}
        >
          Welcome back{profile?.displayName ? `, ${profile.displayName}` : ''}
        </Text>
        <Text
          variant="bodyMedium"
          className="mb-5"
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          Your family connections at a glance
        </Text>

        <View className="mb-8 flex-row gap-3">
          <Button
            mode="contained"
            icon="pencil-plus-outline"
            onPress={() => router.push('/(tabs)/reflect')}
            className="flex-1"
          >
            New Reflection
          </Button>
          <Button
            mode="contained-tonal"
            icon="account-multiple-plus-outline"
            onPress={() => router.push('/(tabs)/family')}
            className="flex-1"
          >
            New Family
          </Button>
        </View>

        {/* Families Card */}
        <Card mode="elevated" className="mb-5 overflow-hidden rounded-2xl" style={shadows.md}>
          <View className="h-1.5 bg-primary-400" />
          <Card.Content className="pt-5">
            <Text
              variant="titleMedium"
              className="mb-1"
              style={{ color: theme.colors.onBackground }}
            >
              Your Families
            </Text>
            {familiesLoading ? (
              <ActivityIndicator size="small" className="my-4" />
            ) : hasFamilies ? (
              <View className="mt-2">
                {families!.map(family => (
                  <View
                    key={family.id}
                    className="flex-row items-center justify-between border-b border-neutral-100 py-2"
                  >
                    <View>
                      <Text variant="bodyMedium" style={{ color: theme.colors.onBackground }}>
                        {family.name}
                      </Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                        {family.memberCount} {family.memberCount === 1 ? 'member' : 'members'}
                      </Text>
                    </View>
                    <Chip compact textStyle={{ fontSize: 12 }}>
                      {family.userRole === 'admin' ? 'Admin' : 'Member'}
                    </Chip>
                  </View>
                ))}
              </View>
            ) : (
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                No families yet. Join or create a family to start connecting.
              </Text>
            )}
          </Card.Content>
          {!hasFamilies && !familiesLoading && (
            <Card.Actions className="px-4 pb-4">
              <Button mode="contained-tonal" onPress={() => router.push('/(tabs)/family')}>
                Get Started
              </Button>
            </Card.Actions>
          )}
        </Card>

        {/* Recent Reflections Card */}
        <Card mode="elevated" className="mb-5 overflow-hidden rounded-2xl" style={shadows.md}>
          <View className="h-1.5 bg-secondary-400" />
          <Card.Content className="pt-5">
            <Text
              variant="titleMedium"
              className="mb-1"
              style={{ color: theme.colors.onBackground }}
            >
              Recent Reflections
            </Text>
            {reflectionsLoading ? (
              <ActivityIndicator size="small" className="my-4" />
            ) : hasReflections ? (
              <View className="mt-2">
                {recentReflections.map(reflection => {
                  const preview =
                    reflection.content.text.length > 100
                      ? reflection.content.text.slice(0, 100) + '...'
                      : reflection.content.text;
                  const dateStr = new Date(reflection.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <View key={reflection.id} className="border-b border-neutral-100 py-2">
                      <View className="mb-1 flex-row items-center gap-2">
                        <Chip compact textStyle={{ fontSize: 11 }}>
                          {TYPE_LABELS[reflection.type]}
                        </Chip>
                        <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                          {dateStr}
                        </Text>
                      </View>
                      <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                        {preview}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Start journaling to see your recent reflections here.
              </Text>
            )}
          </Card.Content>
          <Card.Actions className="px-4 pb-4">
            <Button mode="contained-tonal" onPress={() => router.push('/(tabs)/reflect')}>
              {hasReflections ? 'View All' : 'Start Reflecting'}
            </Button>
          </Card.Actions>
        </Card>

        {/* Alder Wyn Card */}
        <Card mode="elevated" className="mb-5 overflow-hidden rounded-2xl" style={shadows.md}>
          <View className="h-1.5 bg-accent-400" />
          <Card.Content className="pt-5">
            <Text
              variant="titleMedium"
              className="mb-1"
              style={{ color: theme.colors.onBackground }}
            >
              Chat with Alder Wyn
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Your gentle AI companion for reflection and growth.
            </Text>
          </Card.Content>
          <Card.Actions className="px-4 pb-4">
            <Button mode="contained-tonal" onPress={() => router.push('/(tabs)/alder-wyn')}>
              Start Conversation
            </Button>
          </Card.Actions>
        </Card>
      </View>
    </ScrollView>
  );
}
