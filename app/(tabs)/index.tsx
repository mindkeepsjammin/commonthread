import { View, ScrollView } from 'react-native';
import { Text, Card, Button, Chip, ActivityIndicator } from 'react-native-paper';
import { router } from 'expo-router';
import { useProfile } from '@/hooks/use-profile';
import { useReflections } from '@/hooks/use-reflections';
import { useFamilies } from '@/hooks/use-families';
import type { Reflection } from '@/types';

const TYPE_LABELS: Record<Reflection['type'], string> = {
  journal: 'Journal',
  check_in: 'Check-in',
  exercise: 'Exercise',
  prompt_response: 'Prompt',
};

export default function HomeScreen() {
  const { data: profile } = useProfile();
  const { data: reflections, isLoading: reflectionsLoading } = useReflections();
  const { data: families, isLoading: familiesLoading } = useFamilies();

  const recentReflections = reflections?.slice(0, 3) ?? [];
  const hasFamilies = (families?.length ?? 0) > 0;
  const hasReflections = recentReflections.length > 0;

  return (
    <ScrollView className="flex-1 bg-neutral-50">
      <View className="px-5 pb-8 pt-6">
        <Text variant="headlineMedium" className="mb-1 text-neutral-900">
          Welcome back{profile?.displayName ? `, ${profile.displayName}` : ''}
        </Text>
        <Text variant="bodyMedium" className="mb-5 text-neutral-500">
          Your family connections at a glance
        </Text>

        <View className="flex-row gap-3 mb-8">
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
        <Card mode="outlined" className="mb-5 overflow-hidden rounded-2xl border-neutral-200">
          <View className="h-1.5 bg-primary-400" />
          <Card.Content className="pt-5">
            <Text variant="titleMedium" className="mb-1 text-neutral-900">
              Your Families
            </Text>
            {familiesLoading ? (
              <ActivityIndicator size="small" className="my-4" />
            ) : hasFamilies ? (
              <View className="mt-2">
                {families!.map(family => (
                  <View
                    key={family.id}
                    className="flex-row items-center justify-between py-2 border-b border-neutral-100"
                  >
                    <View>
                      <Text variant="bodyMedium" className="text-neutral-900">
                        {family.name}
                      </Text>
                      <Text variant="bodySmall" className="text-neutral-400">
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
              <Text variant="bodyMedium" className="text-neutral-500">
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
        <Card mode="outlined" className="mb-5 overflow-hidden rounded-2xl border-neutral-200">
          <View className="h-1.5 bg-secondary-400" />
          <Card.Content className="pt-5">
            <Text variant="titleMedium" className="mb-1 text-neutral-900">
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
                    <View
                      key={reflection.id}
                      className="py-2 border-b border-neutral-100"
                    >
                      <View className="flex-row items-center gap-2 mb-1">
                        <Chip compact textStyle={{ fontSize: 11 }}>
                          {TYPE_LABELS[reflection.type]}
                        </Chip>
                        <Text variant="bodySmall" className="text-neutral-400">
                          {dateStr}
                        </Text>
                      </View>
                      <Text variant="bodyMedium" className="text-neutral-700">
                        {preview}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text variant="bodyMedium" className="text-neutral-500">
                Start journaling to see your recent reflections here.
              </Text>
            )}
          </Card.Content>
          <Card.Actions className="px-4 pb-4">
            <Button
              mode="contained-tonal"
              onPress={() => router.push('/(tabs)/reflect')}
            >
              {hasReflections ? 'View All' : 'Start Reflecting'}
            </Button>
          </Card.Actions>
        </Card>

        {/* Alder Wyn Card */}
        <Card mode="outlined" className="mb-5 overflow-hidden rounded-2xl border-neutral-200">
          <View className="h-1.5 bg-accent-400" />
          <Card.Content className="pt-5">
            <Text variant="titleMedium" className="mb-1 text-neutral-900">
              Chat with Alder Wyn
            </Text>
            <Text variant="bodyMedium" className="text-neutral-500">
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
