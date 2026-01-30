import { View } from 'react-native';
import { Text, TextInput, useTheme } from 'react-native-paper';

interface JournalPromptProps {
  label: string;
  hint?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  numberOfLines?: number;
}

export function JournalPrompt({
  label,
  hint,
  value,
  onChangeText,
  placeholder,
  numberOfLines = 4,
}: JournalPromptProps) {
  const theme = useTheme();

  return (
    <View className="mb-6">
      <Text variant="titleSmall" className="mb-1">
        {label}
      </Text>
      {hint && (
        <Text
          variant="bodySmall"
          className="mb-2"
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          {hint}
        </Text>
      )}
      <TextInput
        mode="outlined"
        multiline
        numberOfLines={numberOfLines}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        style={{
          minHeight: numberOfLines * 24,
          textAlignVertical: 'top',
        }}
      />
    </View>
  );
}
