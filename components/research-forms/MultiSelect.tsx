import { View, Text, Pressable } from 'react-native';
import type { Question } from '@/lib/research-forms/types';

interface MultiSelectProps {
  question: Question;
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
}

export const MultiSelect = ({ question, value, onChange, error }: MultiSelectProps) => {
  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      // Check max selections
      if (question.maxSelections && value.length >= question.maxSelections) {
        return; // Don't add more if at max
      }
      onChange([...value, optionValue]);
    }
  };

  const isAtMax = !!(question.maxSelections && value.length >= question.maxSelections);

  return (
    <View className="mb-6">
      <Text className="mb-1 text-base font-medium text-neutral-900">
        {question.question}
        {question.required && <Text className="text-red-500"> *</Text>}
      </Text>
      {question.hint && <Text className="mb-3 text-sm text-neutral-500">{question.hint}</Text>}
      <View className="space-y-2">
        {question.options?.map(option => {
          const isSelected = value.includes(option.value);
          const isDisabled = !isSelected && isAtMax;

          return (
            <Pressable
              key={option.value}
              onPress={() => toggleOption(option.value)}
              disabled={isDisabled}
              className={`flex-row items-center rounded-lg border p-3 ${
                isSelected
                  ? 'border-primary-500 bg-primary-50'
                  : isDisabled
                    ? 'border-neutral-100 bg-neutral-50'
                    : 'border-neutral-200 bg-white'
              }`}
            >
              <View
                className={`mr-3 h-5 w-5 items-center justify-center rounded border-2 ${
                  isSelected
                    ? 'border-primary-500 bg-primary-500'
                    : isDisabled
                      ? 'border-neutral-200'
                      : 'border-neutral-300'
                }`}
              >
                {isSelected && <Text className="text-xs font-bold text-white">✓</Text>}
              </View>
              <Text
                className={`text-base ${
                  isSelected
                    ? 'text-primary-700'
                    : isDisabled
                      ? 'text-neutral-400'
                      : 'text-neutral-700'
                }`}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {isAtMax && (
        <Text className="mt-2 text-sm text-amber-600">
          Maximum {question.maxSelections} selections reached
        </Text>
      )}
      {error && <Text className="mt-2 text-sm text-red-500">{error}</Text>}
    </View>
  );
};
