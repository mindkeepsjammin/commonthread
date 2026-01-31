import { useState } from 'react';
import { View, FlatList, ActivityIndicator } from 'react-native';
import {
  Text,
  Card,
  Button,
  TextInput,
  Dialog,
  Portal,
  HelperText,
  Divider,
  List,
} from 'react-native-paper';
import * as Clipboard from 'expo-clipboard';
import { useAuthStore } from '@/hooks/use-auth-store';
import { useProfile } from '@/hooks/use-profile';
import { useFamilies, useCreateFamily, useJoinFamily } from '@/hooks/use-families';
import { FamilyCard } from '@/components/families';
import { useSnackbar } from '@/hooks/use-snackbar';
import { Avatar } from '@/components/ui';

export default function FamilyScreen() {
  const { user } = useAuthStore();
  const { data: profile } = useProfile();
  const { data: families, isLoading } = useFamilies();
  const createMutation = useCreateFamily();
  const joinMutation = useJoinFamily();
  const { showSnackbar } = useSnackbar();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showInviteCodeDialog, setShowInviteCodeDialog] = useState(false);
  const [newInviteCode, setNewInviteCode] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const roleLabels: Record<string, string> = {
    child: 'Child',
    teen: 'Teen',
    adult: 'Adult',
    elder: 'Elder',
  };

  const handleCreate = async () => {
    setCreateError(null);
    try {
      const family = await createMutation.mutateAsync({ name: familyName.trim() });
      setShowCreateDialog(false);
      setFamilyName('');
      setNewInviteCode(family.inviteCode.toUpperCase());
      setShowInviteCodeDialog(true);
    } catch (e: any) {
      setCreateError(e.message ?? 'Failed to create family');
    }
  };

  const handleJoin = async () => {
    setJoinError(null);
    try {
      const result = await joinMutation.mutateAsync({ inviteCode: inviteCode.trim() });
      setShowJoinDialog(false);
      setInviteCode('');
      showSnackbar(`Joined ${result.familyName}!`, 'success');
    } catch (e: any) {
      setJoinError(e.message ?? 'Failed to join family');
    }
  };

  const handleCopyInviteCode = async () => {
    await Clipboard.setStringAsync(newInviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasFamilies = families && families.length > 0;

  return (
    <View className="flex-1 bg-neutral-50">
      <View className="p-4 pb-0">
        {/* Profile Card */}
        <Card className="mb-4">
          <Card.Content>
            <View className="flex-row items-center">
              <Avatar name={profile?.displayName} uri={profile?.avatarUrl} size="medium" />
              <View className="ml-4 flex-1">
                <Text variant="titleLarge">{profile?.displayName || 'User'}</Text>
                <Text variant="bodyMedium" className="text-neutral-500">
                  {profile?.role ? roleLabels[profile.role] : 'No role set'}
                </Text>
                <Text variant="bodySmall" className="text-neutral-400">
                  {user?.email}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Text variant="titleLarge" className="mb-4">
          Your Families
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      ) : !hasFamilies ? (
        <View className="px-4">
          <Card className="mb-4">
            <Card.Content>
              <View className="items-center py-4">
                <Text variant="bodyLarge" className="mb-2 text-center text-neutral-500">
                  You haven't joined any families yet
                </Text>
                <Text variant="bodySmall" className="text-center text-neutral-400">
                  Create a new family or join one with an invite code
                </Text>
              </View>
            </Card.Content>
            <Card.Actions className="justify-center">
              <Button mode="contained" onPress={() => setShowCreateDialog(true)}>
                Create Family
              </Button>
              <Button mode="outlined" onPress={() => setShowJoinDialog(true)}>
                Join Family
              </Button>
            </Card.Actions>
          </Card>
        </View>
      ) : (
        <FlatList
          data={families}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
          renderItem={({ item }) => (
            <FamilyCard family={item} onPress={() => {}} />
          )}
          ListFooterComponent={
            <View className="flex-row gap-2 mt-2">
              <Button mode="contained" compact onPress={() => setShowCreateDialog(true)}>
                Create Family
              </Button>
              <Button mode="outlined" compact onPress={() => setShowJoinDialog(true)}>
                Join Family
              </Button>
            </View>
          }
        />
      )}

      <Portal>
        {/* Create Family Dialog */}
        <Dialog visible={showCreateDialog} onDismiss={() => setShowCreateDialog(false)}>
          <Dialog.Title>Create Family</Dialog.Title>
          <Dialog.Content>
            {createError && (
              <View className="mb-2 rounded-lg bg-red-100 p-3">
                <Text className="text-red-700">{createError}</Text>
              </View>
            )}
            <TextInput
              label="Family Name"
              mode="outlined"
              value={familyName}
              onChangeText={setFamilyName}
              placeholder="e.g., The Smith Family"
            />
            <HelperText type="info">
              You'll get an invite code to share with family members
            </HelperText>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowCreateDialog(false)} disabled={createMutation.isPending}>
              Cancel
            </Button>
            <Button
              onPress={handleCreate}
              disabled={!familyName.trim() || createMutation.isPending}
              loading={createMutation.isPending}
            >
              Create
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Join Family Dialog */}
        <Dialog visible={showJoinDialog} onDismiss={() => setShowJoinDialog(false)}>
          <Dialog.Title>Join Family</Dialog.Title>
          <Dialog.Content>
            {joinError && (
              <View className="mb-2 rounded-lg bg-red-100 p-3">
                <Text className="text-red-700">{joinError}</Text>
              </View>
            )}
            <TextInput
              label="Invite Code"
              mode="outlined"
              value={inviteCode}
              onChangeText={text => setInviteCode(text.toUpperCase())}
              autoCapitalize="characters"
              maxLength={8}
              placeholder="ABCD1234"
            />
            <HelperText type="info">Ask a family member for their 8-character invite code</HelperText>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowJoinDialog(false)} disabled={joinMutation.isPending}>
              Cancel
            </Button>
            <Button
              onPress={handleJoin}
              disabled={inviteCode.length !== 8 || joinMutation.isPending}
              loading={joinMutation.isPending}
            >
              Join
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Invite Code Success Dialog */}
        <Dialog
          visible={showInviteCodeDialog}
          onDismiss={() => setShowInviteCodeDialog(false)}
        >
          <Dialog.Title>Family Created!</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" className="mb-4">
              Share this invite code with your family members:
            </Text>
            <View className="items-center bg-neutral-100 rounded-lg p-4">
              <Text variant="headlineMedium" className="font-mono tracking-widest mb-2">
                {newInviteCode}
              </Text>
              <Button
                mode="outlined"
                icon={copied ? 'check' : 'content-copy'}
                onPress={handleCopyInviteCode}
              >
                {copied ? 'Copied!' : 'Copy Code'}
              </Button>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowInviteCodeDialog(false)}>Done</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}
