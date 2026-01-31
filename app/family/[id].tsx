import { View, FlatList } from 'react-native';
import { Text, Card, Chip, ActivityIndicator, Button, useTheme } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { useFamilies, useFamilyMembers } from '@/hooks/use-families';
import { useFindRelationship, useCreateRelationship } from '@/hooks/use-find-relationship';
import { useAuthStore } from '@/hooks/use-auth-store';
import { Avatar } from '@/components/ui';
import { useState } from 'react';
import type { FamilyMemberInfo } from '@/hooks/use-families';
import type { Href } from 'expo-router';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  member: 'Member',
  child: 'Child',
};

export default function FamilyDetailScreen() {
  const theme = useTheme();
  const { id: familyId } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { data: families } = useFamilies();
  const { data: members, isLoading } = useFamilyMembers(familyId ?? null);

  const family = families?.find(f => f.id === familyId);
  const otherMembers = (members ?? []).filter(m => m.userId !== user?.id);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      <View className="p-4 pb-0">
        <Text variant="headlineMedium" className="mb-1" style={{ color: theme.colors.onBackground }}>
          {family?.name ?? 'Family'}
        </Text>
        <Text variant="bodyMedium" className="mb-4" style={{ color: theme.colors.onSurfaceVariant }}>
          {members?.length ?? 0} {(members?.length ?? 0) === 1 ? 'member' : 'members'}
        </Text>
      </View>

      {otherMembers.length === 0 ? (
        <View className="px-4">
          <Card>
            <Card.Content>
              <View className="items-center py-8">
                <Text variant="titleMedium" className="mb-2 text-center" style={{ color: theme.colors.onBackground }}>
                  No other members yet
                </Text>
                <Text variant="bodyMedium" className="text-center" style={{ color: theme.colors.onSurfaceVariant }}>
                  Invite family members to start connecting
                </Text>
              </View>
            </Card.Content>
          </Card>
        </View>
      ) : (
        <FlatList
          data={otherMembers}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
          renderItem={({ item }) => (
            <MemberCard member={item} familyId={familyId!} />
          )}
        />
      )}
    </View>
  );
}

function MemberCard({ member, familyId }: { member: FamilyMemberInfo; familyId: string }) {
  const theme = useTheme();
  const [navigating, setNavigating] = useState(false);
  const { data: relationshipId, isLoading: findingRelationship } = useFindRelationship(member.userId);
  const createRelationship = useCreateRelationship();

  const handlePress = async () => {
    if (navigating) return;
    setNavigating(true);

    try {
      let relId = relationshipId;
      if (!relId) {
        relId = await createRelationship.mutateAsync({
          otherUserId: member.userId,
          familyId,
        });
      }
      router.push(`/relationship/${relId}` as Href);
    } catch {
      // Navigation failed — reset state
    } finally {
      setNavigating(false);
    }
  };

  return (
    <Card className="mb-3" onPress={handlePress}>
      <Card.Content>
        <View className="flex-row items-center">
          <Avatar name={member.displayName} size="small" />
          <View className="ml-3 flex-1">
            <Text variant="titleMedium" style={{ color: theme.colors.onBackground }}>
              {member.displayName}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
              {ROLE_LABELS[member.role] ?? member.role}
            </Text>
          </View>
          {(findingRelationship || navigating) && <ActivityIndicator size="small" />}
        </View>
      </Card.Content>
    </Card>
  );
}
