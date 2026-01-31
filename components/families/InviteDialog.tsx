import { useState } from 'react';
import { View } from 'react-native';
import { Dialog, TextInput, Button, Text, HelperText, useTheme } from 'react-native-paper';
import { familyInviteSchema } from '@/lib/validations';

interface InviteDialogProps {
  visible: boolean;
  familyId: string;
  familyName: string;
  onDismiss: () => void;
  onInvite: (email: string) => Promise<void>;
  isPending: boolean;
}

export function InviteDialog({
  visible,
  familyId: _familyId,
  familyName,
  onDismiss,
  onInvite,
  isPending,
}: InviteDialogProps) {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleInvite = async () => {
    setError(null);

    const result = familyInviteSchema.safeParse({ email: email.trim() });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    try {
      await onInvite(email.trim());
      setEmail('');
      onDismiss();
    } catch (e: any) {
      setError(e.message ?? 'Failed to send invite');
    }
  };

  const handleDismiss = () => {
    setEmail('');
    setError(null);
    onDismiss();
  };

  return (
    <Dialog visible={visible} onDismiss={handleDismiss}>
      <Dialog.Title>Invite to {familyName}</Dialog.Title>
      <Dialog.Content>
        <Text
          variant="bodyMedium"
          className="mb-3"
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          Enter the email address of the person you'd like to invite. They'll receive an email with
          instructions to join.
        </Text>

        {error && (
          <View
            className="mb-2 rounded-lg p-3"
            style={{ backgroundColor: theme.colors.errorContainer }}
          >
            <Text style={{ color: theme.colors.error }}>{error}</Text>
          </View>
        )}

        <TextInput
          label="Email Address"
          mode="outlined"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          placeholder="name@example.com"
        />
        <HelperText type="info">An invite email will be sent to this address</HelperText>
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={handleDismiss} disabled={isPending}>
          Cancel
        </Button>
        <Button onPress={handleInvite} disabled={!email.trim() || isPending} loading={isPending}>
          Send Invite
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
}
