import { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { Text, Button, Dialog, Portal, Avatar, Divider, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, Href } from 'expo-router';
import { useAuthStore } from '@/hooks/use-auth-store';
import { useProfile } from '@/hooks/use-profile';
import { signOut } from '@/lib/neon/auth';
import { queryClient } from '@/lib/utils/query-client';

export default function SettingsScreen() {
  const theme = useTheme();
  const { profile } = useAuthStore();
  const { data: profileData } = useProfile();
  const { reset } = useAuthStore();
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const displayProfile = profileData ?? profile;

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const { error } = await signOut();
    if (error) {
      setIsSigningOut(false);
      setShowSignOutDialog(false);
      return;
    }
    queryClient.clear();
    reset();
  };

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      <View className="p-4">
        <View className="mb-6 items-center rounded-lg p-6" style={{ backgroundColor: theme.colors.surface }}>
          <Avatar.Text
            size={72}
            label={displayProfile?.displayName?.charAt(0)?.toUpperCase() ?? '?'}
          />
          <Text variant="titleLarge" className="mt-3" style={{ color: theme.colors.onBackground }}>
            {displayProfile?.displayName ?? 'User'}
          </Text>
          {displayProfile?.role && (
            <Text variant="bodyMedium" className="capitalize" style={{ color: theme.colors.onSurfaceVariant }}>
              {displayProfile.role}
            </Text>
          )}
        </View>

        <Text variant="titleMedium" className="mb-2 mt-2" style={{ color: theme.colors.onBackground }}>
          Account
        </Text>

        <Pressable
          onPress={() => router.push('/settings/change-password' as Href)}
          className="flex-row items-center justify-between rounded-lg p-4 mb-2"
          style={{ backgroundColor: theme.colors.surface }}
        >
          <View className="flex-row items-center">
            <MaterialCommunityIcons name="lock-outline" size={22} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodyLarge" className="ml-3" style={{ color: theme.colors.onSurface }}>Change Password</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color={theme.colors.outline} />
        </Pressable>

        <Pressable
          onPress={() => router.push('/settings/change-email' as Href)}
          className="flex-row items-center justify-between rounded-lg p-4 mb-2"
          style={{ backgroundColor: theme.colors.surface }}
        >
          <View className="flex-row items-center">
            <MaterialCommunityIcons name="email-outline" size={22} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodyLarge" className="ml-3" style={{ color: theme.colors.onSurface }}>Change Email</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color={theme.colors.outline} />
        </Pressable>

        <Divider className="my-4" />

        <Pressable
          onPress={() => router.push('/settings/delete-account' as Href)}
          className="flex-row items-center justify-between rounded-lg p-4 mb-4"
          style={{ backgroundColor: theme.colors.surface }}
        >
          <View className="flex-row items-center">
            <MaterialCommunityIcons name="account-remove-outline" size={22} color={theme.colors.error} />
            <Text variant="bodyLarge" className="ml-3" style={{ color: theme.colors.error }}>Delete Account</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color={theme.colors.outline} />
        </Pressable>

        <Button
          mode="outlined"
          onPress={() => setShowSignOutDialog(true)}
          textColor={theme.colors.error}
          icon="logout"
        >
          Sign Out
        </Button>
      </View>

      <Portal>
        <Dialog visible={showSignOutDialog} onDismiss={() => setShowSignOutDialog(false)}>
          <Dialog.Title>Sign Out</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>Are you sure you want to sign out?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowSignOutDialog(false)} disabled={isSigningOut}>
              Cancel
            </Button>
            <Button
              onPress={handleSignOut}
              loading={isSigningOut}
              disabled={isSigningOut}
              textColor={theme.colors.error}
            >
              Sign Out
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}
