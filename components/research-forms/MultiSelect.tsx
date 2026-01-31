import { View, Text, Pressable } from 'react-native';
import type { Question } from '@/lib/research-forms/types';

interface MultiSelectProps {
  question: Question;
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
}

export const MultiSelect = ({
  question,
  value,
  onChange,
  error,
}: MultiSelectProps) => {
  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      // Check max selections
      if (question.maxSelections && value.length >= question.maxSelections) {
        return; // Don't add more if at max
      }
      onChange([...value, optionValue]);
    }
  };

  const isAtMax = question.maxSelections && value.length >= question.maxSelections;

  return (
    <View className="mb-6">
      <Text className="text-base font-medium text-neutral-900 mb-1">
        {question.question}
        {question.required && <Text className="text-red-500"> *</Text>}
      </Text>
      {question.hint && (
        <Text className="text-sm text-neutral-500 mb-3">{question.hint}</Text>
      )}
      <View className="space-y-2">
        {question.options?.map((option) => {
          const isSelected = value.includes(option.value);
          const isDisabled = !isSelected && isAtMax;

          return (
            <Pressable
              key={option.value}
              onPress={() => toggleOption(option.value)}
              disabled={isDisabled}
              className={`flex-row items-center p-3 rounded-lg border ${
                isSelected
                  ? 'border-primary-500 bg-primary-50'
                  : isDisabled
                    ? 'border-neutral-100 bg-neutral-50'
                    : 'border-neutral-200 bg-white'
              }`}
            >
              <View
                className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
                  isSelected
                    ? 'border-primary-500 bg-primary-500'
                    : isDisabled
                      ? 'border-neutral-200'
                      : 'border-neutral-300'
                }`}
              >
                {isSelected && (
                  <Text className="text-white text-xs font-bold">✓</Text>
                )}
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
        <Text className="text-amber-600 text-sm mt-2">
          Maximum {question.maxSelections} selections reached
        </Text>
      )}
      {error && <Text className="text-red-500 text-sm mt-2">{error}</Text>}
    </View>
  );
};
