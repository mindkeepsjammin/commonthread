import { useState } from 'react';
import { View } from 'react-native';
import { Card, Text, Chip, Button } from 'react-native-paper';
import * as Clipboard from 'expo-clipboard';
import type { FamilyWithMeta } from '@/hooks/use-families';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  member: 'Member',
  child: 'Child',
};

interface FamilyCardProps {
  family: FamilyWithMeta;
  onPress: () => void;
  onInvite?: () => void;
}

export function FamilyCard({ family, onPress, onInvite }: FamilyCardProps) {
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(family.inviteCode.toUpperCase());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="mb-3" onPress={onPress}>
      <Card.Content>
        <View className="mb-1 flex-row items-center justify-between">
          <Text variant="titleMedium">{family.name}</Text>
          <Chip compact textStyle={{ fontSize: 12 }}>
            {ROLE_LABELS[family.userRole] ?? family.userRole}
          </Chip>
        </View>

        <Text variant="bodySmall" className="mb-2 text-neutral-400">
          {family.memberCount} {family.memberCount === 1 ? 'member' : 'members'}
        </Text>

        <View className="mb-2 flex-row gap-2">
          <Button
            mode="text"
            compact
            icon="share-variant"
            onPress={() => setShowCode(prev => !prev)}
          >
            {showCode ? 'Hide Code' : 'Show Invite Code'}
          </Button>
          {onInvite && (
            <Button mode="text" compact icon="email-outline" onPress={onInvite}>
              Invite by Email
            </Button>
          )}
        </View>

        {showCode ? (
          <View className="flex-row items-center justify-between rounded-lg bg-neutral-100 p-3">
            <Text variant="titleSmall" className="font-mono tracking-widest">
              {family.inviteCode.toUpperCase()}
            </Text>
            <Button
              mode="text"
              compact
              icon={copied ? 'check' : 'content-copy'}
              onPress={handleCopy}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </View>
        ) : null}
      </Card.Content>
    </Card>
  );
}
