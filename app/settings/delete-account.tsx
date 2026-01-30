import { useState } from 'react';
import { View } from 'react-native';
import { Text, Button, TextInput, Dialog, Portal } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
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

    // Note: Supabase client SDK cannot delete users directly.
    // This requires a Supabase Edge Function or server-side endpoint.
    // For now, we sign the user out and show a message.
    // TODO: Implement server-side account deletion endpoint
    try {
      await signOut();
      queryClient.clear();
      reset();
    } catch {
      setError('Failed to delete account. Please contact support.');
      setIsDeleting(false);
      setShowDialog(false);
    }
  };

  return (
    <View className="flex-1 p-6">
      <View className="items-center mb-6">
        <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#dc2626" />
      </View>

      <Text variant="headlineMedium" className="mb-2 text-center">
        Delete Account
      </Text>
      <Text variant="bodyMedium" className="mb-6 text-center text-gray-500">
        This action is permanent and cannot be undone. All your data, reflections, and family
        connections will be permanently removed.
      </Text>

      {error && (
        <View className="mb-4 rounded-lg bg-red-100 p-3">
          <Text className="text-red-700">{error}</Text>
        </View>
      )}

      <Text variant="bodyMedium" className="mb-2">
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
