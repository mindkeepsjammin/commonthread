import { useEffect } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Chip,
  Switch,
  IconButton,
  Surface,
  useTheme,
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reflectionCreateSchema } from '@/lib/validations';
import { useSuggestion } from '@/hooks/use-suggestion';
import type { z } from 'zod';
import type { Reflection, GeneratedExercise } from '@/types';

type FormData = z.input<typeof reflectionCreateSchema>;

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
  onSubmit: (data: FormData) => void;
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
  const theme = useTheme();
  const { control, handleSubmit, watch, setValue } = useForm<FormData>({
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

  const isPromptType = selectedType === 'prompt_response';
  const isExerciseType = selectedType === 'exercise';
  const isCheckIn = selectedType === 'check_in';

  const {
    suggestion: promptSuggestion,
    isLoading: promptLoading,
    refresh: refreshPrompt,
  } = useSuggestion('prompt', isPromptType);

  const {
    suggestion: exerciseSuggestion,
    isLoading: exerciseLoading,
    refresh: refreshExercise,
  } = useSuggestion('exercise', isExerciseType);

  // Sync suggestion data into hidden form fields
  useEffect(() => {
    if (isPromptType && promptSuggestion && 'text' in promptSuggestion) {
      setValue('promptId', promptSuggestion.id);
      setValue('promptText', promptSuggestion.text);
    }
  }, [isPromptType, promptSuggestion, setValue]);

  useEffect(() => {
    if (isExerciseType && exerciseSuggestion && 'title' in exerciseSuggestion) {
      const ex = exerciseSuggestion as GeneratedExercise;
      setValue('exerciseId', ex.id);
      setValue('exerciseTitle', ex.title);
      setValue('exerciseSteps', ex.steps);
      setValue('exerciseClosingQuestion', ex.closingQuestion);
    }
  }, [isExerciseType, exerciseSuggestion, setValue]);

  const contentLabel = isCheckIn
    ? 'How are you feeling?'
    : isPromptType || isExerciseType
      ? 'Your reflection'
      : "What's on your mind?";

  const contentLines = isCheckIn ? 3 : 6;
  const contentMinHeight = isCheckIn ? 72 : 120;

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
      {/* Type selector */}
      <Text variant="titleSmall" className="mb-2" style={{ color: theme.colors.onBackground }}>
        Type
      </Text>
      <View className="mb-4 flex-row flex-wrap gap-2">
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

      {/* Check-in: mood first */}
      {isCheckIn && (
        <>
          <Text variant="titleSmall" className="mb-2" style={{ color: theme.colors.onBackground }}>
            How are you feeling? (1-10)
          </Text>
          <View className="mb-4 flex-row flex-wrap gap-1">
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
        </>
      )}

      {/* Prompt suggestion card */}
      {isPromptType && (
        <Surface className="mb-4 rounded-xl p-4" elevation={1}>
          <View className="mb-2 flex-row items-center justify-between">
            <Text variant="labelLarge" style={{ color: theme.colors.primary }}>
              Reflection Prompt
            </Text>
            <IconButton icon="refresh" size={20} onPress={refreshPrompt} disabled={promptLoading} />
          </View>
          {promptLoading ? (
            <ActivityIndicator size="small" className="py-4" />
          ) : promptSuggestion && 'text' in promptSuggestion ? (
            <Text
              variant="bodyLarge"
              style={{ color: theme.colors.onSurface, fontStyle: 'italic' }}
            >
              {promptSuggestion.text}
            </Text>
          ) : null}
        </Surface>
      )}

      {/* Exercise suggestion card */}
      {isExerciseType && (
        <Surface className="mb-4 rounded-xl p-4" elevation={1}>
          <View className="mb-2 flex-row items-center justify-between">
            <Text variant="labelLarge" style={{ color: theme.colors.primary }}>
              Guided Exercise
            </Text>
            <IconButton
              icon="refresh"
              size={20}
              onPress={refreshExercise}
              disabled={exerciseLoading}
            />
          </View>
          {exerciseLoading ? (
            <ActivityIndicator size="small" className="py-4" />
          ) : exerciseSuggestion && 'title' in exerciseSuggestion ? (
            <View>
              <Text
                variant="titleMedium"
                className="mb-2"
                style={{ color: theme.colors.onSurface }}
              >
                {(exerciseSuggestion as GeneratedExercise).title}
              </Text>
              {(exerciseSuggestion as GeneratedExercise).steps.map((step, i) => (
                <Text
                  key={i}
                  variant="bodyMedium"
                  className="mb-1"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  {i + 1}. {step}
                </Text>
              ))}
              <Text
                variant="bodyMedium"
                className="mt-3"
                style={{
                  color: theme.colors.onSurface,
                  fontStyle: 'italic',
                }}
              >
                {(exerciseSuggestion as GeneratedExercise).closingQuestion}
              </Text>
            </View>
          ) : null}
        </Surface>
      )}

      {/* Content input */}
      <Controller
        control={control}
        name="content"
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <View className="mb-4">
            <TextInput
              label={contentLabel}
              mode="outlined"
              multiline
              numberOfLines={contentLines}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={!!error}
              style={{ minHeight: contentMinHeight }}
            />
            {error && (
              <Text variant="bodySmall" className="mt-1" style={{ color: theme.colors.error }}>
                {error.message}
              </Text>
            )}
          </View>
        )}
      />

      {/* Mood (for non-check-in types) */}
      {!isCheckIn && (
        <>
          <Text variant="titleSmall" className="mb-2" style={{ color: theme.colors.onBackground }}>
            Mood (optional)
          </Text>
          <View className="mb-4 flex-row flex-wrap gap-1">
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
        </>
      )}

      {/* Sharing */}
      <Controller
        control={control}
        name="isShareableWithFamily"
        render={({ field: { value, onChange } }) => (
          <View className="mb-4">
            <View className="flex-row items-center justify-between">
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                Share with family
              </Text>
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
          <Text variant="titleSmall" className="mb-2" style={{ color: theme.colors.onBackground }}>
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
        <Text variant="bodySmall" className="mb-6" style={{ color: theme.colors.outline }}>
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
