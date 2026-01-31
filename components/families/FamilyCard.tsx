import { useState } from 'react';
import { View } from 'react-native';
import { Card, Text, Chip, Button, IconButton } from 'react-native-paper';
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
}

export function FamilyCard({ family, onPress }: FamilyCardProps) {
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
        <View className="flex-row items-center justify-between mb-1">
          <Text variant="titleMedium">{family.name}</Text>
          <Chip compact textStyle={{ fontSize: 12 }}>
            {ROLE_LABELS[family.userRole] ?? family.userRole}
          </Chip>
        </View>

        <Text variant="bodySmall" className="text-neutral-400 mb-2">
          {family.memberCount} {family.memberCount === 1 ? 'member' : 'members'}
        </Text>

        {showCode ? (
          <View className="flex-row items-center justify-between bg-neutral-100 rounded-lg p-3">
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
        ) : (
          <Button
            mode="text"
            compact
            icon="share-variant"
            onPress={() => setShowCode(true)}
          >
            Show Invite Code
          </Button>
        )}
      </Card.Content>
    </Card>
  );
}
