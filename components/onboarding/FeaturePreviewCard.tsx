import { View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface FeaturePreviewCardProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description: string;
}

export function FeaturePreviewCard({
  icon,
  title,
  description,
}: FeaturePreviewCardProps) {
  const theme = useTheme();

  return (
    <Card className="mb-4" mode="elevated">
      <Card.Content className="flex-row items-start gap-4">
        <View
          className="p-3 rounded-full"
          style={{ backgroundColor: theme.colors.primaryContainer }}
        >
          <MaterialCommunityIcons
            name={icon}
            size={28}
            color={theme.colors.primary}
          />
        </View>
        <View className="flex-1">
          <Text variant="titleMedium" className="mb-1">
            {title}
          </Text>
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            {description}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
}
