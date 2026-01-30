import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface PhilosophyBannerProps {
  title: string;
  messages: string[];
}

export function PhilosophyBanner({ title, messages }: PhilosophyBannerProps) {
  const theme = useTheme();

  return (
    <View
      className="rounded-2xl p-5 mb-6"
      style={{ backgroundColor: theme.colors.primaryContainer }}
    >
      <Text
        variant="titleMedium"
        className="mb-3 text-center"
        style={{ color: theme.colors.onPrimaryContainer }}
      >
        {title}
      </Text>
      {messages.map((message, index) => (
        <Text
          key={index}
          variant="bodyMedium"
          className="text-center mb-1 italic"
          style={{ color: theme.colors.onPrimaryContainer, opacity: 0.9 }}
        >
          "{message}"
        </Text>
      ))}
    </View>
  );
}
