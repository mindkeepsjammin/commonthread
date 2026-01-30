import { View, Text, Pressable } from 'react-native';
import type { Question } from '@/lib/research-forms/types';

interface SingleSelectProps {
  question: Question;
  value: string | undefined;
  onChange: (value: string) => void;
  error?: string;
}

export const SingleSelect = ({
  question,
  value,
  onChange,
  error,
}: SingleSelectProps) => {
  return (
    <View className="mb-6">
      <Text className="text-base font-medium text-gray-900 mb-1">
        {question.question}
        {question.required && <Text className="text-red-500"> *</Text>}
      </Text>
      {question.hint && (
        <Text className="text-sm text-gray-500 mb-3">{question.hint}</Text>
      )}
      <View className="space-y-2">
        {question.options?.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            className={`flex-row items-center p-3 rounded-lg border ${
              value === option.value
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <View
              className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                value === option.value
                  ? 'border-primary-500'
                  : 'border-gray-300'
              }`}
            >
              {value === option.value && (
                <View className="w-2.5 h-2.5 rounded-full bg-primary-500" />
              )}
            </View>
            <Text
              className={`text-base ${
                value === option.value ? 'text-primary-700' : 'text-gray-700'
              }`}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
      {error && <Text className="text-red-500 text-sm mt-2">{error}</Text>}
    </View>
  );
};
