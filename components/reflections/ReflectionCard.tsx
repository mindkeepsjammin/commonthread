import { useState } from 'react';
import { View } from 'react-native';
import { Card, Text, Chip, IconButton, Menu, useTheme } from 'react-native-paper';
import type { Reflection } from '@/types';

const TYPE_LABELS: Record<Reflection['type'], string> = {
  journal: 'Journal',
  check_in: 'Check-in',
  exercise: 'Exercise',
  prompt_response: 'Prompt',
};

interface ReflectionCardProps {
  reflection: Reflection;
  onPress: () => void;
  onDelete?: () => void;
  authorName?: string;
  showAuthor?: boolean;
  sharedWithNames?: string[];
}

export function ReflectionCard({ reflection, onPress, onDelete, authorName, showAuthor, sharedWithNames }: ReflectionCardProps) {
  const theme = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);

  const contentPreview =
    reflection.content.text.length > 120
      ? reflection.content.text.slice(0, 120) + '...'
      : reflection.content.text;

  const dateStr = new Date(reflection.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Card className="mb-3" onPress={onPress}>
      <Card.Content>
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center gap-2">
            <Chip compact textStyle={{ fontSize: 12 }}>
              {TYPE_LABELS[reflection.type]}
            </Chip>
            {reflection.moodScore != null && (
              <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                Mood: {reflection.moodScore}/10
              </Text>
            )}
          </View>
          {onDelete && (
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={18}
                  onPress={() => setMenuVisible(true)}
                />
              }
            >
              <Menu.Item
                onPress={() => {
                  setMenuVisible(false);
                  onDelete();
                }}
                title="Delete"
                leadingIcon="delete-outline"
              />
            </Menu>
          )}
        </View>

        {showAuthor && authorName && (
          <Text variant="bodySmall" className="mb-1" style={{ color: theme.colors.primary }}>
            By {authorName}
          </Text>
        )}

        <Text variant="bodyMedium" className="mb-2">
          {contentPreview}
        </Text>

        <View className="flex-row items-center justify-between">
          <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
            {dateStr}
          </Text>
          {reflection.isShareable && (
            <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
              {sharedWithNames && sharedWithNames.length > 0
                ? `Shared with ${sharedWithNames.join(', ')}`
                : 'Shared'}
            </Text>
          )}
        </View>
      </Card.Content>
    </Card>
  );
}
