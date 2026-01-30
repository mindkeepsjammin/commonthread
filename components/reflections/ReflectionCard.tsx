import { useState } from 'react';
import { View } from 'react-native';
import { Card, Text, Chip, IconButton, Menu } from 'react-native-paper';
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
  onDelete: () => void;
}

export function ReflectionCard({ reflection, onPress, onDelete }: ReflectionCardProps) {
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
              <Text variant="bodySmall" className="text-gray-400">
                Mood: {reflection.moodScore}/10
              </Text>
            )}
          </View>
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
        </View>

        <Text variant="bodyMedium" className="mb-2">
          {contentPreview}
        </Text>

        <View className="flex-row items-center justify-between">
          <Text variant="bodySmall" className="text-gray-400">
            {dateStr}
          </Text>
          {reflection.isShareable && (
            <Text variant="bodySmall" className="text-gray-400">
              Shared
            </Text>
          )}
        </View>
      </Card.Content>
    </Card>
  );
}
