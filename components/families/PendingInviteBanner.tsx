import { View } from 'react-native';
import { Card, Text, Button, useTheme } from 'react-native-paper';
import type { PendingInviteInfo } from '@/types';

interface PendingInviteBannerProps {
  invites: PendingInviteInfo[];
  onAccept: (inviteId: string, familyId: string) => void;
  onDecline: (inviteId: string) => void;
  isAccepting: boolean;
  isDeclining: boolean;
}

export function PendingInviteBanner({
  invites,
  onAccept,
  onDecline,
  isAccepting,
  isDeclining,
}: PendingInviteBannerProps) {
  const theme = useTheme();

  if (invites.length === 0) return null;

  return (
    <View className="px-4 mb-2">
      {invites.map(invite => (
        <Card
          key={invite.id}
          className="mb-2"
          style={{ backgroundColor: theme.colors.primaryContainer }}
        >
          <Card.Content>
            <Text variant="titleSmall" style={{ color: theme.colors.onPrimaryContainer }}>
              Family Invite
            </Text>
            <Text
              variant="bodyMedium"
              className="mt-1"
              style={{ color: theme.colors.onPrimaryContainer }}
            >
              {invite.inviterName} invited you to join{' '}
              <Text style={{ fontWeight: '700' }}>{invite.familyName}</Text>
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button
              onPress={() => onDecline(invite.id)}
              disabled={isAccepting || isDeclining}
              loading={isDeclining}
              textColor={theme.colors.onPrimaryContainer}
            >
              Decline
            </Button>
            <Button
              mode="contained"
              onPress={() => onAccept(invite.id, invite.familyId)}
              disabled={isAccepting || isDeclining}
              loading={isAccepting}
            >
              Accept
            </Button>
          </Card.Actions>
        </Card>
      ))}
    </View>
  );
}
