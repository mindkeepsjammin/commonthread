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
  useTheme,
} from 'react-native-paper';
import * as Clipboard from 'expo-clipboard';
import { useAuthStore } from '@/hooks/use-auth-store';
import { useProfile } from '@/hooks/use-profile';
import {
  useFamilies,
  useCreateFamily,
  useJoinFamily,
  useInviteFamilyMember,
  usePendingInvites,
  useAcceptInvite,
  useDeclineInvite,
} from '@/hooks/use-families';
import { FamilyCard, InviteDialog, PendingInviteBanner } from '@/components/families';
import { useSnackbar } from '@/hooks/use-snackbar';
import { Avatar } from '@/components/ui';
import { router } from 'expo-router';
import type { Href } from 'expo-router';

export default function FamilyScreen() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const { data: profile } = useProfile();
  const { data: families, isLoading } = useFamilies();
  const createMutation = useCreateFamily();
  const joinMutation = useJoinFamily();
  const inviteMutation = useInviteFamilyMember();
  const { data: pendingInvites } = usePendingInvites();
  const acceptMutation = useAcceptInvite();
  const declineMutation = useDeclineInvite();
  const { showSnackbar } = useSnackbar();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showInviteCodeDialog, setShowInviteCodeDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteTargetFamily, setInviteTargetFamily] = useState<{ id: string; name: string } | null>(
    null
  );
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

  const handleOpenInviteDialog = (familyId: string, familyName: string) => {
    setInviteTargetFamily({ id: familyId, name: familyName });
    setShowInviteDialog(true);
  };

  const handleInvite = async (email: string) => {
    if (!inviteTargetFamily) return;
    await inviteMutation.mutateAsync({
      familyId: inviteTargetFamily.id,
      email,
      familyName: inviteTargetFamily.name,
    });
    showSnackbar(`Invite sent to ${email}`, 'success');
  };

  const handleAcceptInvite = async (inviteId: string, familyId: string) => {
    try {
      await acceptMutation.mutateAsync({ inviteId, familyId });
      showSnackbar('Welcome to the family!', 'success');
    } catch (e: any) {
      showSnackbar(e.message ?? 'Failed to accept invite', 'error');
    }
  };

  const handleDeclineInvite = async (inviteId: string) => {
    try {
      await declineMutation.mutateAsync({ inviteId });
      showSnackbar('Invite declined', 'info');
    } catch (e: any) {
      showSnackbar(e.message ?? 'Failed to decline invite', 'error');
    }
  };

  const hasFamilies = families && families.length > 0;

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      <View className="p-4 pb-0">
        {/* Profile Card */}
        <Card className="mb-4">
          <Card.Content>
            <View className="flex-row items-center">
              <Avatar name={profile?.displayName} uri={profile?.avatarUrl} size="medium" />
              <View className="ml-4 flex-1">
                <Text variant="titleLarge">{profile?.displayName || 'User'}</Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  {profile?.role ? roleLabels[profile.role] : 'No role set'}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                  {user?.email}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Text variant="titleLarge" className="mb-4" style={{ color: theme.colors.onBackground }}>
          Your Families
        </Text>
      </View>

      <PendingInviteBanner
        invites={pendingInvites ?? []}
        onAccept={handleAcceptInvite}
        onDecline={handleDeclineInvite}
        isAccepting={acceptMutation.isPending}
        isDeclining={declineMutation.isPending}
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      ) : !hasFamilies ? (
        <View className="px-4">
          <Card className="mb-4">
            <Card.Content>
              <View className="items-center py-4">
                <Text
                  variant="bodyLarge"
                  className="mb-2 text-center"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  You haven't joined any families yet
                </Text>
                <Text
                  variant="bodySmall"
                  className="text-center"
                  style={{ color: theme.colors.outline }}
                >
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
            <FamilyCard
              family={item}
              onPress={() => router.push(`/family/${item.id}` as Href)}
              onInvite={() => handleOpenInviteDialog(item.id, item.name)}
            />
          )}
          ListFooterComponent={
            <View className="mt-2 flex-row gap-2">
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
        {/* Invite by Email Dialog */}
        {inviteTargetFamily && (
          <InviteDialog
            visible={showInviteDialog}
            familyId={inviteTargetFamily.id}
            familyName={inviteTargetFamily.name}
            onDismiss={() => {
              setShowInviteDialog(false);
              setInviteTargetFamily(null);
            }}
            onInvite={handleInvite}
            isPending={inviteMutation.isPending}
          />
        )}

        {/* Create Family Dialog */}
        <Dialog visible={showCreateDialog} onDismiss={() => setShowCreateDialog(false)}>
          <Dialog.Title>Create Family</Dialog.Title>
          <Dialog.Content>
            {createError && (
              <View
                className="mb-2 rounded-lg p-3"
                style={{ backgroundColor: theme.colors.errorContainer }}
              >
                <Text style={{ color: theme.colors.error }}>{createError}</Text>
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
              <View
                className="mb-2 rounded-lg p-3"
                style={{ backgroundColor: theme.colors.errorContainer }}
              >
                <Text style={{ color: theme.colors.error }}>{joinError}</Text>
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
            <HelperText type="info">
              Ask a family member for their 8-character invite code
            </HelperText>
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
        <Dialog visible={showInviteCodeDialog} onDismiss={() => setShowInviteCodeDialog(false)}>
          <Dialog.Title>Family Created!</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" className="mb-4">
              Share this invite code with your family members:
            </Text>
            <View
              className="items-center rounded-lg p-4"
              style={{ backgroundColor: theme.colors.surfaceVariant }}
            >
              <Text variant="headlineMedium" className="mb-2 font-mono tracking-widest">
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
