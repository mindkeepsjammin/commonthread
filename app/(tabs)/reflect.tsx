import { useState, useMemo } from 'react';
import { View, FlatList, ActivityIndicator } from 'react-native';
import { Text, FAB, Card, Chip, Portal, Modal, Dialog, Button, useTheme } from 'react-native-paper';
import { useReflections, useCreateReflection, useUpdateReflection, useDeleteReflection } from '@/hooks/use-reflections';
import { useReflectionsSharedWithMe } from '@/hooks/use-reflections-shared-with-me';
import { useFamilies, useFamilyMembers } from '@/hooks/use-families';
import { useAuthStore } from '@/hooks/use-auth-store';
import { ReflectionCard, ReflectionForm } from '@/components/reflections';
import { useSnackbar } from '@/hooks/use-snackbar';
import type { Reflection } from '@/types';
import type { ReflectionCreateInput } from '@/lib/validations';

type FilterType = Reflection['type'] | 'shared_with_me' | undefined;

const FILTERS: { value: FilterType; label: string }[] = [
  { value: undefined, label: 'All' },
  { value: 'journal', label: 'Journal' },
  { value: 'check_in', label: 'Check-ins' },
  { value: 'exercise', label: 'Exercises' },
  { value: 'shared_with_me', label: 'Shared with me' },
];

export default function ReflectScreen() {
  const theme = useTheme();
  const [filter, setFilter] = useState<FilterType>(undefined);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingReflection, setEditingReflection] = useState<Reflection | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { user } = useAuthStore();
  const isSharedFilter = filter === 'shared_with_me';
  const reflectionTypeFilter = isSharedFilter ? undefined : filter as Reflection['type'] | undefined;
  const { data: ownReflections, isLoading: loadingOwn } = useReflections(reflectionTypeFilter);
  const { data: sharedWithMe, isLoading: loadingShared } = useReflectionsSharedWithMe();
  const reflections = isSharedFilter ? sharedWithMe : ownReflections;
  const isLoading = isSharedFilter ? loadingShared : loadingOwn;
  const { data: families } = useFamilies();
  const firstFamilyId = families?.[0]?.id ?? null;
  const { data: members } = useFamilyMembers(firstFamilyId);
  const familyMembers = (members ?? [])
    .filter(m => m.userId !== user?.id)
    .map(m => ({ userId: m.userId, displayName: m.displayName }));
  const userIdToName = useMemo(() => {
    const map = new Map<string, string>();
    (members ?? []).forEach(m => map.set(m.userId, m.displayName));
    return map;
  }, [members]);
  const createMutation = useCreateReflection();
  const updateMutation = useUpdateReflection();
  const deleteMutation = useDeleteReflection();
  const { showSnackbar } = useSnackbar();

  const handleCreate = async (data: ReflectionCreateInput) => {
    try {
      await createMutation.mutateAsync(data);
      setShowCreateModal(false);
      showSnackbar('Reflection created', 'success');
    } catch {
      showSnackbar('Failed to create reflection', 'error');
    }
  };

  const handleUpdate = async (data: ReflectionCreateInput) => {
    if (!editingReflection) return;
    try {
      await updateMutation.mutateAsync({ id: editingReflection.id, ...data });
      setEditingReflection(null);
      showSnackbar('Reflection updated', 'success');
    } catch {
      showSnackbar('Failed to update reflection', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget);
      setDeleteTarget(null);
      showSnackbar('Reflection deleted', 'success');
    } catch {
      showSnackbar('Failed to delete reflection', 'error');
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      <View className="p-4 pb-0">
        <Text variant="headlineMedium" className="mb-2" style={{ color: theme.colors.onBackground }}>
          Your Reflections
        </Text>
        <Text variant="bodyMedium" className="mb-4" style={{ color: theme.colors.onSurfaceVariant }}>
          Capture your thoughts, feelings, and experiences
        </Text>

        <View className="mb-4 flex-row flex-wrap gap-2">
          {FILTERS.map(f => (
            <Chip
              key={f.label}
              mode="outlined"
              selected={filter === f.value}
              onPress={() => setFilter(f.value)}
            >
              {f.label}
            </Chip>
          ))}
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      ) : !reflections || reflections.length === 0 ? (
        <View className="px-4">
          <Card className="mb-4">
            <Card.Content>
              <View className="items-center py-8">
                <Text variant="titleMedium" className="mb-2 text-center" style={{ color: theme.colors.onBackground }}>
                  No reflections yet
                </Text>
                <Text variant="bodyMedium" className="text-center" style={{ color: theme.colors.onSurfaceVariant }}>
                  Tap the + button to create your first reflection
                </Text>
              </View>
            </Card.Content>
          </Card>
        </View>
      ) : (
        <FlatList
          data={reflections}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
          renderItem={({ item }) => {
            const received = isSharedFilter && 'authorName' in item;
            return (
              <ReflectionCard
                reflection={item}
                onPress={() => !received && setEditingReflection(item)}
                onDelete={received ? undefined : () => setDeleteTarget(item.id)}
                showAuthor={received}
                authorName={received ? (item as any).authorName : undefined}
                sharedWithNames={
                  !received && item.isShareable && item.sharedWith.length > 0
                    ? item.sharedWith.map(id => userIdToName.get(id)).filter((n): n is string => !!n)
                    : undefined
                }
              />
            );
          }}
        />
      )}

      <FAB
        icon="plus"
        className="absolute bottom-4 right-4"
        onPress={() => setShowCreateModal(true)}
        label="New Entry"
      />

      {/* Create Modal */}
      <Portal>
        <Modal
          visible={showCreateModal}
          onDismiss={() => setShowCreateModal(false)}
          contentContainerStyle={{
            backgroundColor: theme.colors.surface,
            margin: 16,
            padding: 20,
            borderRadius: 12,
            maxHeight: '85%',
          }}
        >
          <Text variant="titleLarge" className="mb-4" style={{ color: theme.colors.onBackground }}>
            New Reflection
          </Text>
          <ReflectionForm
            onSubmit={handleCreate}
            familyMembers={familyMembers}
            isLoading={createMutation.isPending}
            submitLabel="Create"
          />
        </Modal>
      </Portal>

      {/* Edit Modal */}
      <Portal>
        <Modal
          visible={!!editingReflection}
          onDismiss={() => setEditingReflection(null)}
          contentContainerStyle={{
            backgroundColor: theme.colors.surface,
            margin: 16,
            padding: 20,
            borderRadius: 12,
            maxHeight: '85%',
          }}
        >
          <Text variant="titleLarge" className="mb-4" style={{ color: theme.colors.onBackground }}>
            Edit Reflection
          </Text>
          {editingReflection && (
            <ReflectionForm
              onSubmit={handleUpdate}
              initialValues={{
                type: editingReflection.type,
                content: editingReflection.content.text,
                moodScore: editingReflection.moodScore ?? undefined,
                isShareableWithFamily: editingReflection.isShareable,
                sharedWith: editingReflection.sharedWith,
              }}
              familyMembers={familyMembers}
              isLoading={updateMutation.isPending}
              submitLabel="Update"
            />
          )}
        </Modal>
      </Portal>

      {/* Delete Confirmation */}
      <Portal>
        <Dialog visible={!!deleteTarget} onDismiss={() => setDeleteTarget(null)}>
          <Dialog.Title>Delete Reflection</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to delete this reflection? This cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteTarget(null)} disabled={deleteMutation.isPending}>
              Cancel
            </Button>
            <Button
              onPress={handleDelete}
              loading={deleteMutation.isPending}
              disabled={deleteMutation.isPending}
              textColor="#dc2626"
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}
