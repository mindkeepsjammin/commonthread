import { useState } from 'react';
import { View } from 'react-native';
import { Text, Button, TextInput, Dialog, Portal, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { signOut } from '@/lib/neon/auth';
import { useAuthStore } from '@/hooks/use-auth-store';
import { queryClient } from '@/lib/utils/query-client';

export default function DeleteAccountScreen() {
  const theme = useTheme();
  const { reset } = useAuthStore();
  const [confirmText, setConfirmText] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirmText === 'DELETE';

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const userId = useAuthStore.getState().user?.id;
      if (!userId) throw new Error('No user found');

      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Deletion failed');
      }

      await signOut();
      queryClient.clear();
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account. Please contact support.');
      setIsDeleting(false);
      setShowDialog(false);
    }
  };

  return (
    <View className="flex-1 p-6">
      <View className="items-center mb-6">
        <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#dc2626" />
      </View>

      <Text variant="headlineMedium" className="mb-2 text-center" style={{ color: theme.colors.onBackground }}>
        Delete Account
      </Text>
      <Text variant="bodyMedium" className="mb-6 text-center" style={{ color: theme.colors.onSurfaceVariant }}>
        This action is permanent and cannot be undone. All your data, reflections, and family
        connections will be permanently removed.
      </Text>

      {error && (
        <View className="mb-4 rounded-lg p-3" style={{ backgroundColor: theme.colors.errorContainer }}>
          <Text style={{ color: theme.colors.error }}>{error}</Text>
        </View>
      )}

      <Text variant="bodyMedium" className="mb-2" style={{ color: theme.colors.onSurface }}>
        Type DELETE to confirm:
      </Text>
      <TextInput
        mode="outlined"
        value={confirmText}
        onChangeText={setConfirmText}
        autoCapitalize="characters"
        className="mb-6"
      />

      <Button
        mode="contained"
        onPress={() => setShowDialog(true)}
        disabled={!canDelete}
        buttonColor="#dc2626"
        textColor="#ffffff"
      >
        Delete My Account
      </Button>

      <Portal>
        <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)}>
          <Dialog.Title>Final Confirmation</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you absolutely sure? This will permanently delete your account and all associated
              data.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDialog(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              onPress={handleDelete}
              loading={isDeleting}
              disabled={isDeleting}
              textColor="#dc2626"
            >
              Delete Forever
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}
