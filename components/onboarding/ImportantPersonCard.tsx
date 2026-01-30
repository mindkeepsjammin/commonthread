import { View } from 'react-native';
import { Card, TextInput, IconButton, Text, useTheme } from 'react-native-paper';
import type { ImportantPerson } from '@/types';

interface ImportantPersonCardProps {
  person: ImportantPerson;
  index: number;
  onUpdate: (index: number, person: ImportantPerson) => void;
  onRemove: (index: number) => void;
}

export function ImportantPersonCard({
  person,
  index,
  onUpdate,
  onRemove,
}: ImportantPersonCardProps) {
  const theme = useTheme();

  const handleChange = (field: keyof ImportantPerson, value: string) => {
    onUpdate(index, { ...person, [field]: value });
  };

  return (
    <Card className="mb-4" mode="outlined">
      <Card.Content>
        <View className="flex-row items-center justify-between mb-2">
          <Text variant="titleSmall">Person {index + 1}</Text>
          <IconButton
            icon="close"
            size={20}
            onPress={() => onRemove(index)}
            iconColor={theme.colors.error}
          />
        </View>

        <TextInput
          mode="outlined"
          label="Name (optional)"
          value={person.name || ''}
          onChangeText={(text) => handleChange('name', text)}
          className="mb-3"
          dense
        />

        <TextInput
          mode="outlined"
          label="Relationship (e.g., parent, friend, mentor)"
          value={person.relationship || ''}
          onChangeText={(text) => handleChange('relationship', text)}
          className="mb-3"
          dense
        />

        <TextInput
          mode="outlined"
          label="What do they mean to you?"
          value={person.whatTheyMean || ''}
          onChangeText={(text) => handleChange('whatTheyMean', text)}
          multiline
          numberOfLines={3}
          placeholder="What role do they play in your life? What makes this connection important?"
        />
      </Card.Content>
    </Card>
  );
}
