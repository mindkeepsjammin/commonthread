import { View, ScrollView } from 'react-native';
import { Text, TextInput, Button, Chip, Switch } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reflectionCreateSchema, type ReflectionCreateInput } from '@/lib/validations';
import type { Reflection } from '@/types';

const TYPES: { value: Reflection['type']; label: string }[] = [
  { value: 'journal', label: 'Journal' },
  { value: 'check_in', label: 'Check-in' },
  { value: 'exercise', label: 'Exercise' },
  { value: 'prompt_response', label: 'Prompt' },
];

const MOOD_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

interface FamilyMember {
  userId: string;
  displayName: string;
}

interface ReflectionFormProps {
  onSubmit: (data: ReflectionCreateInput) => void;
  initialValues?: {
    type: Reflection['type'];
    content: string;
    moodScore?: number;
    isShareableWithFamily?: boolean;
    sharedWith?: string[];
  };
  familyMembers?: FamilyMember[];
  isLoading: boolean;
  submitLabel?: string;
}

export function ReflectionForm({
  onSubmit,
  initialValues,
  familyMembers = [],
  isLoading,
  submitLabel = 'Save',
}: ReflectionFormProps) {
  const { control, handleSubmit, watch, setValue } = useForm<ReflectionCreateInput>({
    resolver: zodResolver(reflectionCreateSchema),
    defaultValues: {
      type: initialValues?.type ?? 'journal',
      content: initialValues?.content ?? '',
      moodScore: initialValues?.moodScore,
      isShareableWithFamily: initialValues?.isShareableWithFamily ?? false,
      sharedWith: initialValues?.sharedWith ?? [],
    },
  });

  const selectedType = watch('type');
  const selectedMood = watch('moodScore');
  const isShareable = watch('isShareableWithFamily');
  const sharedWith = watch('sharedWith') ?? [];

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
      <Text variant="titleSmall" className="mb-2">
        Type
      </Text>
      <View className="flex-row flex-wrap gap-2 mb-4">
        {TYPES.map(t => (
          <Chip
            key={t.value}
            selected={selectedType === t.value}
            onPress={() => setValue('type', t.value)}
            mode="outlined"
          >
            {t.label}
          </Chip>
        ))}
      </View>

      <Controller
        control={control}
        name="content"
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <View className="mb-4">
            <TextInput
              label="What's on your mind?"
              mode="outlined"
              multiline
              numberOfLines={6}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={!!error}
              style={{ minHeight: 120 }}
            />
            {error && (
              <Text variant="bodySmall" className="text-red-600 mt-1">
                {error.message}
              </Text>
            )}
          </View>
        )}
      />

      <Text variant="titleSmall" className="mb-2">
        Mood (optional)
      </Text>
      <View className="flex-row flex-wrap gap-1 mb-4">
        {MOOD_VALUES.map(v => (
          <Chip
            key={v}
            selected={selectedMood === v}
            onPress={() => setValue('moodScore', selectedMood === v ? undefined : v)}
            mode="outlined"
            compact
          >
            {v}
          </Chip>
        ))}
      </View>

      <Controller
        control={control}
        name="isShareableWithFamily"
        render={({ field: { value, onChange } }) => (
          <View className="mb-4">
            <View className="flex-row items-center justify-between">
              <Text variant="bodyMedium">Share with family</Text>
              <Switch
                value={value}
                onValueChange={checked => {
                  onChange(checked);
                  if (!checked) setValue('sharedWith', []);
                }}
              />
            </View>
          </View>
        )}
      />

      {isShareable && familyMembers.length > 0 && (
        <View className="mb-6">
          <Text variant="titleSmall" className="mb-2">
            Share with
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {familyMembers.map(member => {
              const isSelected = sharedWith.includes(member.userId);
              return (
                <Chip
                  key={member.userId}
                  selected={isSelected}
                  onPress={() => {
                    const next = isSelected
                      ? sharedWith.filter(id => id !== member.userId)
                      : [...sharedWith, member.userId];
                    setValue('sharedWith', next);
                  }}
                  mode="outlined"
                >
                  {member.displayName}
                </Chip>
              );
            })}
          </View>
        </View>
      )}

      {isShareable && familyMembers.length === 0 && (
        <Text variant="bodySmall" className="mb-6 text-neutral-400">
          Join a family to share reflections with others.
        </Text>
      )}

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={isLoading}
        disabled={isLoading}
      >
        {submitLabel}
      </Button>
    </ScrollView>
  );
}
